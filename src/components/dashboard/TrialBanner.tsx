import Link from 'next/link';

export function TrialBanner({ trialEnd, repliesUsed = 0 }: { trialEnd: Date; repliesUsed?: number }) {
  const remainingMs = trialEnd.getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / 86400000));
  return <div className="border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-sm text-amber-950">
    <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2">
      <span>Your trial ends in {daysRemaining <= 1 ? '24 hours or less' : `${daysRemaining} days`} · {repliesUsed} of 100 AI replies used</span>
      <Link className="font-semibold underline underline-offset-2" href="/dashboard/settings?tab=billing">Review usage and plans</Link>
    </div>
  </div>;
}
