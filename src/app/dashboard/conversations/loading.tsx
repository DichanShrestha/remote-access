import { MessageSquare, Loader2 } from 'lucide-react';

export default function ConversationsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-5rem)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <div className="h-9 w-56 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
        <div className="h-5 w-72 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>

      <div className="flex-1 flex border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-0">
        {/* Sidebar skeleton */}
        <div className="w-80 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 rounded-xl">
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/2 bg-slate-50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-300">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
