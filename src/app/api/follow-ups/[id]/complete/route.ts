import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FollowUp from '@/lib/models/FollowUp';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const followUp = await FollowUp.findByIdAndUpdate(params.id, { status: 'Completed' }, { new: true });
    if (!followUp) {
      return NextResponse.json({ message: 'Follow-up not found' }, { status: 404 });
    }
    return NextResponse.json(followUp);
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
