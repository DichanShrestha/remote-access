import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { AdminSubscriptionsClient, type AdminSubscriptionUser, type AdminPlanRequest } from '@/components/admin/AdminSubscriptionsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  await requireAffiliateAdmin();
  const [users, requests] = await Promise.all([
    db.user.findMany({ orderBy: { updatedAt: 'desc' }, take: 150, select: { id: true, name: true, email: true, subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1, select: { id: true, planId: true, status: true, billingMethod: true, currentPeriodEnd: true } } } }),
    db.planAccessRequest.findMany({ where: { status: 'pending' }, orderBy: { requestedAt: 'asc' }, take: 200, include: { user: { select: { id: true, name: true, email: true } } } }),
  ]);
  const rows: AdminSubscriptionUser[] = users.map((user) => ({ id: user.id, name: user.name, email: user.email, subscription: user.subscriptions[0] ? { id: user.subscriptions[0].id, planId: user.subscriptions[0].planId, status: user.subscriptions[0].status, billingMethod: user.subscriptions[0].billingMethod, currentPeriodEnd: user.subscriptions[0].currentPeriodEnd?.toISOString() || null } : null }));
  const pendingRequests: AdminPlanRequest[] = requests.map((request) => ({ id: request.id, userId: request.user.id, name: request.user.name, email: request.user.email, requestType: request.requestType, planId: request.planId, currency: request.currency, quotedAmount: Number(request.quotedAmount), discountPercent: Number(request.discountPercent), discountAmount: Number(request.discountAmount), referralCode: request.referralCode, requestedAt: request.requestedAt.toISOString() }));
  return <main><AdminPageHeader title="Subscriptions & Plans" description="Review WhatsApp access requests, grant time-limited complimentary trials or plan access, extend access, and revoke only access granted by an administrator." /><AdminSubscriptionsClient users={rows} requests={pendingRequests} /></main>;
}
