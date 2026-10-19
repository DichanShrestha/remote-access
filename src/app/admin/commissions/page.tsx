import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { AdminCommissionsClient, type AdminCommissionRow, type AdminPayoutRow } from '@/components/admin/AdminCommissionsClient';

export const dynamic = 'force-dynamic';

export default async function AdminCommissionsPage() {
  await requireAffiliateAdmin();
  const [commissions, payouts] = await Promise.all([
    db.commission.findMany({ include: { affiliate: { select: { id: true, email: true, name: true } }, purchase: { select: { customer: { select: { email: true } }, planId: true, paymentReference: true } } }, orderBy: { earnedAt: 'desc' }, take: 500 }),
    db.affiliatePayout.findMany({ include: { affiliate: { select: { email: true, name: true } } }, orderBy: { paidAt: 'desc' }, take: 150 }),
  ]);
  const commissionRows: AdminCommissionRow[] = commissions.map((row) => ({ id: row.id, affiliateId: row.affiliateId, affiliateName: row.affiliate.name, affiliateEmail: row.affiliate.email, customerEmail: row.purchase.customer.email, planId: row.purchase.planId, currency: row.currency, revenue: Number(row.eligibleRevenue), amount: Number(row.amount), percent: Number(row.commissionPercent), earnedAt: row.earnedAt.toISOString(), eligibilityStatus: row.eligibilityStatus, payoutStatus: row.payoutStatus, paymentReference: row.purchase.paymentReference }));
  const payoutRows: AdminPayoutRow[] = payouts.map((row) => ({ id: row.id, affiliateEmail: row.affiliate.email, affiliateName: row.affiliate.name, amount: Number(row.amount), currency: row.currency, payoutAmount: row.payoutAmount ? Number(row.payoutAmount) : null, payoutCurrency: row.payoutCurrency, exchangeRate: row.exchangeRate ? Number(row.exchangeRate) : null, method: row.method, reference: row.reference, paidAt: row.paidAt.toISOString(), status: row.status }));
  return <main><AdminPageHeader title="Commissions & Payouts" description="Review verified commission entries and record payouts only after funds have been sent." /><AdminCommissionsClient commissions={commissionRows} payouts={payoutRows} /></main>;
}
