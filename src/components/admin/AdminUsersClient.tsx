'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { setAccountSuspension } from '@/app/actions/admin-actions';
import { AdminStatus } from '@/components/admin/AdminUI';

export type AdminUserRow = { id: string; email: string | null; name: string | null; username: string | null; profileType: string | null; createdAt: string; suspendedAt: string | null; suspensionReason: string | null; subscription: { planId: string; status: string; billingMethod: string; currentPeriodEnd: string | null } | null };

export function AdminUsersClient({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const changeStatus = (user: AdminUserRow) => {
    const suspend = !user.suspendedAt;
    if (!window.confirm(`${suspend ? 'Suspend' : 'Reactivate'} ${user.email || user.id}?`)) return;
    const reason = window.prompt(suspend ? 'Reason for suspension (required):' : 'Reason for reactivation (required):')?.trim();
    if (!reason || reason.length < 5) { toast.error('Enter a reason of at least 5 characters.'); return; }
    setPendingId(user.id);
    const toastId = toast.loading(suspend ? 'Suspending account…' : 'Reactivating account…');
    startTransition(async () => {
      try { await setAccountSuspension(user.id, suspend, reason); toast.success(suspend ? 'Account suspended.' : 'Account reactivated.', { id: toastId }); router.refresh(); }
      catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update this account.', { id: toastId }); }
      finally { setPendingId(null); }
    });
  };
  return <div className="overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white">
    <div className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_auto] gap-4 border-b border-[#EEECE6] bg-[#F8F7F2] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#777972] lg:grid"><span>Account</span><span>Profile</span><span>Subscription</span><span>Joined</span><span>Access</span></div>
    {users.map((user) => <article key={user.id} className="grid gap-3 border-b border-[#EEECE6] p-4 last:border-0 sm:p-5 lg:grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_auto] lg:items-center lg:gap-4">
      <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name || user.email || 'Unnamed user'}</p><p className="truncate text-xs text-[#777972]">{user.email || user.id}</p></div>
      <div className="text-sm">{user.username ? <><span>@{user.username}</span><p className="text-xs text-[#777972]">{user.profileType || 'Creator'}</p></> : <span className="text-[#8A8C84]">No creator profile</span>}</div>
      <div className="text-sm">{user.subscription ? <><span>{user.subscription.planId}</span><p className="mt-1 flex flex-wrap items-center gap-2 text-xs"><AdminStatus value={user.subscription.status} /><span className="text-[#777972]">{user.subscription.billingMethod}</span></p>{user.subscription.currentPeriodEnd && <p className="mt-1 text-xs text-[#777972]">Until {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}</p>}</> : <span className="text-[#8A8C84]">No subscription</span>}</div>
      <p className="text-sm text-[#777972]">{new Date(user.createdAt).toLocaleDateString()}</p>
      <div className="flex flex-wrap items-center gap-2">{user.suspendedAt && <AdminStatus value="suspended" />}<button type="button" disabled={pending} onClick={() => changeStatus(user)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${user.suspendedAt ? 'border border-[#D8D5CD]' : 'bg-[#292A25] text-white'}`}>{pending && pendingId === user.id ? 'Saving…' : user.suspendedAt ? 'Reactivate' : 'Suspend'}</button></div>
      {user.suspensionReason && <p className="text-xs text-red-700 lg:col-span-5">Suspension reason: {user.suspensionReason}</p>}
    </article>)}
  </div>;
}
