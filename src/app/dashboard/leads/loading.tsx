import { Users, Loader2 } from 'lucide-react';

export default function LeadsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-36 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-5 w-72 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-3"></div>
            <div className="h-8 w-12 bg-slate-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-48 bg-slate-50 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-20 bg-slate-50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
