import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/lib/models/Application';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const applications = await Application.find();
    return NextResponse.json(applications);
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
    const application = new Application(body);
    await application.save();
    return NextResponse.json(application, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Invalid data', error: err.message }, { status: 400 });
  }
}
