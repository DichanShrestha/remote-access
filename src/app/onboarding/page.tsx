import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function OnboardingStart({
  searchParams,
}: {
  searchParams?: Promise<{ changeTemplate?: string; restart?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile) redirect('/dashboard');
  
  const allowChange = params.changeTemplate || params.restart;
  if (!allowChange && profile.page?.draftConfig && Object.keys(profile.page.draftConfig as object).length > 0) {
    redirect(profile.page.isPublished ? '/dashboard' : '/editor');
  }
  redirect('/onboarding/templates');
}
