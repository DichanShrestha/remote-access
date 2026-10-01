import React from 'react';
import { z } from 'zod';
import { RichTextSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import SplitText from '@/components/SplitText';
import BlurText from '@/components/BlurText';
import ShinyText from '@/components/ShinyText';
import TextType from '@/components/TextType';

type RichTextProps = {
  section: z.infer<typeof RichTextSectionSchema>;
  theme: ThemeConfig;
};

// Quick helper to strip HTML tags for pure text effects
const stripHtml = (html: string) => {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, '');
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export function RichTextSection({ section, theme }: RichTextProps) {
  const { variant = 'default', content } = section;
  const rawText = stripHtml(content.text);

  if (variant === 'split') {
    return (
      <section className="py-8 px-6 w-full max-w-3xl mx-auto text-xl md:text-3xl font-bold text-center">
        {/* @ts-ignore - React Bits component missing optional props in TS definition */}
        <SplitText text={rawText} className="text-slate-900 dark:text-white" delay={40} />
      </section>
    );
  }
  
  if (variant === 'blur') {
    return (
      <section className="py-8 px-6 w-full max-w-3xl mx-auto text-xl md:text-3xl font-bold text-center">
        {/* @ts-ignore */}
        <BlurText text={rawText} className="text-slate-900 dark:text-white" delay={40} />
      </section>
    );
  }

  if (variant === 'shiny') {
    return (
      <section className="py-8 px-6 w-full max-w-3xl mx-auto text-xl md:text-3xl font-bold text-center">
        {/* @ts-ignore */}
        <ShinyText text={rawText} speed={2} className="text-slate-900 dark:text-white" />
      </section>
    );
  }

  if (variant === 'typewriter') {
    return (
      <section className="py-8 px-6 w-full max-w-3xl mx-auto text-xl md:text-2xl font-mono text-center">
        {/* @ts-ignore */}
        <TextType text={rawText} speed={50} className="text-slate-900 dark:text-white" />
      </section>
    );
  }

  return (
    <section className="py-8 px-6 w-full max-w-3xl mx-auto prose prose-slate dark:prose-invert prose-lg text-slate-700 dark:text-slate-300">
      <div 
        dangerouslySetInnerHTML={{ __html: content.text }} 
      />
    </section>
  );
}
