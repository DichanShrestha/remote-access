"use client"
import React, { useState } from 'react';
import { z } from 'zod';
import { FaqSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqProps = {
  section: z.infer<typeof FaqSectionSchema>;
  theme: ThemeConfig;
};

export function FaqSection({ section, theme }: FaqProps) {
  const { content } = section;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const variant = section.variant || 'default';

  if (variant === 'compact-grid') {
    return <section className="w-full px-6 py-20 text-[#e9e7dc] sm:px-10 md:px-[8%] md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-end justify-between gap-3 sm:mb-8"><h2 className="max-w-[9ch] font-serif text-[clamp(1.7rem,6vw,4rem)] leading-[0.84] tracking-[-0.05em]">{content.title}</h2>{(content.subtitle || content.description) && <p className="max-w-[12rem] text-[7px] leading-[1.35] text-white/55 sm:text-xs">{content.subtitle || content.description}</p>}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-5 sm:gap-y-3">{content.items.map((item, index) => <div key={item.id} className="overflow-hidden rounded-full border border-white/15">
          <button className="flex min-h-8 w-full items-center justify-between gap-1.5 px-2.5 py-1.5 text-left text-[6px] leading-tight text-[#e9e7dc] sm:min-h-10 sm:gap-4 sm:px-4 sm:py-2.5 sm:text-[11px]" onClick={() => setOpenIndex(openIndex === index ? null : index)}><span>{item.question}</span><span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/20 text-[9px] sm:h-5 sm:w-5 sm:text-xs">{openIndex === index ? '−' : '+'}</span></button>
          {openIndex === index && <p className="px-3 pb-3 text-[7px] leading-relaxed text-white/60 sm:px-4 sm:text-[11px]">{item.answer}</p>}
        </div>)}</div>
      </div>
    </section>;
  }

  if (variant === 'spacious') {
    return (
      <section className="py-32 px-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-16 md:gap-24">
          <div className="w-full md:w-1/3 flex-shrink-0">
            {content.title && (
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-white leading-tight sticky top-24">
                {content.title}
              </h2>
            )}
          </div>
          <div className="w-full md:w-2/3 flex flex-col gap-8">
            {content.items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.id} className="border-b border-slate-200 dark:border-slate-800 pb-8 group">
                  <button
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="text-xl font-serif text-slate-800 dark:text-slate-100 group-hover:text-slate-600 transition-colors pr-8">{item.question}</span>
                    <ChevronDown
                      className={cn("w-5 h-5 text-slate-400 transition-transform duration-500", isOpen && "rotate-180")}
                    />
                  </button>
                  <div
                    className={cn("text-slate-500 dark:text-slate-400 text-base leading-loose transition-all duration-500 overflow-hidden", isOpen ? "mt-6 max-h-96 opacity-100" : "max-h-0 opacity-0")}
                  >
                    {item.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'salon-pill') {
    return (
      <section className="py-16 md:py-24 px-6 w-full max-w-4xl mx-auto text-current">
        <div className="text-center mb-12">
          {content.title && (
            <h2 className="text-3xl md:text-5xl font-serif font-normal text-current tracking-tight mb-3">
              {content.title}
            </h2>
          )}
          {(content.subtitle || content.description) && (
            <p className="text-sm md:text-base text-current/70 max-w-lg mx-auto font-sans leading-relaxed">
              {content.subtitle || content.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id}
                className={cn(
                  "border border-[#c5a880]/30 bg-white/70 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 shadow-sm overflow-hidden",
                  isOpen ? "rounded-3xl bg-white/90" : "rounded-full hover:border-[#c5a880]/60"
                )}
              >
                <button
                  className="w-full flex items-center justify-between px-7 py-4 text-left focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-sm md:text-base font-serif font-medium text-current pr-6">
                    {item.question}
                  </span>
                  <span className="text-xl font-light text-current/70 flex-shrink-0 transition-transform duration-300">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-7 pb-6 pt-1 text-sm text-current/75 font-sans leading-relaxed border-t border-black/5 dark:border-white/5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 w-full max-w-3xl mx-auto">
      {content.title && (
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          {content.title}
        </h2>
      )}

      <div className="flex flex-col gap-4">
        {content.items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 shadow-sm"
              style={{
                borderRadius: theme.radius === 'full' ? '2rem' : theme.radius === 'none' ? '0' : theme.radius === 'large' ? '1rem' : '0.5rem',
              }}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="text-lg font-medium text-slate-800 dark:text-slate-100">{item.question}</span>
                <ChevronDown
                  className={cn("w-5 h-5 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")}
                  style={{ color: isOpen ? theme.primaryColor : undefined }}
                />
              </button>
              <div
                className={cn("px-6 pb-6 text-slate-600 dark:text-slate-300 text-base leading-relaxed transition-all duration-300 origin-top", isOpen ? "block opacity-100" : "hidden opacity-0")}
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
