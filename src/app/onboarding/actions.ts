'use server';

import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getAvailableTemplates, getTemplateDetails, type TemplateCategory } from '@/lib/page-engine/template-catalog';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { TIER_LIMITS, TRIAL_MS } from '@/lib/tier-limits';

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
  if (!template || template.category !== user.profile.type) throw new Error('Choose a template from your selected path.');
  redirect(`/onboarding/personalize?template=${encodeURIComponent(templateId)}`);
}

const personalizationSchema = z.object({
  templateId: z.string().min(1),
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(180).optional().default(''),
  avatarUrl: z.string().trim().url().optional().or(z.literal('')),
});

export async function saveOnboardingPersonalization(input: unknown) {
  const user = await authService.requireUser();
  if (!user.profile) throw new Error('Your profile is not ready yet.');
  const parsed = personalizationSchema.safeParse(input);
  if (!parsed.success) return { error: 'Please check the name and image URL.' };
  const { templateId, displayName, bio, avatarUrl } = parsed.data;
  const template = getTemplateDetails(templateId);
  if (!template || template.category !== user.profile.type) return { error: 'That template is no longer available.' };

  const doc = structuredClone(template.document);
  const hero = doc.sections.find((section) => 'type' in section && section.type === 'hero');
  if (hero && 'content' in hero) {
    hero.content = { ...hero.content, title: displayName, ...(bio ? { subtitle: bio } : {}), ...(avatarUrl ? { avatarUrl } : {}) } as typeof hero.content;
  }
  const validated = PageDocumentSchema.safeParse(doc);
  if (!validated.success) return { error: 'We could not prepare this template. Please choose another.' };

  await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.profile!.id },
      data: { displayName, bio: bio || null, avatarUrl: avatarUrl || null },
    });
    await tx.page.upsert({
      where: { profileId: user.profile!.id },
      create: { profileId: user.profile!.id, draftConfig: validated.data as any },
      update: { draftConfig: validated.data as any },
    });
  });
  revalidatePath('/dashboard');
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
  try {
    await db.profile.update({ where: { id: user.profile.id }, data: { username } });
  } catch {
    return { error: 'That username was just claimed. Try another.' };
  }
  revalidatePath('/dashboard');
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
    await tx.page.update({ where: { id: page.id }, data: { publishedConfig: page.draftConfig as any, isPublished: true } });
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
