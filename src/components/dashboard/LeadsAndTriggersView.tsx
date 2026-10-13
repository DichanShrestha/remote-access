"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Users, Sliders, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LeadsPanel } from "@/components/dashboard/LeadsPanel";
import { LeadCaptureConfigPanel } from "@/components/dashboard/LeadCaptureConfigPanel";
import { LeadCaptureSettings } from "@/types/lead-capture";

interface LeadsAndTriggersViewProps {
  botId: string | null;
  botName: string;
  colorTheme?: string | null;
  initialConfig: LeadCaptureSettings | null;
  botLeads: any[];
  pageLeads: any[];
  defaultTab?: "leads" | "capture";
}

export function LeadsAndTriggersView({
  botId,
  botName,
  colorTheme,
  initialConfig,
  botLeads,
  pageLeads,
  defaultTab = "leads",
}: LeadsAndTriggersViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "capture" ? "capture" : tabParam === "leads" ? "leads" : defaultTab;

  const handleTabChange = (tab: "leads" | "capture") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const totalLeads = botLeads.length + pageLeads.length;

  return (
    <div className="max-w-6xl mx-auto w-full pb-16 space-y-6">
      {/* Top Header & Integrated Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Leads & Triggers</h1>
          <p className="text-sm text-[#737373] mt-1">
            {activeTab === "leads"
              ? "View and export captured visitor leads across your page and AI assistant."
              : "Configure automated prompt rules and booking triggers."}
          </p>
        </div>

        {/* Top Tabs: Leads List vs. Capture Rules */}
        <div className="bg-[#F2EFE9] p-1 rounded-xl inline-flex items-center gap-1 self-start sm:self-auto border border-[#E8E5DF]">
          <button
            type="button"
            onClick={() => handleTabChange("leads")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-white text-[#171717] shadow-2xs font-semibold"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Users size={14} />
            <span>Leads List</span>
            {totalLeads > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F2EFE9] text-[#171717]">
                {totalLeads}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("capture")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "capture"
                ? "bg-white text-[#171717] shadow-2xs font-semibold"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Sliders size={14} />
            <span>Capture Rules</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "leads" ? (
        <LeadsPanel botId={botId} botLeads={botLeads} pageLeads={pageLeads} />
      ) : botId && initialConfig ? (
        <LeadCaptureConfigPanel
          botId={botId}
          botName={botName}
          colorTheme={colorTheme}
          initialConfig={initialConfig}
        />
      ) : (
        <div className="bg-white border border-[#E8E5DF] rounded-2xl p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[#F2EFE9] text-[#171717] rounded-xl flex items-center justify-center mb-3">
            <Sliders className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#171717] mb-1">Set Up Your AI Assistant First</h2>
          <p className="text-xs text-[#737373] mb-6 max-w-sm">
            You need an active chatbot to configure automated lead capture triggers.
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-[#171717] hover:bg-[#262626] text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs"
          >
            Open Editor
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
