import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { OnboardingPathPicker } from '@/components/onboarding/OnboardingPathPicker';

export default async function OnboardingStart() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile) redirect('/dashboard');
  if (profile.page?.draftConfig && Object.keys(profile.page.draftConfig as object).length > 0) {
    redirect(profile.page.isPublished ? '/dashboard' : '/editor');
  }
  return <OnboardingPathPicker name={profile.displayName} />;
}
