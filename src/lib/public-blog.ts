import { cache } from 'react';
import { permanentRedirect } from 'next/navigation';
import { BlogStatus } from '@prisma/client';
import db from '@/lib/prisma';
import {
  BLOG_ARTICLES_PER_PAGE,
  blogArticlePath,
  isBlogArticlePublic,
  parseBlogSnapshot,
  type BlogArticleSnapshot,
} from '@/lib/blog';
import { getSmartPageEntitlement } from '@/lib/tier-limits';

/**
 * Public blog queries.
 *
 * Published articles are always rendered from their publish snapshot, never
 * from the editable draft, so autosaves in the studio can never leak onto a
 * live URL. Redirects and entitlement checks stay tenant-scoped.
 */

type BlogProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  homePublished: boolean;
  unavailable: boolean;
  websitePublished: boolean;
};

export type PublicBlogArticle = {
  id: string;
  publicSlug: string;
  snapshot: BlogArticleSnapshot;
  publishedAt: Date;
};

export type PublicBlogListing = {
  profile: BlogProfile;
  articles: PublicBlogArticle[];
  page: number;
  pageCount: number;
  total: number;
};

export type PublicBlogArticlePage = {
  profile: BlogProfile;
  article: PublicBlogArticle;
};

export type PublicBlogLookup<T> =
  | { status: 'ok'; data: T }
  | { status: 'not-found' };

const profileSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  pages: {
    where: { OR: [{ pageType: 'HOME' as const }, { slug: '' }] },
    select: { isPublished: true },
    take: 1,
  },
  user: {
    select: {
      createdAt: true,
      trialGrantedAt: true,
      suspendedAt: true,
      subscriptions: {
        orderBy: { updatedAt: 'desc' as const },
        take: 1,
        select: {
          planId: true,
          tier: true,
          status: true,
          trialStart: true,
          trialEnd: true,
          currentPeriodEnd: true,
        },
      },
    },
  },
};

const getBlogProfile = cache(async (rawUsername: string): Promise<BlogProfile | null> => {
  const username = rawUsername.trim().toLowerCase();
  if (!username) return null;

  const profile = await db.profile.findUnique({
    where: { username },
    select: profileSelect,
  });
  if (!profile) return null;

  const entitlement = getSmartPageEntitlement(profile.user);
  const unavailable =
    entitlement.trialExpired && new Date() > entitlement.publicGraceEndsAt;
  const homePublished = profile.pages.some((page) => page.isPublished);

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    homePublished,
    unavailable,
    websitePublished: homePublished && !profile.user.suspendedAt,
  };
});

function toPublicArticle(row: {
  id: string;
  publicSlug: string | null;
  publishedSnapshot: unknown;
  publishedAt: Date | null;
  updatedAt: Date;
}): PublicBlogArticle | null {
  if (!row.publicSlug) return null;
  const snapshot = parseBlogSnapshot(row.publishedSnapshot);
  if (!snapshot) return null;
  return {
    id: row.id,
    publicSlug: row.publicSlug,
    snapshot,
    publishedAt: row.publishedAt ?? row.updatedAt,
  };
}

export const getPublicBlogListing = cache(
  async (rawUsername: string, requestedPage = 1): Promise<PublicBlogLookup<PublicBlogListing>> => {
    const profile = await getBlogProfile(rawUsername);
    if (!profile) return { status: 'not-found' };

    const page = Number.isFinite(requestedPage)
      ? Math.min(10_000, Math.max(1, Math.trunc(requestedPage)))
      : 1;
    const now = new Date();
    const where = {
      profileId: profile.id,
      OR: [
        { status: BlogStatus.PUBLISHED },
        { status: BlogStatus.SCHEDULED, scheduledFor: { lte: now } },
      ],
    };

    const [total, rows] = await Promise.all([
      db.blogArticle.count({ where }),
      db.blogArticle.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * BLOG_ARTICLES_PER_PAGE,
        take: BLOG_ARTICLES_PER_PAGE,
        select: {
          id: true,
          publicSlug: true,
          publishedSnapshot: true,
          publishedAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const articles = rows
      .map(toPublicArticle)
      .filter((article): article is PublicBlogArticle => article !== null);

    return {
      status: 'ok',
      data: {
        profile,
        articles,
        page,
        pageCount: Math.max(1, Math.ceil(total / BLOG_ARTICLES_PER_PAGE)),
        total,
      },
    };
  },
);

export const getPublicBlogArticle = cache(
  async (
    rawUsername: string,
    rawSlug: string,
  ): Promise<PublicBlogLookup<PublicBlogArticlePage>> => {
    const profile = await getBlogProfile(rawUsername);
    if (!profile) return { status: 'not-found' };

    const requestedSlug = rawSlug.trim().toLowerCase();
    if (!requestedSlug) return { status: 'not-found' };

    const row = await db.blogArticle.findFirst({
      where: { profileId: profile.id, publicSlug: requestedSlug },
      select: {
        id: true,
        publicSlug: true,
        status: true,
        scheduledFor: true,
        publishedSnapshot: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    if (row?.publicSlug && isBlogArticlePublic(row)) {
      if (rawSlug !== row.publicSlug) {
        permanentRedirect(blogArticlePath(profile.username, row.publicSlug));
      }
      const article = toPublicArticle(row);
      if (!article) return { status: 'not-found' };
      return { status: 'ok', data: { profile, article } };
    }

    // A previously published URL keeps working after the article slug changes.
    const redirect = await db.blogArticleSlugRedirect.findUnique({
      where: { profileId_slug: { profileId: profile.id, slug: requestedSlug } },
      select: {
        article: {
          select: { publicSlug: true, status: true, scheduledFor: true },
        },
      },
    });

    if (
      redirect?.article.publicSlug &&
      redirect.article.publicSlug !== requestedSlug &&
      isBlogArticlePublic(redirect.article)
    ) {
      permanentRedirect(blogArticlePath(profile.username, redirect.article.publicSlug));
    }

    return { status: 'not-found' };
  },
);
