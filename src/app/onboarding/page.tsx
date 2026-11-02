import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { findHomePage } from '@/lib/page-engine/site-store';

export default async function OnboardingStart({
  searchParams,
}: {
  searchParams?: Promise<{ changeTemplate?: string; restart?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect('/dashboard');

  const home = await findHomePage(profile.id);
  const allowChange = params.changeTemplate || params.restart;
  if (!allowChange && home?.draftConfig && Object.keys(home.draftConfig as object).length > 0) {
    redirect(home.isPublished ? '/dashboard' : '/editor');
  }
  redirect('/onboarding/templates');
}
