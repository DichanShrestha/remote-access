"use server";

import db from '@/lib/prisma';
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
      draftConfig: parsed.data,
    }
  });

  return { success: true };
}

export async function publishPage(pageId: string) {
  const user = await authService.requireUser();

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
      publishedConfig: page.draftConfig as any,
      isPublished: true,
    }
  });

  revalidatePath(`/${page.profile.username}`);
  return { success: true };
}
