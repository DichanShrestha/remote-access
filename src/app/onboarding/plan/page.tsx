import { redirect } from 'next/navigation';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { getCurrentTrialLimits, checkTrialEligibility } from '@/app/onboarding/actions';
import { PlanSelection } from '@/components/onboarding/PlanSelection';
import { getPublicOrigin } from '@/lib/public-origin';
import { cookies, headers } from 'next/headers';
import { getInitialPricingMode, PRICING_MODE_COOKIE } from '@/lib/pricing';
import { getSmartPageEntitlement } from '@/lib/tier-limits';

export default async function OnboardingPlanPage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile?.page || !Object.keys(profile.page.draftConfig as object).length) redirect('/onboarding');
  const account = await db.user.findUnique({
    where: { id: user.id },
    include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } },
  });
  const entitlement = account ? getSmartPageEntitlement(account) : null;
  if (entitlement?.paidActive || entitlement?.onTrial) {
    redirect(profile.page.isPublished ? '/dashboard' : '/onboarding/claim');
  }
  const [trial, trialEligibility] = await Promise.all([getCurrentTrialLimits(), checkTrialEligibility()]);
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const pricingMode = getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country'));
  return (
    <PlanSelection
      username={profile.username}
      domain={new URL(await getPublicOrigin()).host}
      endsAt={trial.endsAt}
      trialEligible={trialEligibility.eligible}
      trialIneligibleReason={trialEligibility.reason}
      pricingMode={pricingMode}
    />
  );
}
