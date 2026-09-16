import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { role, memberId } = authResult.user!;
    let query = {};

    if (role === 'telecaller') {
      query = { assignedTo: memberId };
    } else if (role === 'manager') {
      query = {
        $or: [
          { assignedTo: { $exists: false } },
          { managerId: memberId }
        ]
      };
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    return NextResponse.json(leads);
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

    const { ids, callerId } = await req.json();
    const updates = ids.map((id: string) =>
      Lead.findByIdAndUpdate(id, {
        assignedTo: callerId,
        stage: 'Assigned'
      })
    );
    await Promise.all(updates);
    return NextResponse.json({ message: 'Leads assigned successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
