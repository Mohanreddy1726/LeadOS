import { NextRequest, NextResponse } from 'next/server';
import { syncCampaignPerformance, syncAdSetPerformance, syncAdPerformance, fetchMetaCampaignStatus, fetchMetaAdSetStatus, fetchMetaAdStatus } from '@/lib/meta';
import dbConnect from '@/lib/db';
import Campaign from '@/lib/models/Campaign';
import AdSet from '@/lib/models/AdSet';
import Ad from '@/lib/models/Ad';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    console.log('--- Meta Full Sync Started ---');

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
    await Promise.all(campaignsData.map(async (item: any) => {
      return Campaign.findOneAndUpdate(
        { metaCampaignId: item.campaign_id, platform: 'Meta' },
        {
          metaCampaignId: item.campaign_id,
          name: item.campaign_name,
          status: campaignStatusMap.get(item.campaign_id),
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0', 10),
          clicks: parseInt(item.clicks || '0', 10),
          conversions: parseInt(item.conversions || '0', 10),
          reach: parseInt(item.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Sync AdSets
    await Promise.all(adSetsData.map(async (item: any) => {
      return AdSet.findOneAndUpdate(
        { metaAdSetId: item.adset_id, platform: 'Meta' },
        {
          metaAdSetId: item.adset_id,
          name: item.adset_name,
          campaignId: item.campaign_id,
          status: adSetStatusMap.get(item.adset_id),
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0', 10),
          clicks: parseInt(item.clicks || '0', 10),
          conversions: parseInt(item.conversions || '0', 10),
          reach: parseInt(item.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    // Sync Ads
    await Promise.all(adsData.map(async (item: any) => {
      return Ad.findOneAndUpdate(
        { metaAdId: item.ad_id, platform: 'Meta' },
        {
          metaAdId: item.ad_id,
          name: item.ad_name,
          adSetId: item.adset_id,
          campaignId: item.campaign_id,
          status: adStatusMap.get(item.ad_id),
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0', 10),
          clicks: parseInt(item.clicks || '0', 10),
          conversions: parseInt(item.conversions || '0', 10),
          reach: parseInt(item.reach || '0', 10),
        },
        { upsert: true, new: true }
      );
    }));

    return NextResponse.json({
      message: 'All Meta assets synced successfully',
      campaigns: campaignsData.length,
      adsets: adSetsData.length,
      ads: adsData.length,
    }, { status: 200 });

  } catch (err: any) {
    console.error('Meta Sync Error:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
