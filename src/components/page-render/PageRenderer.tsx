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
    <div id="top" className={`@container min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-500`}>
      <main className="flex-1 flex flex-col relative">
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

function renderNode(node: PageNode, theme: PageDocument['theme'], isPreview?: boolean, pageId?: string, isNested = false): ReactNode {
  if (isGroup(node)) {
    return <LayoutGroup key={node.id} group={node} theme={theme} isPreview={isPreview} pageId={pageId} isNested={isNested} />;
  }

  if (node.isHidden) return null;
  const sectionTheme = node.buttonColor ? { ...theme, primaryColor: node.buttonColor } : theme;
  const padding = node.sectionPadding === 'custom'
    ? `${node.customSectionPadding ?? 32}px`
    : ({ none: '0px', small: '16px', medium: '32px', large: '64px' } as const)[node.sectionPadding as 'none' | 'small' | 'medium' | 'large'] || undefined;
  const contentWidth = ({ narrow: '48rem', standard: '64rem', wide: '80rem', full: '100%' } as const)[node.contentWidth as 'narrow' | 'standard' | 'wide' | 'full'] || undefined;
  return (
    <div
      key={node.id}
      id={`preview-section-${node.id}`}
      className="page-component-frame relative group/preview-section scroll-mt-6 min-w-0"
      data-page-anchor={node.id}
      data-full-screen-hero={node.type === 'hero' && node.variant === 'split-wide' ? 'true' : undefined}
      data-custom-background-color={node.backgroundColor ? 'custom' : undefined}
      data-section-padding={node.sectionPadding}
      data-content-width={node.contentWidth}
      data-custom-text-color={node.textColor ? 'custom' : undefined}
      data-button-text-color={node.buttonTextColor ? 'custom' : undefined}
      style={{
        backgroundColor: node.backgroundColor,
        color: node.textColor,
        '--section-text-color': node.textColor,
        '--section-padding': padding,
        '--section-content-width': contentWidth,
        '--section-button-text': node.buttonTextColor,
      } as CSSProperties}
    >
      <span id={node.id} className="pointer-events-none absolute -top-20" aria-hidden="true" />
      {renderSection(node, sectionTheme, isPreview, pageId)}
    </div>
  );
}

function LayoutGroup({ group, theme, isPreview, pageId, isNested }: { group: GroupNode; theme: PageDocument['theme']; isPreview?: boolean; pageId?: string; isNested?: boolean }) {
  const gap = group.gap === 'custom' ? `${group.customGap}px` : ({ small: '8px', medium: '16px', large: '32px' } as const)[group.gap];
  const padding = group.padding === 'custom' ? `${group.customPadding}px` : ({ small: '8px', medium: '16px', large: '32px' } as const)[group.padding];
  const width = group.width === 'fit' ? 'fit-content' : group.width === 'custom' ? `${group.customWidth}%` : '100%';
  const horizontal = ({ left: 'flex-start', center: 'center', right: 'flex-end', 'space-between': 'space-between' } as const)[group.horizontalAlign];
  const vertical = ({ top: 'flex-start', center: 'center', bottom: 'flex-end' } as const)[group.verticalAlign];

  return (
    <div
      id={`preview-section-${group.id}`}
      className="layout-group relative group/preview-section scroll-mt-6 min-w-0"
      data-page-anchor={group.id}
      data-custom-background-color={group.backgroundColor ? 'custom' : undefined}
      data-direction={group.direction}
      data-mobile-direction={group.mobileDirection}
      data-custom-text-color={group.textColor ? 'custom' : undefined}
      style={{
        backgroundColor: group.backgroundColor,
        color: group.textColor,
        '--section-text-color': group.textColor,
        width: isNested ? '100%' : width,
        '--layout-gap': gap,
        '--layout-padding': padding,
        '--layout-horizontal': horizontal,
        '--layout-vertical': vertical,
      } as CSSProperties}
    >
      <span id={group.id} className="pointer-events-none absolute -top-20" aria-hidden="true" />
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
          {renderNode(child, theme, isPreview, pageId, true)}
        </div>
      })}
    </div>
  );
}
