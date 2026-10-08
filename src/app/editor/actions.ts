"use server";

import db from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { authService } from '@/services/auth';
import { revalidatePath } from 'next/cache';

export async function saveDraftConfig(pageId: string, rawConfig: any) {
  const user = await authService.requireUser();

  // Basic validation before saving
  const parsed = PageDocumentSchema.safeParse(rawConfig);
  if (!parsed.success) {
    throw new Error('Invalid page configuration');
  }

  // Ensure this page belongs to the user
  const page = await db.page.findUnique({
    where: { id: pageId },
    include: { profile: true }
  });

  if (!page || page.profile.userId !== user.id) {
    throw new Error('Unauthorized');
  }

  await db.page.update({
    where: { id: pageId },
    data: {
      draftConfig: parsed.data as unknown as Prisma.InputJsonValue,
    }
  });

  return { success: true };
}

export async function publishDraftConfig(pageId: string, rawConfig: any) {
  const user = await authService.requireUser();
  const parsed = PageDocumentSchema.safeParse(rawConfig);
  if (!parsed.success) throw new Error('Invalid page configuration');

  const page = await db.page.findUnique({
    where: { id: pageId },
    include: { profile: true },
  });
  if (!page || page.profile.userId !== user.id) throw new Error('Unauthorized');

  const existingPlan = await db.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, planId: true },
  });
  const onboardingComplete = page.isPublished || Boolean(existingPlan?.planId);

  if (onboardingComplete) {
    await db.page.update({
      where: { id: page.id },
      data: {
        draftConfig: parsed.data as unknown as Prisma.InputJsonValue,
        publishedConfig: parsed.data as unknown as Prisma.InputJsonValue,
        isPublished: true,
      },
    });
    revalidatePath('/dashboard');
    revalidatePath(`/${page.profile.username}`);
    return { redirectTo: '/dashboard' };
  }

  await db.page.update({
    where: { id: page.id },
    data: { draftConfig: parsed.data as unknown as Prisma.InputJsonValue },
  });
  return { redirectTo: '/onboarding/claim' };
}
