import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AdminCard, AdminPageHeader } from '@/components/admin/AdminUI';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAffiliateAdmin();
  const [users, activeSubscriptions, trialUsers, pendingApplications, unpaid] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { billingMethod: { in: ['manual', 'dodo'] }, status: 'active' } }),
    db.subscription.count({ where: { status: 'trialing', trialEnd: { gt: new Date() } } }),
    db.affiliateApplication.count({ where: { status: 'pending' } }),
    db.commission.groupBy({ by: ['currency'], where: { payoutStatus: 'unpaid', eligibilityStatus: 'payable' }, _sum: { amount: true } }),
  ]);
  return <main>
    <AdminPageHeader title="Dashboard" description="A live overview of Pageory accounts, subscriptions, affiliate applications, and unpaid commissions." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminCard title="Total users" value={users.toLocaleString()} />
      <AdminCard title="Active paid subscriptions" value={activeSubscriptions.toLocaleString()} detail="Complimentary access is excluded." />
      <AdminCard title="Trial users" value={trialUsers.toLocaleString()} />
      <AdminCard title="Pending affiliate applications" value={pendingApplications.toLocaleString()} />
    </section>
    <section className="mt-6 rounded-2xl border border-[#E8E5DF] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Unpaid eligible commissions</h2>
      <p className="mt-1 text-sm text-[#777972]">Balances remain separated by payment currency.</p>
      <div className="mt-4 flex flex-wrap gap-3">{unpaid.length ? unpaid.map((row) => <div key={row.currency} className="rounded-xl bg-[#F7F6F1] px-4 py-3"><span className="text-xs text-[#777972]">{row.currency}</span><p className="mt-1 text-xl font-semibold">{Number(row._sum.amount || 0).toFixed(2)}</p></div>) : <p className="text-sm text-[#777972]">No unpaid commissions.</p>}</div>
    </section>
  </main>;
}
