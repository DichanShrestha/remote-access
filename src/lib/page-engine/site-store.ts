import db from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PageDocument, PageDocumentSchema } from './schemas';
import {
  WebsiteConfig,
  extractWebsiteConfig,
  parseWebsiteConfig,
  toPageContentDocument,
} from './site-config';
import { buildPageDocument } from './page-layouts';
import { getSeoPublishSnapshot } from '@/lib/seo';

export async function findHomePage(profileId: string) {
  return db.page.findFirst({
    where: {
      profileId,
      OR: [{ pageType: 'HOME' }, { slug: '' }],
    },
    orderBy: { createdAt: 'asc' },
  });
}

export function parsePageDocument(value: unknown): PageDocument | null {
  if (!value || typeof value !== 'object') return null;
  const parsed = PageDocumentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Publish template-generated child pages with their homepage so template navigation never points at drafts. */
export async function publishTemplateStarterPages(tx: Prisma.TransactionClient, profileId: string) {
  const candidates = await tx.page.findMany({
    where: { profileId, isPublished: false, pageType: { not: 'HOME' } },
    select: { id: true, slug: true, draftConfig: true },
  });
  const publishedSlugs: string[] = [];

  for (const page of candidates) {
    const document = parsePageDocument(page.draftConfig);
    const titleSection = document?.sections[0];
    if (!titleSection || !('type' in titleSection) || titleSection.id !== `starter-${page.slug}-title`) continue;

    await tx.page.update({
      where: { id: page.id },
      data: {
        publishedConfig: page.draftConfig as Prisma.InputJsonValue,
        isPublished: true,
        publishedAt: new Date(),
        ...getSeoPublishSnapshot(document.settings),
      },
    });
    publishedSlugs.push(page.slug);
  }

  return publishedSlugs;
}

export function fallbackDocument(): PageDocument {
  return PageDocumentSchema.parse({});
}

export async function ensureWebsiteConfig(profileId: string) {
  const existing = await db.website.findUnique({ where: { profileId } });
  if (existing) return existing;

  const home = await findHomePage(profileId);
  const draftDocument = parsePageDocument(home?.draftConfig) || fallbackDocument();
  const publishedDocument = parsePageDocument(home?.publishedConfig);

  return db.website.upsert({
    where: { profileId },
    create: {
      profileId,
      draftConfig: extractWebsiteConfig(draftDocument) as unknown as Prisma.InputJsonValue,
      publishedConfig: publishedDocument
        ? (extractWebsiteConfig(publishedDocument) as unknown as Prisma.InputJsonValue)
        : undefined,
    },
    update: {},
  });
}

export async function getWebsiteConfig(
  profileId: string,
  mode: 'draft' | 'published',
  fallback?: PageDocument | null,
): Promise<{ website: Awaited<ReturnType<typeof ensureWebsiteConfig>> | null; config: WebsiteConfig }> {
  const website = mode === 'draft'
    ? await ensureWebsiteConfig(profileId)
    : await db.website.findUnique({ where: { profileId } });

  const source = mode === 'published' ? website?.publishedConfig : website?.draftConfig;
  const parsed = parseWebsiteConfig(source);
  if (parsed) return { website, config: parsed };

  const document = fallback || fallbackDocument();
  return { website, config: extractWebsiteConfig(document) };
}

export async function saveWebsiteDraft(profileId: string, config: WebsiteConfig) {
  return db.website.upsert({
    where: { profileId },
    create: {
      profileId,
      draftConfig: config as unknown as Prisma.InputJsonValue,
    },
    update: {
      draftConfig: config as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function publishWebsiteDraft(profileId: string) {
  const website = await ensureWebsiteConfig(profileId);
  return db.website.update({
    where: { id: website.id },
    data: { publishedConfig: website.draftConfig as Prisma.InputJsonValue },
  });
}

export async function findBlogPage(profileId: string) {
  return db.page.findFirst({
    where: {
      profileId,
      OR: [{ pageType: 'BLOG' }, { slug: 'blog' }],
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function ensureBlogIndexPage(profileId: string) {
  const existing = await findBlogPage(profileId);
  if (existing) return existing;

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { id: true, displayName: true, username: true, bio: true },
  });
  if (!profile) return null;

  const home = await findHomePage(profileId);
  const homeDocument = parsePageDocument(home?.draftConfig);
  const { config: siteConfig } = await getWebsiteConfig(profileId, 'draft', homeDocument);

  const document = buildPageDocument({
    type: 'BLOG',
    layoutId: 'list',
    pageTitle: 'Blog',
    businessName: profile.displayName || profile.username || 'Our Site',
    bio: profile.bio,
    siteConfig,
  });

  const maxOrder = await db.page.aggregate({
    where: { profileId },
    _max: { navOrder: true },
  });

  return db.page.create({
    data: {
      profileId,
      title: 'Blog',
      slug: 'blog',
      pageType: 'BLOG',
      showInNavigation: true,
      navOrder: (maxOrder._max.navOrder ?? 0) + 1,
      draftConfig: toPageContentDocument(document) as unknown as Prisma.InputJsonValue,
    },
  });
}
