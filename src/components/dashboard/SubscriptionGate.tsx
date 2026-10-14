'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SubscriptionGate({
  active,
  trialEnd,
  isPaidExpired,
  publicGraceEndsAt,
  children,
}: {
  active: boolean;
  trialEnd: string;
  isPaidExpired?: boolean;
  publicGraceEndsAt?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (!active || ['/dashboard/billing', '/dashboard/settings'].includes(pathname)) return children;

  const graceDate = publicGraceEndsAt
    ? new Date(publicGraceEndsAt)
    : new Date(new Date(trialEnd).getTime() + 3 * 86400000);
  const isGracePast = new Date() > graceDate;

  return (
    <main className="min-h-screen w-full bg-[#FDFCF8] flex items-center justify-center p-6">
      <section className="max-w-xl rounded-3xl border border-[#E8E7E1] bg-white p-8 md:p-12 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-[#A1A299] mb-3">Subscription required</p>
        <h1 className="font-serif text-3xl font-semibold text-[#292A25]">
          {isPaidExpired ? 'Your subscription has ended' : 'Your 14-day trial has ended'}
        </h1>
        <p className="mt-4 text-[#777970]">
          Choose a plan to continue managing your Pageory and AI assistant. Your page content and knowledge data are preserved.
        </p>
        <p className="mt-3 text-sm text-[#777970]">
          {isGracePast
            ? 'Your public page is currently paused until a plan is selected.'
            : `Your public page stays online until ${graceDate.toLocaleDateString()}.`}
        </p>
        <Link href="/dashboard/settings?tab=billing" className="mt-7 inline-flex rounded-xl bg-[#292A25] px-6 py-3 font-medium text-white">
          View plans
        </Link>
        <div className="mt-6 flex justify-center gap-5 text-sm">
          <Link href="/dashboard/settings" className="underline">Support and account settings</Link>
        </div>
      </section>
    </main>
  );
}
