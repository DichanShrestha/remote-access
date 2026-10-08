import { NextResponse } from 'next/server';
import { dodo } from '@/lib/dodopayments';
import db from '@/lib/prisma';

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

  const webhookKey = process.env.DODO_WEBHOOK_SECRET || process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  if (!webhookKey) {
    console.error('Webhook verification failed: DODO_WEBHOOK_SECRET is not set in environment variables');
    return NextResponse.json(
      { error: 'Webhook key not configured on server' },
      { status: 500 }
    );
  }

  let event: DodoEvent;
  try {
    event = dodo.webhooks.unwrap(payload, {
      headers: {
        'webhook-id': webhookId,
        'webhook-signature': webhookSignature,
        'webhook-timestamp': webhookTimestamp,
      },
      key: webhookKey,
    }) as DodoEvent;
  } catch (err: any) {
    console.error('Webhook verification failed:', err?.message || err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventId = event.event_id || event.id || 'unknown_event_id';
  const eventType = event.type || event.event_type || 'unknown';
  const data = event.data || {};

  try {
    // Process subscription events
    if (eventType.startsWith('subscription.')) {
      const userId = data.metadata?.user_id || data.customer?.metadata?.user_id;
      const dodoSubscriptionId = data.subscription_id || data.id;
      const dodoCustomerId = data.customer_id || data.customer?.customer_id;
      const status = data.status || 'active';
      const cancelAtPeriodEnd = !!data.cancel_at_period_end;
      const planId = data.metadata?.plan_id || data.product_id || (data.product_cart && data.product_cart[0]?.product_id) || "smart_page";
      
      let nextBillingDate: Date | undefined;
      if (data.next_billing_date) {
         nextBillingDate = new Date(data.next_billing_date);
      } else if (data.current_period_end) {
         nextBillingDate = new Date(data.current_period_end);
      }

      if (userId && dodoSubscriptionId) {
        // Upsert the subscription using standard upsert or finding existing
        const existing = await db.subscription.findFirst({
           where: { userId }
        });

        if (existing) {
           await db.subscription.update({
             where: { id: existing.id },
             data: {
               planId,
               tier: planId,
               status,
               billingMethod: 'dodo',
               cancelAtPeriodEnd,
               dodoSubscriptionId,
               dodoCustomerId,
               ...(nextBillingDate ? { currentPeriodEnd: nextBillingDate } : {}),
             }
           });
        } else {
           await db.subscription.create({
             data: {
               userId,
               planId,
               status,
               billingMethod: 'dodo',
               cancelAtPeriodEnd,
               dodoSubscriptionId,
               dodoCustomerId,
               currentPeriodEnd: nextBillingDate || new Date(),
               tier: planId
             }
           });
        }
        
        console.log(`Updated subscription for user ${userId} to status ${status}`);
      }
    }
    
    // Also record the webhook to ensure idempotency
    await db.webhookEvent.upsert({
      where: { eventId },
      update: { status: 'processed' },
      create: {
        eventId,
        provider: 'dodo',
        type: eventType,
        status: 'processed'
      }
    });

  } catch (err: any) {
    console.error('Error processing webhook event:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
