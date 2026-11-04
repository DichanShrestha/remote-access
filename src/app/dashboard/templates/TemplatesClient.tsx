'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowRight, Loader2, Check, AlertTriangle, X } from 'lucide-react';
import { applyTemplateToPage } from '@/app/actions/template-actions';
import { toast } from 'sonner';

type TemplateProps = {
  id: string;
  name: string;
  description: string;
  mood: string;
  category: string;
};

type CategoryFilter = 'all' | 'creators' | 'business';

type TemplatesClientProps = {
  templates: TemplateProps[];
  currentTemplateId: string | null;
  currentTemplateName: string | null;
  compatibleCategory: string;
  managedPageCount: number;
};

export function TemplatesClient({
  templates,
  currentTemplateId,
  currentTemplateName,
  compatibleCategory,
  managedPageCount,
}: TemplatesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryFilter>(
    compatibleCategory?.toUpperCase() === 'CREATOR' ? 'creators' : 'business',
  );
  const [confirmation, setConfirmation] = useState<TemplateProps | null>(null);
  const [error, setError] = useState<string | null>(null);

  const creatorCount = templates.filter(t => t.category?.toUpperCase() === 'CREATOR').length;
  const businessCount = templates.filter(t => t.category?.toUpperCase() === 'BUSINESS').length;

  const tabs: { id: CategoryFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: templates.length },
    { id: 'creators', label: 'Creators', count: creatorCount },
    { id: 'business', label: 'Business', count: businessCount },
  ];

  const filteredTemplates = templates.filter((template) => {
    if (activeTab === 'creators') return template.category?.toUpperCase() === 'CREATOR';
    if (activeTab === 'business') return template.category?.toUpperCase() === 'BUSINESS';
    return true;
  });

  const closeConfirmation = () => {
    if (isPending) return;
    setConfirmation(null);
    setError(null);
  };

  const handleConfirm = () => {
    if (!confirmation) return;
    setActiveTemplate(confirmation.id);
    setError(null);
    startTransition(async () => {
      try {
        toast.loading('Updating your whole website…', { id: 'apply-template' });
        const result = await applyTemplateToPage(confirmation.id);
        if (!result.ok) {
          setError(result.error);
          toast.error(result.error, { id: 'apply-template' });
          setActiveTemplate(null);
          return;
        }
        toast.success(
          `Template applied — ${result.updatedPages} page${result.updatedPages === 1 ? '' : 's'} redesigned${result.createdPages ? `, ${result.createdPages} new page${result.createdPages === 1 ? '' : 's'} added` : ''}.`,
          { id: 'apply-template' },
        );
        setConfirmation(null);
        setActiveTemplate(null);
        router.refresh();
      } catch (e) {
        console.error(e);
        setError('Failed to apply template. Please try again.');
        toast.error('Failed to apply template. Please try again.', { id: 'apply-template' });
        setActiveTemplate(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      {currentTemplateName ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-[#E8E7E1] bg-[#FDFCF8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#96978F]">Current design</p>
            <p className="mt-1 text-sm font-semibold text-[#292A25]">{currentTemplateName}</p>
          </div>
          <p className="text-xs text-[#777970]">
            {managedPageCount} template-managed page{managedPageCount === 1 ? '' : 's'} currently share this design.
          </p>
        </div>
      ) : null}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E7E1] pb-4">
        <div className="inline-flex p-1 bg-[#F1EFEA] border border-[#E3E0D8] rounded-xl gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#292A25] shadow-xs'
                    : 'text-[#777970] hover:text-[#292A25] hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-[#EAE8E1] text-[#292A25]'
                      : 'bg-black/5 text-[#85867E]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl p-8">
          <p className="text-[#85867F] text-sm">No templates found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, index) => {
            const isCurrent = template.id === currentTemplateId;
            const isCompatible = template.category?.toUpperCase() === compatibleCategory?.toUpperCase();
            const isApplying = isPending && activeTemplate === template.id;

            return (
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

                  {isCurrent ? (
                    <div className="absolute z-20 left-4 top-10 flex items-center gap-1.5 rounded-full bg-[#292A25] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      <Check size={11} /> Current design
                    </div>
                  ) : null}
                  
                  {/* Preview Hover Affordance */}
                  <Link
                    href={`/template-preview?id=${template.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute z-20 right-4 top-4 flex items-center gap-1.5 text-xs text-[#4C4E47] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-sm"
                  >
                    Preview <ArrowUpRight size={12} />
                  </Link>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[10px] tracking-widest text-[#96978F] uppercase font-semibold mb-2">{template.mood}</p>
                  <h2 className="text-xl font-bold text-[#292A25] tracking-tight mb-2">{template.name}</h2>
                  <p className="text-[#85867F] text-xs leading-relaxed mb-6 flex-1">{template.description}</p>
                  
                  <button 
                    type="button"
                    onClick={() => { setError(null); setConfirmation(template); }}
                    disabled={isPending || isCurrent || !isCompatible}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F3F2EA] hover:bg-[#E8E7E1] text-[#292A25] font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-[#E8E7E1]"
                  >
                    {isApplying ? (
                      <><Loader2 size={14} className="animate-spin" /> Applying to website…</>
                    ) : isCurrent ? (
                      <><Check size={14} /> Current design</>
                    ) : !isCompatible ? (
                      <><AlertTriangle size={14} /> Not available for this website</>
                    ) : (
                      <>Use this template <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {confirmation ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#292A25]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-switch-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E8E7E1] bg-[#FDFCF8] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E8E7E1] px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#96978F]">Whole website switch</p>
                <h2 id="template-switch-title" className="mt-1 font-serif text-2xl text-[#292A25]">
                  Switch to {confirmation.name}?
                </h2>
              </div>
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={isPending}
                className="rounded-lg p-2 text-[#96978F] transition-colors hover:bg-[#F1EFEA] hover:text-[#292A25] disabled:opacity-50"
                aria-label="Cancel template switch"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5 text-sm text-[#4C4E47]">
              <p>
                <strong className="text-[#292A25]">Every template-managed page will be redesigned.</strong>{' '}
                The homepage and all default pages — About, Services, Contact, FAQ, Gallery, Portfolio,
                Menu and other pages that exist in this template — will receive its layouts, sections,
                components, variants and styling.
              </p>
              <p>
                Your business name, logo, uploaded images, text, services and products, page URLs,
                SEO settings, blog posts and customer-created custom pages are kept.
              </p>
              <p className="rounded-xl border border-[#E3E0D8] bg-[#F5F3EC] px-4 py-3 text-xs leading-relaxed text-[#6E7068]">
                A recoverable snapshot is saved first. If anything fails, your previous website
                configuration is restored automatically. Pages that only exist in your current design
                and have no equivalent in the new template keep their current content.
              </p>
              {error ? (
                <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#E8E7E1] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={isPending}
                className="rounded-xl border border-[#E8E7E1] px-4 py-2.5 text-xs font-semibold text-[#4C4E47] transition-colors hover:bg-[#F1EFEA] disabled:opacity-50"
              >
                Keep current design
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#292A25] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B3D36] disabled:opacity-60"
              >
                {isPending ? <><Loader2 size={14} className="animate-spin" /> Switching website…</> : <>Switch website design <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
