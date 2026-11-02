import { cache } from 'react';
import { permanentRedirect } from 'next/navigation';
import { BlogStatus, type BlogArticle, type Prisma } from '@prisma/client';
import db from './prisma';
import {
  BLOG_ARTICLES_PER_PAGE,
  blogArticlePath,
  blogListingPath,
  isBlogArticlePublic,
  normalizeBlogSlug,
  normalizeBlogTerms,
  parseBlogSnapshot,
  sanitizeBlogHtml,
  type BlogArticleSnapshot,
} from './blog';
import { getPublishedPage, type PublicPageData } from './public-page';
import {
  SiteFooterSectionSchema,
  SiteNavbarSectionSchema,
  type ThemeConfig,
} from './page-engine/schemas';
import type { z } from 'zod';

type NavbarSection = z.infer<typeof SiteNavbarSectionSchema>;
type FooterSection = z.infer<typeof SiteFooterSectionSchema>;

export type BlogSite = {
  profileId: string;
  username: string;
  displayName: string;
  bio: string | null;
  theme: ThemeConfig;
  header: NavbarSection | null;
  footer: FooterSection | null;
  websitePublished: boolean;
  unavailable: boolean;
  homeBotId?: string;
  homePageId?: string;
};

type PublicArticleRow = Pick<
  BlogArticle,
  | 'id'
  | 'publicSlug'
  | 'publishedSnapshot'
  | 'publishedNoindex'
  | 'publishedCanonicalUrl'
  | 'publishedAt'
  | 'updatedAt'
  | 'status'
  | 'scheduledFor'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'bodyHtml'
  | 'featuredImageUrl'
  | 'featuredImageAlt'
  | 'categories'
  | 'tags'
  | 'authorName'
  | 'authorAvatarUrl'
  | 'seoTitle'
  | 'seoDescription'
  | 'canonicalUrl'
  | 'ogImage'
  | 'noindex'
>;

export type BlogArticleData = {
  id: string;
  slug: string;
  title: string;
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
  publishedAt: string | null;
  updatedAt: string;
  status: string;
  scheduledFor: string | null;
  path: string;
};

function findChromeSection<T extends 'site-navbar' | 'site-footer'>(
  document: PublicPageData['document'],
  type: T,
) {
  return document.sections.find((node) => 'type' in node && node.type === type);
}

/** Published website chrome shared by the blog listing and every article. */
export const getBlogSite = cache(async (rawUsername: string): Promise<BlogSite | null> => {
  const lookup = await getPublishedPage(rawUsername);
  if (lookup.status !== 'ok') return null;
  const data = lookup.data;

  const navbarNode = findChromeSection(data.document, 'site-navbar');
  const footerNode = findChromeSection(data.document, 'site-footer');
  const navbarParsed = navbarNode ? SiteNavbarSectionSchema.safeParse(navbarNode) : null;
  const footerParsed = footerNode ? SiteFooterSectionSchema.safeParse(footerNode) : null;

  const blogPath = blogListingPath(data.profile.username);
  let header = navbarParsed?.success ? navbarParsed.data : null;
  if (header) {
    const alreadyLinked = header.content.links.some((link) => {
      const url = link.url.replace(/\/+$/, '');
      return url === blogPath || url.endsWith('/blog');
    });
    if (!alreadyLinked) {
      header = {
        ...header,
        content: {
          ...header.content,
          links: [
            ...header.content.links,
            { id: 'managed-blog-index', label: 'Blog', url: blogPath },
          ],
        },
      };
    }
  }

  return {
    profileId: data.profile.id,
    username: data.profile.username,
    displayName: data.profile.displayName,
    bio: data.profile.bio,
    theme: data.document.theme,
    header,
    footer: footerParsed?.success ? footerParsed.data : null,
    websitePublished: data.websitePublished,
    unavailable: data.unavailable,
    homeBotId: data.homeBotId,
    homePageId: data.page.id,
  };
});

function rowToArticle(
  row: PublicArticleRow,
  username: string,
  snapshot: BlogArticleSnapshot | null,
): BlogArticleData {
  const slug = row.publicSlug || snapshot?.slug || row.slug;
  const bodyHtml = snapshot?.bodyHtml ?? sanitizeBlogHtml(row.bodyHtml);
  const categories = snapshot?.categories ?? normalizeBlogTerms(row.categories, 8);
  const tags = snapshot?.tags ?? normalizeBlogTerms(row.tags, 20);
  const publishedAt = snapshot?.publishedAt || row.publishedAt?.toISOString() || null;
  const updatedAt = snapshot?.updatedAt || row.updatedAt.toISOString();

  return {
    id: row.id,
    slug,
    title: snapshot?.title || row.title || 'Untitled article',
    excerpt: snapshot?.excerpt || row.excerpt || '',
    bodyHtml,
    featuredImageUrl: snapshot?.featuredImageUrl ?? row.featuredImageUrl,
    featuredImageAlt: snapshot?.featuredImageAlt ?? row.featuredImageAlt,
    categories,
    tags,
    authorName: snapshot?.authorName || row.authorName || '',
    authorAvatarUrl: snapshot?.authorAvatarUrl ?? row.authorAvatarUrl,
    seoTitle: snapshot?.seoTitle ?? row.seoTitle,
    seoDescription: snapshot?.seoDescription ?? row.seoDescription,
    canonicalUrl: row.publishedCanonicalUrl ?? snapshot?.canonicalUrl ?? null,
    ogImage: snapshot?.ogImage ?? row.ogImage,
    noindex: row.publishedNoindex || snapshot?.noindex === true,
    readingMinutes: snapshot?.readingMinutes ?? 0,
    publishedAt,
    updatedAt,
    status: row.status,
    scheduledFor: row.scheduledFor?.toISOString() || null,
    path: blogArticlePath(username, slug),
  };
}

const publicArticleSelect = {
  id: true,
  publicSlug: true,
  publishedSnapshot: true,
  publishedNoindex: true,
  publishedCanonicalUrl: true,
  publishedAt: true,
  updatedAt: true,
  status: true,
  scheduledFor: true,
  slug: true,
  title: true,
  excerpt: true,
  bodyHtml: true,
  featuredImageUrl: true,
  featuredImageAlt: true,
  categories: true,
  tags: true,
  authorName: true,
  authorAvatarUrl: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  ogImage: true,
  noindex: true,
} as const;

function publicArticlesWhere(profileId: string, now = new Date()): Prisma.BlogArticleWhereInput {
  return {
    profileId,
    publicSlug: { not: null },
    OR: [
      { status: BlogStatus.PUBLISHED },
      { status: BlogStatus.SCHEDULED, scheduledFor: { lte: now } },
    ],
  };
}

/**
 * Articles available on the public blog. Terms are filtered against the
 * published snapshot, not the editable draft, so an owner can safely prepare
 * category changes without changing the live listing.
 */
export async function listPublishedBlogArticles(
  profileId: string,
  username: string,
  options: { category?: string; tag?: string; page?: number } = {},
): Promise<{ articles: BlogArticleData[]; total: number; page: number; pageCount: number; categories: string[] }> {
  const rows = await db.blogArticle.findMany({
    where: publicArticlesWhere(profileId),
    select: publicArticleSelect,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });

  const articles = rows
    .map((row) => ({ row, snapshot: parseBlogSnapshot(row.publishedSnapshot) }))
    .filter(({ row, snapshot }) => Boolean(snapshot || row.publicSlug))
    .map(({ row, snapshot }) => rowToArticle(row, username, snapshot))
    .sort((a, b) => {
      const left = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const right = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return right - left;
    });

  const categories = normalizeBlogTerms(
    articles.flatMap((article) => article.categories),
    40,
  );

  const category = options.category?.trim().toLowerCase();
  const tag = options.tag?.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    if (category && !article.categories.some((item) => item.toLowerCase() === category)) return false;
    if (tag && !article.tags.some((item) => item.toLowerCase() === tag)) return false;
    return true;
  });

  const pageSize = BLOG_ARTICLES_PER_PAGE;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, Math.floor(options.page || 1)), pageCount);
  const start = (page - 1) * pageSize;

  return {
    articles: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageCount,
    categories,
  };
}

export const getPublishedBlogArticle = cache(async (
  profileId: string,
  username: string,
  rawSlug: string,
): Promise<BlogArticleData | null> => {
  const slug = normalizeBlogSlug(rawSlug);
  if (!slug) return null;

  const row = await db.blogArticle.findFirst({
    where: { profileId, publicSlug: slug },
    select: publicArticleSelect,
  });

  if (!row) {
    const redirect = await db.blogArticleSlugRedirect.findUnique({
      where: { profileId_slug: { profileId, slug } },
      select: { articleId: true },
    });
    if (redirect) {
      const target = await db.blogArticle.findFirst({
        where: { id: redirect.articleId, profileId },
        select: publicArticleSelect,
      });
      if (target && isBlogArticlePublic(target) && target.publicSlug && target.publicSlug !== slug) {
        permanentRedirect(blogArticlePath(username, target.publicSlug));
      }
    }
    return null;
  }

  if (!isBlogArticlePublic(row)) return null;
  if (rawSlug !== row.publicSlug) {
    // Case and formatting variants permanently resolve to the canonical URL.
    if (row.publicSlug) permanentRedirect(blogArticlePath(username, row.publicSlug));
  }

  return rowToArticle(row, username, parseBlogSnapshot(row.publishedSnapshot));
});

export async function getRelatedBlogArticles(
  profileId: string,
  username: string,
  article: BlogArticleData,
  limit = 3,
): Promise<BlogArticleData[]> {
  const rows = await db.blogArticle.findMany({
    where: {
      ...publicArticlesWhere(profileId),
      id: { not: article.id },
    },
    select: publicArticleSelect,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit * 3,
  });

  return rows
    .map((row) => rowToArticle(row, username, parseBlogSnapshot(row.publishedSnapshot)))
    .sort((left, right) => {
      const leftMatches = article.categories.some((category) => left.categories.includes(category)) ? 1 : 0;
      const rightMatches = article.categories.some((category) => right.categories.includes(category)) ? 1 : 0;
      if (leftMatches !== rightMatches) return rightMatches - leftMatches;
      const leftDate = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
      const rightDate = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
      return rightDate - leftDate;
    })
    .slice(0, limit);
}

export async function getDashboardBlogArticles(profileId: string, username: string) {
  const rows = await db.blogArticle.findMany({
    where: { profileId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      status: true,
      scheduledFor: true,
      publishedAt: true,
      publicSlug: true,
      updatedAt: true,
      featuredImageUrl: true,
      categories: true,
      tags: true,
      bodyHtml: true,
      authorName: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title || 'Untitled article',
    slug: row.slug,
    excerpt: row.excerpt,
    status: row.status,
    scheduledFor: row.scheduledFor?.toISOString() || null,
    publishedAt: row.publishedAt?.toISOString() || null,
    publicSlug: row.publicSlug,
    updatedAt: row.updatedAt.toISOString(),
    featuredImageUrl: row.featuredImageUrl,
    categories: row.categories,
    tags: row.tags,
    publicPath: row.publicSlug ? blogArticlePath(username, row.publicSlug) : null,
  }));
}

export async function getBlogArticleForEditor(profileId: string, articleId: string) {
  return db.blogArticle.findFirst({
    where: { id: articleId, profileId },
  });
}

export async function getBlogTermSuggestions(profileId: string): Promise<{ categories: string[]; tags: string[] }> {
  const rows = await db.blogArticle.findMany({
    where: { profileId },
    select: { categories: true, tags: true },
  });
  return {
    categories: normalizeBlogTerms(rows.flatMap((row) => row.categories), 40),
    tags: normalizeBlogTerms(rows.flatMap((row) => row.tags), 60),
  };
}
