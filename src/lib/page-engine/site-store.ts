import db from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PageDocument, PageDocumentSchema } from './schemas';
import {
  WebsiteConfig,
  extractWebsiteConfig,
  parseWebsiteConfig,
} from './site-config';

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
