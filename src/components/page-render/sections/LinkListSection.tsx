import React from 'react';
import { z } from 'zod';
import { LinkListSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { ExternalLink } from 'lucide-react';

type LinkListProps = {
  section: z.infer<typeof LinkListSectionSchema>;
  theme: ThemeConfig;
};

export function LinkListSection({ section, theme }: LinkListProps) {
  const { content } = section;

  if (section.variant === 'navigation') {
    return (
      <nav aria-label="Main navigation" className="w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-current">
        {content.links.map(link => (
          <a key={link.id} href={link.url} className="transition-opacity hover:opacity-60">{link.label}</a>
        ))}
      </nav>
    );
  }

  if (section.variant === 'tabs') {
    return (
      <nav aria-label="Section navigation" className="w-full border-y border-slate-200/80 dark:border-slate-700">
        <div className="mx-auto flex max-w-6xl items-stretch justify-between gap-2 overflow-x-auto px-4">
          {content.links.map(link => {
            const isActive = Boolean(link.isActive);
            return (
              <a
                key={link.id}
                href={link.url}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-12 shrink-0 items-center gap-2 px-4 text-[11px] font-medium transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {link.label}
                {link.badge && <span className="rounded-sm bg-emerald-50 px-1 py-0.5 text-[8px] font-bold uppercase text-emerald-800">{link.badge}</span>}
                {isActive && <span className="absolute inset-x-3 bottom-0 h-px" style={{ backgroundColor: theme.primaryColor }} />}
              </a>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <section className="py-8 px-6 w-full max-w-2xl mx-auto flex flex-col gap-4">
      {content.links.map((link, i) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-transparent"
          style={{
            borderRadius: theme.radius === 'full' ? '9999px' : theme.radius === 'none' ? '0' : theme.radius === 'large' ? '1rem' : '0.5rem',
          }}
        >
          {/* Hover highlight background */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            style={{ backgroundColor: theme.primaryColor }}
          />
          
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-100 relative z-10 group-hover:translate-x-1 transition-transform duration-300">
            {link.label}
          </span>
          
          <ExternalLink 
            className="w-5 h-5 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white relative z-10 transition-colors" 
          />
        </a>
      ))}
    </section>
  );
}
