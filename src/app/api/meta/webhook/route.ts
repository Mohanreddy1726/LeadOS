import { NextRequest, NextResponse } from 'next/server';
import { processMetaLead } from '@/lib/meta';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Meta Webhook Verification:', { mode, token, challenge });

  // The verify_token should be set in .env.local as META_WEBHOOK_VERIFY_TOKEN
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ message: 'Verification failed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Meta Webhook Received:', JSON.stringify(body, null, 2));

    if (!body.entry || !body.entry[0].changes) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const change = body.entry[0].changes[0].value;

    if (change.leadgen_id) {
      console.log('Lead Notification received for ID:', change.leadgen_id);

      // Fetch actual lead data from Meta Graph API
      try {
        const { fetchMetaLeadData, processMetaLead } = await import('@/lib/meta');
        const leadData = await fetchMetaLeadData(change.leadgen_id);
        await processMetaLead(leadData);
        console.log('Meta lead processed successfully:', change.leadgen_id);
      } catch (err) {
        console.error('Failed to process Meta lead:', err);
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (err: any) {
    console.error('Meta Webhook Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
