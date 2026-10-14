'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Eye,
  Smartphone,
  Monitor,
  ExternalLink,
  X,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';
import { chooseOnboardingTemplate } from '@/app/onboarding/actions';

type Category = 'CREATOR' | 'BUSINESS';
type Template = {
  id: string;
  name: string;
  description: string;
  mood: string;
  category: Category;
};

export function TemplateLibrary({ templates }: { templates: Template[] }) {
  const [filter, setFilter] = useState<'ALL' | Category>('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(
    () => (filter === 'ALL' ? templates : templates.filter((template) => template.category === filter)),
    [filter, templates]
  );

  // Close preview on escape key and manage body overflow
  useEffect(() => {
    if (!previewTemplate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewTemplate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [previewTemplate]);

  const handleUseTemplate = (templateId: string) => {
    setPendingId(templateId);
    startTransition(() => {
      chooseOnboardingTemplate(templateId);
    });
  };

  return (
    <main className="onboard-library premium-library">
      <header className="onboard-top">
        <Link href="/" className="onboard-brand">
          <Image src="/logo.png" alt="Pageory" width={28} height={28} className="rounded-md object-contain" /> Pageory
        </Link>
        <span>
          01 <i /> 02
        </span>
      </header>

      <section className="library-intro">
        <p className="onboard-kicker">A BEAUTIFUL PLACE TO BEGIN</p>
        <h1>
          Choose your <em>starting point.</em>
        </h1>
        <div className="template-filter" role="tablist" aria-label="Filter templates">
          {(['ALL', 'CREATOR', 'BUSINESS'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={filter === value ? 'active' : ''}
              onClick={() => setFilter(value)}
            >
              {value === 'ALL' ? 'All' : value === 'CREATOR' ? 'Creator' : 'Business'}
            </button>
          ))}
        </div>
      </section>

      <div className="onboard-template-grid">
        {visible.map((template, index) => (
          <article key={template.id} className="onboard-template-card">
            {/* Visual thumbnail / preview launcher */}
            <button
              type="button"
              onClick={() => {
                setPreviewTemplate(template);
                setPreviewDevice('mobile');
              }}
              className="onboard-template-visual w-full text-left cursor-pointer border-0 p-0 block relative group"
              aria-label={`Preview ${template.name}`}
            >
              <div className="template-device">
                <iframe
                  src={`/template-preview?id=${template.id}`}
                  title={`${template.name} preview`}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  tabIndex={-1}
                />
              </div>
              <span className="template-seq">
                {template.category === 'CREATOR' ? 'CREATOR' : 'BUSINESS'}
              </span>
              <span className="template-preview-affordance flex items-center gap-1.5 bg-[#292a25]/85 !text-white backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-medium">
                <Eye size={13} /> Preview
              </span>
              <span className={`template-halo halo-${index % 5}`} />
            </button>

            {/* Template Information */}
            <div className="onboard-template-info">
              <div>
                <p>{template.mood}</p>
                <h2>{template.name}</h2>
                <span>{template.description}</span>
              </div>
            </div>

            {/* Actions: Preview & Use Template */}
            <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-[#e7e6df]">
              <button
                type="button"
                onClick={() => {
                  setPreviewTemplate(template);
                  setPreviewDevice('mobile');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-[#f1f0e9] text-[#292a25] border border-[#dcdad0] rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs hover:border-[#c5c3b9]"
              >
                <Eye size={14} className="text-[#64665e]" />
                Preview
              </button>

              <button
                type="button"
                onClick={() => handleUseTemplate(template.id)}
                disabled={pendingId === template.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#292a25] hover:bg-[#3d3f37] text-white border border-[#292a25] rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-wait"
              >
                {pendingId === template.id ? (
                  <>
                    <LoaderCircle size={14} className="spin" />
                    Preparing…
                  </>
                ) : (
                  <>
                    Use template
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Interactive Full Template Preview Modal */}
      {previewTemplate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplate.name} preview`}
          className="fixed inset-0 z-50 bg-[#191a16]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-[#f8f7f2] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#dedcd4]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <header className="h-16 px-5 sm:px-6 bg-[#fdfcf8] border-b border-[#e6e4dc] flex items-center justify-between gap-4 flex-none z-10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-md bg-[#eeeae0] text-[#55574e]">
                  {previewTemplate.category}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-[#292a25] truncate">
                  {previewTemplate.name}
                </h3>
                <span className="hidden md:inline-block text-xs text-[#85867f]">
                  · {previewTemplate.mood}
                </span>
              </div>

              {/* Viewport switcher */}
              <div className="flex items-center gap-1.5 bg-[#eeece4] p-1 rounded-xl border border-[#e0ded6]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${previewDevice === 'mobile'
                    ? 'bg-white text-[#292a25] shadow-xs'
                    : 'text-[#777970] hover:text-[#292a25]'
                    }`}
                  aria-label="Mobile preview"
                >
                  <Smartphone size={14} />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${previewDevice === 'desktop'
                    ? 'bg-white text-[#292a25] shadow-xs'
                    : 'text-[#777970] hover:text-[#292a25]'
                    }`}
                  aria-label="Desktop preview"
                >
                  <Monitor size={14} />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
              </div>

              {/* External link & Close buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`/template-preview?id=${previewTemplate.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1 text-xs text-[#777970] hover:text-[#292a25] px-2.5 py-1.5 rounded-lg border border-[#dedcd4] hover:bg-[#eeece4] transition-colors"
                  title="Open live preview in new window"
                >
                  <ExternalLink size={13} />
                  <span>Full tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-[#777970] hover:text-[#292a25] hover:bg-[#eeece4] rounded-lg transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            {/* Modal Stage Body */}
            <div className="flex-1 bg-[#eae7de] overflow-auto p-4 sm:p-6 flex items-center justify-center relative">
              {previewDevice === 'mobile' ? (
                <div className="relative w-[390px] h-[780px] max-h-full border-[6px] border-[#292a25] rounded-[38px] bg-white overflow-hidden shadow-2xl flex flex-col">
                  {/* Phone Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#292a25] rounded-full z-20 pointer-events-none" />
                  <iframe
                    src={`/template-preview?id=${previewTemplate.id}`}
                    title={`${previewTemplate.name} mobile preview`}
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              ) : (
                <div className="w-full h-full max-w-4xl border border-[#d8d6cd] rounded-xl bg-white overflow-hidden shadow-2xl flex flex-col">
                  {/* Browser Chrome Header */}
                  <div className="h-8 bg-[#f1efe8] border-b border-[#e2e0d8] flex items-center px-3 gap-2 flex-none">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e37f74]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e8be66]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#82c974]" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto h-5 bg-white rounded-md border border-[#dedcd4] flex items-center px-2 text-[10px] text-[#8e8f88] truncate font-mono">
                      pageory.app/preview/{previewTemplate.id}
                    </div>
                  </div>
                  <iframe
                    src={`/template-preview?id=${previewTemplate.id}`}
                    title={`${previewTemplate.name} desktop preview`}
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <footer className="h-18 px-5 sm:px-6 bg-[#fdfcf8] border-t border-[#e6e4dc] flex items-center justify-between gap-4 flex-none">
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#777970] max-w-md">
                <Sparkles size={14} className="text-[#a48866] shrink-0" />
                <span className="truncate">{previewTemplate.description}</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-medium text-[#777970] hover:text-[#292a25] hover:bg-[#eeece4] rounded-xl transition-colors cursor-pointer"
                >
                  Back to templates
                </button>

                <button
                  type="button"
                  onClick={() => handleUseTemplate(previewTemplate.id)}
                  disabled={pendingId === previewTemplate.id}
                  className="px-5 py-2.5 bg-[#292a25] hover:bg-[#3d3f37] text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-wait"
                >
                  {pendingId === previewTemplate.id ? (
                    <>
                      <LoaderCircle size={14} className="spin" />
                      Setting up your page…
                    </>
                  ) : (
                    <>
                      Use this template
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
