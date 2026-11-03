import { NextResponse } from 'next/server';
import { dodo } from '@/lib/dodopayments';
import db from '@/lib/prisma';
import { normalizePlan } from '@/lib/tier-limits';
import { addCalendarMonths, calculateCommission, fromMinorUnits, isWithinCommissionWindow } from '@/lib/affiliate-math';
import { getAffiliateConfig, recordCommissionReversal } from '@/services/affiliates';

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
      const subscriptionId = data.subscription_id || (type.startsWith('subscription.') ? data.id : null);
      const existing = subscriptionId ? await tx.subscription.findFirst({ where: { dodoSubscriptionId: subscriptionId } }) : null;
      const linkedPayment = (type === 'refund.succeeded' || type === 'dispute.lost') && data.payment_id ? await tx.affiliatePurchase.findUnique({ where: { paymentReference: data.payment_id }, select: { customerId: true } }) : null;
      const userId = data.metadata?.user_id || data.customer?.metadata?.user_id || existing?.userId || linkedPayment?.customerId;
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
      let cancelAtPeriodEnd = Boolean(data.cancel_at_next_billing_date);
      let effectivePeriodEnd = periodEnd || sub?.currentPeriodEnd;
      let status = sub?.status || 'pending';
      let repliesUsed = sub?.aiRepliesUsed || 0;
      let periodStartSaved = sub?.aiRepliesPeriodStart;

      if (type === 'subscription.active' || type === 'subscription.renewed' || type === 'subscription.unpaused') {
        status = 'active';
        cancelAtPeriodEnd = Boolean(data.cancel_at_next_billing_date);
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
      } else if (type === 'subscription.paused') {
        status = 'paused';
        aiAccessEndedAt = eventAt;
      } else if (type === 'subscription.cancelled' || type === 'subscription.expired') {
        const isCancelAtNextBilling = Boolean(data.cancel_at_next_billing_date);
        if (type === 'subscription.cancelled' && isCancelAtNextBilling && periodEnd && periodEnd > new Date()) {
          // Scheduled cancellation at period end: remain active until the billing cycle expires
          status = 'active';
          cancelAtPeriodEnd = true;
        } else {
          // Immediate cancellation (e.g. from Dodo dashboard) or expired subscription
          status = type === 'subscription.expired' ? 'expired' : 'canceled';
          cancelAtPeriodEnd = type === 'subscription.expired' && Boolean(sub?.cancelAtPeriodEnd);
          effectivePeriodEnd = data.cancelled_at ? new Date(data.cancelled_at) : eventAt;
          aiAccessEndedAt = effectivePeriodEnd;
        }
      } else if (type === 'subscription.plan_changed') {
        status = providerStatus === 'active' ? 'active' : sub?.status || 'pending';
        const confirmedNewPeriod = !!periodStart && (!sub?.aiRepliesPeriodStart || periodStart > sub.aiRepliesPeriodStart);
        if (plan === 'smart_page_ai' && status === 'active' && (normalizePlan(sub?.planId) !== 'smart_page_ai' || confirmedNewPeriod)) {
          repliesUsed = 0;
          periodStartSaved = periodStart || eventAt;
          aiAccessEndedAt = null;
        } else if (plan === 'smart_page' && (normalizePlan(sub?.planId) === 'smart_page_ai' || sub?.status === 'trialing')) aiAccessEndedAt = eventAt;
      } else if (type === 'subscription.updated') {
        if (providerStatus === 'cancelled') {
          status = 'canceled';
          effectivePeriodEnd = data.cancelled_at ? new Date(data.cancelled_at) : eventAt;
          aiAccessEndedAt = effectivePeriodEnd;
        } else if (providerStatus === 'paused') {
          status = 'paused';
          aiAccessEndedAt = eventAt;
        } else {
          status = sub?.status || (providerStatus === 'active' ? 'active' : 'pending');
        }
      } else if (type === 'payment.succeeded') {
        // A signed successful payment event is collection evidence for the commission ledger.
        status = sub?.status || 'pending';
      }

      const common = {
        planId: plan,
        tier: plan,
        billingMethod: 'dodo',
        dodoSubscriptionId: subscriptionId || sub?.dodoSubscriptionId,
        dodoCustomerId: data.customer_id || data.customer?.customer_id || sub?.dodoCustomerId,
        currentPeriodStart: periodStart || sub?.currentPeriodStart,
        currentPeriodEnd: effectivePeriodEnd,
        cancelAtPeriodEnd,
        lastProviderEventAt: eventAt,
      };

      const writeData = { ...common, status, aiRepliesUsed: repliesUsed, aiRepliesPeriodStart: periodStartSaved, aiAccessEndedAt };
      if (sub) await tx.subscription.update({ where: { id: sub.id }, data: writeData });
      else await tx.subscription.create({ data: { userId, ...writeData, planId: plan, tier: plan } });

      if (type === 'payment.succeeded' && !data.is_update_payment_method && data.payment_id) {
        if (data.discount_id || data.discount_ids?.length) {
          await tx.user.update({ where: { id: userId }, data: { promoCodeUsedAt: eventAt } });
        }
        const metadataPurchaseId = data.metadata?.affiliate_purchase_id;
        const initialPurchase = metadataPurchaseId ? await tx.affiliatePurchase.findUnique({ where: { id: metadataPurchaseId }, include: { referral: true } }) : null;
        if (Number(initialPurchase?.discountPercent || 0) > 0) {
          await tx.user.update({ where: { id: userId }, data: { promoCodeUsedAt: eventAt } });
        }
        const existingPayment = await tx.affiliatePurchase.findUnique({ where: { paymentReference: data.payment_id } });
        if (!existingPayment) {
          const referral = initialPurchase?.referral || await tx.customerReferral.findUnique({ where: { customerId: userId } });
          if (referral) {
            const paymentCurrency = String(data.currency || initialPurchase?.currency || 'USD').toUpperCase();
            const settlementCurrency = String(data.settlement_currency || paymentCurrency).toUpperCase();
            const settlementTax = data.settlement_tax ?? (settlementCurrency === paymentCurrency ? data.tax : 0) ?? 0;
            const retainedRevenue = fromMinorUnits(Number(data.settlement_amount ?? data.total_amount ?? 0) - Number(settlementTax), settlementCurrency);
            const grossPayment = fromMinorUnits(Number(data.total_amount ?? 0), paymentCurrency);
            const taxAmount = fromMinorUnits(Number(data.tax ?? 0), paymentCurrency);
            const paymentAt = new Date(data.created_at || eventAt);
            const purchase = initialPurchase
              ? await tx.affiliatePurchase.update({ where: { id: initialPurchase.id }, data: { paymentReference: data.payment_id, status: 'verified', currency: paymentCurrency, verifiedAmount: grossPayment, expectedAmount: grossPayment - taxAmount, verifiedAt: paymentAt, paymentDate: paymentAt, subscriptionId: sub?.id || null, verifiedBy: null } })
              : await tx.affiliatePurchase.create({ data: { customerId: userId, referralId: referral.id, subscriptionId: sub?.id, planId: plan, paymentProvider: 'dodo', currency: paymentCurrency, originalAmount: grossPayment - taxAmount, expectedAmount: grossPayment - taxAmount, verifiedAmount: grossPayment, status: 'verified', verifiedAt: paymentAt, paymentDate: paymentAt, paymentReference: data.payment_id } });
            const firstPaidAt = referral.firstPaidAt || paymentAt;
            const updatedReferral = await tx.customerReferral.update({ where: { id: referral.id }, data: { firstPaidAt, discountUsed: referral.discountUsed || Number(initialPurchase?.discountPercent || 0) > 0 } });
            const affiliateIsApproved = await tx.affiliateApplication.findFirst({ where: { userId: referral.affiliateId, status: 'approved' }, select: { id: true } });
            const config = await getAffiliateConfig(tx);
            if (affiliateIsApproved && retainedRevenue > 0 && isWithinCommissionWindow(paymentAt, firstPaidAt, config.eligibilityMonths)) {
              const commissionPercent = Number(config.commissionPercent);
              await tx.commission.create({ data: { affiliateId: updatedReferral.affiliateId, referralId: updatedReferral.id, purchaseId: purchase.id, subscriptionId: sub?.id, currency: settlementCurrency, eligibleRevenue: retainedRevenue, commissionPercent, amount: calculateCommission(retainedRevenue, commissionPercent), earnedAt: paymentAt, eligibilityEndsAt: addCalendarMonths(firstPaidAt, config.eligibilityMonths), eligibilityStatus: 'payable', payoutStatus: 'unpaid' } });
            }
          }
        }
      }

      if ((type === 'refund.succeeded' || type === 'dispute.lost') && data.payment_id) {
        const purchase = await tx.affiliatePurchase.findUnique({ where: { paymentReference: data.payment_id }, include: { commission: true } });
        if (purchase?.commission) {
          const reversalReference = String(data.refund_id || data.dispute_id || data.id || eventId);
          const refundCurrency = String(data.currency || purchase.currency).toUpperCase();
          const refundAmount = data.amount == null ? Number(purchase.verifiedAmount || purchase.expectedAmount) : fromMinorUnits(Number(data.amount), refundCurrency);
          const gross = Number(purchase.verifiedAmount || purchase.expectedAmount);
          const reversed = await recordCommissionReversal(tx, purchase.commission, { refundReference: reversalReference, refundAmount, refundCurrency, fraction: gross > 0 ? Math.min(1, refundAmount / gross) : 1, at: eventAt });
          if (reversed) {
            await tx.affiliatePurchase.update({ where: { id: purchase.id }, data: { ...(reversed.fullyReversed ? { status: 'refunded' } : {}), resolutionNote: `Dodo ${reversed.fullyReversed ? 'refund or chargeback' : 'partial refund or chargeback'}: ${reversalReference}` } });
            if (reversed.fullyReversed && purchase.subscriptionId) {
              const laterPayment = await tx.affiliatePurchase.findFirst({ where: { subscriptionId: purchase.subscriptionId, status: 'verified', paymentDate: { gt: purchase.paymentDate || purchase.createdAt } }, select: { id: true } });
              if (!laterPayment) await tx.subscription.update({ where: { id: purchase.subscriptionId }, data: { status: 'canceled', cancelAtPeriodEnd: false } });
            }
            await tx.affiliateAuditEvent.create({ data: { actorId: null, action: type === 'dispute.lost' ? 'chargeback_reversed' : 'refund_reversed', entityType: 'commission', entityId: purchase.commission.id, details: { reference: reversalReference, refundAmount, refundCurrency, reversedCommission: reversed.commissionAmount } } });
          }
        }
      }
      await tx.webhookEvent.update({ where: { eventId }, data: { status: 'processed' } });
    });
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ received: true, duplicate: true });
    console.error('Error processing Dodo webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
