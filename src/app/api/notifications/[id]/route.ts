import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await Notification.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Notification removed' });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
