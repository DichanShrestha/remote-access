import { TEMPLATES_MAP } from './templates';
import { PageDocumentSchema, type PageDocument, type PageNode } from './schemas';
import { applyWebsiteConfig, extractWebsiteConfig } from './site-config';
import { buildTemplatePages, type TemplateStarterPage } from './template-pages';
import { BUSINESS_TEMPLATE_PAGE_BLUEPRINTS } from './business-template-pages';
import { isGroup } from './operations';

const PAGE_HASH_ALIASES: Record<string, Record<string, string>> = {
  restaurant: {
    story: 'about',
    history: 'about',
    menu: 'menu',
    booking: 'reservations',
    reservations: 'reservations',
    contact: 'reservations',
    gallery: 'gallery',
  },
  'corporate-consulting': {
    about: 'about',
    'service-tabs': 'services',
    services: 'services',
    'value-cards': 'services',
    pricing: 'services',
    'financial-planning': 'services',
    'performance-analysis': 'services',
    'investment-advisory': 'services',
    'success-stories': 'gallery',
    news: 'gallery',
    contact: 'contact',
    faq: 'faq',
  },
  'luxury-skincare': {
    top: '',
    about: 'about',
    products: 'products',
    shop: 'products',
    journal: 'journal',
    contact: 'contact',
    faq: 'faq',
  },
  'spa-salon': {
    hero: '',
    about: 'about',
    treatments: 'services',
    services: 'services',
    contact: 'contact',
    gallery: 'gallery',
    faq: 'faq',
  },
  'tattoo-artist': {
    artist: 'about',
    about: 'about',
    process: 'process',
    board: 'gallery',
    gallery: 'gallery',
    contact: 'contact',
    faq: 'faq',
  },
  'tattoo-studio': {
    about: 'about',
    portfolio: 'portfolio',
    process: 'process',
    testimonials: 'testimonials',
    faq: 'faq',
    contact: 'contact',
    book: 'contact',
    booking: 'contact',
  },
};

function normalizeLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isExternalLink(url: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

function previewHref(templateId: string, slug?: string): string {
  return slug
    ? `/template-preview/${encodeURIComponent(templateId)}/${encodeURIComponent(slug)}`
    : `/template-preview?id=${encodeURIComponent(templateId)}`;
}

/**
 * Build the document shown inside the template preview. Business templates
 * get their curated secondary pages; creators keep the existing starter pages.
 * Navigation is rewritten to preview routes so clicking a menu item behaves
 * like a real page change instead of jumping to a homepage anchor.
 */
export function getTemplatePreview(templateId: string, requestedSlug?: string): {
  document: PageDocument;
  page: TemplateStarterPage | null;
  pages: TemplateStarterPage[];
} | null {
  const source = TEMPLATES_MAP[templateId];
  if (!source) return null;

  const { starterPages } = buildTemplatePages(templateId, source);
  const slug = requestedSlug?.trim().toLowerCase();
  const page = slug ? starterPages.find((candidate) => candidate.slug === slug) : null;
  if (slug && !page) return null;

  const base = page
    ? PageDocumentSchema.parse({ ...source, sections: page.sections })
    : source;
  const document = applyWebsiteConfig(base, extractWebsiteConfig(source));

  return {
    document: BUSINESS_TEMPLATE_PAGE_BLUEPRINTS[templateId]
      ? rewritePreviewChrome(document, templateId, starterPages)
      : document,
    page: page || null,
    pages: starterPages,
  };
}

function rewritePreviewChrome(document: PageDocument, templateId: string, pages: TemplateStarterPage[]): PageDocument {
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const byLabel = new Map(pages.map((page) => [normalizeLabel(page.title), page]));
  const aliases = PAGE_HASH_ALIASES[templateId] || {};

  const resolve = (url: string, label?: string): string => {
    if (!url || url === '#' || isExternalLink(url)) return url;

    if (label) {
      const normalized = normalizeLabel(label);
      if (normalized === 'home') return previewHref(templateId);
      const byLabelMatch = byLabel.get(normalized);
      if (byLabelMatch) return previewHref(templateId, byLabelMatch.slug);
    }

    if (url.startsWith('#')) {
      const hash = url.slice(1).toLowerCase();
      if (hash === '' || hash === 'top' || hash === 'hero') return previewHref(templateId);
      const direct = bySlug.get(hash);
      if (direct) return previewHref(templateId, direct.slug);
      const alias = aliases[hash];
      if (alias === '') return previewHref(templateId);
      if (alias && bySlug.has(alias)) return previewHref(templateId, alias);
    }

    return url;
  };

  const updateNodes = (nodes: PageNode[]): PageNode[] => nodes.map((node) => {
    if (isGroup(node)) return { ...node, children: updateNodes(node.children) };

    if (node.type === 'site-navbar') {
      return {
        ...node,
        content: {
          ...node.content,
          links: node.content.links.map((link) => ({ ...link, url: resolve(link.url, link.label) })),
          primaryUrl: node.content.primaryUrl ? resolve(node.content.primaryUrl, node.content.primaryLabel) : node.content.primaryUrl,
          secondaryUrl: node.content.secondaryUrl ? resolve(node.content.secondaryUrl, node.content.secondaryLabel) : node.content.secondaryUrl,
        },
      };
    }

    if (node.type === 'site-footer') {
      return {
        ...node,
        content: {
          ...node.content,
          links: node.content.links.map((link) => ({ ...link, url: resolve(link.url, link.label) })),
          legalLinks: node.content.legalLinks.map((link) => ({ ...link, url: resolve(link.url, link.label) })),
        },
      };
    }

    return node;
  });

  return { ...document, sections: updateNodes(document.sections) };
}
