import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SubscriptionGate } from '@/components/dashboard/SubscriptionGate';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAccountCapabilities } from '@/services/capabilities';
import { AccountSuspendedError } from '@/lib/errors';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try { user = await authService.requireUser(); }
  catch (error) { if (error instanceof AccountSuspendedError) redirect('/account-suspended'); throw error; }
  const path = (await headers()).get('x-pageory-pathname') || '/dashboard';
  const capabilities = await getAccountCapabilities(user.id);
  if (path.startsWith('/dashboard/affiliate') && !capabilities.affiliate) redirect('/affiliate/apply');
  if (!path.startsWith('/dashboard/affiliate') && path !== '/dashboard' && path !== '/dashboard/settings' && !capabilities.creator) {
    if (capabilities.affiliate) redirect('/dashboard/affiliate');
    if (capabilities.applicationStatus) redirect('/affiliate/apply');
    redirect('/onboarding');
  }
  if (path === '/dashboard/settings' && !capabilities.creator && !capabilities.affiliate) redirect('/onboarding');
  const billing = await db.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 }, usage: true } });
  const entitlement = billing ? getSmartPageEntitlement(billing) : null;
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar isAdmin={capabilities.admin} isCreator={capabilities.creator} isAffiliate={capabilities.affiliate} showBecomeAffiliate={capabilities.creator && !capabilities.affiliate} />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#FBF9F5] selection:bg-[#292A25] selection:text-white">
        <SubscriptionGate
          active={!!entitlement?.trialExpired && !capabilities.affiliate}
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
