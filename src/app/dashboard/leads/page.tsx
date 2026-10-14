import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { LeadsAndTriggersView } from '@/components/dashboard/LeadsAndTriggersView';
import { getLeadCaptureConfig } from '@/app/actions/bot-actions';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const user = await authService.requireUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedSearchParams?.tab === 'capture' ? 'capture' : 'leads';

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: { page: true },
  });

  const bot = await db.bot.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const pageId = profile?.page?.id;
  const botId = bot?.id || null;

  // Fetch bot leads (from AI chat)
  let botLeads: any[] = [];
  let initialConfig = null;

  if (botId) {
    const [fetchedBotLeads, fetchedConfig] = await Promise.all([
      db.botLead.findMany({
        where: { botId },
        orderBy: { createdAt: 'desc' },
      }),
      getLeadCaptureConfig(botId).catch(() => null),
    ]);
    botLeads = fetchedBotLeads;
    initialConfig = fetchedConfig;
  }

  // Fetch page leads (from forms)
  let pageLeads: any[] = [];
  if (pageId) {
    pageLeads = await db.lead.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    });
  }

  const hasBot = !!bot;
  const hasPage = !!pageId;

  if (!hasBot && !hasPage) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717] mb-2">Leads & Triggers</h1>
        <p className="text-[#737373] mb-10 text-sm">View and export your captured leads.</p>

        <div className="bg-white border border-[#E8E5DF] rounded-2xl p-10 text-center flex flex-col items-center shadow-xs">
          <div className="w-14 h-14 bg-[#F2EFE9] text-[#171717] rounded-xl flex items-center justify-center mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#171717] mb-2">Set Up Your Page First</h2>
          <p className="text-xs text-[#737373] mb-8 max-w-md">
            Create your Pageory and enable the AI chatbot to start capturing leads automatically.
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-[#171717] hover:bg-[#262626] text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs"
          >
            Open Editor
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LeadsAndTriggersView
      botId={botId}
      botName={bot?.name || 'Support Assistant'}
      colorTheme={bot?.colorTheme}
      initialConfig={initialConfig}
      botLeads={botLeads}
      pageLeads={pageLeads}
      defaultTab={initialTab}
    />
  );
}
