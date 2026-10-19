import Link from 'next/link';
import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AdminEmpty, AdminPageHeader } from '@/components/admin/AdminUI';
import { AdminUsersClient, type AdminUserRow } from '@/components/admin/AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAffiliateAdmin();
  const query = (await searchParams).q?.trim() || '';
  const users = await db.user.findMany({
    where: query ? { OR: [{ email: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }, { profile: { username: { contains: query, mode: 'insensitive' } } }] } : undefined,
    orderBy: { createdAt: 'desc' }, take: 100,
    include: { profile: { select: { username: true, displayName: true, type: true } }, subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1, select: { planId: true, status: true, billingMethod: true, currentPeriodEnd: true } } },
  });
  const rows: AdminUserRow[] = users.map((user) => ({ id: user.id, email: user.email, name: user.name, username: user.profile?.username || null, profileType: user.profile?.type || null, createdAt: user.createdAt.toISOString(), suspendedAt: user.suspendedAt?.toISOString() || null, suspensionReason: user.suspensionReason, subscription: user.subscriptions[0] ? { planId: user.subscriptions[0].planId, status: user.subscriptions[0].status, billingMethod: user.subscriptions[0].billingMethod, currentPeriodEnd: user.subscriptions[0].currentPeriodEnd?.toISOString() || null } : null }));
  return <main><AdminPageHeader title="Users" description="Search accounts, review their Pageory profile and latest subscription, and suspend or reactivate access." />
    <form className="mb-5 flex gap-2" action="/admin/users"><input name="q" defaultValue={query} placeholder="Search name, email, or username" className="min-w-0 flex-1 rounded-xl border border-[#D8D5CD] bg-white px-4 py-2.5 text-sm" /><button className="rounded-xl bg-[#292A25] px-4 py-2.5 text-sm font-medium text-white">Search</button>{query && <Link href="/admin/users" className="rounded-xl border border-[#D8D5CD] px-4 py-2.5 text-sm">Clear</Link>}</form>
    {rows.length ? <AdminUsersClient users={rows} /> : <AdminEmpty>No accounts matched your search.</AdminEmpty>}
    {rows.length === 100 && <p className="mt-3 text-xs text-[#777972]">Showing the latest 100 matching accounts. Refine your search to locate older accounts.</p>}
  </main>;
}
