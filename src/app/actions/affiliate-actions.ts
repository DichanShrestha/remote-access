'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import db from '@/lib/prisma';
import { dodo } from '@/lib/dodopayments';
import { authService } from '@/services/auth';
import { generateAffiliateCode, getAffiliateConfig, recordCommissionReversal, requireAffiliateAdmin } from '@/services/affiliates';
import { PAID_PLANS, type PaidPlanId } from '@/lib/pricing';
import { addCalendarMonths, calculateCommission, calculateDiscount, calculateEligibleRevenue, isWithinCommissionWindow } from '@/lib/affiliate-math';
import { validateCustomAffiliateCode } from '@/lib/affiliate-code';
import { cookies, headers } from 'next/headers';
import { getInitialPricingMode, PRICING_MODE_COOKIE } from '@/lib/pricing';

const codeSchema = z.string().trim().min(4).max(40).regex(/^[A-Za-z0-9-]+$/);
const detailsSchema = z.string().trim().max(1000).optional();

export async function applyForAffiliate(details: string, basedInNepal: boolean) {
  const user = await authService.requireUser();
  const parsed = detailsSchema.safeParse(details);
  if (basedInNepal !== true) return { error: 'Confirm that you are based in Nepal to apply.' };
  if (!parsed.success) return { error: 'Please keep your application under 1,000 characters.' };
  await db.affiliateApplication.upsert({
    where: { userId: user.id },
    create: { userId: user.id, basedInNepal: true, details: parsed.data },
    update: { basedInNepal: true, details: parsed.data, status: 'pending', reviewNote: null, reviewedAt: null, reviewedBy: null },
  });
  revalidatePath('/dashboard/affiliate');
  return { success: true };
}

export async function validateAffiliateCode(rawCode: string) {
  const user = await authService.requireUser();
  const parsed = codeSchema.safeParse(rawCode);
  if (!parsed.success) return { valid: false, message: 'Enter a valid referral code.' };
  const code = await db.affiliateCode.findFirst({
    where: { code: { equals: parsed.data, mode: 'insensitive' }, active: true, affiliate: { affiliateApplication: { status: 'approved' } } },
    include: { affiliate: { select: { id: true } } },
  });
  if (!code) return { valid: false, message: 'That referral code is not active.' };
  if (code.affiliateId === user.id) return { valid: false, message: 'You cannot use your own referral code.' };
  const referral = await db.customerReferral.findUnique({ where: { customerId: user.id } });
  if (referral && referral.codeId !== code.id) return { valid: false, message: 'A referral code is already attached to your account.' };
  const previouslyPaid = await db.subscription.findFirst({ where: { userId: user.id, billingMethod: { in: ['manual', 'dodo'] } } });
  if (previouslyPaid && !referral) return { valid: false, message: 'A referral code cannot be attached after your first paid subscription.' };
  const promoUse = await db.user.findUnique({ where: { id: user.id }, select: { promoCodeUsedAt: true } });
  const discountAvailable = !previouslyPaid && !referral?.discountUsed && !promoUse?.promoCodeUsedAt;
  const config = await getAffiliateConfig();
  return { valid: true, discountAvailable, discountPercent: discountAvailable ? Number(config.customerDiscountPercent) : 0, message: discountAvailable ? 'Code applied. You qualify for the first-purchase discount.' : 'Referral attribution will be recorded, but this account is not eligible for the first-purchase discount.' };
}

export async function updateAffiliateReferralCode(rawCode: string, confirmExistingReferrals = false) {
  const user = await authService.requireUser();
  const validated = validateCustomAffiliateCode(rawCode);
  if (!validated.code) return { error: validated.error || 'Enter a valid referral code.' };

  try {
    const result = await db.$transaction(async (tx) => {
      const application = await tx.affiliateApplication.findUnique({ where: { userId: user.id }, include: { code: true } });
      if (application?.status !== 'approved') return { error: 'Only approved affiliates can change their referral code.' };

      const currentCode = application.code;
      const normalizedCode = validated.code!;
      if (currentCode?.code.toUpperCase() === normalizedCode) {
        if (currentCode.code !== normalizedCode) await tx.affiliateCode.update({ where: { id: currentCode.id }, data: { code: normalizedCode } });
        return { success: true, code: normalizedCode, usedReferralCount: 0, active: currentCode.active };
      }
      const referralsUsingCode = currentCode
        ? await tx.customerReferral.count({ where: { codeId: currentCode.id } })
        : 0;
      if (referralsUsingCode > 0 && !confirmExistingReferrals) {
        return { requiresConfirmation: true, usedReferralCount: referralsUsingCode, code: normalizedCode };
      }

      const existing = await tx.affiliateCode.findFirst({ where: { code: { equals: normalizedCode, mode: 'insensitive' } } });
      if (existing && existing.id !== currentCode?.id) return { error: 'That referral code is already taken. Choose another.' };

      if (currentCode) {
        await tx.affiliateCode.update({ where: { id: currentCode.id }, data: { applicationId: null, active: false } });
      }
      await tx.affiliateCode.create({ data: { affiliateId: user.id, applicationId: application.id, code: normalizedCode, active: currentCode?.active ?? true } });
      await tx.affiliateAuditEvent.create({ data: { actorId: user.id, action: 'affiliate_code_changed', entityType: 'affiliate_code', entityId: currentCode?.id || application.id, details: { previousCode: currentCode?.code || null, newCode: normalizedCode, preservedReferralCount: referralsUsingCode } } });
      return { success: true, code: normalizedCode, usedReferralCount: referralsUsingCode, active: currentCode?.active ?? true };
    }, { isolationLevel: 'Serializable' });

    if (result.success) {
      revalidatePath('/dashboard/affiliate');
      revalidatePath('/admin/affiliates');
    }
    return result;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return { error: 'That referral code is already taken. Choose another.' };
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') {
      return { error: 'Your code changed in another request. Refresh the page and try again.' };
    }
    return { error: error instanceof Error ? error.message : 'Could not update the referral code. Please retry.' };
  }
}

export async function createManualAffiliatePurchase(planId: PaidPlanId, rawCode?: string) {
  const user = await authService.requireUser();
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  if (getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country')) !== 'nepal') {
    return { error: 'Manual NPR purchases are only available through Nepal billing.' };
  }
  if (planId !== 'smart_page' && planId !== 'smart_page_ai') return { error: 'Choose a valid plan.' };
  if (!user.profile) return { error: 'Complete your profile before purchasing.' };
  const plan = PAID_PLANS[planId];
  const originalAmount = plan.nepal.amount;
  const currency = plan.nepal.currency;

  try {
    const purchase = await db.$transaction(async (tx) => {
      const existingPending = await tx.affiliatePurchase.findFirst({ where: { customerId: user.id, status: 'pending' }, orderBy: { createdAt: 'desc' } });
      if (existingPending) throw new Error('You already have a pending payment. Complete or contact support about it before starting another purchase.');

      let referral = await tx.customerReferral.findUnique({ where: { customerId: user.id } });
      if (rawCode?.trim()) {
        const normalized = codeSchema.parse(rawCode.trim());
        const code = await tx.affiliateCode.findFirst({ where: { code: { equals: normalized, mode: 'insensitive' }, active: true, affiliate: { affiliateApplication: { status: 'approved' } } } });
        if (!code) throw new Error('That referral code is not active.');
        if (code.affiliateId === user.id) throw new Error('You cannot use your own referral code.');
        if (referral && referral.codeId !== code.id) throw new Error('A referral code is already attached to your account.');
        const historicalPayment = await tx.subscription.findFirst({ where: { userId: user.id, billingMethod: { in: ['manual', 'dodo'] } } });
        if (historicalPayment && !referral) throw new Error('A referral code cannot be attached after your first paid subscription.');
        if (!referral) referral = await tx.customerReferral.create({ data: { customerId: user.id, affiliateId: code.affiliateId, codeId: code.id } });
      }

      const config = await getAffiliateConfig(tx);
      const previouslyPaid = await tx.subscription.findFirst({ where: { userId: user.id, billingMethod: { in: ['manual', 'dodo'] } } });
      const promoUse = await tx.user.findUnique({ where: { id: user.id }, select: { promoCodeUsedAt: true } });
      const discountPercent = referral && !previouslyPaid && !referral.discountUsed && !promoUse?.promoCodeUsedAt ? Number(config.customerDiscountPercent) : 0;
      const { discountAmount, finalAmount: expectedAmount } = calculateDiscount(originalAmount, discountPercent);
      return tx.affiliatePurchase.create({ data: { customerId: user.id, referralId: referral?.id, planId, currency, originalAmount, discountPercent, discountAmount, expectedAmount } });
    }, { isolationLevel: 'Serializable' });
    revalidatePath('/dashboard/affiliate');
    return { purchaseId: purchase.id };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Could not start this purchase. Please retry.' };
  }
}

export async function createInternationalAffiliateCheckout(planId: PaidPlanId, rawCode: string) {
  const user = await authService.requireUser();
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  if (getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country')) === 'nepal') {
    return { error: 'Use Nepal billing for this location.' };
  }
  if (planId !== 'smart_page' && planId !== 'smart_page_ai') return { error: 'Choose a valid plan.' };
  if (!user.profile) return { error: 'Complete your creator profile before purchasing.' };
  if (!dodo || !process.env.DODO_API_KEY) return { error: 'Billing is temporarily unavailable. Please try again later.' };
  const productId = planId === 'smart_page_ai'
    ? process.env.DODO_PRODUCT_SMART_PAGE_AI || process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE_AI
    : process.env.DODO_PRODUCT_SMART_PAGE || process.env.NEXT_PUBLIC_DODO_PRODUCT_SMART_PAGE;
  if (!productId) return { error: 'This plan is not configured for checkout.' };
  const parsedCode = codeSchema.safeParse(rawCode);
  if (!parsedCode.success) return { error: 'Enter a valid promo code.' };

  let purchaseId: string | null = null;
  try {
    const purchase = await db.$transaction(async (tx) => {
      if (await tx.affiliatePurchase.findFirst({ where: { customerId: user.id, status: 'pending' } })) {
        throw new Error('You already have a pending payment. Complete it or contact support before starting another purchase.');
      }
      const code = await tx.affiliateCode.findFirst({
        where: { code: { equals: parsedCode.data, mode: 'insensitive' }, active: true, affiliate: { affiliateApplication: { status: 'approved' } } },
      });
      if (!code) throw new Error('That promo code is not active.');
      if (code.affiliateId === user.id) throw new Error('You cannot use your own promo code.');
      let referral = await tx.customerReferral.findUnique({ where: { customerId: user.id } });
      if (referral && referral.codeId !== code.id) throw new Error('A referral code is already attached to your account.');
      const paidSubscription = await tx.subscription.findFirst({ where: { userId: user.id, billingMethod: { in: ['manual', 'dodo'] } } });
      if (paidSubscription && !referral) throw new Error('A promo code cannot be attached after your first paid subscription.');
      if (!referral) referral = await tx.customerReferral.create({ data: { customerId: user.id, affiliateId: code.affiliateId, codeId: code.id } });
      const promoUse = await tx.user.findUnique({ where: { id: user.id }, select: { promoCodeUsedAt: true } });
      const config = await getAffiliateConfig(tx);
      const discountPercent = !paidSubscription && !referral.discountUsed && !promoUse?.promoCodeUsedAt ? Number(config.customerDiscountPercent) : 0;
      const planPrice = PAID_PLANS[planId].international;
      const { discountAmount, finalAmount: expectedAmount } = calculateDiscount(planPrice.amount, discountPercent);
      return tx.affiliatePurchase.create({
        data: { customerId: user.id, referralId: referral.id, planId, paymentProvider: 'dodo', currency: planPrice.currency, originalAmount: planPrice.amount, discountPercent, discountAmount, expectedAmount },
      });
    }, { isolationLevel: 'Serializable' });
    purchaseId = purchase.id;

    let providerDiscountCode: string | undefined;
    if (purchase.discountPercent.gt(0)) {
      const discount = await dodo.discounts.create({ amount: Math.round(Number(purchase.discountPercent) * 100), type: 'percentage', usage_limit: 1, per_customer_usage_limit: 1, subscription_cycles: 1, restricted_to: [productId], customer_eligibility: 'any', name: `Pageory first payment ${purchase.id}` });
      providerDiscountCode = discount.code;
    }
    const session = await dodo.checkoutSessions.create({
      customer: { email: user.email!, name: user.email! },
      product_cart: [{ product_id: productId, quantity: 1 }],
      metadata: { user_id: user.id, plan_id: planId, affiliate_purchase_id: purchase.id },
      ...(providerDiscountCode ? { discount_code: providerDiscountCode } : {}),
      feature_flags: { allow_discount_code: false },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=billing`,
    });
    await db.affiliatePurchase.update({ where: { id: purchase.id }, data: { paymentReference: session.session_id } });
    revalidatePath('/dashboard/affiliate');
    return { checkoutUrl: session.checkout_url };
  } catch (error: unknown) {
    if (purchaseId) await db.affiliatePurchase.updateMany({ where: { id: purchaseId, status: 'pending' }, data: { status: 'rejected', resolutionNote: 'Dodo checkout could not be created.' } }).catch(() => undefined);
    return { error: error instanceof Error ? error.message : 'Could not start checkout. Please retry.' };
  }
}

export async function confirmManualPaymentSent(purchaseId: string) {
  const user = await authService.requireUser();
  const id = z.string().min(8).max(40).safeParse(purchaseId);
  if (!id.success) return { error: 'This subscription request is invalid.' };
  const submittedAt = new Date();
  const updated = await db.$transaction(async (tx) => {
    const result = await tx.affiliatePurchase.updateMany({ where: { id: id.data, customerId: user.id, paymentProvider: 'manual', status: 'pending', customerConfirmedAt: null }, data: { customerConfirmedAt: submittedAt } });
    if (result.count) await tx.affiliateAuditEvent.create({ data: { actorId: user.id, action: 'payment_confirmation_submitted', entityType: 'affiliate_purchase', entityId: id.data, details: { submittedAt: submittedAt.toISOString() } } });
    return result;
  });
  if (!updated.count) return { error: 'This payment is no longer awaiting submission.' };
  revalidatePath('/dashboard/affiliate');
  revalidatePath('/admin/affiliates');
  revalidatePath(`/onboarding/payment/${id.data}`);
  return { success: true };
}

export async function reviewAffiliateApplication(applicationId: string, decision: 'approved' | 'rejected', note = '') {
  const admin = await requireAffiliateAdmin();
  const parsed = z.string().trim().min(5, 'Enter a review reason of at least 5 characters.').max(1000).safeParse(note);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Enter a review reason.');
  await db.$transaction(async (tx) => {
    const application = await tx.affiliateApplication.findUnique({ where: { id: applicationId } });
    if (!application) throw new Error('Application not found.');
    await tx.affiliateApplication.update({ where: { id: applicationId }, data: { status: decision, reviewedBy: admin.id, reviewedAt: new Date(), reviewNote: parsed.data || null } });
    if (decision === 'approved' && !await tx.affiliateCode.findUnique({ where: { applicationId } })) await generateAffiliateCode(tx, application.userId, applicationId);
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: `application_${decision}`, entityType: 'affiliate_application', entityId: applicationId, details: { note: parsed.data } } });
  });
  revalidatePath('/admin/affiliates');
}

export async function setAffiliateStatus(userId: string, status: 'suspended' | 'approved', note = '') {
  const admin = await requireAffiliateAdmin();
  const parsedReason = z.string().trim().min(5, 'Enter a reason of at least 5 characters.').max(1000).parse(note);
  const app = await db.affiliateApplication.findUnique({ where: { userId } });
  if (!app || !['approved', 'suspended'].includes(status)) throw new Error('Affiliate not found.');
  await db.$transaction(async (tx) => {
    await tx.affiliateApplication.update({ where: { userId }, data: { status, reviewedBy: admin.id, reviewedAt: new Date(), reviewNote: parsedReason } });
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: `affiliate_${status}`, entityType: 'affiliate', entityId: userId, details: { reason: parsedReason } } });
  });
  revalidatePath('/admin/affiliates');
  revalidatePath('/dashboard/affiliate');
}

export async function setAffiliateCodeActive(codeId: string, active: boolean, reason: string) {
  const admin = await requireAffiliateAdmin();
  const parsedReason = z.string().trim().min(5).max(1000).parse(reason);
  const code = await db.affiliateCode.findUnique({ where: { id: codeId }, include: { affiliate: { include: { affiliateApplication: true } } } });
  if (!code || (active && code.affiliate.affiliateApplication?.status !== 'approved')) throw new Error('Only codes belonging to approved affiliates can be activated.');
  await db.$transaction([
    db.affiliateCode.update({ where: { id: codeId }, data: { active } }),
    db.affiliateAuditEvent.create({ data: { actorId: admin.id, action: active ? 'code_activated' : 'code_deactivated', entityType: 'affiliate_code', entityId: codeId, details: { reason: parsedReason } } }),
  ]);
  revalidatePath('/admin/affiliates');
}

export async function updateAffiliateConfig(discountPercent: number, commissionPercent: number, eligibilityMonths: number, reason: string) {
  const admin = await requireAffiliateAdmin();
  const parsedReason = z.string().trim().min(5).max(1000).parse(reason);
  const parsed = z.object({ discount: z.number().min(0).max(100), commission: z.number().min(0).max(100), months: z.number().int().min(1).max(60) }).safeParse({ discount: discountPercent, commission: commissionPercent, months: eligibilityMonths });
  if (!parsed.success) throw new Error('Configuration values are out of range.');
  await db.affiliateConfig.upsert({ where: { id: 1 }, create: { id: 1, customerDiscountPercent: parsed.data.discount, commissionPercent: parsed.data.commission, eligibilityMonths: parsed.data.months, updatedBy: admin.id }, update: { customerDiscountPercent: parsed.data.discount, commissionPercent: parsed.data.commission, eligibilityMonths: parsed.data.months, updatedBy: admin.id } });
  await db.affiliateAuditEvent.create({ data: { actorId: admin.id, action: 'configuration_updated', entityType: 'affiliate_config', entityId: '1', details: { ...parsed.data, reason: parsedReason } } });
  revalidatePath('/admin/affiliates');
}

export async function resolveManualPayment(purchaseId: string, action: 'verified' | 'rejected', verifiedAmount: number, note = '', acceptMismatch = false, transactionReference = '') {
  const admin = await requireAffiliateAdmin();
  const parsedNote = z.string().trim().min(5, 'Enter a resolution reason of at least 5 characters.').max(1000).parse(note);
  const parsedReference = action === 'verified' ? z.string().trim().min(4, 'Enter the transaction reference from the WhatsApp receipt.').max(120).parse(transactionReference) : null;
  if (!Number.isFinite(verifiedAmount) || verifiedAmount < 0) throw new Error('Enter a valid received amount.');
  await db.$transaction(async (tx) => {
    const purchase = await tx.affiliatePurchase.findUnique({ where: { id: purchaseId, status: 'pending' }, include: { referral: true } });
    if (!purchase || (!purchase.customerConfirmedAt && !purchase.paymentReference)) throw new Error('The customer has not confirmed that payment was sent.');
    const mismatch = Number(purchase.expectedAmount) !== verifiedAmount;
    if (action === 'verified' && mismatch && !acceptMismatch) throw new Error('The received amount differs from the expected amount. Explicitly resolve the discrepancy to continue.');
    if (action === 'verified' && verifiedAmount <= 0) throw new Error('A zero payment cannot activate a subscription.');
    const now = new Date();
    await tx.affiliatePurchase.update({ where: { id: purchaseId }, data: { status: action, paymentReference: parsedReference, verifiedAmount: action === 'verified' ? verifiedAmount : null, verifiedAt: now, verifiedBy: admin.id, paymentDate: action === 'verified' ? now : null, resolutionNote: parsedNote } });
    if (action === 'verified') {
      if (purchase.discountPercent.gt(0)) await tx.user.update({ where: { id: purchase.customerId }, data: { promoCodeUsedAt: now } });
      const priorSub = await tx.subscription.findFirst({ where: { userId: purchase.customerId }, orderBy: { updatedAt: 'desc' } });
      const periodStart = now;
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      const subscription = priorSub
        ? await tx.subscription.update({ where: { id: priorSub.id }, data: { planId: purchase.planId, tier: purchase.planId, status: 'active', billingMethod: 'manual', currentPeriodStart: periodStart, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false } })
        : await tx.subscription.create({ data: { userId: purchase.customerId, planId: purchase.planId, tier: purchase.planId, status: 'active', billingMethod: 'manual', currentPeriodStart: periodStart, currentPeriodEnd: periodEnd } });
      await tx.affiliatePurchase.update({ where: { id: purchaseId }, data: { subscriptionId: subscription.id } });
      if (purchase.referralId && purchase.referral) {
        const ref = await tx.customerReferral.update({ where: { id: purchase.referralId }, data: { firstPaidAt: purchase.referral.firstPaidAt || now, discountUsed: purchase.discountPercent.gt(0) || purchase.referral.discountUsed } });
        const config = await getAffiliateConfig(tx);
        const eligibilityEndsAt = addCalendarMonths(ref.firstPaidAt!, config.eligibilityMonths);
        const revenue = calculateEligibleRevenue(Number(purchase.expectedAmount), verifiedAmount);
        const affiliateApproved = await tx.affiliateApplication.findFirst({ where: { userId: ref.affiliateId, status: 'approved' }, select: { id: true } });
        if (affiliateApproved && isWithinCommissionWindow(now, ref.firstPaidAt!, config.eligibilityMonths) && revenue > 0) {
          const commissionPercent = Number(config.commissionPercent);
          const amount = calculateCommission(revenue, commissionPercent);
          await tx.commission.create({ data: { affiliateId: ref.affiliateId, referralId: ref.id, purchaseId, subscriptionId: subscription.id, currency: purchase.currency, eligibleRevenue: revenue, commissionPercent, amount, earnedAt: now, eligibilityEndsAt, eligibilityStatus: 'payable', payoutStatus: 'unpaid' } });
        }
      }
    }
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: `payment_${action}`, entityType: 'affiliate_purchase', entityId: purchaseId, details: { verifiedAmount, transactionReference: parsedReference, expectedAmount: Number(purchase.expectedAmount), reason: parsedNote, mismatch } } });
  }, { isolationLevel: 'Serializable' });
  revalidatePath('/admin/affiliates');
  revalidatePath('/dashboard/affiliate');
}

export async function reverseAffiliateCommission(commissionId: string, refundReference: string, reason: string) {
  const admin = await requireAffiliateAdmin();
  const reference = z.string().trim().min(1).max(150).parse(refundReference);
  const parsedReason = z.string().trim().min(5).max(1000).parse(reason);
  await db.$transaction(async (tx) => {
    const commission = await tx.commission.findUnique({ where: { id: commissionId }, include: { purchase: { select: { id: true, status: true, subscriptionId: true, paymentDate: true, currency: true, verifiedAmount: true } } } });
    if (!commission || commission.eligibilityStatus === 'reversed') throw new Error('Commission is already reversed or was not found.');
    const reversed = await recordCommissionReversal(tx, commission, { refundReference: reference, refundAmount: Number(commission.eligibleRevenue), refundCurrency: commission.currency, fraction: 1, at: new Date() });
    if (!reversed) throw new Error('This refund reference has already been recorded.');
    await tx.affiliatePurchase.update({ where: { id: commission.purchaseId }, data: { ...(reversed.fullyReversed ? { status: 'refunded' } : {}), resolutionNote: `${reversed.fullyReversed ? 'Refund or chargeback' : 'Partial refund or chargeback'} recorded: ${reference}` } });
    if (reversed.fullyReversed && commission.purchase.subscriptionId) {
      const laterPayment = await tx.affiliatePurchase.findFirst({ where: { subscriptionId: commission.purchase.subscriptionId, status: 'verified', paymentDate: { gt: commission.purchase.paymentDate || commission.earnedAt } }, select: { id: true } });
      if (!laterPayment) await tx.subscription.update({ where: { id: commission.purchase.subscriptionId }, data: { status: 'canceled', cancelAtPeriodEnd: false } });
    }
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: 'commission_reversed', entityType: 'commission', entityId: commissionId, details: { reference, reason: parsedReason } } });
  }, { isolationLevel: 'Serializable' });
  revalidatePath('/admin/affiliates');
}

export async function recordAffiliatePayout(userId: string, currency: string, commissionIds: string[], method: string, reference: string, paidAt: string, reason: string) {
  const admin = await requireAffiliateAdmin();
  const parsedReason = z.string().trim().min(5).max(1000).parse(reason);
  const valid = z.object({ currency: z.string().trim().min(3).max(3), ids: z.array(z.string().min(1)).min(1).max(100), method: z.string().trim().min(2).max(80), reference: z.string().trim().min(2).max(150), paidAt: z.coerce.date() }).parse({ currency, ids: commissionIds, method, reference, paidAt });
  if (new Set(valid.ids).size !== valid.ids.length) throw new Error('Duplicate commission selected.');
  await db.$transaction(async (tx) => {
    const commissions = await tx.commission.findMany({ where: { id: { in: valid.ids }, affiliateId: userId, currency: valid.currency, payoutStatus: 'unpaid', eligibilityStatus: 'payable', payoutId: null } });
    if (commissions.length !== valid.ids.length) throw new Error('Some selected commissions are unavailable, already paid, or use another currency.');
    const amount = commissions.reduce((sum, row) => sum + Number(row.amount), 0);
    const payout = await tx.affiliatePayout.create({ data: { affiliateId: userId, currency: valid.currency, amount, method: valid.method, reference: valid.reference, paidAt: valid.paidAt, createdBy: admin.id } });
    const claimed = await tx.commission.updateMany({ where: { id: { in: valid.ids }, payoutStatus: 'unpaid', payoutId: null }, data: { payoutStatus: 'paid', payoutId: payout.id } });
    if (claimed.count !== valid.ids.length) throw new Error('Payout could not claim all commissions; no payout was recorded.');
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: 'payout_recorded', entityType: 'affiliate_payout', entityId: payout.id, details: { affiliateId: userId, currency: valid.currency, amount, commissionIds: valid.ids, reason: parsedReason } } });
  }, { isolationLevel: 'Serializable' });
  revalidatePath('/admin/affiliates');
  revalidatePath('/dashboard/affiliate');
}
