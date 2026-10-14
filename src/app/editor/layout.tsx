import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SubscriptionGate } from '@/components/dashboard/SubscriptionGate';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import { TrialBanner } from '@/components/dashboard/TrialBanner';

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authService.requireUser();
  const billing = await db.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } } });
  const entitlement = billing ? getSmartPageEntitlement(billing) : null;
  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <SubscriptionGate
          active={!!entitlement?.trialExpired}
          trialEnd={entitlement?.trialEnd.toISOString() || new Date().toISOString()}
          isPaidExpired={entitlement?.isPaidExpired}
          publicGraceEndsAt={entitlement?.publicGraceEndsAt.toISOString()}
        >
          {entitlement?.onTrial && <TrialBanner trialEnd={entitlement.trialEnd} />}
          {children}
        </SubscriptionGate>
      </main>
    </div>
  );
}
