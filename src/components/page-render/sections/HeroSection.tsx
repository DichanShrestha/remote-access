import React from 'react';
import { z } from 'zod';
import { HeroSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import Aurora from '@/components/Aurora';
import DarkVeil from '@/components/DarkVeil';

type HeroProps = {
  section: z.infer<typeof HeroSectionSchema>;
  theme: ThemeConfig;
};

export function HeroSection({ section, theme }: HeroProps) {
  const { content, layout, variant = 'default' } = section;
  
  if (variant === 'profile-card') {
    return (
      <section className="py-16 md:py-24 px-6 md:px-12 w-full max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
        {/* @ts-ignore - React Bits component, optional props are fine */}
        <ProfileCard
          name={content.title || 'Welcome'}
          title={content.subtitle || ''}
          contactText={content.buttonText || 'Contact'}
          avatarUrl={content.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
        />
      </section>
    );
  }

  const layoutClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
    split: 'text-left items-start md:w-1/2',
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 w-full max-w-5xl mx-auto flex flex-col justify-center min-h-[40vh] relative group overflow-hidden">
      {variant === 'aurora' && (
        <div className="absolute inset-0 z-0">
          {/* @ts-ignore */}
          <Aurora
            colorStops={[theme.primaryColor || '#3b82f6', '#8B5CF6', '#000000']}
            speed={0.5}
            amplitude={1.2}
          />
        </div>
      )}
      
      {variant === 'dark-veil' && (
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>
      )}

      {/* Decorative gradient blur based on primaryColor */}
      {variant === 'default' && (
        <div 
          className="absolute inset-0 opacity-10 blur-3xl pointer-events-none transition-opacity duration-700 group-hover:opacity-20 z-0"
          style={{ backgroundColor: theme.primaryColor }}
        />
      )}
      
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
