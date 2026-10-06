"use client";

import React, { useMemo } from 'react';
import { 
  Users, 
  MessageSquare, 
  CalendarDays, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  Activity,
  MousePointerClick
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
  
  // Calculate booking conversion rate
  const bookingConversion = data.bookingStats.opportunities > 0 
    ? Math.round((data.bookingStats.clicks / data.bookingStats.opportunities) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Analytics Overview</h1>
          <p className="text-slate-500">Insights into your page and AI assistant performance.</p>
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          Live Metrics
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard 
          title="Total Leads" 
          value={totalLeads} 
          icon={<Users className="w-5 h-5 text-blue-600" />}
          trend="+12% this week"
          color="bg-blue-50"
        />
        <MetricCard 
          title="AI Conversations" 
          value={data.totalConversations} 
          icon={<MessageSquare className="w-5 h-5 text-indigo-600" />}
          trend="Active engagement"
          color="bg-indigo-50"
        />
        <MetricCard 
          title="Booking Clicks" 
          value={data.bookingStats.clicks} 
          icon={<CalendarDays className="w-5 h-5 text-emerald-600" />}
          trend={`${bookingConversion}% conversion`}
          color="bg-emerald-50"
        />
        <MetricCard 
          title="Satisfaction" 
          value={`${data.satisfaction.percentage}%`} 
          icon={<ThumbsUp className="w-5 h-5 text-orange-600" />}
          trend={`${data.satisfaction.upvotes} positive ratings`}
          color="bg-orange-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Booking Funnel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-slate-400" />
            Booking Funnel
          </h3>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Opportunities Shown</span>
                <span className="font-bold">{data.bookingStats.opportunities}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-full rounded-full"></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Link Clicks</span>
                <span className="font-bold">{data.bookingStats.clicks}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${bookingConversion}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-emerald-700 text-sm flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block">Conversion Rate: {bookingConversion}%</span>
                <span className="opacity-90">Of users who see the booking link, {bookingConversion}% click to schedule.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Questions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            Top AI Questions
          </h3>
          {data.topQuestions.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center gap-4">
              {data.topQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-medium text-slate-700 truncate">
                    "{q.question}"
                  </div>
                  <div className="text-sm font-bold text-slate-400 shrink-0">
                    {q.count} times
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>No questions asked yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Recent Leads
          </h3>
        </div>
        <div className="overflow-x-auto">
          {totalLeads > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Interleave or show top botLeads & leads */}
                {[...data.botLeads, ...data.leads]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((lead: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {lead.name || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div>{lead.email || '-'}</div>
                      <div className="text-xs">{lead.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {lead.source || "AI Chat"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="p-10 flex flex-col items-center justify-center text-slate-400 text-sm">
                <Users className="w-10 h-10 mb-3 opacity-20" />
                No leads captured yet. Your AI assistant or page forms will collect them here.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, color }: { title: string, value: string | number, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{value}</div>
        <div className="text-sm font-medium text-slate-500 mb-3">{title}</div>
        <div className="text-xs font-medium text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded-md">
          {trend}
        </div>
      </div>
    </div>
  );
}
