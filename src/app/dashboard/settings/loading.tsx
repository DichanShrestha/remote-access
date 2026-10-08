import React from 'react';

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>
        <div className="h-5 w-72 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Navigation Sidebar Skeleton */}
        <div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 space-y-12">
          <div className="space-y-6">
            <div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/50 rounded-md animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div>
                  <div className="h-12 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-4">
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
