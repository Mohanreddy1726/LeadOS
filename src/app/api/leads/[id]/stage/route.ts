import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
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

    const { stage } = await req.json();
    const lead = await Lead.findByIdAndUpdate(id, { stage }, { new: true });

    if (!lead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
