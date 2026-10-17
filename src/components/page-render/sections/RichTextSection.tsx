import React from 'react';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
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
  const sanitizedHtml = DOMPurify.sanitize(content.text || '');

  if (variant === 'architecture-about') {
    return <section className="w-full bg-white px-6 py-16 text-[#123b38] sm:px-10 md:px-[10%] md:py-20">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.7fr_1.3fr] md:gap-12">
        <p className="text-[10px] font-semibold uppercase">About us</p>
        <div className="prose prose-sm max-w-none prose-headings:mb-4 prose-headings:text-2xl prose-headings:font-semibold prose-headings:leading-tight prose-headings:tracking-tight prose-p:text-[10px] prose-p:leading-relaxed prose-p:text-neutral-600" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    </section>;
  }

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

  if (variant === 'asymmetric') {
    return (
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-24">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <h2 className="text-3xl md:text-5xl font-serif text-slate-900 dark:text-slate-100 leading-tight">
              Our Story
            </h2>
          </div>
          <div 
            className="w-full md:w-2/3 prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:text-slate-500 dark:prose-p:text-slate-400 prose-p:leading-loose prose-a:text-slate-900 dark:prose-a:text-white hover:prose-a:text-opacity-80"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-6 w-full max-w-3xl mx-auto prose prose-slate dark:prose-invert prose-lg text-slate-700 dark:text-slate-300">
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
      />
    </section>
  );
}
