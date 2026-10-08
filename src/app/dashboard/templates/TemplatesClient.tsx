'use client';

import React, { useState, useTransition } from 'react';
import { ArrowUpRight, ArrowRight, Loader2, Check } from 'lucide-react';
import { applyTemplateToPage } from '@/app/actions/template-actions';
import { toast } from 'sonner';

type TemplateProps = {
  id: string;
  name: string;
  description: string;
  mood: string;
  category: string;
};

export function TemplatesClient({ templates }: { templates: TemplateProps[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const handleUseTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    startTransition(async () => {
      try {
        toast.loading("Applying template...", { id: 'apply-template' });
        await applyTemplateToPage(templateId);
        toast.success("Template applied successfully!", { id: 'apply-template' });
      } catch (e) {
        console.error(e);
        toast.error('Failed to apply template. Please try again.', { id: 'apply-template' });
        setActiveTemplate(null);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {templates.map((template, index) => (
        <article key={template.id} className="flex flex-col bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="h-64 sm:h-72 bg-[#EEEAE2] relative overflow-hidden flex items-end justify-center group">
            {/* Decorative background halo */}
            <div className={`absolute w-64 h-64 rounded-full top-10 left-1/2 -translate-x-1/2 transition-transform duration-700 group-hover:scale-110 
              ${index % 3 === 0 ? 'bg-[radial-gradient(circle,#D4D9CE_0,rgba(212,217,206,0.42)_40%,transparent_72%)]' : 
                index % 3 === 1 ? 'bg-[radial-gradient(circle,#DED1C4_0,rgba(222,209,196,0.42)_40%,transparent_72%)]' :
                'bg-[radial-gradient(circle,#D4D9DF_0,rgba(212,217,223,0.42)_40%,transparent_72%)]'}`} 
            />
            
            {/* Phone mockup */}
            <div className="relative z-10 w-[180px] h-[280px] border-4 border-[#292A26] border-b-0 rounded-t-3xl bg-white overflow-hidden shadow-xl transform translate-y-8 transition-transform duration-500 group-hover:translate-y-4">
              <iframe 
                src={`/template-preview?id=${template.id}`} 
                className="border-0 w-[390px] h-[844px] origin-top-left"
                style={{ transform: 'scale(0.44)' }}
                loading={index < 3 ? 'eager' : 'lazy'}
                tabIndex={-1}
              />
            </div>

            {/* Category tag */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-[10px] tracking-widest text-[#85867E] uppercase font-semibold">
              <span className="w-1.5 h-1.5 bg-[#B59A7D] rounded-full" />
              {template.category}
            </div>
            
            {/* Preview Hover Affordance */}
            <a 
              href={`/template-preview?id=${template.id}`} 
              target="_blank" 
              rel="noreferrer"
              className="absolute z-20 right-4 top-4 flex items-center gap-1.5 text-xs text-[#4C4E47] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-sm"
            >
              Preview <ArrowUpRight size={12} />
            </a>
          </div>
          
          <div className="p-6 flex flex-col flex-1">
            <p className="text-[10px] tracking-widest text-[#96978F] uppercase font-semibold mb-2">{template.mood}</p>
            <h2 className="text-xl font-bold text-[#292A25] tracking-tight mb-2">{template.name}</h2>
            <p className="text-[#85867F] text-xs leading-relaxed mb-6 flex-1">{template.description}</p>
            
            <button 
              onClick={() => handleUseTemplate(template.id)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F3F2EA] hover:bg-[#E8E7E1] text-[#292A25] font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-[#E8E7E1]"
            >
              {isPending && activeTemplate === template.id ? (
                <><Loader2 size={14} className="animate-spin" /> Applying Template...</>
              ) : (
                <>Use this template <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
