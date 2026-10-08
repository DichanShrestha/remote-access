import React from 'react';

export default function BillingLoading() {
  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mx-auto mb-4"></div>
        <div className="h-5 w-72 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse mx-auto"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col h-[500px]">
            <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse mb-6"></div>
            <div className="h-12 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-4"></div>
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/50 rounded-md animate-pulse mb-8"></div>
            
            <div className="space-y-4 flex-1">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                  <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-8"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
