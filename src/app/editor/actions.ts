"use server";

import db from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { authService } from '@/services/auth';
import { revalidatePath } from 'next/cache';
import { buildPagePath } from '@/lib/page-engine/page-types';
import {
  extractWebsiteConfig,
  toPageContentDocument,
} from '@/lib/page-engine/site-config';
import { getSeoPublishSnapshot } from '@/lib/seo';
import { randomUUID } from 'crypto';
import { storageService } from '@/lib/storage/service';
import { getUserEntitlement, requirePageAccess } from '@/lib/billing/entitlements';

export async function removeUnusedPageMedia(userId: string, profileId: string) {
  const [pages, website, articles] = await Promise.all([
    db.page.findMany({
      where: { profileId },
      select: { draftConfig: true, publishedConfig: true },
    }),
    db.website.findUnique({
      where: { profileId },
      select: { draftConfig: true, publishedConfig: true },
    }),
    db.blogArticle.findMany({
      where: { profileId },
      select: {
        bodyHtml: true,
        featuredImageUrl: true,
        featuredImageAlt: true,
        authorAvatarUrl: true,
        ogImage: true,
        publishedSnapshot: true,
      },
    }),
  ]);

  const used = new Set<string>();
  const collect = (value: unknown) => {
    if (typeof value === 'string') for (const match of value.matchAll(/\/api\/media\/([A-Za-z0-9_-]+)/g)) used.add(match[1]);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };

  for (const page of pages) {
    collect(page.draftConfig);
    collect(page.publishedConfig);
  }
  if (website) {
    collect(website.draftConfig);
    collect(website.publishedConfig);
  }
  for (const article of articles) collect(article);

  const assets = await db.pageMediaAsset.findMany({ where: { userId } });
  const unused = assets.filter((asset) => !used.has(asset.id));
  if (!unused.length) return;
  await storageService.delete(unused.map((asset) => ({ bucket: asset.bucket, key: asset.objectKey })));
  await db.$transaction([
    db.pageMediaAsset.deleteMany({ where: { id: { in: unused.map((asset) => asset.id) } } }),
    db.usage.updateMany({ where: { userId }, data: { pageMediaBytes: { decrement: unused.reduce((sum, asset) => sum + asset.sizeBytes, BigInt(0)) } } }),
  ]);
  revalidatePath('/dashboard/settings');
}

function revalidatePublicPage(username: string, slug: string) {
  revalidatePath(buildPagePath(username, slug));
  revalidatePath(`/${username}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/pages');
  revalidatePath('/sitemap.xml');
}

export async function uploadPageMedia(formData: FormData) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('Choose an image to upload.');
  const maxFileBytes = 10 * 1024 * 1024;
  const totalBytes = 250 * 1024 * 1024;
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > maxFileBytes) throw new Error('Images must be 10 MB or smaller.');
  if (file.size <= 0) throw new Error('The image is empty.');
  await db.usage.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
  const reserved = await db.$executeRaw`
    UPDATE "Usage" SET "pageMediaBytes" = "pageMediaBytes" + ${BigInt(file.size)}
    WHERE "userId" = ${user.id}::uuid AND "pageMediaBytes" + ${BigInt(file.size)} <= ${BigInt(totalBytes)}
  `;
  if (!reserved) throw new Error('Your page image storage is full. Delete an unused image before uploading another.');
  const bucket = 'smart-page-assets';
  const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'img';
  const objectKey = `${user.id}/${randomUUID()}.${extension}`;
  try {
    await storageService.upload({ bucket, key: objectKey, size: file.size, contentType: file.type }, file);
    const asset = await db.pageMediaAsset.create({ data: { userId: user.id, bucket, objectKey, sizeBytes: BigInt(file.size), contentType: file.type } });
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    return { publicUrl: `/api/media/${asset.id}`, objectKey };
  } catch (error) {
    await db.usage.update({ where: { userId: user.id }, data: { pageMediaBytes: { decrement: BigInt(file.size) } } });
    try { await storageService.delete([{ bucket, key: objectKey }]); } catch {}
    revalidatePath('/dashboard/settings');
    throw error;
  }
}

export async function saveDraftConfig(pageId: string, rawConfig: unknown) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);

  // Basic validation before saving
  const parsed = PageDocumentSchema.safeParse(rawConfig);
  if (!parsed.success) {
    throw new Error('Invalid page configuration');
  }

  // Ensure this page belongs to the user
  const page = await db.page.findUnique({
    where: { id: pageId },
    include: { profile: true }
  });

  if (!page || page.profile.userId !== user.id) {
    throw new Error('Unauthorized');
  }

  const pageContent = toPageContentDocument(parsed.data);
  const siteConfig = extractWebsiteConfig(parsed.data);

  await db.$transaction(async (tx) => {
    await tx.page.update({
      where: { id: pageId },
      data: {
        draftConfig: pageContent as unknown as Prisma.InputJsonValue,
      }
    });
    await tx.website.upsert({
      where: { profileId: page.profileId },
      create: {
        profileId: page.profileId,
        draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
      },
      update: {
        draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
      },
    });
  });
  await removeUnusedPageMedia(user.id, page.profileId);

  return { success: true };
}

export async function publishDraftConfig(pageId: string, rawConfig: unknown) {
  const user = await authService.requireCreator();
  const { entitlement } = await getUserEntitlement(user.id);
  const parsed = PageDocumentSchema.safeParse(rawConfig);
  if (!parsed.success) throw new Error('Invalid page configuration');

  const page = await db.page.findUnique({
    where: { id: pageId },
    include: { profile: true },
  });
  if (!page || page.profile.userId !== user.id) throw new Error('Unauthorized');

  const pageContent = toPageContentDocument(parsed.data);
  const siteConfig = extractWebsiteConfig(parsed.data);
  const seoSnapshot = getSeoPublishSnapshot(parsed.data.settings);
  const isHome = page.pageType === 'HOME' || page.slug === '';

  const saveDrafts = async () => {
    await db.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: page.id },
        data: { draftConfig: pageContent as unknown as Prisma.InputJsonValue },
      });
      await tx.website.upsert({
        where: { profileId: page.profileId },
        create: {
          profileId: page.profileId,
          draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
        },
        update: {
          draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
        },
      });
    });
  };

  if (entitlement.trialExpired) {
    await saveDrafts();
    return { redirectTo: '/dashboard/billing' };
  }
  const onboardingComplete = entitlement.onTrial || entitlement.paidActive;

  if (onboardingComplete) {
    await db.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: page.id },
        data: {
          draftConfig: pageContent as unknown as Prisma.InputJsonValue,
          publishedConfig: pageContent as unknown as Prisma.InputJsonValue,
          isPublished: true,
          publishedAt: new Date(),
          ...seoSnapshot,
        },
      });
      await tx.website.upsert({
        where: { profileId: page.profileId },
        create: {
          profileId: page.profileId,
          draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
          publishedConfig: siteConfig as unknown as Prisma.InputJsonValue,
        },
        update: {
          draftConfig: siteConfig as unknown as Prisma.InputJsonValue,
          publishedConfig: siteConfig as unknown as Prisma.InputJsonValue,
        },
      });
    });
    await removeUnusedPageMedia(user.id, page.profileId);
    revalidatePublicPage(page.profile.username, page.slug);
    return { redirectTo: isHome ? '/dashboard' : '/dashboard/pages' };
  }

  await saveDrafts();
  return { redirectTo: '/onboarding/plan' };
}
