import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="h-5 w-24 bg-slate-100 rounded-md animate-pulse mb-4"></div>
            <div className="h-10 w-16 bg-slate-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-slate-50 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[300px] flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    </div>
  );
}
