'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { manageComplimentaryAccess, resolvePlanAccessRequest } from '@/app/actions/admin-actions';
import { AdminEmpty, AdminStatus } from '@/components/admin/AdminUI';

export type AdminSubscriptionUser = { id: string; name: string | null; email: string | null; subscription: { id: string; planId: string; status: string; billingMethod: string; currentPeriodEnd: string | null } | null };
type AccessAction = 'grant_trial' | 'grant_plan' | 'extend' | 'revoke';
export type AdminPlanRequest = { id: string; userId: string; name: string | null; email: string | null; requestType: string; planId: string; currency: string; quotedAmount: number; discountPercent: number; discountAmount: number; referralCode: string | null; requestedAt: string };

export function AdminSubscriptionsClient({ users, requests }: { users: AdminSubscriptionUser[]; requests: AdminPlanRequest[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const resolveRequest = (request: AdminPlanRequest, decision: 'approved' | 'rejected') => {
    if (!window.confirm(`${decision === 'approved' ? 'Approve' : 'Reject'} ${request.requestType} request for ${request.email || request.userId}?${decision === 'approved' ? ' This will activate complimentary access and publish their prepared page.' : ''}`)) return;
    const rawDays = decision === 'approved' ? window.prompt(request.requestType === 'trial' ? 'Trial duration in days (1–90):' : 'Complimentary plan access in days:', request.requestType === 'trial' ? '14' : '30') : '1';
    if (rawDays === null) return;
    const days = Number(rawDays);
    if (!Number.isInteger(days) || days < 1 || days > (request.requestType === 'trial' ? 90 : 3650)) { toast.error('Enter a valid access duration.'); return; }
    const reason = window.prompt('Enter an administrative reason (at least 5 characters):')?.trim();
    if (!reason || reason.length < 5) { toast.error('Enter a reason of at least 5 characters.'); return; }
    setPendingId(request.id);
    const toastId = toast.loading(decision === 'approved' ? 'Approving access request…' : 'Rejecting access request…');
    startTransition(async () => {
      try { await resolvePlanAccessRequest(request.id, decision, days, reason); toast.success(decision === 'approved' ? 'Request approved and access activated.' : 'Request rejected.', { id: toastId }); router.refresh(); }
      catch (error) { toast.error(error instanceof Error ? error.message : 'Could not resolve this request.', { id: toastId }); }
      finally { setPendingId(null); }
    });
  };
  const submit = (event: React.FormEvent<HTMLFormElement>, user: AdminSubscriptionUser) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const action = String(form.get('action')) as AccessAction;
    const reason = String(form.get('reason') || '').trim();
    const days = Number(form.get('days'));
    const plan = String(form.get('plan')) as 'trial' | 'smart_page' | 'smart_page_ai';
    if (reason.length < 5) { toast.error('Enter a reason of at least 5 characters.'); return; }
    const title = action === 'revoke' ? 'Revoke complimentary access' : action === 'extend' ? 'Extend complimentary access' : action === 'grant_trial' ? 'Grant free trial' : `Grant ${plan === 'smart_page_ai' ? 'Growth' : 'Starter'} access`;
    if (!window.confirm(`${title} for ${user.email || user.id}?`)) return;
    setPendingId(user.id);
    const toastId = toast.loading(`${title}…`);
    startTransition(async () => {
      try {
        await manageComplimentaryAccess({ userId: user.id, action, plan: action === 'grant_trial' ? 'trial' : plan, days, reason });
        toast.success('Complimentary access updated.', { id: toastId });
        router.refresh();
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update access.', { id: toastId }); }
      finally { setPendingId(null); }
    });
  };
  return <div className="space-y-8"><section><h2 className="mb-3 text-lg font-semibold">Pending WhatsApp access requests</h2>{requests.length ? <div className="space-y-3">{requests.map((request) => <article key={request.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#E8E5DF] bg-white p-5"><div><h3 className="font-semibold">{request.name || request.email}</h3><p className="mt-1 text-sm text-[#777972]">{request.email} · {request.requestType === 'trial' ? 'Free trial' : request.planId === 'smart_page_ai' ? 'Growth' : 'Starter'} · {new Date(request.requestedAt).toLocaleString()}</p>{request.requestType === 'plan' && <p className="mt-1 text-sm">Requested price: {request.currency} {request.quotedAmount.toFixed(2)}{request.discountPercent > 0 ? ` (includes ${request.discountPercent}% referral discount)` : ''}</p>}{request.referralCode && <p className="mt-1 text-xs text-[#777972]">Referral code: {request.referralCode}</p>}<p className="mt-2 text-xs text-[#777972]">Confirm the WhatsApp conversation before approving. Approval grants complimentary access and does not record payment or revenue.</p></div><div className="flex gap-2"><button disabled={pending} onClick={() => resolveRequest(request, 'approved')} className="rounded-lg bg-[#292A25] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{pending && pendingId === request.id ? 'Working…' : 'Approve request'}</button><button disabled={pending} onClick={() => resolveRequest(request, 'rejected')} className="rounded-lg border border-[#D8D5CD] px-3 py-2 text-sm font-medium disabled:opacity-50">Reject</button></div></article>)}</div> : <AdminEmpty>No plan or trial requests are waiting for review.</AdminEmpty>}</section><section><h2 className="mb-3 text-lg font-semibold">Manual complimentary access</h2><div className="space-y-3">{users.length ? users.map((user) => {
    const isComp = user.subscription?.billingMethod === 'admin_comp' && ['active', 'trialing'].includes(user.subscription.status);
    return <article key={user.id} className="rounded-2xl border border-[#E8E5DF] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{user.name || user.email || user.id}</h2><p className="mt-1 text-xs text-[#777972]">{user.email || user.id}</p></div>{user.subscription ? <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{user.subscription.planId}</span><AdminStatus value={user.subscription.status} /><span className="rounded-full bg-[#F2EFE9] px-2.5 py-1 text-xs text-[#656760]">{user.subscription.billingMethod === 'admin_comp' ? 'Complimentary' : user.subscription.billingMethod === 'manual' || user.subscription.billingMethod === 'dodo' ? 'Paid billing' : user.subscription.billingMethod}</span></div> : <AdminStatus value="no subscription" />}</div>
      {user.subscription?.currentPeriodEnd && <p className="mt-2 text-xs text-[#777972]">Access ends {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}</p>}
      <form onSubmit={(event) => submit(event, user)} className="mt-4 grid gap-3 border-t border-[#EEECE6] pt-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_120px_2fr_auto] xl:items-end">
        <label className="text-xs font-medium text-[#62645E]">Action<select name="action" className="mt-1 block w-full rounded-lg border border-[#D9D6CE] bg-white p-2.5 text-sm"><option value="grant_trial">Grant free trial</option><option value="grant_plan">Grant plan access</option>{isComp && <><option value="extend">Extend complimentary access</option><option value="revoke">Revoke complimentary access</option></>}</select></label>
        <label className="text-xs font-medium text-[#62645E]">Plan (used for plan grants)<select name="plan" className="mt-1 block w-full rounded-lg border border-[#D9D6CE] bg-white p-2.5 text-sm"><option value="smart_page">Starter</option><option value="smart_page_ai">Growth</option></select></label>
        <label className="text-xs font-medium text-[#62645E]">Days<input name="days" type="number" min="1" max="3650" defaultValue="14" required className="mt-1 block w-full rounded-lg border border-[#D9D6CE] p-2.5 text-sm" /></label>
        <label className="text-xs font-medium text-[#62645E]">Reason (required)<input name="reason" minLength={5} maxLength={1000} required className="mt-1 block w-full rounded-lg border border-[#D9D6CE] p-2.5 text-sm" placeholder="Why is this access being changed?" /></label>
        <button disabled={pending} className="rounded-lg bg-[#292A25] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending && pendingId === user.id ? 'Saving…' : 'Apply'}</button>
      </form>
    </article>;
  }) : <AdminEmpty>No user accounts are available.</AdminEmpty>}</div></section></div>;
}
