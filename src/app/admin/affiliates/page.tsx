import { notFound } from 'next/navigation';
import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AffiliateAdminClient } from '@/components/admin/AffiliateAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminAffiliatesPage() {
  try { await requireAffiliateAdmin(); } catch { notFound(); }
  const [config, applications, purchases, affiliates, commissions, audits, referrals] = await Promise.all([
    db.affiliateConfig.findUnique({ where: { id: 1 } }),
    db.affiliateApplication.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, email: true, name: true } } } }),
    db.affiliatePurchase.findMany({ where: { status: 'pending', paymentProvider: 'manual', OR: [{ customerConfirmedAt: { not: null } }, { paymentReference: { not: null } }] }, orderBy: { customerConfirmedAt: 'asc' }, include: { customer: { select: { email: true } }, referral: { include: { code: true } } } }),
    db.affiliateApplication.findMany({ where: { status: { in: ['approved', 'suspended'] } }, include: { user: { select: { id: true, email: true, name: true } }, code: true }, orderBy: { updatedAt: 'desc' } }),
    db.commission.findMany({ where: { eligibilityStatus: { not: 'reversed' } }, include: { affiliate: { select: { email: true } } }, orderBy: { earnedAt: 'desc' } }),
    db.affiliateAuditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    db.customerReferral.findMany({ orderBy: { referredAt: 'desc' }, take: 200, include: { customer: { select: { email: true } }, affiliate: { select: { email: true } }, code: { select: { code: true } }, purchases: { orderBy: { createdAt: 'desc' }, take: 5, include: { commission: true } } } }),
  ]);

  return <AffiliateAdminClient
    config={config ? { discount: Number(config.customerDiscountPercent), commission: Number(config.commissionPercent), months: config.eligibilityMonths } : { discount: 10, commission: 15, months: 12 }}
    applications={applications.map((app) => ({ id: app.id, name: app.user.name, email: app.user.email, createdAt: app.createdAt.toISOString(), details: app.details }))}
    purchases={purchases.map((purchase) => ({ id: purchase.id, customerEmail: purchase.customer.email, planId: purchase.planId, currency: purchase.currency, expectedAmount: Number(purchase.expectedAmount), originalAmount: Number(purchase.originalAmount), discountAmount: Number(purchase.discountAmount), discountPercent: Number(purchase.discountPercent), referralCode: purchase.referral?.code.code || null, paymentReference: purchase.paymentReference, proofUrl: purchase.proofUrl, customerConfirmedAt: purchase.customerConfirmedAt?.toISOString() || null }))}
    affiliates={affiliates.map((affiliate) => ({ userId: affiliate.userId, name: affiliate.user.name, email: affiliate.user.email, status: affiliate.status, codeId: affiliate.code?.id || null, code: affiliate.code?.code || null, codeActive: affiliate.code?.active || false }))}
    commissions={commissions.map((commission) => ({ id: commission.id, affiliateId: commission.affiliateId, email: commission.affiliate.email, currency: commission.currency, amount: Number(commission.amount), revenue: Number(commission.eligibleRevenue), earnedAt: commission.earnedAt.toISOString(), eligibilityStatus: commission.eligibilityStatus, payoutStatus: commission.payoutStatus }))}
    audits={audits.map((event) => ({ id: event.id, action: event.action, entityType: event.entityType, entityId: event.entityId, createdAt: event.createdAt.toISOString() }))}
    referrals={referrals.map((referral) => ({ id: referral.id, affiliateEmail: referral.affiliate.email, customerEmail: referral.customer.email, code: referral.code.code, referredAt: referral.referredAt.toISOString(), firstPaidAt: referral.firstPaidAt?.toISOString() || null, purchases: referral.purchases.map((purchase) => ({ planId: purchase.planId, currency: purchase.currency, amount: Number(purchase.verifiedAmount || 0), status: purchase.status, commission: purchase.commission ? Number(purchase.commission.amount) : null, commissionStatus: purchase.commission?.payoutStatus || null })) }))}
  />;
}
