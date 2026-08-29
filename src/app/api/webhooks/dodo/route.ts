import { NextResponse } from 'next/server';
import { dodo } from '@/lib/dodo';

type DodoEvent = {
  event_id?: string;
  id?: string;
  type?: string;
  event_type?: string;
  data?: Record<string, any>;
};

export async function POST(req: Request) {
  const payload = await req.text();

  const webhookId = req.headers.get('webhook-id');
  const webhookSignature = req.headers.get('webhook-signature');
  const webhookTimestamp = req.headers.get('webhook-timestamp');

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json(
      { error: 'Missing webhook headers' },
      { status: 400 }
    );
  }

  if (!dodo) {
    return NextResponse.json(
      { error: 'Dodo Payments not initialized' },
      { status: 500 }
    );
  }

  let event: DodoEvent;
  try {
    // Verifies signature + parses payload
    event = dodo.webhooks.unwrap(payload, {
      headers: {
        'webhook-id': webhookId,
        'webhook-signature': webhookSignature,
        'webhook-timestamp': webhookTimestamp,
      },
    }) as DodoEvent;
  } catch (err: any) {
    console.error('Webhook verification failed:', err?.message || err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventId = event.event_id || event.id || 'unknown_event_id';
  const eventType = event.type || event.event_type || 'unknown';

  switch (eventType) {
    case 'payment.succeeded':
    case 'payment.failed':
    case 'subscription.created':
    case 'subscription.updated':
    case 'subscription.cancelled':
      console.log(`Handled Dodo event: ${eventType}`, { eventId, data: event.data });
      break;
    default:
      console.log(`Unhandled Dodo event type: ${eventType}`, { eventId });
  }

  return NextResponse.json({ received: true });
}
