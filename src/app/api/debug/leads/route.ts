import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';

export async function GET() {
  try {
    await dbConnect();
    const count = await Lead.countDocuments();
    const leads = await Lead.find().limit(5);
    return NextResponse.json({ count, leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
