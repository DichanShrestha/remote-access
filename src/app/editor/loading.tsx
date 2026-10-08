import React from 'react';
import { Loader2 } from 'lucide-react';

export default function EditorLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 animate-in fade-in duration-500">
      
      {/* LEFT COLUMN: Section List Skeleton */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center h-14">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
          <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800/50 rounded-md animate-pulse"></div>
        </div>
        <div className="flex-1 p-3 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 h-16">
          <div className="h-full w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* MIDDLE: Live Preview Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 h-14 z-10">
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-8 w-24 bg-blue-200 dark:bg-blue-900/50 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Preview area Skeleton */}
        <div className="flex-1 overflow-hidden bg-slate-200/50 dark:bg-slate-950 p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-pulse">
            <Loader2 className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-spin" />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Inspector Skeleton */}
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center h-14">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-6">
          <div className="space-y-4">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-2"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
