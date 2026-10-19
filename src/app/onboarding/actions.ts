'use server';

import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getAvailableTemplates, getTemplateDetails, type TemplateCategory } from '@/lib/page-engine/template-catalog';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSmartPageEntitlement, TIER_LIMITS, TRIAL_MS } from '@/lib/tier-limits';
import { cookies, headers } from 'next/headers';
import { getInitialPricingMode, PAID_PLANS, PRICING_MODE_COOKIE, type PricingMode } from '@/lib/pricing';
import { getAffiliateConfig } from '@/services/affiliates';
import { calculateDiscount } from '@/lib/affiliate-math';

export async function selectOnboardingPath(type: TemplateCategory) {
  const user = await authService.requireUser();
  if (!user.profile) throw new Error('Your profile is not ready yet.');
  await db.profile.update({ where: { id: user.profile.id }, data: { type } });
  redirect('/onboarding/templates');
}

export async function chooseOnboardingTemplate(templateId: string) {
  const user = await authService.requireUser();
  if (!user.profile) throw new Error('Your profile is not ready yet.');
  const template = getTemplateDetails(templateId);
  if (!template) throw new Error('Choose an available template.');

  // Pre-seed the page with the chosen template right away
  await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.profile!.id },
      data: { type: template.category },
    });
    await tx.page.upsert({
      where: { profileId: user.profile!.id },
      create: {
        profileId: user.profile!.id,
        draftConfig: template.document as unknown as Prisma.InputJsonValue,
      },
      update: {
        draftConfig: template.document as unknown as Prisma.InputJsonValue,
      },
    });
  });

  revalidatePath('/dashboard');
  revalidatePath('/editor');
  redirect(`/onboarding/personalize?template=${encodeURIComponent(templateId)}`);
}

export async function selectOnboardingTemplateDirect(templateId: string) {
  const user = await authService.requireUser();
  if (!user.profile) throw new Error('Your profile is not ready yet.');
  const template = getTemplateDetails(templateId);
  if (!template) throw new Error('Choose an available template.');

  await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.profile!.id },
      data: { type: template.category },
    });
    await tx.page.upsert({
      where: { profileId: user.profile!.id },
      create: {
        profileId: user.profile!.id,
        draftConfig: template.document as unknown as Prisma.InputJsonValue,
      },
      update: {
        draftConfig: template.document as unknown as Prisma.InputJsonValue,
      },
    });
  });

  revalidatePath('/dashboard');
  revalidatePath('/editor');
  redirect('/editor');
}

const personalizationSchema = z.object({
  templateId: z.string().min(1),
  displayName: z.string().trim().min(1).max(80),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
});

export async function saveOnboardingPersonalization(input: unknown) {
  const user = await authService.requireUser();
  if (!user.profile) throw new Error('Your profile is not ready yet.');
  const parsed = personalizationSchema.safeParse(input);
  if (!parsed.success) return { error: 'Enter a name and a username with 3–30 letters, numbers, dashes, or underscores.' };
  const { templateId, displayName, username } = parsed.data;
  const template = getTemplateDetails(templateId);
  if (!template) return { error: 'That template is no longer available.' };
  if (username.toLowerCase() !== user.profile.username && !(await authService.isUsernameAvailable(username.toLowerCase()))) return { error: 'That username is already in use.' };

  const doc = structuredClone(template.document);
  // Find hero in sections or groups and update title with user's display name
  const updateHeroTitle = (nodes: unknown[]): boolean => {
    for (const candidate of nodes) {
      if (!candidate || typeof candidate !== 'object') continue;
      const node = candidate as { type?: string; kind?: string; content?: Record<string, unknown>; children?: unknown[] };
      if (node.type === 'hero' && node.content) {
        node.content = { ...node.content, title: displayName };
        return true;
      }
      if (node.kind === 'group' && Array.isArray(node.children)) {
        if (updateHeroTitle(node.children)) return true;
      }
    }
    return false;
  };
  updateHeroTitle(doc.sections);

  const validated = PageDocumentSchema.safeParse(doc);
  if (!validated.success) return { error: 'We could not prepare this template. Please choose another.' };

  await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.profile!.id },
      data: { displayName, type: template.category, username: username.toLowerCase() },
    });
    await tx.page.upsert({
      where: { profileId: user.profile!.id },
      create: { profileId: user.profile!.id, draftConfig: validated.data as unknown as Prisma.InputJsonValue },
      update: { draftConfig: validated.data as unknown as Prisma.InputJsonValue },
    });
  });
  revalidatePath('/dashboard');
  revalidatePath('/editor');
  redirect('/editor');
}

const usernameSchema = z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/);

export async function checkUsernameAvailability(value: string) {
  const user = await authService.requireUser();
  const username = value.trim().toLowerCase();
  if (!usernameSchema.safeParse(username).success) return { state: 'invalid' as const };
  const available = await authService.isUsernameAvailable(username);
  return { state: available || user.profile?.username === username ? 'available' as const : 'unavailable' as const };
}

export async function saveOnboardingUsername(value: string) {
  const user = await authService.requireUser();
  if (!user.profile) return { error: 'Your profile is not ready yet.' };
  const parsed = usernameSchema.safeParse(value.trim().toLowerCase());
  if (!parsed.success) return { error: 'Use 3–30 letters, numbers, dashes, or underscores.' };
  const username = parsed.data;
  if (username !== user.profile.username && !(await authService.isUsernameAvailable(username))) {
    return { error: 'That username is already taken. Try another.' };
  }
  const page = await db.page.findUnique({ where: { profileId: user.profile.id } });
  if (!page || !page.draftConfig || !Object.keys(page.draftConfig as object).length) {
    return { error: 'Your page draft is missing. Please return to the editor and try again.' };
  }
  const account = await db.user.findUnique({
    where: { id: user.id },
    include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } },
  });
  const entitlement = account ? getSmartPageEntitlement(account) : null;
  const alreadyActivated = Boolean(entitlement?.paidActive || entitlement?.onTrial);
  try {
    await db.$transaction(async (tx) => {
      await tx.profile.update({ where: { id: user.profile!.id }, data: { username } });
      if (alreadyActivated) {
        await tx.page.update({
          where: { id: page.id },
          data: { publishedConfig: page.draftConfig as Prisma.InputJsonValue, isPublished: true },
        });
      }
    });
  } catch {
    return { error: 'That username was just claimed. Try another.' };
  }
  revalidatePath('/dashboard');
  revalidatePath(`/${username}`);
  if (alreadyActivated) redirect('/dashboard');
  redirect('/onboarding/plan');
}

export async function onboardingTemplateIds() {
  const user = await authService.requireUser();
  return getAvailableTemplates(user.profile?.type).map(({ id }) => id);
}

export async function startCurrentFreeTrial(planId: string = 'smart_page') {
  await authService.requireUser();
  void planId;
  return { error: 'Trials are granted after your request is reviewed. Submit a request from the plan page.' };
}

export async function getCurrentTrialLimits() {
  const user = await authService.requireUser();
  const existing = await db.subscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });
  return {
    endsAt: (existing?.trialEnd || new Date(user.createdAt.getTime() + TRIAL_MS)).toISOString(),
    limits: TIER_LIMITS.free,
  };
}

/** Check whether the current user can start a free trial. */
export async function checkTrialEligibility(): Promise<{ eligible: boolean; reason?: string }> {
  const user = await authService.requireUser();
  const existing = await db.subscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });
  const trialGrant = await db.user.findUnique({ where: { id: user.id }, select: { trialGrantedAt: true } });
  if (existing && ['active', 'past_due'].includes(existing.status)) return { eligible: false, reason: 'You already have an active subscription.' };
  if (trialGrant?.trialGrantedAt || existing?.trialEverGranted || existing?.trialStart) return { eligible: false, reason: 'Your one-time trial has already been used.' };
  return { eligible: true };
}

export async function setOnboardingPricingMode(mode: PricingMode) {
  const user = await authService.requireUser();
  const parsed = z.enum(['nepal', 'international']).safeParse(mode);
  if (!parsed.success) throw new Error('Choose a valid billing location.');
  const requestHeaders = await headers();
  if (requestHeaders.get('x-vercel-ip-country')?.toUpperCase() === 'NP' && parsed.data !== 'nepal') throw new Error('Nepal billing is required for your location.');
  (await cookies()).set(PRICING_MODE_COOKIE, parsed.data, { path: '/', maxAge: 31536000, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  revalidatePath('/onboarding/plan');
  return { success: true, userId: user.id };
}

export async function requestPlanAccess(planId: 'smart_page' | 'smart_page_ai', requestType: 'trial' | 'plan', rawAffiliateCode?: string) {
  const user = await authService.requireUser();
  if (!user.profile) return { error: 'Your Pageory profile is not ready yet.' };
  if ((planId !== 'smart_page' && planId !== 'smart_page_ai') || !['trial', 'plan'].includes(requestType)) return { error: 'Choose a valid plan request.' };
  const page = await db.page.findUnique({ where: { profileId: user.profile.id } });
  if (!page || !Object.keys(page.draftConfig as object).length) return { error: 'Finish preparing your Pageory page before requesting access.' };
  if (requestType === 'trial' && !(await checkTrialEligibility()).eligible) return { error: 'This account is not eligible for another free trial.' };
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const pricingMode = getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country'));
  const price = PAID_PLANS[planId][pricingMode];
  const normalizedCode = rawAffiliateCode?.trim().toUpperCase() || '';
  if (normalizedCode && !/^[A-Z0-9-]{4,40}$/.test(normalizedCode)) return { error: 'Enter a valid referral code.' };
  try {
    const request = await db.$transaction(async (tx) => {
      const active = await tx.subscription.findFirst({ where: { userId: user.id, status: { in: ['active', 'past_due', 'trialing'] }, OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }] } });
      if (active) throw new Error('This account already has active access. Contact us if you need a plan change.');
      const existingPending = await tx.planAccessRequest.findFirst({ where: { userId: user.id, status: 'pending' }, orderBy: { requestedAt: 'desc' } });
      if (existingPending) throw new Error(`You already have a pending ${existingPending.requestType} request. Please continue the WhatsApp conversation or wait for Pageory to review it.`);

      let referral = await tx.customerReferral.findUnique({ where: { customerId: user.id } });
      if (normalizedCode) {
        const code = await tx.affiliateCode.findFirst({ where: { code: { equals: normalizedCode, mode: 'insensitive' }, active: true, affiliate: { affiliateApplication: { status: 'approved' } } } });
        if (!code) throw new Error('That referral code is not active.');
        if (code.affiliateId === user.id) throw new Error('You cannot use your own referral code.');
        if (referral && referral.codeId !== code.id) throw new Error('A referral code is already attached to your account.');
        const historicPaid = await tx.subscription.findFirst({ where: { userId: user.id, billingMethod: { in: ['manual', 'dodo'] } } });
        if (historicPaid && !referral) throw new Error('A referral code cannot be attached after your first paid subscription.');
        if (!referral) referral = await tx.customerReferral.create({ data: { customerId: user.id, affiliateId: code.affiliateId, codeId: code.id } });
      }
      const historicPaid = await tx.subscription.findFirst({ where: { userId: user.id, billingMethod: { in: ['manual', 'dodo'] } } });
      const promoUse = await tx.user.findUnique({ where: { id: user.id }, select: { promoCodeUsedAt: true } });
      const config = await getAffiliateConfig(tx);
      const discountPercent = requestType === 'plan' && referral && !historicPaid && !referral.discountUsed && !promoUse?.promoCodeUsedAt ? Number(config.customerDiscountPercent) : 0;
      const discounted = calculateDiscount(price.amount, discountPercent);
      const created = await tx.planAccessRequest.create({ data: { userId: user.id, requestType, planId, currency: price.currency, quotedAmount: requestType === 'trial' ? 0 : discounted.finalAmount, discountPercent, discountAmount: requestType === 'trial' ? 0 : discounted.discountAmount, referralCode: referral?.codeId ? (await tx.affiliateCode.findUnique({ where: { id: referral.codeId }, select: { code: true } }))?.code || null : null, affiliateId: referral?.affiliateId || null } });
      await tx.affiliateAuditEvent.create({ data: { actorId: user.id, action: 'plan_access_requested', entityType: 'plan_access_request', entityId: created.id, details: { requestType, planId, currency: price.currency, quotedAmount: requestType === 'trial' ? 0 : discounted.finalAmount, referralCode: referral?.codeId ? normalizedCode || undefined : undefined } } });
      return created;
    }, { isolationLevel: 'Serializable' });
    revalidatePath('/admin/subscriptions');
    return { success: true, requestId: request.id, requestType, planId, currency: price.currency, amount: Number(request.quotedAmount), discountPercent: Number(request.discountPercent), reused: request.status === 'pending' && !normalizedCode };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not submit your access request.' };
  }
}

export async function createOnboardingCheckout(planId: "smart_page" | "smart_page_ai", rawAffiliateCode?: string) {
  await authService.requireUser();
  void planId;
  void rawAffiliateCode;
  return { error: "Choose a plan and submit a WhatsApp request. Access is granted only after Pageory approves it." };
}
