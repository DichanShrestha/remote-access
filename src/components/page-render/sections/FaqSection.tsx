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
