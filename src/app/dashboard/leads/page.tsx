import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { LeadsPanel } from '@/components/dashboard/LeadsPanel';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function LeadsPage() {
  const user = await authService.requireUser();

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
  if (botId) {
    botLeads = await db.botLead.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch page leads (from forms)
  let pageLeads: any[] = [];
  if (pageId) {
    pageLeads = await db.lead.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    });
  }

  const hasAnyLeads = botLeads.length > 0 || pageLeads.length > 0;
  const hasBot = !!bot;
  const hasPage = !!pageId;

  if (!hasBot && !hasPage) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Leads</h1>
        <p className="text-slate-500 mb-10">View and export your captured leads.</p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Set Up Your Page First</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Create your Smart Page and enable the AI chatbot to start capturing leads automatically.
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            Open Editor
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Leads</h1>
          <p className="text-slate-500">View and export your captured leads from AI chat and page forms.</p>
        </div>
      </div>

      <LeadsPanel botId={botId} botLeads={botLeads} pageLeads={pageLeads} />
    </div>
  );
}
