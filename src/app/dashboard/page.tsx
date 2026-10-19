import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { getEffectiveTier } from '@/lib/tier-limits';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile?.page || !Object.keys(profile.page.draftConfig as object).length) {
    const application = await db.affiliateApplication.findUnique({ where: { userId: user.id }, select: { status: true } });
    if (application?.status === 'approved' && !profile) {
      const [referralCount, activeReferrals, unpaid, paid] = await Promise.all([
        db.customerReferral.count({ where: { affiliateId: user.id } }),
        db.customerReferral.count({ where: { affiliateId: user.id, purchases: { some: { status: 'verified', subscription: { status: 'active' } } } } }),
        db.commission.groupBy({ by: ['currency'], where: { affiliateId: user.id, payoutStatus: 'unpaid', eligibilityStatus: 'payable' }, _sum: { amount: true } }),
        db.commission.groupBy({ by: ['currency'], where: { affiliateId: user.id, payoutStatus: 'paid' }, _sum: { amount: true } }),
      ]);
      return <main className="space-y-8 text-[#292A25]"><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777972]">Welcome to Pageory</p><h1 className="mt-2 text-3xl font-semibold">Affiliate dashboard</h1><p className="mt-2 text-sm text-[#777972]">Track your referrals and commissions from here.</p></header><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Stat label="Attributed referrals" value={referralCount} /><Stat label="Active paying referrals" value={activeReferrals} /><div className="rounded-2xl border border-[#E8E5DF] bg-white p-5"><p className="text-sm text-[#777972]">Unpaid commissions</p>{unpaid.length ? unpaid.map((row) => <p key={row.currency} className="mt-2 text-xl font-semibold">{row.currency} {Number(row._sum.amount || 0).toFixed(2)}</p>) : <p className="mt-2 text-xl font-semibold">0.00</p>}</div><div className="rounded-2xl border border-[#E8E5DF] bg-white p-5"><p className="text-sm text-[#777972]">Paid commissions</p>{paid.length ? paid.map((row) => <p key={row.currency} className="mt-2 text-xl font-semibold">{row.currency} {Number(row._sum.amount || 0).toFixed(2)}</p>) : <p className="mt-2 text-xl font-semibold">0.00</p>}</div></section><Link href="/dashboard/affiliate" className="inline-flex rounded-xl bg-[#292A25] px-5 py-3 text-sm font-semibold text-white">Open affiliate program</Link></main>;
    }
    if (application?.status === 'pending') redirect('/affiliate/apply');
    redirect('/onboarding');
  }
  if (!profile.page.isPublished) redirect('/onboarding/claim');

  const [bot, subscription, pageLeads, pageLeadCount] = await Promise.all([
    db.bot.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, include: { dataSources: { select: { status: true } }, qaPairs: { select: { id: true } } } }),
    db.subscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } }),
    db.lead.findMany({ where: { pageId: profile.page.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    db.lead.count({ where: { pageId: profile.page.id } }),
  ]);
  const [conversationGroups, recentMessages, botLeads, botLeadCount, bookingClicks] = bot ? await Promise.all([
    db.chatMessage.groupBy({ by: ['sessionId'], where: { botId: bot.id } }),
    db.chatMessage.findMany({ where: { botId: bot.id, role: 'user' }, orderBy: { createdAt: 'desc' }, take: 4, select: { id: true, content: true, createdAt: true, sessionId: true } }),
    db.botLead.findMany({ where: { botId: bot.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    db.botLead.count({ where: { botId: bot.id } }),
    countBookingClicks(bot.id),
  ]) : [[], [], [], 0, 0];
  const tier = getEffectiveTier({ createdAt: user.createdAt, subscriptions: subscription ? [{ tier: subscription.tier }] : [] });
  const completedSources = bot?.dataSources.some((source) => source.status === 'completed') || false;
  const trained = Boolean(bot && (completedSources || bot.qaPairs.length > 0));
  const recent = [
    ...pageLeads.map((lead) => ({ id: `page-${lead.id}`, kind: 'lead' as const, title: lead.name || lead.email || 'New page inquiry', detail: lead.message || 'A visitor sent a page inquiry', createdAt: lead.createdAt })),
    ...botLeads.map((lead) => ({ id: `bot-${lead.id}`, kind: 'lead' as const, title: lead.name || lead.email || 'New AI lead', detail: lead.conversationSnippet || 'A visitor shared their details with your assistant', createdAt: lead.createdAt })),
    ...recentMessages.map((message) => ({ id: `message-${message.id}`, kind: 'conversation' as const, title: 'A visitor started a conversation', detail: message.content, createdAt: message.createdAt })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'smartpage.app';
  const protocol = requestHeaders.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https');

  return <DashboardHome data={{
    name: profile.displayName || user.name || 'there', username: profile.username, bio: profile.bio,
    published: profile.page.isPublished, origin: `${protocol}://${host}`, tier,
    visitors: null, leads: pageLeadCount + botLeadCount, conversations: conversationGroups.length,
    bookingClicks, trained, hasBot: Boolean(bot), profileComplete: Boolean(profile.displayName && profile.bio),
    recent, conversationCount: conversationGroups.length,
  }} />;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-[#E8E5DF] bg-white p-5"><p className="text-sm text-[#777972]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}

function countBookingClicks(botId: string) {
  const bookingEvents = db as unknown as { bookingEvent: { count(args: { where: { botId: string; event: string } }): Promise<number> } };
  return bookingEvents.bookingEvent.count({ where: { botId, event: 'booking_link_clicked' } });
}
