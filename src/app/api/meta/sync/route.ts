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

    await logMetaSync(`Fetched: ${campaignsData.length} campaign insights, ${campaignStatData.length} campaign statuses`);
    await logMetaSync(`Fetched: ${adSetsData.length} adset insights, ${adSetStatData.length} adset statuses`);
    await logMetaSync(`Fetched: ${adsData.length} ad insights, ${adStatData.length} ad statuses`);

    // Create maps for quick lookup of performance data
    const campaignPerfMap = new Map();
    campaignsData.forEach((item: any) => campaignPerfMap.set(item.campaign_id, item));

    const adSetPerfMap = new Map();
    adSetsData.forEach((item: any) => adSetPerfMap.set(item.adset_id, item));

    const adPerfMap = new Map();
    adsData.forEach((item: any) => adPerfMap.set(item.ad_id, item));

    const campaignStatusMap = new Map();
    campaignStatData.forEach((s: any) => campaignStatusMap.set(s.id, s.status));

    const adSetStatusMap = new Map();
    adSetStatData.forEach((s: any) => adSetStatusMap.set(s.id, s.status));

    const adStatusMap = new Map();
    adStatData.forEach((s: any) => adStatusMap.set(s.id, s.status));

    // Sync Campaigns - Iterate over ALL campaigns
    const seenCampaignIds = new Set();
    await Promise.all(campaignStatData.map(async (item: any) => {
      seenCampaignIds.add(item.id);
      const perf = campaignPerfMap.get(item.id) || {};
      const status = (item.status || 'INACTIVE').toUpperCase();
      const conversions = perf.conversions ||
                           (perf.actions && perf.actions.find((a: any) => a.action_type === 'lead')?.value) ||
                           0;
      return Campaign.findOneAndUpdate(
        { metaCampaignId: item.id, platform: 'Meta' },
        {
          metaCampaignId: item.id,
          name: item.name,
          platform: 'Meta',
          status: status,
          spend: parseFloat(perf.spend || '0'),
          impressions: parseInt(perf.impressions || '0', 10),
          clicks: parseInt(perf.clicks || '0', 10),
          conversions: parseInt(conversions || '0', 10),
          reach: parseInt(perf.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Sync AdSets - Iterate over ALL adsets
    const seenAdSetIds = new Set();
    await Promise.all(adSetStatData.map(async (item: any) => {
      seenAdSetIds.add(item.id);
      const perf = adSetPerfMap.get(item.id) || {};
      const campaignStatus = (campaignStatusMap.get(item.campaign_id) || 'UNKNOWN').toUpperCase();
      const adSetStatus = (item.status || 'UNKNOWN').toUpperCase();
      const conversions = perf.conversions ||
                           (perf.actions && perf.actions.find((a: any) => a.action_type === 'lead')?.value) ||
                           0;

      let effectiveStatus = adSetStatus;
      // Only force INACTIVE if parent is explicitly not ACTIVE and not UNKNOWN
      if (adSetStatus === 'ACTIVE' && campaignStatus !== 'ACTIVE' && campaignStatus !== 'UNKNOWN') {
        effectiveStatus = 'INACTIVE';
      }

      return AdSet.findOneAndUpdate(
        { metaAdSetId: item.id, platform: 'Meta' },
        {
          metaAdSetId: item.id,
          name: item.name,
          campaignId: item.campaign_id,
          status: effectiveStatus === 'UNKNOWN' ? 'INACTIVE' : effectiveStatus,
          spend: parseFloat(perf.spend || '0'),
          impressions: parseInt(perf.impressions || '0', 10),
          clicks: parseInt(perf.clicks || '0', 10),
          conversions: parseInt(conversions || '0', 10),
          reach: parseInt(perf.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Sync Ads - Iterate over ALL ads
    const seenAdIds = new Set();
    await Promise.all(adStatData.map(async (item: any) => {
      seenAdIds.add(item.id);
      const perf = adPerfMap.get(item.id) || {};
      const campaignStatus = (campaignStatusMap.get(item.campaign_id) || 'UNKNOWN').toUpperCase();
      const adSetStatus = (adSetStatusMap.get(item.adset_id) || 'UNKNOWN').toUpperCase();
      const adStatus = (item.status || 'UNKNOWN').toUpperCase();
      const conversions = perf.conversions ||
                           (perf.actions && perf.actions.find((a: any) => a.action_type === 'lead')?.value) ||
                           0;

      let effectiveStatus = adStatus;
      // Only force INACTIVE if any parent is explicitly not ACTIVE and not UNKNOWN
      if (adStatus === 'ACTIVE' &&
          ((campaignStatus !== 'ACTIVE' && campaignStatus !== 'UNKNOWN') ||
           (adSetStatus !== 'ACTIVE' && adSetStatus !== 'UNKNOWN'))) {
        effectiveStatus = 'INACTIVE';
      }

      return Ad.findOneAndUpdate(
        { metaAdId: item.id, platform: 'Meta' },
        {
          metaAdId: item.id,
          name: item.name,
          adSetId: item.adset_id,
          campaignId: item.campaign_id,
          status: effectiveStatus === 'UNKNOWN' ? 'INACTIVE' : effectiveStatus,
          spend: parseFloat(perf.spend || '0'),
          impressions: parseInt(perf.impressions || '0', 10),
          clicks: parseInt(perf.clicks || '0', 10),
          conversions: parseInt(conversions || '0', 10),
          reach: parseInt(perf.reach || '0', 10),
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
