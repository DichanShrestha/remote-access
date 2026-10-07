import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { getEffectiveTier } from '@/lib/tier-limits';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile?.page || !Object.keys(profile.page.draftConfig as object).length) redirect('/onboarding');
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
    (db as any).bookingEvent.count({ where: { botId: bot.id, event: 'booking_link_clicked' } }),
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
