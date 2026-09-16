import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FollowUp from '@/lib/models/FollowUp';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { memberId } = authResult.user!;
    const followUps = await FollowUp.find({ memberId }).sort({ date: 1 });
    return NextResponse.json(followUps);
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
    const followUp = new FollowUp(body);
    await followUp.save();
    return NextResponse.json(followUp, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
