import { NextRequest, NextResponse } from 'next/server';
import { syncCampaignPerformance } from '@/lib/meta';
import dbConnect from '@/lib/db';
import Campaign from '@/lib/models/Campaign';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    console.log('--- Meta Campaign Sync Started ---');
    const response = await syncCampaignPerformance();
    const campaignsData = response.data || [];

    console.log(`Found ${campaignsData.length} campaigns to sync`);

    const syncResults = await Promise.all(
      campaignsData.map(async (item: any) => {
        return Campaign.findOneAndUpdate(
          { name: item.campaign_name, platform: 'Meta' },
          {
            spend: parseFloat(item.spend || '0'),
            impressions: parseInt(item.impressions || '0', 10),
            clicks: parseInt(item.clicks || '0', 10),
            conversions: parseInt(item.conversions || '0', 10),
          },
          { upsert: true, new: true }
        );
      })
    );

    return NextResponse.json({
      message: 'Campaign performance synced successfully',
      count: syncResults.length,
      data: syncResults
    }, { status: 200 });

  } catch (err: any) {
    console.error('Meta Sync Error:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
