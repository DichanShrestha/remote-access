import { Brain } from 'lucide-react';

export default function KnowledgeLoading() {
  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="h-9 w-52 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
        <div className="h-5 w-80 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Brain className="w-10 h-10 animate-pulse mb-4" />
            <div className="h-4 w-40 bg-slate-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
