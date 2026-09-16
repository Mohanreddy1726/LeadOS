import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/lib/models/Activity';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const activity = await Activity.find().sort({ at: -1 });
    return NextResponse.json(activity);
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const item = new Activity(body);
    await item.save();
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Invalid data', error: err.message }, { status: 400 });
  }
}
