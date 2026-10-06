"use client"
import type { CSSProperties, ReactNode } from 'react';
import { GroupNode, PageDocument, PageNode } from '@/lib/page-engine/schemas';
import { renderSection } from './sections/AllSections';
import { isGroup } from '@/lib/page-engine/operations';
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
        {sections.map(node => renderNode(node, theme, isPreview, pageId))}
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

function renderNode(node: PageNode, theme: PageDocument['theme'], isPreview?: boolean, pageId?: string): ReactNode {
  if (isGroup(node)) {
    return <LayoutGroup key={node.id} group={node} theme={theme} isPreview={isPreview} pageId={pageId} />;
  }

  if (node.isHidden) return null;
  return (
    <div
      key={node.id}
      id={`preview-section-${node.id}`}
      className="relative group/preview-section scroll-mt-6 min-w-0"
      style={{ backgroundColor: node.backgroundColor, color: node.textColor }}
    >
      {renderSection(node, theme, isPreview, pageId)}
    </div>
  );
}

function LayoutGroup({ group, theme, isPreview, pageId }: { group: GroupNode; theme: PageDocument['theme']; isPreview?: boolean; pageId?: string }) {
  const gap = group.gap === 'custom' ? `${group.customGap}px` : ({ small: '8px', medium: '16px', large: '32px' } as const)[group.gap];
  const padding = group.padding === 'custom' ? `${group.customPadding}px` : ({ small: '8px', medium: '16px', large: '32px' } as const)[group.padding];
  const width = group.width === 'fit' ? 'fit-content' : group.width === 'custom' ? `${group.customWidth}%` : '100%';
  const horizontal = ({ left: 'flex-start', center: 'center', right: 'flex-end', 'space-between': 'space-between' } as const)[group.horizontalAlign];
  const vertical = ({ top: 'flex-start', center: 'center', bottom: 'flex-end' } as const)[group.verticalAlign];

  return (
    <div
      id={`preview-section-${group.id}`}
      className="layout-group relative group/preview-section scroll-mt-6 min-w-0"
      data-direction={group.direction}
      data-mobile-direction={group.mobileDirection}
      style={{
        backgroundColor: group.backgroundColor,
        color: group.textColor,
        width,
        '--layout-gap': gap,
        '--layout-padding': padding,
        '--layout-horizontal': horizontal,
        '--layout-vertical': vertical,
      } as CSSProperties}
    >
      {group.children.map(child => {
        const childIsGroup = isGroup(child);
        const childWidth = childIsGroup ? (child.width === 'custom' ? `${child.customWidth}%` : child.width === 'fit' ? 'fit-content' : '100%') : undefined;
        return <div
          key={child.id}
          className="layout-group__child min-w-0"
          data-layout-child={childIsGroup ? 'group' : 'component'}
          data-child-width={childIsGroup ? child.width : undefined}
          style={childIsGroup ? { '--child-layout-width': childWidth } as CSSProperties : undefined}
        >
          {renderNode(child, theme, isPreview, pageId)}
        </div>
      })}
    </div>
  );
}
