import React from 'react';
import { z } from 'zod';
import { RichTextSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';

type RichTextProps = {
  section: z.infer<typeof RichTextSectionSchema>;
  theme: ThemeConfig;
};

export function RichTextSection({ section, theme }: RichTextProps) {
  return (
    <section className="py-8 px-6 w-full max-w-3xl mx-auto prose prose-slate dark:prose-invert prose-lg text-slate-700 dark:text-slate-300">
      <div 
        dangerouslySetInnerHTML={{ __html: section.content.text }} 
      />
    </section>
  );
}
