import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { role } = authResult.user!;
    let query = {};

    if (role === 'manager') {
      query = { role: 'telecaller' };
    } else if (role === 'telecaller') {
      return NextResponse.json({ message: 'Not authorized to view team' }, { status: 403 });
    }

    const members = await User.find(query).select('-password');
    return NextResponse.json(members);
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
