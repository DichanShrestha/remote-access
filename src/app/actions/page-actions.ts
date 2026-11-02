'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { requirePageAccess } from '@/lib/billing/entitlements';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import {
  buildPagePath,
  isCreatablePageType,
  isPageLayoutForType,
  normalizePageSlug,
  validatePageSlug,
} from '@/lib/page-engine/page-types';
import { buildPageDocument } from '@/lib/page-engine/page-layouts';
import {
  extractWebsiteConfig,
  parseWebsiteConfig,
  toPageContentDocument,
} from '@/lib/page-engine/site-config';
import {
  findHomePage,
  getWebsiteConfig,
  parsePageDocument,
} from '@/lib/page-engine/site-store';

const createPageSchema = z.object({
  pageType: z.string(),
  layoutId: z.string(),
  title: z.string().trim().min(1).max(100).optional(),
  slug: z.string().max(64).optional(),
});

const updatePageSchema = z.object({
  pageId: z.string().min(1),
  title: z.string().trim().min(1).max(100),
  slug: z.string().max(64),
  showInNavigation: z.boolean(),
});

function revalidatePublicPage(username: string, slug: string) {
  revalidatePath(buildPagePath(username, slug));
  revalidatePath(`/${username}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/pages');
  revalidatePath('/sitemap.xml');
}

async function uniqueSlug(tx: Prisma.TransactionClient, profileId: string, base: string, excludePageId?: string): Promise<string> {
  const normalized = normalizePageSlug(base) || 'page';
  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = attempt === 0 ? normalized : `${normalized}-${attempt + 1}`;
    const existing = await tx.page.findFirst({
      where: { profileId, slug: candidate, ...(excludePageId ? { id: { not: excludePageId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `${normalized}-${Date.now().toString(36)}`;
}

export async function createWebsitePage(input: unknown) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const parsedInput = createPageSchema.safeParse(input);
  if (!parsedInput.success) return { error: 'Choose a valid page type and layout.' };

  const { pageType, layoutId, title, slug } = parsedInput.data;
  if (!isCreatablePageType(pageType)) return { error: 'Choose a valid page type.' };
  if (!isPageLayoutForType(pageType, layoutId)) return { error: 'Choose a valid page layout.' };

  const profile = user.profile;
  const home = await findHomePage(profile.id);
  const homeDocument = parsePageDocument(home?.draftConfig);
  const { config: siteConfig } = await getWebsiteConfig(profile.id, 'draft', homeDocument);

  const pageTitle = (title || '').trim() || getDefaultTitle(pageType);
  const requestedSlug = slug !== undefined && slug.trim() !== '' ? slug.trim() : '';
  if (requestedSlug) {
    const validation = validatePageSlug(requestedSlug);
    if (!validation.valid) return { error: validation.error };
  }

  const document = buildPageDocument({
    type: pageType,
    layoutId,
    pageTitle,
    businessName: profile.displayName || profile.username,
    bio: profile.bio,
    siteConfig,
  });

  const validated = PageDocumentSchema.safeParse(document);
  if (!validated.success) return { error: 'We could not prepare this page layout. Please choose another.' };

  try {
    const result = await db.$transaction(async (tx) => {
      const maxOrder = await tx.page.aggregate({
        where: { profileId: profile.id },
        _max: { navOrder: true },
      });

      const finalSlug = requestedSlug
        ? normalizePageSlug(requestedSlug)
        : await uniqueSlug(tx, profile.id, getDefaultSlug(pageType));

      if (requestedSlug) {
        const duplicate = await tx.page.findFirst({
          where: { profileId: profile.id, slug: finalSlug },
          select: { id: true },
        });
        if (duplicate) throw new PageSlugTakenError();
      }

      // A new page using a previously retired URL should own that URL again.
      await tx.pageSlugRedirect.deleteMany({
        where: { profileId: profile.id, slug: finalSlug },
      });

      return tx.page.create({
        data: {
          profileId: profile.id,
          title: pageTitle,
          slug: finalSlug,
          pageType,
          showInNavigation: true,
          navOrder: (maxOrder._max.navOrder ?? -1) + 1,
          draftConfig: toPageContentDocument(validated.data) as unknown as Prisma.InputJsonValue,
        },
      });
    });

    revalidatePath('/dashboard/pages');
    revalidatePath('/dashboard');
    return { success: true, pageId: result.id, slug: result.slug, title: result.title };
  } catch (error) {
    if (error instanceof PageSlugTakenError) return { error: 'That page URL is already in use. Choose another one.' };
    if (isUniqueConstraintError(error)) return { error: 'That page URL is already in use. Choose another one.' };
    console.error('Create page error:', error);
    return { error: 'The page could not be created. Please try again.' };
  }
}

export async function updateWebsitePage(input: unknown) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const parsedInput = updatePageSchema.safeParse(input);
  if (!parsedInput.success) return { error: 'Enter a page title and URL.' };

  const { pageId, title, showInNavigation } = parsedInput.data;
  const page = await db.page.findFirst({
    where: { id: pageId, profileId: user.profile.id },
    select: {
      id: true,
      slug: true,
      pageType: true,
      profile: { select: { username: true } },
    },
  });
  if (!page) return { error: 'Page not found.' };

  const isHome = page.pageType === 'HOME' || page.slug === '';
  let slug = page.slug;
  if (!isHome) {
    const validation = validatePageSlug(parsedInput.data.slug);
    if (!validation.valid) return { error: validation.error };
    slug = validation.slug;
  }

  try {
    await db.$transaction(async (tx) => {
      if (!isHome && slug !== page.slug) {
        const duplicate = await tx.page.findFirst({
          where: { profileId: user.profile!.id, slug, id: { not: page.id } },
          select: { id: true },
        });
        if (duplicate) throw new PageSlugTakenError();

        // The current page always wins over an older redirect for the same URL.
        await tx.pageSlugRedirect.deleteMany({
          where: { profileId: user.profile!.id, slug },
        });

        if (page.slug) {
          await tx.pageSlugRedirect.upsert({
            where: { profileId_slug: { profileId: user.profile!.id, slug: page.slug } },
            create: { profileId: user.profile!.id, pageId: page.id, slug: page.slug },
            update: { pageId: page.id },
          });
        }
      }

      await tx.page.update({
        where: { id: page.id },
        data: {
          title,
          slug,
          showInNavigation,
        },
      });
    });

    revalidatePublicPage(page.profile.username, page.slug);
    if (slug !== page.slug) revalidatePublicPage(page.profile.username, slug);
    return { success: true, slug };
  } catch (error) {
    if (error instanceof PageSlugTakenError || isUniqueConstraintError(error)) {
      return { error: 'That page URL is already in use. Choose another one.' };
    }
    console.error('Update page error:', error);
    return { error: 'The page could not be updated. Please try again.' };
  }
}

export async function publishWebsitePage(pageId: string) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const page = await db.page.findFirst({
    where: { id: pageId, profileId: user.profile.id },
    select: {
      id: true,
      slug: true,
      draftConfig: true,
      profile: { select: { id: true, username: true } },
    },
  });
  if (!page) return { error: 'Page not found.' };

  const document = parsePageDocument(page.draftConfig);
  if (!document) return { error: 'This page needs a valid layout before it can be published.' };

  // The website owns shared theme/header/footer. Publish its latest draft so a
  // page publish can never overwrite another page's shared design.
  const website = await db.website.findUnique({
    where: { profileId: page.profile.id },
    select: { id: true, draftConfig: true },
  });
  const config = parseWebsiteConfig(website?.draftConfig) || extractWebsiteConfig(document);
  const pageContent = toPageContentDocument(document);

  try {
    await db.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: page.id },
        data: {
          publishedConfig: pageContent as unknown as Prisma.InputJsonValue,
          isPublished: true,
        },
      });
      await tx.website.upsert({
        where: { profileId: page.profile.id },
        create: {
          profileId: page.profile.id,
          draftConfig: config as unknown as Prisma.InputJsonValue,
          publishedConfig: config as unknown as Prisma.InputJsonValue,
        },
        update: {
          publishedConfig: config as unknown as Prisma.InputJsonValue,
        },
      });
    });

    revalidatePublicPage(page.profile.username, page.slug);
    return { success: true };
  } catch (error) {
    console.error('Publish page error:', error);
    return { error: 'The page could not be published. Please try again.' };
  }
}

export async function unpublishWebsitePage(pageId: string) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const page = await db.page.findFirst({
    where: { id: pageId, profileId: user.profile.id },
    select: {
      id: true,
      slug: true,
      pageType: true,
      profile: { select: { username: true } },
    },
  });
  if (!page) return { error: 'Page not found.' };
  if (page.pageType === 'HOME' || page.slug === '') {
    return { error: 'The homepage cannot be unpublished. Keep it live so visitors can reach your website.' };
  }

  await db.page.update({ where: { id: page.id }, data: { isPublished: false } });
  revalidatePublicPage(page.profile.username, page.slug);
  return { success: true };
}

export async function deleteWebsitePage(pageId: string) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const page = await db.page.findFirst({
    where: { id: pageId, profileId: user.profile.id },
    select: {
      id: true,
      slug: true,
      pageType: true,
      profile: { select: { username: true } },
    },
  });
  if (!page) return { error: 'Page not found.' };
  if (page.pageType === 'HOME' || page.slug === '') {
    return { error: 'The homepage cannot be deleted.' };
  }

  await db.page.delete({ where: { id: page.id } });
  revalidatePublicPage(page.profile.username, page.slug);
  return { success: true };
}

export async function reorderWebsitePages(orderedIds: string[]) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const ids = [...new Set(orderedIds.filter((id) => typeof id === 'string' && id.length > 0))];
  const pages = await db.page.findMany({
    where: { profileId: user.profile.id, id: { in: ids } },
    select: { id: true, slug: true },
  });
  if (pages.length !== ids.length) return { error: 'One or more pages could not be found.' };

  await db.$transaction(ids.map((id, index) => db.page.update({ where: { id }, data: { navOrder: index } })));
  revalidatePath('/dashboard/pages');
  revalidatePath('/dashboard');
  return { success: true };
}

function getDefaultTitle(pageType: string): string {
  const titles: Record<string, string> = {
    ABOUT: 'About',
    SERVICES: 'Services',
    PRODUCTS: 'Products',
    CONTACT: 'Contact',
    FAQ: 'FAQ',
    GALLERY: 'Gallery',
    BLOG: 'Blog',
    CUSTOM: 'New Page',
  };
  return titles[pageType] || 'New Page';
}

function getDefaultSlug(pageType: string): string {
  const slugs: Record<string, string> = {
    ABOUT: 'about',
    SERVICES: 'services',
    PRODUCTS: 'products',
    CONTACT: 'contact',
    FAQ: 'faq',
    GALLERY: 'gallery',
    BLOG: 'blog',
    CUSTOM: 'page',
  };
  return slugs[pageType] || 'page';
}

class PageSlugTakenError extends Error {}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002');
}
