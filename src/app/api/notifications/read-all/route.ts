import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await Notification.updateMany({ userId: authResult.user!.userId, read: false }, { read: true });
    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
