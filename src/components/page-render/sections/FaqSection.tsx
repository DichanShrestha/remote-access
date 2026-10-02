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
