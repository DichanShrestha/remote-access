"use server";

import db from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { authService } from '@/services/auth';
import { TEMPLATES_MAP } from '@/lib/page-engine/templates';
import {
  extractWebsiteConfig,
  toPageContentDocument,
} from '@/lib/page-engine/site-config';
import { findHomePage } from '@/lib/page-engine/site-store';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function useTemplate(templateId: string) {
  const user = await authService.requireCreator();

  if (!user.profile) {
    throw new Error('Please create a profile first.');
  }

  const template = TEMPLATES_MAP[templateId];
  if (!template) {
    throw new Error('Template not found');
  }

  const home = await findHomePage(user.profile.id);
  const pageContent = toPageContentDocument(template);
  const siteConfig = extractWebsiteConfig(template);

  await db.$transaction(async (tx) => {
    if (home) {
      await tx.page.update({
        where: { id: home.id },
        data: {
          pageType: 'HOME',
          slug: '',
          draftConfig: pageContent as unknown as Prisma.InputJsonValue,
        },
      });
    } else {
      await tx.page.create({
        data: {
          profileId: user.profile!.id,
          title: user.profile!.displayName,
          pageType: 'HOME',
          slug: '',
          navOrder: 0,
          draftConfig: pageContent as unknown as Prisma.InputJsonValue,
        },
      });
    }
    await tx.website.upsert({
      where: { profileId: user.profile!.id },
      create: {
        profileId: user.profile!.id,
        draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
      },
      update: {
        draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
      },
    });
  });

  revalidatePath('/dashboard');
  revalidatePath('/editor');
  redirect('/editor');
}
