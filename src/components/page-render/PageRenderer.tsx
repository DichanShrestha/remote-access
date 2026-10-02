"use client"
import { PageDocument, PageSection } from '@/lib/page-engine/schemas';
import { renderSection } from './sections/AllSections';

type PageRendererProps = {
  document: PageDocument;
};

export function PageRenderer({ document }: PageRendererProps) {
  const { sections, theme, settings } = document;

  return (
    <div className={`@container min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-500`}>
      <main className="flex-1 flex flex-col pb-24 relative">
        {sections.map((section: PageSection) => (
          <div key={section.id} id={`preview-section-${section.id}`} className="relative group/preview-section scroll-mt-6">
            {renderSection(section, theme)}
          </div>
        ))}
      </main>

      {settings.showFooterBranding && (
        <footer className="py-8 text-center text-slate-400 text-sm">
          Powered by <a href="#" className="font-semibold hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Smart Pages</a>
        </footer>
      )}
    </div>
  );
}
