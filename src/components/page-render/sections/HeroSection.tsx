import React from 'react';
import { z } from 'zod';
import { HeroSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type HeroProps = {
  section: z.infer<typeof HeroSectionSchema>;
  theme: ThemeConfig;
};

export function HeroSection({ section, theme }: HeroProps) {
  const { content, layout } = section;
  
  const layoutClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
    split: 'text-left items-start md:w-1/2',
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 w-full max-w-5xl mx-auto flex flex-col justify-center min-h-[40vh] relative group overflow-hidden">
      {/* Decorative gradient blur based on primaryColor */}
      <div 
        className="absolute inset-0 opacity-10 blur-3xl pointer-events-none transition-opacity duration-700 group-hover:opacity-20"
        style={{ backgroundColor: theme.primaryColor }}
      />
      
      <div className={cn("flex flex-col gap-6 relative z-10", layoutClasses[layout])}>
        <h1 
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          style={{ letterSpacing: theme.style === 'bold' ? '-0.05em' : 'normal' }}
        >
          {content.title}
        </h1>
        
        {content.subtitle && (
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
            {content.subtitle}
          </p>
        )}
        
        {content.buttonText && (
          <a
            href={content.buttonUrl || '#'}
            className="mt-4 inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50"
            style={{ 
              backgroundColor: theme.primaryColor,
              borderRadius: theme.radius === 'full' ? '9999px' : theme.radius === 'none' ? '0' : theme.radius === 'large' ? '1rem' : '0.5rem',
              boxShadow: `0 10px 25px -5px ${theme.primaryColor}66`
            }}
          >
            {content.buttonText}
            <ArrowRight className="w-5 h-5" />
          </a>
        )}
      </div>
    </section>
  );
}
