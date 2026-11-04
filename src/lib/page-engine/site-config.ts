import { z } from 'zod';
import {
  PageDocument,
  PageNode,
  PageSection,
  PageSettingsSchema,
  SiteFooterSectionSchema,
  SiteNavbarSectionSchema,
  ThemeConfigSchema,
} from './schemas';
import { isGroup } from './operations';
import { MANAGED_NAVIGATION_PREFIX } from './page-types';

export const WebsiteSettingsSchema = z.object({
  showFooterBranding: z.boolean().default(true),
  enableSmoothScrolling: z.boolean().default(false),
});

export const WebsiteConfigSchema = z.object({
  version: z.number().default(1),
  theme: ThemeConfigSchema,
  settings: WebsiteSettingsSchema.default({ showFooterBranding: true, enableSmoothScrolling: false }),
  header: SiteNavbarSectionSchema.nullable().default(null),
  footer: SiteFooterSectionSchema.nullable().default(null),
});

export type WebsiteConfig = z.infer<typeof WebsiteConfigSchema>;

export type NavigationLink = {
  id: string;
  label: string;
  url: string;
  slug?: string;
};

function findFirstSection(nodes: PageNode[], type: 'site-navbar' | 'site-footer'): PageSection | undefined {
  for (const node of nodes) {
    if (!isGroup(node) && node.type === type) return node;
    if (isGroup(node)) {
      const found = findFirstSection(node.children, type);
      if (found) return found;
    }
  }
}

function stripSiteChrome(nodes: PageNode[]): PageNode[] {
  return nodes
    .filter((node) => isGroup(node) || (node.type !== 'site-navbar' && node.type !== 'site-footer'))
    .map((node) => (isGroup(node) ? { ...node, children: stripSiteChrome(node.children) } : node));
}

export function extractWebsiteConfig(document: PageDocument): WebsiteConfig {
  const headerCandidate = findFirstSection(document.sections, 'site-navbar');
  const footerCandidate = findFirstSection(document.sections, 'site-footer');
  const header = headerCandidate ? SiteNavbarSectionSchema.safeParse(headerCandidate) : null;
  const footer = footerCandidate ? SiteFooterSectionSchema.safeParse(footerCandidate) : null;

  return {
    version: 1,
    theme: document.theme,
    settings: {
      showFooterBranding: document.settings.showFooterBranding,
      enableSmoothScrolling: document.settings.enableSmoothScrolling,
    },
    header: header?.success ? header.data : null,
    footer: footer?.success ? footer.data : null,
  };
}

export function parseWebsiteConfig(value: unknown): WebsiteConfig | null {
  if (!value || typeof value !== 'object') return null;
  const parsed = WebsiteConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function applyWebsiteConfig(document: PageDocument, config: WebsiteConfig): PageDocument {
  const sections = stripSiteChrome(document.sections);
  return {
    ...document,
    theme: config.theme,
    settings: {
      ...document.settings,
      showFooterBranding: config.settings.showFooterBranding,
      enableSmoothScrolling: config.settings.enableSmoothScrolling,
    },
    sections: [
      ...(config.header ? [config.header] : []),
      ...sections,
      ...(config.footer ? [config.footer] : []),
    ],
  };
}

/**
 * Store only page-specific sections. Shared header/footer/theme live in the
 * Website record, so a page can never overwrite another page's content.
 */
export function toPageContentDocument(document: PageDocument): PageDocument {
  return {
    ...document,
    sections: stripSiteChrome(document.sections),
  };
}

export function getNavigationLinksForPages(
  username: string,
  pages: Array<{ id: string; title: string; slug: string; pageType: string; navOrder: number }>,
): NavigationLink[] {
  return [...pages]
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((page) => ({
      id: page.id,
      label: page.pageType === 'HOME' ? 'Home' : page.title || 'Page',
      url: page.slug ? `/${username}/${page.slug}` : `/${username}`,
      slug: page.slug,
    }));
}

function isExternalLink(url: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function mergeNavigationLinks(
  existing: NavigationLink[],
  managed: NavigationLink[],
  matchingPages: NavigationLink[] = managed,
): NavigationLink[] {
  const result = [...existing];

  for (const link of matchingPages) {
    const linkSlug = link.slug || '';
    const existingIndex = result.findIndex((candidate) => {
      if (isExternalLink(candidate.url)) return false;
      const candidateHash = candidate.url.startsWith('#') ? candidate.url.slice(1) : '';
      return (
        candidate.url === link.url ||
        normalizeLabel(candidate.label) === normalizeLabel(link.label) ||
        (linkSlug !== '' && candidateHash === linkSlug)
      );
    });

    if (existingIndex >= 0) {
      const existingLink = result[existingIndex];
      result[existingIndex] = {
        ...existingLink,
        label: link.label,
        url: link.url,
      };
    } else if (managed.some((managedLink) => managedLink.url === link.url)) {
      result.push({
        id: `${MANAGED_NAVIGATION_PREFIX}${link.id}`,
        label: link.label,
        url: link.url,
        slug: link.slug,
      });
    }
  }

  const seen = new Set<string>();
  return result.filter((link) => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

/**
 * Merge the business's published pages into every navigation bar in the
 * document. This is only applied at render time; it is never persisted, so
 * renaming, unpublishing, or deleting a page always updates navigation.
 */
export function applyManagedNavigation(
  document: PageDocument,
  links: NavigationLink[],
  matchingPages: NavigationLink[] = links,
): PageDocument {
  if (!links.length && !matchingPages.length) return document;

  const updateNodes = (nodes: PageNode[]): PageNode[] =>
    nodes.map((node) => {
      if (isGroup(node)) return { ...node, children: updateNodes(node.children) };
      if (node.type !== 'site-navbar') return node;

      const parsed = SiteNavbarSectionSchema.safeParse(node);
      if (!parsed.success) return node;
      return {
        ...parsed.data,
        content: {
          ...parsed.data.content,
          links: mergeNavigationLinks(parsed.data.content.links, links, matchingPages),
        },
      };
    });

  return { ...document, sections: updateNodes(document.sections) };
}

export const PageSeoSettingsSchema = PageSettingsSchema;
