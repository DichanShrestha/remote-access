import db from "@/lib/prisma";
import { authService } from "@/services/auth";
import { LeadCaptureConfigPanel } from "@/components/dashboard/LeadCaptureConfigPanel";
import { getLeadCaptureConfig } from "@/app/actions/bot-actions";
import { ArrowLeft, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function LeadCapturePage() {
  const user = await authService.requireUser();

  const bot = await db.bot.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (!bot) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Lead Capture</h1>
        <p className="text-slate-500 mb-10">Configure how and when your chatbot captures leads.</p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Set Up Your AI Assistant First</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            You need an active Smart Page and chatbot to configure automated lead capture.
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

  const initialConfig = await getLeadCaptureConfig(bot.id);

  return (
    <div className="max-w-6xl mx-auto w-full pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/dashboard/leads"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Leads
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Lead Capture Configuration</h1>
        <p className="text-slate-500">
          Set up automated prompts to convert chatbot visitors into qualified leads using start triggers, keyword triggers, or engagement thresholds.
        </p>
      </div>

      <LeadCaptureConfigPanel
        botId={bot.id}
        botName={bot.name}
        colorTheme={bot.colorTheme}
        initialConfig={initialConfig}
      />
    </div>
  );
}
