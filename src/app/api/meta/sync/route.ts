import { NextRequest, NextResponse } from 'next/server';
import { syncCampaignPerformance } from '@/lib/meta';

export async function GET(req: NextRequest) {
  try {
    // Security check: verify auth (can use verifyAuth from auth.ts)
    // For now, we'll assume the user is authorized via the session token
    const token = req.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('--- Meta Campaign Sync Started ---');
    const data = await syncCampaignPerformance();
    console.log('Sync Result:', JSON.stringify(data, null, 2));

    return NextResponse.json({
      message: 'Campaign performance synced successfully',
      data: data
    }, { status: 200 });

  } catch (err: any) {
    console.error('Meta Sync Error:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
