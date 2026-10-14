import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SubscriptionGate } from '@/components/dashboard/SubscriptionGate';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import { TrialBanner } from '@/components/dashboard/TrialBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authService.requireUser();
  const billing = await db.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 }, usage: true } });
  const entitlement = billing ? getSmartPageEntitlement(billing) : null;
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#FBF9F5] selection:bg-[#292A25] selection:text-white">
        <SubscriptionGate
          active={!!entitlement?.trialExpired}
          trialEnd={entitlement?.trialEnd.toISOString() || new Date().toISOString()}
          isPaidExpired={entitlement?.isPaidExpired}
          publicGraceEndsAt={entitlement?.publicGraceEndsAt.toISOString()}
        >
          {entitlement?.onTrial && <TrialBanner trialEnd={entitlement.trialEnd} repliesUsed={billing?.subscriptions[0]?.aiRepliesUsed || 0} />}
          <div className="flex-1 p-6 lg:px-14 lg:py-12 max-w-[1400px] mx-auto w-full">{children}</div>
        </SubscriptionGate>
      </main>
    </div>
  );
}
