import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Security check: Verify the ingestion token
    const token = req.headers.get('x-ingest-token');
    if (!token || token !== process.env.INGEST_TOKEN) {
      return NextResponse.json({ message: 'Unauthorized: Invalid or missing ingest token' }, { status: 401 });
    }

    const body = await req.json();
    const { formId, data } = body;

    if (!formId || !data) {
      return NextResponse.json({ message: 'Missing formId or data' }, { status: 400 });
    }

    // Standardize data based on your requirements
    // We want: Name, Phone Number, MBBS/MASTERS, Preferred country, Form Source

    const name = data.name || data.fullName || data['Full Name'] || data['Full Name'] || '';
    const phone = data.phone || data.phoneNumber || data['Phone Number'] || data['Mobile Number'] || '';
    const program = data.programType || data.courseType || data.selection || data.program || 'Not Specified';
    const destination = data.preferredCountry || data.country || data['Preferred country'] || data['Country'] || 'Not Specified';

    if (!name || !phone) {
      return NextResponse.json({ message: 'Name and Phone are required' }, { status: 400 });
    }

    // Create the lead in MongoDB
    const newLead = new Lead({
      name,
      phone,
      email: data.email || '', // Optional, but good to have if available
      program,
      destination,
      source: `Website: ${formId}`,
      stage: 'New',
      createdAt: new Date(),
    });

    await newLead.save();

    return NextResponse.json({
      message: 'Lead ingested successfully',
      leadId: newLead._id
    }, { status: 201 });

  } catch (err: any) {
    console.error('Ingestion error:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
