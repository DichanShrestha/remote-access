import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { AdminPageHeader, AdminEmpty } from '@/components/admin/AdminUI';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  await requireAffiliateAdmin();
  const events = await db.affiliateAuditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  const actorIds = [...new Set(events.map((event) => event.actorId).filter((id): id is string => Boolean(id)))];
  const actors = await db.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } });
  const actorById = new Map(actors.map((actor) => [actor.id, actor]));
  return <main><AdminPageHeader title="Audit Logs" description="Recent sensitive administrative and affiliate actions, including their actor, target, reason, and timestamp." />
    {events.length ? <div className="overflow-x-auto rounded-2xl border border-[#E8E5DF] bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#F7F6F1] text-xs uppercase tracking-wide text-[#777972]"><tr><th className="p-3">When</th><th className="p-3">Admin / actor</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">Reason / details</th></tr></thead><tbody>{events.map((event) => { const actor = event.actorId ? actorById.get(event.actorId) : null; const details = event.details && typeof event.details === 'object' && !Array.isArray(event.details) ? event.details as Record<string, unknown> : {}; const reason = typeof details.reason === 'string' ? details.reason : typeof details.note === 'string' ? details.note : ''; return <tr key={event.id} className="border-t border-[#EEECE6] align-top"><td className="whitespace-nowrap p-3 text-[#777972]">{event.createdAt.toLocaleString()}</td><td className="p-3">{actor?.name || actor?.email || event.actorId || 'System'}</td><td className="p-3 font-medium">{event.action}</td><td className="p-3">{event.entityType}<div className="max-w-48 truncate text-xs text-[#777972]" title={event.entityId}>{event.entityId}</div></td><td className="max-w-md p-3 text-[#62645E]">{reason || <details><summary className="cursor-pointer text-xs">View details</summary><pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(details, null, 2)}</pre></details>}</td></tr>; })}</tbody></table></div> : <AdminEmpty>No audit events have been recorded.</AdminEmpty>}
    {events.length === 300 && <p className="mt-3 text-xs text-[#777972]">Showing the 300 most recent events.</p>}
  </main>;
}
