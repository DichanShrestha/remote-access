import db from '@/lib/prisma';
import { requireApprovedAffiliate } from '@/services/capabilities';
import { AffiliateDashboard } from '@/components/dashboard/AffiliateDashboard';

export const dynamic = 'force-dynamic';

export default async function AffiliatePage() {
  const user = await requireApprovedAffiliate();
  const application = await db.affiliateApplication.findUnique({ where: { userId: user.id }, include: { code: true } });
  if (application?.status !== 'approved') return null;

  const [referrals, commissions, payouts] = await Promise.all([
    db.customerReferral.findMany({ where: { affiliateId: user.id }, orderBy: { referredAt: 'desc' }, include: { code: { select: { code: true } }, purchases: { orderBy: { createdAt: 'desc' }, select: { id: true, planId: true, currency: true, expectedAmount: true, status: true, createdAt: true, paymentDate: true, subscription: { select: { status: true, cancelAtPeriodEnd: true } }, commission: { select: { amount: true, payoutStatus: true, eligibilityStatus: true } } } } } }),
    db.commission.findMany({ where: { affiliateId: user.id }, orderBy: { earnedAt: 'desc' }, select: { id: true, currency: true, amount: true, eligibleRevenue: true, earnedAt: true, eligibilityStatus: true, payoutStatus: true } }),
    db.affiliatePayout.findMany({ where: { affiliateId: user.id }, orderBy: { paidAt: 'desc' }, select: { id: true, currency: true, amount: true, paidAt: true, method: true, reference: true, status: true } }),
  ]);
  const grouped = new Map<string, { payable: number; unpaid: number; paid: number }>();
  for (const commission of commissions) {
    const row = grouped.get(commission.currency) || { payable: 0, unpaid: 0, paid: 0 };
    const amount = Number(commission.amount);
    if (commission.eligibilityStatus === 'payable') row.payable += amount;
    if (commission.payoutStatus === 'unpaid' && commission.eligibilityStatus === 'payable') row.unpaid += amount;
    if (commission.payoutStatus === 'paid') row.paid += amount;
    grouped.set(commission.currency, row);
  }
  return <AffiliateDashboard application={{ status: application.status, reviewNote: application.reviewNote, code: application.code?.code || null, codeActive: application.code?.active || false }} referrals={referrals.map((r) => ({ id: r.id.slice(-8).toUpperCase(), referredAt: r.referredAt.toISOString(), code: r.code.code, purchases: r.purchases.map((p) => ({ id: p.id, planId: p.planId, currency: p.currency, amount: Number(p.expectedAmount), status: p.status, subscriptionStatus: p.subscription ? `${p.subscription.status}${p.subscription.cancelAtPeriodEnd ? ' · cancel scheduled' : ''}` : 'not activated', createdAt: p.createdAt.toISOString(), paymentDate: p.paymentDate?.toISOString() || null, commission: p.commission ? { amount: Number(p.commission.amount), payoutStatus: p.commission.payoutStatus, eligibilityStatus: p.commission.eligibilityStatus } : null })) }))} commissions={commissions.map((c) => ({ id: c.id, currency: c.currency, amount: Number(c.amount), revenue: Number(c.eligibleRevenue), earnedAt: c.earnedAt.toISOString(), eligibilityStatus: c.eligibilityStatus, payoutStatus: c.payoutStatus }))} payouts={payouts.map((p) => ({ id: p.id, currency: p.currency, amount: Number(p.amount), paidAt: p.paidAt.toISOString(), method: p.method, reference: p.reference, status: p.status }))} totals={[...grouped.entries()].map(([currency, value]) => ({ currency, ...value }))} />;
}
