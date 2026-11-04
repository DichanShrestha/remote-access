import 'server-only';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import db from '@/lib/prisma';
import type { TemplateSwitchPlan } from './template-switch';

const snapshotPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  pageType: z.string(),
  showInNavigation: z.boolean(),
  navOrder: z.number(),
  draftConfig: z.unknown(),
  publishedConfig: z.unknown().nullable().optional(),
  isPublished: z.boolean(),
  publishedAt: z.coerce.date().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  noindex: z.boolean(),
});

const snapshotPagesSchema = z.array(snapshotPageSchema);

export type SnapshotSourcePage = {
  id: string;
  title: string;
  slug: string;
  pageType: string;
  showInNavigation: boolean;
  navOrder: number;
  draftConfig: unknown;
  publishedConfig: unknown;
  isPublished: boolean;
  publishedAt: Date | null;
  canonicalUrl: string | null;
  noindex: boolean;
};

export async function createTemplateSwitchSnapshot(
  profileId: string,
  plan: TemplateSwitchPlan,
  pages: SnapshotSourcePage[],
  website: { draftConfig: unknown; publishedConfig: unknown } | null,
) {
  return db.templateSwitchSnapshot.create({
    data: {
      profileId,
      fromTemplateId: plan.previousTemplateId,
      toTemplateId: plan.templateId,
      websiteConfig: (website?.draftConfig ?? {}) as Prisma.InputJsonValue,
      publishedWebsiteConfig: website?.publishedConfig
        ? (website.publishedConfig as Prisma.InputJsonValue)
        : undefined,
      pages: pages as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });
}

/** Restore the exact website and page configuration captured before a switch. */
export async function restoreTemplateSwitchSnapshot(snapshotId: string, profileId: string) {
  const snapshot = await db.templateSwitchSnapshot.findFirst({
    where: { id: snapshotId, profileId },
  });
  if (!snapshot) return { restored: false as const };

  const pages = snapshotPagesSchema.parse(snapshot.pages);

  await db.$transaction(async (tx) => {
    const website = await tx.website.findUnique({ where: { profileId }, select: { id: true } });
    if (website) {
      await tx.website.update({
        where: { profileId },
        data: {
          draftConfig: snapshot.websiteConfig as Prisma.InputJsonValue,
          publishedConfig: snapshot.publishedWebsiteConfig
            ? (snapshot.publishedWebsiteConfig as Prisma.InputJsonValue)
            : Prisma.DbNull,
        },
      });
    } else {
      await tx.website.create({
        data: {
          profileId,
          draftConfig: snapshot.websiteConfig as Prisma.InputJsonValue,
          publishedConfig: snapshot.publishedWebsiteConfig
            ? (snapshot.publishedWebsiteConfig as Prisma.InputJsonValue)
            : undefined,
        },
      });
    }

    for (const page of pages) {
      await tx.page.upsert({
        where: { id: page.id },
        create: {
          id: page.id,
          profileId,
          title: page.title,
          slug: page.slug,
          pageType: page.pageType as never,
          showInNavigation: page.showInNavigation,
          navOrder: page.navOrder,
          draftConfig: page.draftConfig as Prisma.InputJsonValue,
          publishedConfig: page.publishedConfig
            ? (page.publishedConfig as Prisma.InputJsonValue)
            : Prisma.DbNull,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt ?? null,
          canonicalUrl: page.canonicalUrl ?? null,
          noindex: page.noindex,
        },
        update: {
          title: page.title,
          slug: page.slug,
          pageType: page.pageType as never,
          showInNavigation: page.showInNavigation,
          navOrder: page.navOrder,
          draftConfig: page.draftConfig as Prisma.InputJsonValue,
          publishedConfig: page.publishedConfig
            ? (page.publishedConfig as Prisma.InputJsonValue)
            : Prisma.DbNull,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt ?? null,
          canonicalUrl: page.canonicalUrl ?? null,
          noindex: page.noindex,
        },
      });
    }
  });

  return { restored: true as const };
}
