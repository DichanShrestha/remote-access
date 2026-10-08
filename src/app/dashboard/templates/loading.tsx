import React from 'react';

export default function TemplatesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-3"></div>
        <div className="h-5 w-96 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-[480px]">
            <div className="h-64 sm:h-72 bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
            <div className="p-6 flex flex-col flex-1 gap-4">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/50 rounded-md animate-pulse mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
