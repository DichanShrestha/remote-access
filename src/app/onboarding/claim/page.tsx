import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ClaimUsername } from '@/components/onboarding/ClaimUsername';
import { getPublicOrigin } from '@/lib/public-origin';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import { findHomePage } from '@/lib/page-engine/site-store';

export default async function ClaimUsernamePage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect('/onboarding');
  const home = await findHomePage(profile.id);
  if (!home) redirect('/onboarding');
  if (home.isPublished) redirect('/dashboard');
  if (!home.draftConfig || !Object.keys(home.draftConfig as object).length) redirect('/onboarding');
  const account = await db.user.findUnique({
    where: { id: user.id },
    include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } },
  });
  const entitlement = account ? getSmartPageEntitlement(account) : null;
  const alreadyActivated = Boolean(entitlement?.paidActive || entitlement?.onTrial);
  return <ClaimUsername currentUsername={profile.username} domain={new URL(await getPublicOrigin()).host} alreadyActivated={alreadyActivated} />;
}
