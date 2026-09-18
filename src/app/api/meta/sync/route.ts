import { NextRequest, NextResponse } from 'next/server';
import { syncCampaignPerformance, syncAdSetPerformance, syncAdPerformance, fetchMetaCampaignStatus, fetchMetaAdSetStatus, fetchMetaAdStatus, syncMetaLeads } from '@/lib/meta';
import { logMetaSync } from '@/lib/logger';
import dbConnect from '@/lib/db';
import Campaign from '@/lib/models/Campaign';
import AdSet from '@/lib/models/AdSet';
import Ad from '@/lib/models/Ad';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    if (!token || token === 'Bearer null' || token === 'Bearer undefined') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    await logMetaSync('--- Meta Full Sync Started ---');

    // Fetch all performance and status data in parallel
    const [
      campaignsData, adSetsData, adsData,
      campaignStatData, adSetStatData, adStatData
    ] = await Promise.all([
      syncCampaignPerformance(),
      syncAdSetPerformance(),
      syncAdPerformance(),
      fetchMetaCampaignStatus(),
      fetchMetaAdSetStatus(),
      fetchMetaAdStatus(),
    ]);

    const campaignStatusMap = new Map();
    campaignStatData.forEach((s: any) => campaignStatusMap.set(s.id, s.status));

    const adSetStatusMap = new Map();
    adSetStatData.forEach((s: any) => adSetStatusMap.set(s.id, s.status));

    const adStatusMap = new Map();
    adStatData.forEach((s: any) => adStatusMap.set(s.id, s.status));

    // Sync Campaigns
    const seenCampaignIds = new Set();
    await Promise.all(campaignsData.map(async (item: any) => {
      seenCampaignIds.add(item.campaign_id);
      const status = campaignStatusMap.get(item.campaign_id) || 'INACTIVE';
      const conversions = item.conversions ||
                           (item.actions && item.actions.find((a: any) => a.action_type === 'lead')?.value) ||
                           0;
      return Campaign.findOneAndUpdate(
        { metaCampaignId: item.campaign_id, platform: 'Meta' },
        {
          metaCampaignId: item.campaign_id,
          name: item.campaign_name,
          status: status,
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0', 10),
          clicks: parseInt(item.clicks || '0', 10),
          conversions: parseInt(conversions || '0', 10),
          reach: parseInt(item.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Sync AdSets
    const seenAdSetIds = new Set();
    await Promise.all(adSetsData.map(async (item: any) => {
      seenAdSetIds.add(item.adset_id);
      const campaignStatus = campaignStatusMap.get(item.campaign_id) || 'INACTIVE';
      const adSetStatus = adSetStatusMap.get(item.adset_id) || 'INACTIVE';
      const conversions = item.conversions ||
                           (item.actions && item.actions.find((a: any) => a.action_type === 'lead')?.value) ||
                           0;
      // Effective status: Active only if both AdSet and Campaign are Active
      const effectiveStatus = (campaignStatus === 'ACTIVE' && adSetStatus === 'ACTIVE')
        ? 'ACTIVE'
        : (adSetStatus === 'ACTIVE' ? 'INACTIVE' : adSetStatus);

      return AdSet.findOneAndUpdate(
        { metaAdSetId: item.adset_id, platform: 'Meta' },
        {
          metaAdSetId: item.adset_id,
          name: item.adset_name,
          campaignId: item.campaign_id,
          status: effectiveStatus === 'Unknown' ? 'INACTIVE' : effectiveStatus,
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0', 10),
          clicks: parseInt(item.clicks || '0', 10),
          conversions: parseInt(conversions || '0', 10),
          reach: parseInt(item.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Sync Ads
    const seenAdIds = new Set();
    await Promise.all(adsData.map(async (item: any) => {
      seenAdIds.add(item.ad_id);
      const campaignStatus = campaignStatusMap.get(item.campaign_id) || 'INACTIVE';
      const adSetStatus = adSetStatusMap.get(item.adset_id) || 'INACTIVE';
      const adStatus = adStatusMap.get(item.ad_id) || 'INACTIVE';
      const conversions = item.conversions ||
                           (item.actions && item.actions.find((a: any) => a.action_type === 'lead')?.value) ||
                           0;
      // Effective status: Active only if Campaign, AdSet, and Ad are all Active
      const effectiveStatus = (campaignStatus === 'ACTIVE' && adSetStatus === 'ACTIVE' && adStatus === 'ACTIVE')
        ? 'ACTIVE'
        : (adStatus === 'ACTIVE' ? 'INACTIVE' : adStatus);

      return Ad.findOneAndUpdate(
        { metaAdId: item.ad_id, platform: 'Meta' },
        {
          metaAdId: item.ad_id,
          name: item.ad_name,
          adSetId: item.adset_id,
          campaignId: item.campaign_id,
          status: effectiveStatus === 'Unknown' ? 'INACTIVE' : effectiveStatus,
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0', 10),
          clicks: parseInt(item.clicks || '0', 10),
          conversions: parseInt(conversions || '0', 10),
          reach: parseInt(item.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Cleanup: Mark missing assets as DELETED
    await Promise.all([
      Campaign.updateMany({ platform: 'Meta', metaCampaignId: { $nin: Array.from(seenCampaignIds) } }, { status: 'DELETED' }),
      AdSet.updateMany({ platform: 'Meta', metaAdSetId: { $nin: Array.from(seenAdSetIds) } }, { status: 'DELETED' }),
      Ad.updateMany({ platform: 'Meta', metaAdId: { $nin: Array.from(seenAdIds) } }, { status: 'DELETED' }),
    ]);

    // Sync Leads
    await logMetaSync('Syncing leads...');
    let leadsSynced = 0;
    try {
      leadsSynced = await syncMetaLeads();
    } catch (leadErr) {
      await logMetaSync(`Lead sync failed, but continuing with success response for assets: ${leadErr}`, 'ERROR');
      // We don't throw here because campaigns/ads were already synced successfully
    }

    return NextResponse.json({
      message: 'Meta sync complete',
      campaigns: campaignsData.length,
      adsets: adSetsData.length,
      ads: adsData.length,
      leads: leadsSynced,
    }, { status: 200 });

  } catch (err: any) {
    console.error('Meta Sync Error:', err);
    await logMetaSync(`Meta Sync Critical Error: ${err.message}`, 'ERROR');
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
