import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/lib/models/Ad';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const ads = await Ad.find({}).sort({ createdAt: -1 });

    return NextResponse.json(ads, { status: 200 });
  } catch (err: any) {
    console.error('Fetch Ads Error:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
