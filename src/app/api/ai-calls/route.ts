import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AiCall from '@/lib/models/AiCall';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const calls = await AiCall.find().sort({ at: -1 });
    return NextResponse.json(calls);
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
