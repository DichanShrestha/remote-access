import type { ReactNode } from 'react';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import { SubscriptionGate } from '@/components/dashboard/SubscriptionGate';

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await authService.requireUser();
  const account = await db.user.findUnique({
    where: { id: user.id },
    include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } },
  });
  const entitlement = account ? getSmartPageEntitlement(account) : null;

  return (
    <SubscriptionGate
      active={!!entitlement?.trialExpired}
      trialEnd={entitlement?.trialEnd.toISOString() || new Date().toISOString()}
      isPaidExpired={entitlement?.isPaidExpired}
      publicGraceEndsAt={entitlement?.publicGraceEndsAt.toISOString()}
    >
      {children}
    </SubscriptionGate>
  );
}
