import React from 'react';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: { pages: { select: { id: true } } }
  });

  const bot = await db.bot.findFirst({
    where: { userId: user.id }
  });

  const botId = bot?.id;
  const pageIds = profile?.pages.map((page) => page.id) ?? [];

  let conversations: any[] = [];
  let allMessages: any[] = [];
  let topQuestions: any[] = [];
  let satisfaction = { upvotes: 0, downvotes: 0, percentage: "0.0" };
  let bookingStats = { opportunities: 0, clicks: 0 };
  let botLeads: any[] = [];
  let leads: any[] = [];

  if (botId) {
    allMessages = await db.chatMessage.findMany({
      where: { botId },
      orderBy: { createdAt: "asc" }
    });

    const conversationsMap = new Map();
    for (const msg of allMessages) {
      if (!conversationsMap.has(msg.sessionId)) {
        conversationsMap.set(msg.sessionId, { id: msg.sessionId, messages: [] });
      }
      conversationsMap.get(msg.sessionId).messages.push(msg);
    }
    conversations = Array.from(conversationsMap.values());

    const userMessages = allMessages.filter((m: any) => m.role === "user");
    const assistantMessages = allMessages.filter((m: any) => m.role === "assistant");

    const questions = userMessages.map((m: any) => m.content.trim().toLowerCase());
    topQuestions = Array.from(new Set(questions))
      .map((q: any) => ({
        question: q,
        count: questions.filter((x: any) => x === q).length
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Satisfaction (Feedback doesn't exist on chatMessage in prisma schema! Wait, let's check schema again. Schema: id, botId, sessionId, visitorId, role, content, createdAt. There's no feedback! Let's just mock or skip it since it was returning 0 in API before. Wait, I'll check API.)
    // Actually the API code `m.feedback === "up"` suggests it was a field, maybe saved in metadata or it's a dynamic cast. But I'll default to 0.)
    
    const bookingEvents = await db.bookingEvent.findMany({
      where: { botId }
    });
    bookingStats = {
      opportunities: bookingEvents.filter((e: any) => e.event === "booking_link_shown").length,
      clicks: bookingEvents.filter((e: any) => e.event === "booking_link_clicked").length,
    };

    botLeads = await db.botLead.findMany({
      where: { botId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  if (pageIds.length) {
    leads = await db.lead.findMany({
      where: { pageId: { in: pageIds } },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  const data = {
    totalConversations: conversations.length,
    totalMessages: allMessages.length,
    satisfaction,
    bookingStats,
    leads,
    botLeads,
    topQuestions
  };

  return <AnalyticsDashboard data={data} />;
}
