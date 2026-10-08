import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardHomeLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>
          <div className="h-5 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-50 dark:bg-slate-800/50 rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-slate-50 dark:bg-slate-800/30 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-spin" />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-spin" />
        </div>
      </div>
    </div>
  );
}
