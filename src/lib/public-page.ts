import { cache } from 'react';
import { permanentRedirect } from 'next/navigation';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';
import { PageDocument } from '@/lib/page-engine/schemas';
import { buildPagePath } from '@/lib/page-engine/page-types';
import {
  applyManagedNavigation,
  applyWebsiteConfig,
  getNavigationLinksForPages,
  parseWebsiteConfig,
} from '@/lib/page-engine/site-config';
import { parsePageDocument } from '@/lib/page-engine/site-store';

const pageMetadataSelect = {
  id: true,
  title: true,
  slug: true,
  pageType: true,
  isPublished: true,
  showInNavigation: true,
  navOrder: true,
  botId: true,
  updatedAt: true,
} as const;

export type PublicPageData = {
  profile: {
    id: string;
    username: string;
    displayName: string;
    type: string;
    bio: string | null;
    avatarUrl: string | null;
    user: {
      createdAt: Date;
      trialGrantedAt: Date | null;
      suspendedAt: Date | null;
      subscriptions: Array<{
        planId: string;
        tier: string;
        status: string;
        trialStart: Date | null;
        trialEnd: Date | null;
        currentPeriodEnd: Date | null;
      }>;
    };
  };
  page: {
    id: string;
    title: string;
    slug: string;
    pageType: string;
    updatedAt: Date;
  };
  document: PageDocument;
  unavailable: boolean;
  websitePublished: boolean;
  homeBotId?: string;
};

export type PublicPageLookup =
  | { status: 'ok'; data: PublicPageData }
  | { status: 'not-found' }
  | { status: 'invalid-config' };

export const getPublishedPage = cache(async (rawUsername: string, rawSlug?: string): Promise<PublicPageLookup> => {
  const username = rawUsername.toLowerCase();
  const slug = (rawSlug ?? '').toLowerCase();

  const profile = await db.profile.findUnique({
    where: { username },
    include: {
      website: true,
      pages: {
        select: pageMetadataSelect,
        orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }],
      },
      user: {
        include: {
          subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 },
        },
      },
    },
  });

  if (!profile) return { status: 'not-found' };

  const homeMetadata = profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '');
  const target = slug
    ? profile.pages.find((page) => page.slug === slug)
    : homeMetadata;

  if (target && slug && rawSlug !== target.slug) {
    // Case or formatting variants permanently resolve to the canonical URL.
    permanentRedirect(buildPagePath(profile.username, target.slug));
  }

  if (!target && slug) {
    const oldSlug = await db.pageSlugRedirect.findUnique({
      where: { profileId_slug: { profileId: profile.id, slug } },
      select: { pageId: true },
    });
    if (oldSlug) {
      const redirectTarget = profile.pages.find((page) => page.id === oldSlug.pageId);
      // Tenant-scoped lookup plus the slug comparison prevents redirect loops
      // and guarantees the destination belongs to this business.
      if (redirectTarget?.isPublished && redirectTarget.slug !== slug) {
        permanentRedirect(buildPagePath(profile.username, redirectTarget.slug));
      }
    }
  }

  if (!target?.isPublished) return { status: 'not-found' };

  const page = await db.page.findUnique({
    where: { id: target.id },
    select: {
      id: true,
      title: true,
      slug: true,
      pageType: true,
      publishedConfig: true,
      isPublished: true,
      botId: true,
      updatedAt: true,
    },
  });

  if (!page?.isPublished) return { status: 'not-found' };

  const document = parsePageDocument(page.publishedConfig);
  if (!document) return { status: 'invalid-config' };

  let websiteConfig = parseWebsiteConfig(profile.website?.publishedConfig);
  if (!websiteConfig) {
    if (page.pageType === 'HOME' || page.slug === '') {
      websiteConfig = parseWebsiteConfig(
        // Extract directly from the homepage so existing single-page sites keep
        // their theme, header, and footer without a data migration.
        {
          version: 1,
          theme: document.theme,
          settings: {
            showFooterBranding: document.settings.showFooterBranding,
            enableSmoothScrolling: document.settings.enableSmoothScrolling,
          },
          header: document.sections.find((node) => 'type' in node && node.type === 'site-navbar') || null,
          footer: document.sections.find((node) => 'type' in node && node.type === 'site-footer') || null,
        },
      );
    } else {
      const homePage = homeMetadata
        ? await db.page.findUnique({
            where: { id: homeMetadata.id },
            select: { publishedConfig: true, isPublished: true },
          })
        : null;
      const homeDocument = homePage?.isPublished ? parsePageDocument(homePage.publishedConfig) : null;
      if (homeDocument) {
        websiteConfig = parseWebsiteConfig({
          version: 1,
          theme: homeDocument.theme,
          settings: {
            showFooterBranding: homeDocument.settings.showFooterBranding,
            enableSmoothScrolling: homeDocument.settings.enableSmoothScrolling,
          },
          header: homeDocument.sections.find((node) => 'type' in node && node.type === 'site-navbar') || null,
          footer: homeDocument.sections.find((node) => 'type' in node && node.type === 'site-footer') || null,
        });
      }
    }
  }

  const fallbackConfig = {
    version: 1,
    theme: document.theme,
    settings: {
      showFooterBranding: document.settings.showFooterBranding,
      enableSmoothScrolling: document.settings.enableSmoothScrolling,
    },
    header: null,
    footer: null,
  };
  const resolvedWebsiteConfig = websiteConfig || fallbackConfig;

  const navigation = getNavigationLinksForPages(
    profile.username,
    profile.pages.filter((page) => page.isPublished && page.showInNavigation),
  );

  const renderedDocument = applyManagedNavigation(
    applyWebsiteConfig(document, resolvedWebsiteConfig),
    navigation,
  );

  const entitlement = getSmartPageEntitlement(profile.user);

  return {
    status: 'ok',
    data: {
      profile: {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        type: profile.type,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        user: profile.user,
      },
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        pageType: page.pageType,
        updatedAt: page.updatedAt,
      },
      document: renderedDocument,
      unavailable: entitlement.trialExpired && new Date() > entitlement.publicGraceEndsAt,
      websitePublished: Boolean(homeMetadata?.isPublished) && !profile.user.suspendedAt,
      homeBotId: homeMetadata?.botId || page.botId || undefined,
    },
  };
});
