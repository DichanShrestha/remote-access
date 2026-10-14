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
import { getInitialPricingMode, PRICING_MODE_COOKIE } from '@/lib/pricing';

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
  const updateHeroTitle = (nodes: any[]): boolean => {
    for (const node of nodes) {
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
  const user = await authService.requireUser();
  if (!user.profile) return { error: 'Your profile is not ready yet.' };
  const page = await db.page.findUnique({ where: { profileId: user.profile.id } });
  if (!page || !Object.keys(page.draftConfig as object).length) return { error: 'Choose and personalize a template before publishing.' };

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_MS);
  const existing = await db.subscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });
  const trialGrant = await db.user.findUnique({ where: { id: user.id }, select: { trialGrantedAt: true } });
  if ((trialGrant?.trialGrantedAt || existing?.trialEverGranted || existing?.trialStart || existing?.status === 'trialing') && !['active', 'past_due'].includes(existing?.status || '')) {
    if (!existing || existing.status !== 'trialing' || !existing.trialEnd || existing.trialEnd <= now) return { error: 'Your one-time trial has ended. Choose a paid plan to continue.' };
  }
  await db.$transaction(async (tx) => {
      await tx.page.update({ where: { id: page.id }, data: { publishedConfig: page.draftConfig as unknown as Prisma.InputJsonValue, isPublished: true } });
    if (existing?.status === 'trialing' && existing.trialEnd && existing.trialEnd > now) {
      await tx.subscription.update({ where: { id: existing.id }, data: { planId: 'trial', tier: 'trial', currentPeriodEnd: existing.trialEnd } });
    } else if (existing && ['active', 'past_due'].includes(existing.status)) {
      // Publishing again never changes an existing paid entitlement.
    } else if (!existing?.trialEverGranted && !existing?.trialStart) {
      const claim = await tx.user.updateMany({ where: { id: user.id, trialGrantedAt: null }, data: { trialGrantedAt: now } });
      if (!claim.count) throw new Error('Your one-time trial has already been used.');
      if (existing) await tx.subscription.update({ where: { id: existing.id }, data: { status: 'trialing', planId: 'trial', currentPeriodEnd: trialEndsAt, tier: 'trial', billingMethod: 'none', trialStart: now, trialEnd: trialEndsAt, trialEverGranted: true } });
      else await tx.subscription.create({ data: { userId: user.id, status: 'trialing', planId: 'trial', currentPeriodEnd: trialEndsAt, tier: 'trial', trialStart: now, trialEnd: trialEndsAt, trialEverGranted: true } });
    } else {
      throw new Error('Trial is unavailable for this account.');
    }
  });
  revalidatePath('/dashboard');
  revalidatePath(`/${user.profile.username}`);
  redirect('/onboarding/complete');
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

/** Publish the page and redirect the user to a Dodo checkout session. */
export async function createOnboardingCheckout(planId: 'smart_page' | 'smart_page_ai') {
  const user = await authService.requireUser();
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  if (getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country')) === 'nepal') {
    return { error: 'Nepal subscriptions are arranged through WhatsApp. Please use the WhatsApp purchase option.' };
  }
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const page = await db.page.findUnique({ where: { profileId: user.profile.id } });
  if (!page || !Object.keys(page.draftConfig as object).length) return { error: 'Choose and personalize a template before publishing.' };

  // Publish the page first so it's live when the user returns from checkout
  await db.page.update({ where: { id: page.id }, data: { publishedConfig: page.draftConfig as unknown as Prisma.InputJsonValue, isPublished: true } });

  // Create checkout session via Dodo
  const { dodo } = await import('@/lib/dodopayments');
  if (!dodo || !process.env.DODO_API_KEY) return { error: 'Billing is temporarily unavailable. Please try again later.' };

  const productId = planId === 'smart_page_ai' ? process.env.DODO_PRODUCT_SMART_PAGE_AI : process.env.DODO_PRODUCT_SMART_PAGE;
  if (!productId) return { error: 'This plan is not configured for checkout.' };

  try {
    const session = await dodo.checkoutSessions.create({
      customer: { email: user.email!, name: user.email! },
      product_cart: [{ product_id: productId, quantity: 1 }],
      metadata: { user_id: user.id, plan_id: planId },
      feature_flags: { allow_discount_code: true },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/complete`,
    });
    return { checkoutUrl: session.checkout_url };
  } catch (e: any) {
    console.error('Onboarding checkout creation failed:', e.message);
    return { error: 'Could not start checkout. Please try again.' };
  }
}
