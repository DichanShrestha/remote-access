"use client"
import { PageDocument, PageSection } from '@/lib/page-engine/schemas';
import { renderSection } from './sections/AllSections';
import { ReactLenis } from 'lenis/react';
import { ChatbotWidget } from '../knowchat/ChatbotWidget';

type PageRendererProps = {
  document: PageDocument;
  isPreview?: boolean;
  pageId?: string;
  botId?: string;
};

export function PageRenderer({ document, isPreview, pageId, botId }: PageRendererProps) {
  const { sections, theme, settings } = document;

  const content = (
    <div className={`@container min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-500`}>
      <main className="flex-1 flex flex-col pb-24 relative">
        {sections.map((section: PageSection) => (
          <div key={section.id} id={`preview-section-${section.id}`} className="relative group/preview-section scroll-mt-6">
            {renderSection(section, theme, isPreview, pageId)}
          </div>
        ))}
      </main>

      {settings.showFooterBranding && (
        <footer className="py-8 text-center text-slate-400 text-sm relative z-10">
          Powered by <a href="#" className="font-semibold hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Smart Pages</a>
        </footer>
      )}

      {!isPreview && botId && <ChatbotWidget botId={botId} />}
    </div>
  );

  if (settings.enableSmoothScrolling && !isPreview) {
    return <ReactLenis root>{content}</ReactLenis>;
  }

  return content;
}
