'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { recordAffiliatePayout } from '@/app/actions/affiliate-actions';
import { AdminEmpty, AdminStatus } from '@/components/admin/AdminUI';

export type AdminCommissionRow = { id: string; affiliateId: string; affiliateName: string | null; affiliateEmail: string | null; customerEmail: string | null; planId: string; currency: string; revenue: number; amount: number; percent: number; earnedAt: string; eligibilityStatus: string; payoutStatus: string; paymentReference: string | null };
export type AdminPayoutRow = { id: string; affiliateEmail: string | null; affiliateName: string | null; amount: number; currency: string; payoutAmount: number | null; payoutCurrency: string | null; exchangeRate: number | null; method: string; reference: string; paidAt: string; status: string };

export function AdminCommissionsClient({ commissions, payouts }: { commissions: AdminCommissionRow[]; payouts: AdminPayoutRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState('');
  const payable = commissions.filter((row) => row.payoutStatus === 'unpaid' && row.eligibilityStatus === 'payable');
  const groups = [...new Set(payable.map((row) => `${row.affiliateId}:${row.currency}`))];
  const pay = (event: React.FormEvent<HTMLFormElement>, affiliateId: string, currency: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ids = form.getAll('commissionId').map(String);
    const method = String(form.get('method') || '').trim();
    const reference = String(form.get('reference') || '').trim();
    const paidAt = String(form.get('paidAt') || '');
    const reason = String(form.get('reason') || '').trim();
    if (!ids.length) { toast.error('Select at least one eligible commission.'); return; }
    if (reason.length < 5) { toast.error('Enter a reason of at least 5 characters.'); return; }
    if (!window.confirm(`Record ${ids.length} ${currency} commission(s) as paid? Confirm only after the transfer has been sent.`)) return;
    const key = `${affiliateId}:${currency}`; setBusy(key);
    const toastId = toast.loading('Recording payout…');
    startTransition(async () => {
      try { await recordAffiliatePayout(affiliateId, currency, ids, method, reference, paidAt, reason); toast.success('Payout recorded.', { id: toastId }); router.refresh(); }
      catch (error) { toast.error(error instanceof Error ? error.message : 'Could not record this payout.', { id: toastId }); }
      finally { setBusy(''); }
    });
  };
  return <div className="space-y-8">
    <section><h2 className="mb-3 text-lg font-semibold">Ready for payout</h2>{groups.length ? <div className="space-y-3">{groups.map((key) => { const [affiliateId, currency] = key.split(':'); const rows = payable.filter((row) => row.affiliateId === affiliateId && row.currency === currency); const total = rows.reduce((sum, row) => sum + row.amount, 0); return <article key={key} className="rounded-2xl border border-[#E8E5DF] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{rows[0]?.affiliateName || rows[0]?.affiliateEmail}</h3><p className="text-xs text-[#777972]">{rows[0]?.affiliateEmail}</p></div><p className="text-lg font-semibold">{currency} {total.toFixed(2)} <span className="text-xs font-normal text-[#777972]">· {rows.length} commissions</span></p></div><form onSubmit={(event) => pay(event, affiliateId, currency)} className="mt-4 space-y-3 border-t border-[#EEECE6] pt-4">
        {rows.map((row) => <label key={row.id} className="flex flex-wrap items-center gap-2 text-xs text-[#5F615A]"><input name="commissionId" type="checkbox" value={row.id} defaultChecked />{new Date(row.earnedAt).toLocaleDateString()} · {row.customerEmail || 'Customer'} · {row.planId} · collected {currency} {row.revenue.toFixed(2)} · commission {currency} {row.amount.toFixed(2)}</label>)}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="text-xs">Payout method<input required minLength={2} maxLength={80} name="method" className="mt-1 block w-full rounded-lg border border-[#D9D6CE] p-2.5 text-sm" placeholder="Bank transfer, eSewa…" /></label><label className="text-xs">Transaction reference<input required minLength={2} maxLength={150} name="reference" className="mt-1 block w-full rounded-lg border border-[#D9D6CE] p-2.5 text-sm" /></label><label className="text-xs">Payout date<input required name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 block w-full rounded-lg border border-[#D9D6CE] p-2.5 text-sm" /></label><label className="text-xs">Reason<input required minLength={5} maxLength={1000} name="reason" className="mt-1 block w-full rounded-lg border border-[#D9D6CE] p-2.5 text-sm" placeholder="Payout period / reason" /></label></div>
        <button disabled={pending} className="rounded-lg bg-[#292A25] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending && busy === key ? 'Recording…' : 'Record payout sent'}</button>
      </form></article>; })}</div> : <AdminEmpty>No eligible unpaid commissions are ready for payout.</AdminEmpty>}</section>
    <section><h2 className="mb-3 text-lg font-semibold">Commission ledger</h2>{commissions.length ? <div className="overflow-x-auto rounded-2xl border border-[#E8E5DF] bg-white"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#F8F7F2] text-xs uppercase tracking-wide text-[#777972]"><tr><th className="p-3">Affiliate / customer</th><th className="p-3">Plan / payment ref</th><th className="p-3">Eligible revenue</th><th className="p-3">Commission</th><th className="p-3">Earned</th><th className="p-3">Eligibility</th><th className="p-3">Payout</th></tr></thead><tbody>{commissions.map((row) => <tr key={row.id} className="border-t border-[#EEECE6]"><td className="p-3"><strong>{row.affiliateEmail}</strong><p className="text-xs text-[#777972]">{row.customerEmail || 'Customer'}</p></td><td className="p-3">{row.planId}<p className="text-xs text-[#777972]">{row.paymentReference || 'Payment verified'}</p></td><td className="p-3">{row.currency} {row.revenue.toFixed(2)}</td><td className="p-3">{row.currency} {row.amount.toFixed(2)} <span className="text-xs text-[#777972]">({row.percent}%)</span></td><td className="p-3">{new Date(row.earnedAt).toLocaleDateString()}</td><td className="p-3"><AdminStatus value={row.eligibilityStatus} /></td><td className="p-3"><AdminStatus value={row.payoutStatus} /></td></tr>)}</tbody></table></div> : <AdminEmpty>No commission entries have been recorded.</AdminEmpty>}</section>
    <section><h2 className="mb-3 text-lg font-semibold">Payout history</h2>{payouts.length ? <div className="overflow-x-auto rounded-2xl border border-[#E8E5DF] bg-white"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-[#F8F7F2] text-xs uppercase tracking-wide text-[#777972]"><tr><th className="p-3">Affiliate</th><th className="p-3">Amount</th><th className="p-3">Method / reference</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead><tbody>{payouts.map((row) => <tr key={row.id} className="border-t border-[#EEECE6]"><td className="p-3">{row.affiliateName || row.affiliateEmail}<p className="text-xs text-[#777972]">{row.affiliateEmail}</p></td><td className="p-3">{row.currency} {row.amount.toFixed(2)}{row.payoutAmount !== null && row.payoutCurrency && <p className="text-xs text-[#777972]">Sent as {row.payoutCurrency} {row.payoutAmount.toFixed(2)}{row.exchangeRate ? ` · rate ${row.exchangeRate}` : ''}</p>}</td><td className="p-3">{row.method}<p className="text-xs text-[#777972]">{row.reference}</p></td><td className="p-3">{new Date(row.paidAt).toLocaleDateString()}</td><td className="p-3"><AdminStatus value={row.status} /></td></tr>)}</tbody></table></div> : <AdminEmpty>No payouts have been recorded.</AdminEmpty>}</section>
  </div>;
}
