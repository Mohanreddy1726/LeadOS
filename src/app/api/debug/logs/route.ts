import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SyncLog from '@/lib/models/SyncLog';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const logs = await SyncLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
