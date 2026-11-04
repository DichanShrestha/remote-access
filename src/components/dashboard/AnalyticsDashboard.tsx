"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  CalendarDays, 
  ThumbsUp,
  TrendingUp,
  MousePointerClick,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

type AnalyticsData = {
  totalConversations: number;
  totalMessages: number;
  satisfaction: { upvotes: number; downvotes: number; percentage: string };
  bookingStats: { opportunities: number; clicks: number };
  leads: any[];
  botLeads: any[];
  topQuestions: { question: string; count: number }[];
};

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const totalLeads = data.leads.length + data.botLeads.length;
  
  const bookingConversion = data.bookingStats.opportunities > 0 
    ? Math.round((data.bookingStats.clicks / data.bookingStats.opportunities) * 100) 
    : 0;

  const maxQuestionCount = data.topQuestions.length > 0 
    ? Math.max(...data.topQuestions.map(q => q.count)) 
    : 1;

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E8E5DF] gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Analytics</h1>
          <p className="text-sm text-[#737373] mt-1">Performance insights for your page and AI assistant.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-white shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-[#565850]">Live</span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          label="Total Leads" 
          value={totalLeads} 
          icon={<Users size={16} strokeWidth={2} />}
          accent="#171717"
        />
        <KpiCard 
          label="AI Conversations" 
          value={data.totalConversations}
          icon={<MessageSquare size={16} strokeWidth={2} />}
          accent="#171717"
        />
        <KpiCard 
          label="Booking Clicks" 
          value={data.bookingStats.clicks}
          icon={<CalendarDays size={16} strokeWidth={2} />}
          accent="#171717"
          detail={`${bookingConversion}% conversion`}
        />
        <KpiCard 
          label="Satisfaction" 
          value={`${data.satisfaction.percentage}%`}
          icon={<ThumbsUp size={16} strokeWidth={2} />}
          accent="#171717"
          detail={`${data.satisfaction.upvotes} upvotes`}
        />
      </div>

      {/* Middle Row: Booking Funnel + Top Questions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Booking Funnel */}
        <section className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#F2EFE9] mb-5">
            <span className="w-7 h-7 rounded-lg bg-[#F2EFE9] flex items-center justify-center text-[#565850]">
              <MousePointerClick size={14} strokeWidth={2} />
            </span>
            <h2 className="text-sm font-semibold text-[#171717]">Booking Funnel</h2>
          </div>
          
          <div className="space-y-4">
            <FunnelRow 
              label="Opportunities Shown" 
              value={data.bookingStats.opportunities} 
              percent={100} 
            />
            <FunnelRow 
              label="Link Clicks" 
              value={data.bookingStats.clicks} 
              percent={bookingConversion} 
            />
          </div>

          <div className="mt-5 flex items-start gap-3 p-3.5 rounded-xl bg-[#FBF9F5] border border-[#F2EFE9]">
            <span className="w-7 h-7 rounded-lg bg-[#E8E5DF] flex items-center justify-center flex-shrink-0 text-[#565850]">
              <TrendingUp size={13} strokeWidth={2.2} />
            </span>
            <div>
              <span className="text-xs font-semibold text-[#171717] block">
                {bookingConversion}% conversion rate
              </span>
              <span className="text-[11px] text-[#737373] leading-relaxed">
                {bookingConversion > 0 
                  ? `${bookingConversion}% of visitors who see the booking link click to schedule.`
                  : 'No booking data yet. Clicks will be tracked once your link is shown.'}
              </span>
            </div>
          </div>
        </section>

        {/* Top AI Questions */}
        <section className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xs p-6 flex flex-col">
          <div className="flex items-center gap-2 pb-4 border-b border-[#F2EFE9] mb-5">
            <span className="w-7 h-7 rounded-lg bg-[#F2EFE9] flex items-center justify-center text-[#565850]">
              <Sparkles size={14} strokeWidth={2} />
            </span>
            <h2 className="text-sm font-semibold text-[#171717]">Top AI Questions</h2>
          </div>

          {data.topQuestions.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center space-y-3">
              {data.topQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-[#F2EFE9] text-[10px] font-bold text-[#565850] flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#171717] truncate">&ldquo;{q.question}&rdquo;</p>
                    <div className="mt-1.5 h-1 rounded-full bg-[#F2EFE9] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-[#171717] transition-all duration-700 ease-out"
                        style={{ width: `${(q.count / maxQuestionCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#8C8D85] flex-shrink-0 tabular-nums">
                    {q.count}×
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <span className="w-10 h-10 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#8C8D85] mb-3">
                <MessageSquare size={18} strokeWidth={1.5} />
              </span>
              <p className="text-xs text-[#8C8D85]">No questions asked yet.</p>
              <p className="text-[11px] text-[#B0AFA7] mt-0.5">Questions from visitors will appear here.</p>
            </div>
          )}
        </section>
      </div>

      {/* Recent Leads Table */}
      <section className="bg-white border border-[#E8E5DF] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F2EFE9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#F2EFE9] flex items-center justify-center text-[#565850]">
              <Users size={14} strokeWidth={2} />
            </span>
            <h2 className="text-sm font-semibold text-[#171717]">Recent Leads</h2>
          </div>
          {totalLeads > 5 && (
            <Link href="/dashboard/leads" className="text-xs font-medium text-[#737373] hover:text-[#171717] transition-colors flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          )}
        </div>

        {totalLeads > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F2EFE9]">
                  <th className="px-6 py-3 text-[10px] font-semibold text-[#8C8D85] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[#8C8D85] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[#8C8D85] uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[#8C8D85] uppercase tracking-wider text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...data.botLeads, ...data.leads]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((lead: any, i: number) => (
                  <tr key={i} className="border-b border-[#F2EFE9] last:border-b-0 hover:bg-[#FBF9F5] transition-colors">
                    <td className="px-6 py-3.5 text-xs font-medium text-[#171717]">
                      {lead.name || "Anonymous"}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="text-xs text-[#565850]">{lead.email || '—'}</div>
                      {lead.phone && <div className="text-[11px] text-[#8C8D85] mt-0.5">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F2EFE9] text-[#565850] border border-[#E8E5DF]">
                        {lead.source || "AI Chat"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-[11px] text-[#8C8D85] tabular-nums">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
            <span className="w-10 h-10 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#8C8D85] mb-3">
              <Users size={18} strokeWidth={1.5} />
            </span>
            <p className="text-xs text-[#8C8D85]">No leads captured yet.</p>
            <p className="text-[11px] text-[#B0AFA7] mt-0.5">Your AI assistant or page forms will collect them here.</p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function KpiCard({ label, value, icon, accent, detail }: { 
  label: string; value: string | number; icon: React.ReactNode; accent: string; detail?: string;
}) {
  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs group hover:border-[#D5D3CB] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="w-8 h-8 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#565850] group-hover:bg-[#E8E5DF] transition-colors">
          {icon}
        </span>
        {detail && (
          <span className="text-[10px] font-medium text-[#8C8D85] bg-[#FBF9F5] px-1.5 py-0.5 rounded">
            {detail}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-[#171717] tabular-nums">{value}</div>
      <div className="text-[11px] font-medium text-[#8C8D85] mt-0.5">{label}</div>
    </div>
  );
}

function FunnelRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-medium text-[#565850]">{label}</span>
        <span className="text-sm font-bold text-[#171717] tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-[#F2EFE9] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#171717] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
    </div>
  );
}
