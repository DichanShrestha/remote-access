import React from 'react';
import { z } from 'zod';
import { AiChatSectionSchema, ThemeConfig } from '@/lib/page-engine/schemas';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiChatProps = {
  section: z.infer<typeof AiChatSectionSchema>;
  theme: ThemeConfig;
};

export function AiChatSection({ section, theme }: AiChatProps) {
  const { content, layout } = section;

  if (layout === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
        {content.greeting && (
          <div 
            className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-4 shadow-xl max-w-[250px] text-sm relative"
            style={{ borderRadius: theme.radius === 'full' ? '1rem' : '0.5rem' }}
          >
            {content.greeting}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 transform rotate-45" />
          </div>
        )}
        <button 
          className="w-14 h-14 flex items-center justify-center rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50"
          style={{ backgroundColor: theme.primaryColor, color: 'white' }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // Inline layout
  return (
    <section className="py-12 px-6 w-full max-w-2xl mx-auto">
      <div 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg p-6 md:p-8 flex flex-col items-center text-center gap-4"
        style={{ borderRadius: theme.radius === 'full' ? '2rem' : theme.radius === 'none' ? '0' : theme.radius === 'large' ? '1rem' : '0.5rem' }}
      >
        <div 
          className="w-16 h-16 flex items-center justify-center rounded-full mb-2"
          style={{ backgroundColor: `${theme.primaryColor}22`, color: theme.primaryColor }}
        >
          <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Need Help?</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-2">
          {content.greeting || "Chat with my AI assistant to get quick answers."}
        </p>
        <button 
          className="px-8 py-3 font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none"
          style={{ 
            backgroundColor: theme.primaryColor,
            borderRadius: theme.radius === 'full' ? '9999px' : '0.5rem'
          }}
        >
          Start Chat
        </button>
      </div>
    </section>
  );
}
