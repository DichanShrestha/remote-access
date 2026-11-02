import DOMPurify from 'isomorphic-dompurify';
import { normalizePageSlug, slugifyPageTitle } from './page-engine/page-types';
import {
  resolveSiteUrl,
  stripHtml,
  stripTrailingSlash,
  toAbsoluteUrl,
  truncateText,
} from './seo';
import { isAllowedVideoEmbedUrl } from './video-embed';

/**
 * Shared blog primitives.
 *
 * This module is deliberately database-free: the same slug rules, visibility
 * checks, sanitisation, reading-time calculation and SEO resolution are used by
 * server actions, public routes, sitemap generation and unit tests.
 */

export const BLOG_LISTING_SEGMENT = 'blog';
export const BLOG_ARTICLES_PER_PAGE = 12;
export const BLOG_MAX_TITLE_LENGTH = 140;
export const BLOG_MAX_EXCERPT_LENGTH = 320;
export const BLOG_MAX_BODY_LENGTH = 400_000;
export const BLOG_MAX_CATEGORIES = 8;
export const BLOG_MAX_TAGS = 20;

export type BlogArticleStatusValue = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export type BlogArticleSnapshot = {
  version: 1;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  categories: string[];
  tags: string[];
  authorName: string;
  authorAvatarUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noindex: boolean;
  readingMinutes: number;
  publishedAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Slugs and URLs                                                             */
/* -------------------------------------------------------------------------- */

export function normalizeBlogSlug(value: string): string {
  return normalizePageSlug(value);
}

export function slugifyBlogTitle(title: string): string {
  return slugifyPageTitle(title).slice(0, 64).replace(/-+$/g, '') || 'article';
}

export function validateBlogSlug(value: string): { valid: boolean; slug: string; error?: string } {
  const slug = normalizeBlogSlug(value);
  if (!slug) return { valid: false, slug, error: 'Enter an article URL.' };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { valid: false, slug, error: 'Use lowercase letters, numbers, and single dashes.' };
  }
  if (value.trim().toLowerCase() !== slug) {
    return { valid: false, slug, error: 'Use lowercase letters, numbers, and single dashes.' };
  }
  return { valid: true, slug };
}

export function blogListingPath(username: string): string {
  return `/${username.toLowerCase()}/${BLOG_LISTING_SEGMENT}`;
}

export function blogArticlePath(username: string, slug: string): string {
  return `${blogListingPath(username)}/${slug}`;
}

export function blogListingUrl(siteUrl: string | undefined, username: string): string {
  return new URL(blogListingPath(username), resolveSiteUrl(siteUrl)).toString();
}

export function blogArticleUrl(siteUrl: string | undefined, username: string, slug: string): string {
  return new URL(blogArticlePath(username, slug), resolveSiteUrl(siteUrl)).toString();
}

/* -------------------------------------------------------------------------- */
/* Visibility                                                                 */
/* -------------------------------------------------------------------------- */

export function isBlogArticlePublic(
  article: { status: BlogArticleStatusValue | string; scheduledFor?: Date | string | null },
  now = new Date(),
): boolean {
  if (article.status === 'PUBLISHED') return true;
  if (article.status !== 'SCHEDULED' || !article.scheduledFor) return false;
  const scheduled = article.scheduledFor instanceof Date
    ? article.scheduledFor
    : new Date(article.scheduledFor);
  return !Number.isNaN(scheduled.getTime()) && scheduled.getTime() <= now.getTime();
}

export function isBlogArticleDue(article: {
  status: BlogArticleStatusValue | string;
  scheduledFor?: Date | string | null;
}, now = new Date()): boolean {
  return isBlogArticlePublic(article, now);
}

/* -------------------------------------------------------------------------- */
/* Sanitisation                                                               */
/* -------------------------------------------------------------------------- */

const ALLOWED_TAGS = [
  'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'img', 'figure',
  'figcaption', 'iframe', 'video', 'source',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'loading',
  'allow', 'allowfullscreen', 'controls', 'preload', 'type',
];

function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isAllowedImageSource(value: string): boolean {
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith('/api/media/')) return true;
  if (url.startsWith('/_next/image')) return true;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  return isSafeHttpUrl(url);
}

function isAllowedMediaSource(value: string): boolean {
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith('/api/media/')) return true;
  return isSafeHttpUrl(url);
}

function isAllowedLinkHref(value: string): boolean {
  const href = value.trim();
  if (!href) return false;
  if (href.startsWith('#')) return true;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  if (/^(?:mailto|tel):/i.test(href)) return true;
  return isSafeHttpUrl(href);
}

let hooksInstalled = false;

function ensureSanitizerHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    const element = node as Element;
    if (data.tagName === 'iframe') {
      const source = element.getAttribute?.('src') || '';
      if (!isAllowedVideoEmbedUrl(source)) element.parentNode?.removeChild(element);
    }
    if (data.tagName === 'video' || data.tagName === 'source') {
      const source = element.getAttribute?.('src') || '';
      if (!isAllowedMediaSource(source)) element.parentNode?.removeChild(element);
    }
  });

  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    const tag = node.nodeName.toLowerCase();
    if (data.attrName === 'src') {
      if (tag === 'img' && !isAllowedImageSource(data.attrValue)) data.keepAttr = false;
      if ((tag === 'video' || tag === 'source') && !isAllowedMediaSource(data.attrValue)) data.keepAttr = false;
    }
    if (tag === 'a' && data.attrName === 'href' && !isAllowedLinkHref(data.attrValue)) {
      data.keepAttr = false;
    }
    if (tag === 'a' && data.attrName === 'target' && data.attrValue !== '_blank') {
      data.keepAttr = false;
    }
  });
}

/**
 * Sanitise editor/AI HTML. Structural tags used by long-form articles are
 * retained; scripts, inline styles, event handlers, unsafe URLs and embeds from
 * unknown hosts are removed.
 */
export function sanitizeBlogHtml(value: string | null | undefined): string {
  if (!value) return '';
  ensureSanitizerHooks();
  const clean = DOMPurify.sanitize(value, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'base'],
    FORBID_ATTR: ['style', 'class', 'id', 'onerror', 'onload', 'onclick', 'srcset'],
  });
  return String(clean);
}

/** Inline-only sanitisation for AI suggestions that replace selected text. */
export function sanitizeBlogInlineHtml(value: string | null | undefined): string {
  if (!value) return '';
  ensureSanitizerHooks();
  const clean = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['strong', 'b', 'em', 'i', 'u', 's', 'a', 'br', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
  });
  return String(clean);
}

/* -------------------------------------------------------------------------- */
/* Text metrics                                                               */
/* -------------------------------------------------------------------------- */

export function getBlogWordCount(html: string | null | undefined): number {
  const text = stripHtml(html || '');
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function getBlogReadingMinutes(html: string | null | undefined): number {
  const words = getBlogWordCount(html);
  if (!words) return 0;
  return Math.max(1, Math.ceil(words / 220));
}

export function createBlogExcerpt(html: string | null | undefined, maxLength = 170): string {
  return truncateText(stripHtml(html || ''), maxLength);
}

export function findFirstBlogImage(html: string | null | undefined): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)')/i);
  return match?.[1] || match?.[2] || undefined;
}

export function isBlogBodyEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  if (/<(?:img|iframe|video|hr)\b/i.test(html)) return false;
  return stripHtml(html).trim().length === 0;
}

/* -------------------------------------------------------------------------- */
/* Categories and tags                                                        */
/* -------------------------------------------------------------------------- */

export function normalizeBlogTerms(values: unknown, max = BLOG_MAX_TAGS): string[] {
  const source = Array.isArray(values)
    ? values
    : typeof values === 'string'
      ? values.split(',')
      : [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of source) {
    if (typeof item !== 'string') continue;
    const term = item.replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!term) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(term);
    if (result.length >= max) break;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Media and snapshots                                                        */
/* -------------------------------------------------------------------------- */

export function safeBlogMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url) return null;
  if (!isAllowedImageSource(url)) return null;
  return url;
}

export type BuildBlogSnapshotInput = {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  categories?: unknown;
  tags?: unknown;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
  publishedAt: Date;
  updatedAt: Date;
};

export function buildBlogSnapshot(input: BuildBlogSnapshotInput): BlogArticleSnapshot {
  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  const excerpt = (input.excerpt || '').trim() || createBlogExcerpt(bodyHtml);

  return {
    version: 1,
    title: (input.title || '').trim() || 'Untitled article',
    slug: input.slug,
    excerpt,
    bodyHtml,
    featuredImageUrl: safeBlogMediaUrl(input.featuredImageUrl),
    featuredImageAlt: input.featuredImageAlt?.trim().slice(0, 300) || null,
    categories: normalizeBlogTerms(input.categories, BLOG_MAX_CATEGORIES),
    tags: normalizeBlogTerms(input.tags, BLOG_MAX_TAGS),
    authorName: input.authorName?.trim().slice(0, 120) || '',
    authorAvatarUrl: safeBlogMediaUrl(input.authorAvatarUrl),
    seoTitle: input.seoTitle?.trim().slice(0, 120) || null,
    seoDescription: input.seoDescription?.trim().slice(0, 320) || null,
    canonicalUrl: input.canonicalUrl?.trim().slice(0, 2000) || null,
    ogImage: safeBlogMediaUrl(input.ogImage),
    noindex: input.noindex === true,
    readingMinutes: getBlogReadingMinutes(bodyHtml),
    publishedAt: input.publishedAt.toISOString(),
    updatedAt: input.updatedAt.toISOString(),
  };
}

export function parseBlogSnapshot(value: unknown): BlogArticleSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.title !== 'string' || typeof raw.bodyHtml !== 'string' || typeof raw.slug !== 'string') {
    return null;
  }

  const publishedAt = typeof raw.publishedAt === 'string' ? raw.publishedAt : '';
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : publishedAt;

  return {
    version: 1,
    title: raw.title,
    slug: raw.slug,
    excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : '',
    bodyHtml: typeof raw.bodyHtml === 'string' ? raw.bodyHtml : '',
    featuredImageUrl: typeof raw.featuredImageUrl === 'string' ? raw.featuredImageUrl : null,
    featuredImageAlt: typeof raw.featuredImageAlt === 'string' ? raw.featuredImageAlt : null,
    categories: normalizeBlogTerms(raw.categories, BLOG_MAX_CATEGORIES),
    tags: normalizeBlogTerms(raw.tags, BLOG_MAX_TAGS),
    authorName: typeof raw.authorName === 'string' ? raw.authorName : '',
    authorAvatarUrl: typeof raw.authorAvatarUrl === 'string' ? raw.authorAvatarUrl : null,
    seoTitle: typeof raw.seoTitle === 'string' ? raw.seoTitle : null,
    seoDescription: typeof raw.seoDescription === 'string' ? raw.seoDescription : null,
    canonicalUrl: typeof raw.canonicalUrl === 'string' ? raw.canonicalUrl : null,
    ogImage: typeof raw.ogImage === 'string' ? raw.ogImage : null,
    noindex: raw.noindex === true,
    readingMinutes: typeof raw.readingMinutes === 'number'
      ? Math.max(0, Math.round(raw.readingMinutes))
      : getBlogReadingMinutes(typeof raw.bodyHtml === 'string' ? raw.bodyHtml : ''),
    publishedAt,
    updatedAt,
  };
}

/** Build the snapshot fields used when an article is (re)published. */
export function getBlogPublishSnapshot(input: BuildBlogSnapshotInput): {
  snapshot: BlogArticleSnapshot;
  publicSlug: string;
  publishedNoindex: boolean;
  publishedCanonicalUrl: string | null;
  publishedAt: Date;
} {
  const snapshot = buildBlogSnapshot(input);
  return {
    snapshot,
    publicSlug: input.slug,
    publishedNoindex: snapshot.noindex,
    publishedCanonicalUrl: snapshot.canonicalUrl,
    publishedAt: input.publishedAt,
  };
}

/* -------------------------------------------------------------------------- */
/* Canonical and SEO                                                          */
/* -------------------------------------------------------------------------- */

export function resolveBlogCanonicalUrl(input: {
  siteUrl?: string;
  username: string;
  slug: string;
  override?: string | null;
}): string {
  const siteUrl = resolveSiteUrl(input.siteUrl);
  const username = input.username.toLowerCase();
  const preferred = blogArticleUrl(siteUrl, username, input.slug);
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
  const tenantBlogRoot = `/${username}/${BLOG_LISTING_SEGMENT}`;
  if (pathname !== tenantBlogRoot && !pathname.startsWith(`${tenantBlogRoot}/`)) return preferred;

  return `${parsed.origin}${pathname}`;
}

/**
 * A canonical override that points at a different in-tenant URL turns the
 * article into a duplicate. Like pages, only the canonical target should appear
 * in the sitemap.
 */
export function resolveBlogSitemapUrl(input: {
  siteUrl?: string;
  username: string;
  slug: string;
  canonicalOverride?: string | null;
}): string | null {
  const preferred = resolveBlogCanonicalUrl({
    siteUrl: input.siteUrl,
    username: input.username,
    slug: input.slug,
  });
  if (!input.canonicalOverride?.trim()) return preferred;

  const canonical = resolveBlogCanonicalUrl({
    siteUrl: input.siteUrl,
    username: input.username,
    slug: input.slug,
    override: input.canonicalOverride,
  });
  return canonical === preferred ? preferred : null;
}

export type ResolvedBlogArticleSeo = {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: { index: boolean; follow: boolean };
  openGraph: {
    type: 'article';
    siteName: string;
    title: string;
    description: string;
    url: string;
    images: Array<{ url: string; alt: string }>;
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
};

export type BlogSeoArticle = {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  categories?: string[];
  tags?: string[];
  authorName?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export function resolveBlogArticleSeo(input: {
  siteUrl?: string;
  username: string;
  displayName?: string | null;
  article: BlogSeoArticle;
  indexable?: boolean;
}): ResolvedBlogArticleSeo {
  const siteUrl = resolveSiteUrl(input.siteUrl);
  const businessName = input.displayName?.trim() || input.username;
  const articleTitle = input.article.title?.trim() || 'Untitled article';
  const plainBody = stripHtml(input.article.bodyHtml || '');

  const defaultTitle = articleTitle.length >= 52
    ? truncateText(articleTitle, 68)
    : truncateText(`${articleTitle} | ${businessName}`, 70);
  const defaultDescription = input.article.excerpt?.trim()
    || truncateText(plainBody, 160)
    || `${articleTitle} — ${businessName}.`;

  const title = input.article.seoTitle?.trim() || defaultTitle;
  const description = input.article.seoDescription?.trim() || defaultDescription;
  const canonicalUrl = resolveBlogCanonicalUrl({
    siteUrl,
    username: input.username,
    slug: input.article.slug,
    override: input.article.canonicalUrl,
  });

  const index = input.indexable !== false && input.article.noindex !== true;
  const ogImage = input.article.ogImage?.trim()
    || input.article.featuredImageUrl?.trim()
    || findFirstBlogImage(input.article.bodyHtml)
    || '/logo.png';
  const imageUrl = toAbsoluteUrl(ogImage, siteUrl);
  const imageAlt = input.article.featuredImageAlt?.trim() || title;
  const publishedAt = normalizeSeoDate(input.article.publishedAt);
  const modifiedAt = normalizeSeoDate(input.article.updatedAt);

  return {
    title,
    description,
    canonicalUrl,
    robots: { index, follow: index },
    openGraph: {
      type: 'article',
      siteName: businessName,
      title,
      description,
      url: canonicalUrl,
      images: [{ url: imageUrl, alt: imageAlt }],
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
      ...(modifiedAt ? { modifiedTime: modifiedAt } : {}),
      ...(input.article.authorName?.trim() ? { authors: [input.article.authorName.trim()] } : {}),
      ...(input.article.categories?.[0] ? { section: input.article.categories[0] } : {}),
      ...(input.article.tags?.length ? { tags: input.article.tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

function normalizeSeoDate(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                       */
/* -------------------------------------------------------------------------- */

export function formatBlogDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatBlogDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatBlogStatusLabel(
  article: { status: BlogArticleStatusValue | string; scheduledFor?: string | Date | null },
  now = new Date(),
): 'Published' | 'Scheduled' | 'Draft' | 'Live' {
  if (article.status === 'PUBLISHED') return 'Published';
  if (article.status === 'SCHEDULED') {
    return isBlogArticlePublic(article, now) ? 'Live' : 'Scheduled';
  }
  return 'Draft';
}

/** Replace the first N `<h2>` headings, preserving the rest of the article. */
export function applyHeadingSuggestions(html: string, headings: string[]): string {
  let index = 0;
  return html.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi, (match) => {
    const heading = headings[index++];
    if (!heading) return match;
    return `<h2>${escapeHtmlText(heading)}</h2>`;
  });
}

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildFaqHtml(faqs: Array<{ question: string; answer: string }>): string {
  const items = faqs
    .filter((faq) => faq.question?.trim() && faq.answer?.trim())
    .map((faq) => `<h3>${escapeHtmlText(faq.question.trim())}</h3><p>${escapeHtmlText(faq.answer.trim())}</p>`)
    .join('');
  return items ? `<h2>Frequently asked questions</h2>${items}` : '';
}
