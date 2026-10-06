import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { ConversationsPanel } from '@/components/dashboard/ConversationsPanel';
import { MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function ConversationsPage() {
  const user = await authService.requireUser();

  const bot = await db.bot.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  if (!bot) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Conversations</h1>
        <p className="text-slate-500 mb-10">View conversations people have had with your AI chatbot.</p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">No AI Assistant Yet</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            You need to set up your page and enable the AI chatbot first. Head to the Editor to configure your AI assistant.
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
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-5rem)] flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Conversations</h1>
        <p className="text-slate-500">View and manage conversations people have had with your AI chatbot.</p>
      </div>

      <ConversationsPanel botId={bot.id} />
    </div>
  );
}
