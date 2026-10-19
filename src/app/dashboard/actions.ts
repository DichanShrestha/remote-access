"use server";

import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { TEMPLATES_MAP } from '@/lib/page-engine/templates';
import { redirect } from 'next/navigation';

export async function useTemplate(templateId: string) {
  const user = await authService.requireCreator();

  if (!user.profile) {
    throw new Error('Please create a profile first.');
  }

  const template = TEMPLATES_MAP[templateId];
  if (!template) {
    throw new Error('Template not found');
  }

  await db.page.upsert({
    where: { profileId: user.profile.id },
    create: {
      profileId: user.profile.id,
      draftConfig: template as any,
    },
    update: {
      draftConfig: template as any,
    }
  });

  redirect('/editor');
}
