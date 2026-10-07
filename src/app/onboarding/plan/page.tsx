import { redirect } from 'next/navigation';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { getCurrentTrialLimits } from '@/app/onboarding/actions';
import { PlanSelection } from '@/components/onboarding/PlanSelection';
import { getPublicOrigin } from '@/lib/public-origin';

export default async function OnboardingPlanPage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile?.page || !Object.keys(profile.page.draftConfig as object).length) redirect('/onboarding');
  if (profile.page.isPublished) redirect('/dashboard');
  const trial = await getCurrentTrialLimits();
  return <PlanSelection username={profile.username} domain={new URL(await getPublicOrigin()).host} endsAt={trial.endsAt} limits={trial.limits} />;
}
