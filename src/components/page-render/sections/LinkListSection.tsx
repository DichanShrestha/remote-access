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
