import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';

export async function POST(req: NextRequest) {
  try {
    console.log('--- Ingestion Request Received ---');
    await dbConnect();

    // Security check: Verify the ingestion token
    const token = req.headers.get('x-ingest-token');
    console.log('Auth Token:', token ? 'Present' : 'Missing');

    if (!token || token !== process.env.INGEST_TOKEN) {
      console.log('Auth Result: Unauthorized');
      return NextResponse.json({ message: 'Unauthorized: Invalid or missing ingest token' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received Body:', JSON.stringify(body, null, 2));

    const { formId, data } = body;

    if (!formId || !data) {
      console.log('Validation Result: Missing formId or data');
      return NextResponse.json({ message: 'Missing formId or data' }, { status: 400 });
    }

    // Standardize data based on your requirements
    const name = data.name || data.fullName || data['Full Name'] || data['Full Name'] || '';
    const phone = data.phone || data.phoneNumber || data['Phone Number'] || data['Mobile Number'] || '';
    const program = data.programType || data.courseType || data.selection || data.program || 'Not Specified';
    const destination = data.preferredCountry || data.country || data['Preferred country'] || data['Country'] || 'Not Specified';

    console.log('Mapped Data:', { name, phone, program, destination });

    if (!name || !phone) {
      console.log('Validation Result: Missing name or phone');
      return NextResponse.json({ message: 'Name and Phone are required' }, { status: 400 });
    }

    // Use findOneAndUpdate to club leads with the same phone number
    const leadData = {
      name,
      phone,
      email: data.email || '',
      program,
      destination,
      source: `Website: ${formId}`,
      stage: 'New',
      createdAt: new Date(),
    };

    const newLead = await Lead.findOneAndUpdate(
      { phone },
      leadData,
      { upsert: true, new: true }
    );
    console.log('Database Result: Lead processed successfully', newLead._id);

    return NextResponse.json({
      message: 'Lead ingested successfully',
      leadId: newLead._id
    }, { status: 201 });

  } catch (err: any) {
    console.error('Ingestion system crash:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
