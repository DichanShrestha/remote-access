import { buildPagePath } from './page-engine/page-types';

/**
 * Shared, dependency-free SEO primitives.
 *
 * This module deliberately has no database, Next.js or AI dependencies so the
 * exact same defaults and canonical rules are used by metadata, sitemap XML and
 * unit tests. No AI call is involved in any of this generation.
 */

export const DEFAULT_SITE_URL = 'https://pageory.app';
export const DEFAULT_SHARE_IMAGE = '/logo.png';

export type PageSeoSettings = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
};

export type SeoPage = {
  title: string;
  slug: string;
  pageType: string;
};

export type SeoDocument = {
  settings?: PageSeoSettings | null;
  sections?: unknown;
};

export type ResolvedPageSeo = {
  title: string;
  description: string;
  canonicalUrl: string;
  isHome: boolean;
  robots: { index: boolean; follow: boolean };
  openGraph: {
    type: 'website';
    siteName: string;
    title: string;
    description: string;
    url: string;
    images: Array<{ url: string; alt: string }>;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
};

export function resolveSiteUrl(raw?: string | null): string {
  const value = raw?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) return DEFAULT_SITE_URL;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function stripTrailingSlash(value: string): string {
  if (!value) return '/';
  if (value === '/') return '/';
  return value.replace(/\/+$/, '') || '/';
}

export function toAbsoluteUrl(value: string, siteUrl = resolveSiteUrl()): string {
  const trimmed = value.trim();
  if (!trimmed) return siteUrl;
  try {
    return new URL(trimmed, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

function isHomePage(page: SeoPage): boolean {
  return page.pageType === 'HOME' || page.slug === '';
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/');
}

export function stripHtml(value: string): string {
  return normalizeWhitespace(
    decodeHtmlEntities(value.replace(/<[^>]*>/g, ' '))
      .replace(/\s+([,.;:!?])/g, '$1'),
  );
}

export function truncateText(value: string, maxLength: number): string {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, Math.max(0, maxLength - 1));
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[.,;:\s]+$/g, '')}…`;
}

const SKIP_TEXT_KEYS = new Set([
  'id',
  'url',
  'href',
  'src',
  'imageUrl',
  'fileUrl',
  'buttonUrl',
  'secondaryButtonUrl',
  'logoUrl',
  'secondaryImageUrl',
  'menuImageUrl',
  'avatarUrl',
  'type',
  'kind',
  'layout',
  'variant',
  'backgroundColor',
  'textColor',
  'primaryColor',
  'buttonColor',
  'buttonTextColor',
  'sectionPadding',
  'contentWidth',
  'customSectionPadding',
  'customGap',
  'customPadding',
  'customWidth',
  'direction',
  'horizontalAlign',
  'verticalAlign',
  'width',
  'gap',
  'padding',
  'mobileDirection',
  'platform',
  'icon',
  'badge',
  'tag',
  'currency',
]);

const SKIP_SECTION_TYPES = new Set(['site-navbar', 'site-footer']);

/**
 * Pull readable page copy out of the section document. Shared navigation and
 * footer copy is skipped so descriptions describe the page, not the menu.
 */
export function collectDocumentText(sections: unknown, limit = 1200): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  let used = 0;

  const walk = (value: unknown, key = '', parentKey = '') => {
    if (used >= limit) return;

    if (typeof value === 'string') {
      if (SKIP_TEXT_KEYS.has(key)) return;
      const text = stripHtml(value);
      if (text.length < 2) return;
      if (/^(?:https?:|\/|#|data:|mailto:|tel:)/i.test(text)) return;
      if (/^#[0-9a-f]{3,8}$/i.test(text)) return;
      const signature = text.toLowerCase();
      if (seen.has(signature)) return;
      seen.add(signature);
      parts.push(text);
      used += text.length + 1;
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) walk(item, key, parentKey);
      return;
    }

    if (!value || typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    if (typeof record.type === 'string' && SKIP_SECTION_TYPES.has(record.type)) return;
    if (record.isHidden === true) return;

    for (const [childKey, childValue] of Object.entries(record)) {
      walk(childValue, childKey, key);
    }
  };

  walk(sections);
  return truncateText(parts.join(' '), limit);
}

const IMAGE_KEYS = new Set(['imageUrl', 'avatarUrl', 'logoUrl', 'menuImageUrl', 'secondaryImageUrl']);
const IMAGE_ARRAY_KEYS = new Set(['images', 'galleryImages']);

export function findFirstImageUrl(value: unknown, parentKey = ''): string | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstImageUrl(item, parentKey);
      if (found) return found;
    }
    return undefined;
  }

  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;

  for (const [key, child] of Object.entries(record)) {
    if (typeof child !== 'string' || !child.trim() || child.startsWith('#')) continue;
    if (IMAGE_KEYS.has(key)) return child.trim();
    if (key === 'url' && IMAGE_ARRAY_KEYS.has(parentKey)) return child.trim();
  }

  for (const [key, child] of Object.entries(record)) {
    const found = findFirstImageUrl(child, key);
    if (found) return found;
  }

  return undefined;
}

export function buildSeoDefaults(input: {
  businessName?: string | null;
  username?: string;
  bio?: string | null;
  page: SeoPage;
  document: SeoDocument;
}): { title: string; description: string } {
  const businessName = input.businessName?.trim() || input.username?.trim() || 'This business';
  const home = isHomePage(input.page);
  const pageTitle = input.page.title?.trim() || (home ? businessName : 'Page');
  const content = collectDocumentText(input.document.sections);

  const title = truncateText(home ? businessName : `${pageTitle} | ${businessName}`, 70);

  let description: string;
  if (home) {
    description = input.bio?.trim() || content || `${businessName} — official website.`;
  } else {
    const lead = `${pageTitle} — ${businessName}.`;
    const detail = content || input.bio?.trim() || `Learn more about ${pageTitle.toLowerCase()}.`;
    description = `${lead} ${detail}`;
  }

  return { title, description: truncateText(description, 160) };
}

/**
 * Validate a user supplied canonical URL. Cross-business or external values
 * are ignored so one tenant can never canonicalise another tenant's page.
 */
export function resolveCanonicalUrl(input: {
  siteUrl?: string;
  username: string;
  slug: string;
  override?: string | null;
}): string {
  const siteUrl = resolveSiteUrl(input.siteUrl);
  const username = input.username.toLowerCase();
  const preferred = new URL(buildPagePath(username, input.slug), siteUrl).toString();
  const override = input.override?.trim();
  if (!override) return preferred;

  let parsed: URL;
  try {
    parsed = new URL(override, siteUrl);
  } catch {
    return preferred;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return preferred;
  if (parsed.origin !== new URL(siteUrl).origin) return preferred;

  const pathname = stripTrailingSlash(parsed.pathname);
  const tenantRoot = `/${username}`;
  if (pathname !== tenantRoot && !pathname.startsWith(`${tenantRoot}/`)) return preferred;

  return `${parsed.origin}${pathname}`;
}

/**
 * Resolve the URL a page should contribute to the sitemap. A page that
 * canonicalises to a different in-tenant URL is a duplicate and is omitted;
 * its canonical target is listed by its own row. This makes sitemap output
 * globally unique even when it is split across multiple shards.
 */
export function resolveSitemapUrl(input: {
  siteUrl?: string;
  username: string;
  slug: string;
  canonicalOverride?: string | null;
}): string | null {
  const preferredUrl = resolveCanonicalUrl({
    siteUrl: input.siteUrl,
    username: input.username,
    slug: input.slug,
  });

  if (!input.canonicalOverride?.trim()) return preferredUrl;

  const canonicalUrl = resolveCanonicalUrl({
    siteUrl: input.siteUrl,
    username: input.username,
    slug: input.slug,
    override: input.canonicalOverride,
  });

  return canonicalUrl === preferredUrl ? preferredUrl : null;
}

export function resolvePageSeo(input: {
  siteUrl?: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  page: SeoPage;
  document: SeoDocument;
  indexable?: boolean;
}): ResolvedPageSeo {
  const siteUrl = resolveSiteUrl(input.siteUrl);
  const settings = input.document.settings || {};
  const home = isHomePage(input.page);
  const businessName = input.displayName?.trim() || input.username;

  const defaults = buildSeoDefaults({
    businessName: input.displayName,
    username: input.username,
    bio: input.bio,
    page: input.page,
    document: input.document,
  });

  const title = settings.seoTitle?.trim() || defaults.title;
  const description = settings.seoDescription?.trim() || defaults.description;
  const canonicalUrl = resolveCanonicalUrl({
    siteUrl,
    username: input.username,
    slug: input.page.slug,
    override: settings.canonicalUrl,
  });

  const index = input.indexable !== false && settings.noindex !== true;
  const ogTitle = settings.ogTitle?.trim() || title;
  const ogDescription = settings.ogDescription?.trim() || description;
  const ogImage = settings.ogImage?.trim()
    || findFirstImageUrl(input.document.sections)
    || DEFAULT_SHARE_IMAGE;
  const imageUrl = toAbsoluteUrl(ogImage, siteUrl);

  return {
    title,
    description,
    canonicalUrl,
    isHome: home,
    robots: { index, follow: index },
    openGraph: {
      type: 'website',
      siteName: businessName,
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      images: [{ url: imageUrl, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
    },
  };
}

/** Values mirrored onto Page when a page is published for sitemap queries. */
export function getSeoPublishSnapshot(settings?: PageSeoSettings | null): {
  canonicalUrl: string | null;
  noindex: boolean;
} {
  return {
    canonicalUrl: settings?.canonicalUrl?.trim() || null,
    noindex: settings?.noindex === true,
  };
}

export type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | string;
  priority?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastModified(value: Date | string | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s]+$/i.test(value);
}

function uniqueEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (!entry.url || !isAbsoluteHttpUrl(entry.url)) return false;
    const key = entry.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildSitemapUrlSetXml(entries: SitemapEntry[]): string {
  const urls = uniqueEntries(entries).map((entry) => {
    const lines = [`    <loc>${escapeXml(entry.url)}</loc>`];
    const lastModified = formatLastModified(entry.lastModified);
    if (lastModified) lines.push(`    <lastmod>${lastModified}</lastmod>`);
    if (entry.changeFrequency) lines.push(`    <changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`);
    if (typeof entry.priority === 'number' && Number.isFinite(entry.priority)) {
      const priority = Math.min(1, Math.max(0, entry.priority));
      lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
    }
    return `  <url>\n${lines.join('\n')}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

export function buildSitemapIndexXml(entries: SitemapEntry[]): string {
  const sitemaps = uniqueEntries(entries).map((entry) => {
    const lines = [`    <loc>${escapeXml(entry.url)}</loc>`];
    const lastModified = formatLastModified(entry.lastModified);
    if (lastModified) lines.push(`    <lastmod>${lastModified}</lastmod>`);
    return `  <sitemap>\n${lines.join('\n')}\n  </sitemap>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps,
    '</sitemapindex>',
  ].join('\n');
}

export const PUBLIC_ROBOTS_DISALLOW = [
  '/dashboard',
  '/editor',
  '/editor-preview',
  '/onboarding',
  '/admin',
  '/account-suspended',
  '/affiliate/apply',
  '/api',
];

export const PUBLIC_ROBOTS_ALLOW = [
  '/',
  '/api/media/',
  '/_next/static/',
  '/_next/image/',
];

export const INDEXING_CRAWLERS = ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot'] as const;

export function buildRobotsConfig(siteUrl = resolveSiteUrl()) {
  return {
    rules: INDEXING_CRAWLERS.map((userAgent) => ({
      userAgent,
      allow: [...PUBLIC_ROBOTS_ALLOW],
      disallow: [...PUBLIC_ROBOTS_DISALLOW],
    })),
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
