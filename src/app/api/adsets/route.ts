import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AdSet from '@/lib/models/AdSet';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const adsets = await AdSet.find({}).sort({ createdAt: -1 });

    return NextResponse.json(adsets, { status: 200 });
  } catch (err: any) {
    console.error('Fetch AdSets Error:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
