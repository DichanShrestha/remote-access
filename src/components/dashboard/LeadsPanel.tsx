"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Trash2,
  Download,
  Mail,
  Phone,
  User,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react";
import { getBotLeads, deleteLead, exportLeadsToCSV } from "@/app/actions/leads-actions";

interface BotLead {
  id: string;
  botId: string;
  visitorId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  metadata: any;
  createdAt: Date;
  conversationSnippet: string | null;
}

interface PageLead {
  id: string;
  pageId: string;
  componentId: string;
  componentType: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  customData: any;
  source: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: Date;
}

type UnifiedLead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  createdAt: Date;
  conversationSnippet: string | null;
  message: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  raw: BotLead | PageLead;
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LeadsPanel({
  botId,
  botLeads,
  pageLeads,
}: {
  botId: string | null;
  botLeads: BotLead[];
  pageLeads: PageLead[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Merge both lead types into a unified list
    const unified: UnifiedLead[] = [];

    for (const lead of botLeads) {
      unified.push({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: "AI Chat",
        createdAt: lead.createdAt,
        conversationSnippet: lead.conversationSnippet,
        message: null,
        utmSource: null,
        utmCampaign: null,
        referrer: null,
        raw: lead,
      });
    }

    for (const lead of pageLeads) {
      unified.push({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source || lead.componentType || "Page Form",
        createdAt: lead.createdAt,
        conversationSnippet: null,
        message: lead.message,
        utmSource: lead.utmSource,
        utmCampaign: lead.utmCampaign,
        referrer: lead.referrer,
        raw: lead,
      });
    }

    unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setLeads(unified);
  }, [botLeads, pageLeads]);

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      (lead.name || "").toLowerCase().includes(q) ||
      (lead.email || "").toLowerCase().includes(q) ||
      (lead.phone || "").toLowerCase().includes(q) ||
      lead.source.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (lead: UnifiedLead) => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    setDeletingId(lead.id);
    try {
      // Only bot leads can be deleted via the action
      if ("botId" in lead.raw) {
        await deleteLead(lead.id);
      }
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      if (expandedId === lead.id) setExpandedId(null);
    } catch (error) {
      console.error("Failed to delete lead", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    if (!botId) return;
    setExporting(true);
    try {
      const csv = await exportLeadsToCSV(botId);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setExporting(false);
    }
  };

  const totalLeads = leads.length;
  const emailLeads = leads.filter((l) => l.email).length;
  const chatLeads = leads.filter((l) => l.source === "AI Chat").length;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard label="Total Leads" value={totalLeads} icon={<Users className="w-5 h-5 text-blue-600" />} color="bg-blue-50" />
        <StatCard label="With Email" value={emailLeads} icon={<Mail className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="From AI Chat" value={chatLeads} icon={<MessageSquare className="w-5 h-5 text-indigo-600" />} color="bg-indigo-50" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          {botId && (
            <button
              onClick={handleExport}
              disabled={exporting || totalLeads === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export CSV
            </button>
          )}
        </div>

        {/* Lead Rows */}
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 px-6 text-center">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">
              {searchQuery ? "No matching leads" : "No leads captured yet"}
            </p>
            <p className="text-sm mt-1 opacity-70">
              {searchQuery ? "Try a different search." : "Leads from your AI chatbot and page forms will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const isExpanded = expandedId === lead.id;
              const isDeleting = deletingId === lead.id;
              return (
                <div key={lead.id} className={`transition-colors ${isDeleting ? "opacity-50" : ""}`}>
                  {/* Summary Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4.5 h-4.5 text-slate-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {lead.name || "Anonymous Visitor"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {lead.email && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Source badge */}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${
                      lead.source === "AI Chat"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {lead.source}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">
                      {formatRelativeDate(lead.createdAt)}
                    </span>

                    {/* Chevron */}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                      <div className="ml-14 bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <DetailField label="Full Name" value={lead.name} />
                          <DetailField label="Email" value={lead.email} />
                          <DetailField label="Phone" value={lead.phone} />
                          <DetailField label="Source" value={lead.source} />
                          <DetailField label="Date" value={formatDate(lead.createdAt)} />
                          {lead.utmSource && <DetailField label="UTM Source" value={lead.utmSource} />}
                          {lead.utmCampaign && <DetailField label="UTM Campaign" value={lead.utmCampaign} />}
                          {lead.referrer && <DetailField label="Referrer" value={lead.referrer} />}
                        </div>

                        {/* Message from form */}
                        {lead.message && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Message</p>
                            <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                              {lead.message}
                            </div>
                          </div>
                        )}

                        {/* Conversation Snippet from chatbot */}
                        {lead.conversationSnippet && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Conversation Snippet
                            </p>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-700 space-y-2 max-h-48 overflow-y-auto">
                              {lead.conversationSnippet.split("\n").map((line, i) => {
                                const isUserLine = line.startsWith("User:") || line.startsWith("user:");
                                const isBotLine = line.startsWith("Assistant:") || line.startsWith("assistant:") || line.startsWith("Bot:") || line.startsWith("bot:");
                                return (
                                  <p key={i} className={`${isUserLine ? "font-medium text-slate-900" : isBotLine ? "text-indigo-700" : "text-slate-600"}`}>
                                    {line}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleDelete(lead)}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Lead
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filteredLeads.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Showing {filteredLeads.length} of {totalLeads} leads
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
      <p className="text-slate-800 font-medium">{value || "—"}</p>
    </div>
  );
}
