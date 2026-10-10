import { NextResponse } from 'next/server';
import { dodo } from '@/lib/dodopayments';
import db from '@/lib/prisma';
import { normalizePlan } from '@/lib/tier-limits';

type DodoEvent = { type?: string; timestamp?: string; data?: Record<string, any> };

export async function POST(req: Request) {
  const payload = await req.text();
  const webhookId = req.headers.get('webhook-id');
  const webhookSignature = req.headers.get('webhook-signature');
  const webhookTimestamp = req.headers.get('webhook-timestamp');
  const webhookKey = process.env.DODO_WEBHOOK_SECRET || process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookId || !webhookSignature || !webhookTimestamp) return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  if (!dodo || !webhookKey) return NextResponse.json({ error: 'Webhook verification is not configured' }, { status: 500 });
  let event: DodoEvent;
  try {
    event = dodo.webhooks.unwrap(payload, { headers: { 'webhook-id': webhookId, 'webhook-signature': webhookSignature, 'webhook-timestamp': webhookTimestamp }, key: webhookKey }) as DodoEvent;
  } catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 401 }); }

  const eventId = webhookId;
  const type = event.type || 'unknown';
  const data = event.data || {};
  const eventAt = new Date(event.timestamp || webhookTimestamp);
  try {
    await db.$transaction(async (tx) => {
      await tx.webhookEvent.create({ data: { eventId, provider: 'dodo', type, status: 'processing' } });
      const subscriptionId = data.subscription_id || data.id;
      const existing = subscriptionId ? await tx.subscription.findFirst({ where: { dodoSubscriptionId: subscriptionId } }) : null;
      const userId = data.metadata?.user_id || data.customer?.metadata?.user_id || existing?.userId;
      if (!userId) {
        await tx.webhookEvent.update({ where: { eventId }, data: { status: 'ignored_missing_user' } });
        return;
      }
      const sub = existing || await tx.subscription.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } });
      if (sub?.lastProviderEventAt && eventAt <= sub.lastProviderEventAt) {
        await tx.webhookEvent.update({ where: { eventId }, data: { status: 'ignored_stale' } });
        return;
      }
      const productId = data.product_id || data.product_cart?.[0]?.product_id;
      const aiProduct = process.env.DODO_PRODUCT_SMART_PAGE_AI;
      const basicProduct = process.env.DODO_PRODUCT_SMART_PAGE;
      const plan = productId === aiProduct ? 'smart_page_ai' : productId === basicProduct ? 'smart_page' : normalizePlan(data.metadata?.plan_id || sub?.planId);
      const providerStatus = data.status;
      const periodStart = data.previous_billing_date ? new Date(data.previous_billing_date) : undefined;
      const periodEnd = data.next_billing_date ? new Date(data.next_billing_date) : undefined;
      let aiAccessEndedAt = sub?.aiAccessEndedAt || null;
      const common = {
        planId: plan, tier: plan, billingMethod: 'dodo', dodoSubscriptionId: subscriptionId,
        dodoCustomerId: data.customer_id || data.customer?.customer_id || sub?.dodoCustomerId,
        currentPeriodStart: periodStart || sub?.currentPeriodStart,
        currentPeriodEnd: periodEnd || sub?.currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(data.cancel_at_next_billing_date), lastProviderEventAt: eventAt,
      };
      let status = sub?.status || 'pending';
      let repliesUsed = sub?.aiRepliesUsed || 0;
      let periodStartSaved = sub?.aiRepliesPeriodStart;
      if (type === 'subscription.active' || type === 'subscription.renewed' || type === 'subscription.unpaused') {
        status = 'active';
        // Only successful activation or an explicit renewal for a genuinely new provider period resets AI replies.
        const confirmedNewPeriod = !!periodStart && (!sub?.aiRepliesPeriodStart || periodStart > sub.aiRepliesPeriodStart);
        const newlyActivatedAI = type === 'subscription.active' && plan === 'smart_page_ai' && (sub?.status !== 'active' || normalizePlan(sub?.planId) !== 'smart_page_ai');
        if (plan === 'smart_page_ai' && (newlyActivatedAI || (type === 'subscription.renewed' && confirmedNewPeriod))) {
          repliesUsed = 0;
          periodStartSaved = periodStart || eventAt;
        }
        if (plan === 'smart_page_ai') aiAccessEndedAt = null;
        else if (plan === 'smart_page' && sub?.status === 'trialing') aiAccessEndedAt = eventAt;
      } else if (type === 'subscription.failed' || type === 'subscription.on_hold') {
        status = 'past_due';
      } else if (type === 'subscription.cancelled' || type === 'subscription.expired') {
        status = type === 'subscription.cancelled' && periodEnd && periodEnd > new Date() ? 'active' : 'expired';
        if (normalizePlan(sub?.planId) === 'smart_page_ai' && status === 'expired') aiAccessEndedAt = periodEnd || eventAt;
      } else if (type === 'subscription.plan_changed') {
        status = providerStatus === 'active' ? 'active' : sub?.status || 'pending';
        const confirmedNewPeriod = !!periodStart && (!sub?.aiRepliesPeriodStart || periodStart > sub.aiRepliesPeriodStart);
        if (plan === 'smart_page_ai' && status === 'active' && (normalizePlan(sub?.planId) !== 'smart_page_ai' || confirmedNewPeriod)) {
          repliesUsed = 0;
          periodStartSaved = periodStart || eventAt;
          aiAccessEndedAt = null;
        } else if (plan === 'smart_page' && (normalizePlan(sub?.planId) === 'smart_page_ai' || sub?.status === 'trialing')) aiAccessEndedAt = eventAt;
      } else if (type === 'subscription.updated') {
        // Cancellation scheduling and metadata updates never create new paid access or reset quota.
        status = sub?.status || (providerStatus === 'active' ? 'active' : 'pending');
      } else if (type === 'payment.succeeded') {
        // Payment events alone are not sufficient to infer a subscription period or plan.
        status = sub?.status || 'pending';
      }
      const writeData = { ...common, status, aiRepliesUsed: repliesUsed, aiRepliesPeriodStart: periodStartSaved, aiAccessEndedAt };
      if (sub) await tx.subscription.update({ where: { id: sub.id }, data: writeData });
      else await tx.subscription.create({ data: { userId, ...writeData, planId: plan, tier: plan } });
      await tx.webhookEvent.update({ where: { eventId }, data: { status: 'processed' } });
    });
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ received: true, duplicate: true });
    console.error('Error processing Dodo webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
