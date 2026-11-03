import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import {
  resolveSiteUrl,
  resolveSitemapUrl,
  type SitemapEntry,
} from '@/lib/seo';

/**
 * Sitemaps are generated from the published SEO snapshot on Page. Drafts and
 * noindex pages are filtered in the database, and the home-page relation check
 * prevents an unpublished website from leaking child pages into search.
 */
export const SITEMAP_MAX_URLS = 45_000;
export const SITEMAP_SHARD_SIZE = 10_000;

const sitemapPageWhere = {
  isPublished: true,
  noindex: false,
  profile: {
    is: {
      username: { not: 'demo' },
      user: { is: { suspendedAt: null } },
      pages: {
        some: {
          pageType: 'HOME' as const,
          isPublished: true,
        },
      },
    },
  },
};

export function getStaticSitemapEntries(siteUrl = resolveSiteUrl()): SitemapEntry[] {
  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}

export async function countSitemapPages(): Promise<number> {
  return db.page.count({ where: sitemapPageWhere });
}

export async function getLatestSitemapPageUpdate(): Promise<Date | null> {
  const result = await db.page.aggregate({
    where: sitemapPageWhere,
    _max: { publishedAt: true, updatedAt: true },
  });
  return result._max.publishedAt ?? result._max.updatedAt ?? null;
}

export async function loadSitemapEntries(options: {
  siteUrl?: string;
  skip?: number;
  take?: number;
} = {}): Promise<SitemapEntry[]> {
  const siteUrl = resolveSiteUrl(options.siteUrl);
  const rows = await db.page.findMany({
    where: sitemapPageWhere,
    select: {
      id: true,
      slug: true,
      pageType: true,
      updatedAt: true,
      publishedAt: true,
      canonicalUrl: true,
      profile: {
        select: {
          username: true,
          user: {
            select: {
              createdAt: true,
              trialGrantedAt: true,
              suspendedAt: true,
              subscriptions: {
                orderBy: { updatedAt: 'desc' },
                take: 1,
                select: {
                  planId: true,
                  tier: true,
                  status: true,
                  trialStart: true,
                  trialEnd: true,
                  currentPeriodEnd: true,
                  cancelAtPeriodEnd: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
    skip: Math.max(0, options.skip ?? 0),
    take: Math.min(SITEMAP_MAX_URLS, Math.max(1, options.take ?? SITEMAP_MAX_URLS)),
  });

  const now = new Date();
  const entries: SitemapEntry[] = [];

  for (const row of rows) {
    const entitlement = getSmartPageEntitlement(row.profile.user, now);
    if (entitlement.trialExpired && now > entitlement.publicGraceEndsAt) continue;

    // A page that deliberately canonicalises to another URL is a duplicate.
    // Listing its preferred URL would contradict the canonical tag and could
    // create duplicates across sitemap shards, so the canonical target's own
    // row is the only one that belongs in the sitemap.
    const url = resolveSitemapUrl({
      siteUrl,
      username: row.profile.username,
      slug: row.slug,
      canonicalOverride: row.canonicalUrl,
    });
    if (!url) continue;

    entries.push({
      url,
      lastModified: row.publishedAt ?? row.updatedAt,
      changeFrequency: 'weekly',
      priority: row.pageType === 'HOME' || row.slug === '' ? 0.8 : 0.6,
    });
  }

  return entries;
}

export function getSitemapShardCount(totalPages: number): number {
  return Math.max(1, Math.ceil(totalPages / SITEMAP_SHARD_SIZE));
}
