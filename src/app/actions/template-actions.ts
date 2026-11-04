'use server';

import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getTemplateDetails, getAvailableTemplates } from '@/lib/page-engine/template-catalog';
import { PageDocument, PageSection, PageNode } from '@/lib/page-engine/schemas';
import { isGroup } from '@/lib/page-engine/operations';
import { revalidatePath } from 'next/cache';
import { requirePageAccess } from '@/lib/billing/entitlements';
import type { Prisma } from '@prisma/client';
import { parseWebsiteConfig } from '@/lib/page-engine/site-config';
import { parsePageDocument } from '@/lib/page-engine/site-store';
import {
  TemplateSwitchError,
  detectTemplateId,
  planTemplateSwitch,
  templateCategoryForProfile,
  type TemplateSwitchPage,
} from '@/lib/page-engine/template-switch';
import {
  createTemplateSwitchSnapshot,
  restoreTemplateSwitchSnapshot,
} from '@/lib/page-engine/template-switch-store';

export type ApplyTemplateResult =
  | {
      ok: true;
      templateId: string;
      updatedPages: number;
      createdPages: number;
      preservedPages: number;
      snapshotId: string;
    }
  | { ok: false; error: string };

export async function getAvailableTemplatesForClient() {
  let category: 'CREATOR' | 'BUSINESS' | undefined;
  try {
    const user = await authService.requireCreator();
    if (user.profile) category = templateCategoryForProfile(user.profile.type);
  } catch {
    // The editor preview is also used for demo pages without a profile.
  }
  const templates = getAvailableTemplates(category);
  return templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    mood: t.mood,
    category: t.category
  }));
}


export async function mergeTemplateContent(oldDoc: PageDocument, templateId: string): Promise<PageDocument> {
  const template = getTemplateDetails(templateId);
  if (!template) throw new Error('Template not found');

  const mergedDoc = structuredClone(template.document) as PageDocument;

  const oldSections: PageSection[] = [];
  const traverse = (nodes: PageNode[]) => {
    for (const node of nodes) {
      if (isGroup(node)) traverse(node.children);
      else oldSections.push(node as PageSection);
    }
  };
  traverse(oldDoc.sections);

  const usedOldSectionIds = new Set<string>();

  const traverseMerge = (nodes: PageNode[]) => {
    for (const node of nodes) {
      if (isGroup(node)) {
        traverseMerge(node.children);
      } else {
        const section = node as PageSection;
        const match = oldSections.find(s => s.type === section.type && !usedOldSectionIds.has(s.id));
        if (match && match.content) {
          // Keep template-specific hero defaults (for example, a hero photo strip)
          // when the user's previous hero doesn't define those fields.
          section.content = section.type === 'hero'
            ? { ...structuredClone(section.content), ...structuredClone(match.content) }
            : structuredClone(match.content);
          usedOldSectionIds.add(match.id);
        }
      }
    }
  };
  traverseMerge(mergedDoc.sections);

  return mergedDoc;
}

/**
 * Switch the entire website — homepage plus every template-managed secondary
 * page — to a new template. Customer content, URLs, SEO, custom pages, and
 * blog articles are preserved. A snapshot is written first and the switch runs
 * in one transaction so a partial failure restores the previous site.
 */
export async function applyTemplateToPage(templateId: string): Promise<ApplyTemplateResult> {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { ok: false, error: 'Your profile is not ready yet.' };

  const profile = await db.profile.findUnique({
    where: { id: user.profile.id },
    include: {
      pages: { orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }] },
      website: true,
    },
  });
  if (!profile) return { ok: false, error: 'Your profile is not ready yet.' };

  const home = profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '');
  const pages: TemplateSwitchPage[] = profile.pages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    pageType: page.pageType,
    navOrder: page.navOrder,
    showInNavigation: page.showInNavigation,
    draftDocument: parsePageDocument(page.draftConfig),
    publishedDocument: parsePageDocument(page.publishedConfig),
  }));

  const websiteConfig = parseWebsiteConfig(profile.website?.draftConfig);
  const currentTemplateId =
    websiteConfig?.templateId ||
    detectTemplateId(home ? parsePageDocument(home.draftConfig) : null, pages);

  let plan;
  try {
    plan = planTemplateSwitch({
      templateId,
      profileType: templateCategoryForProfile(profile.type),
      currentTemplateId,
      websiteConfig,
      pages,
      homePageId: home?.id ?? null,
    });
  } catch (error) {
    if (error instanceof TemplateSwitchError) return { ok: false, error: error.message };
    console.error('Template switch planning failed:', error);
    return { ok: false, error: 'The template could not be applied. Please try again.' };
  }

  const snapshot = await createTemplateSwitchSnapshot(
    profile.id,
    plan,
    profile.pages.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      pageType: page.pageType,
      showInNavigation: page.showInNavigation,
      navOrder: page.navOrder,
      draftConfig: page.draftConfig,
      publishedConfig: page.publishedConfig,
      isPublished: page.isPublished,
      publishedAt: page.publishedAt,
      canonicalUrl: page.canonicalUrl,
      noindex: page.noindex,
    })),
    profile.website
      ? {
          draftConfig: profile.website.draftConfig,
          publishedConfig: profile.website.publishedConfig,
        }
      : null,
  );

  try {
    await db.$transaction(async (tx) => {
      for (const update of plan.updates) {
        const source = profile.pages.find((page) => page.id === update.pageId);
        const publishedDocument = update.publishedDocument
          || (source?.isPublished ? update.draftDocument : null);

        await tx.page.update({
          where: { id: update.pageId },
          data: {
            title: update.title,
            ...(update.pageType ? { pageType: update.pageType as never } : {}),
            draftConfig: update.draftDocument as unknown as Prisma.InputJsonValue,
            ...(source?.isPublished && publishedDocument
              ? {
                  publishedConfig: publishedDocument as unknown as Prisma.InputJsonValue,
                  publishedAt: source.publishedAt ?? new Date(),
                }
              : {}),
          },
        });
      }

      for (const create of plan.creates) {
        await tx.page.create({
          data: {
            profileId: profile.id,
            title: create.title,
            slug: create.slug,
            pageType: create.pageType as never,
            showInNavigation: true,
            navOrder: create.navOrder,
            draftConfig: create.draftDocument as unknown as Prisma.InputJsonValue,
          },
        });
      }

      await tx.website.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          draftConfig: plan.websiteConfig as unknown as Prisma.InputJsonValue,
          ...(profile.website?.publishedConfig
            ? { publishedConfig: plan.websiteConfig as unknown as Prisma.InputJsonValue }
            : {}),
        },
        update: {
          draftConfig: plan.websiteConfig as unknown as Prisma.InputJsonValue,
          ...(profile.website?.publishedConfig
            ? { publishedConfig: plan.websiteConfig as unknown as Prisma.InputJsonValue }
            : {}),
        },
      });
    });
  } catch (error) {
    console.error('Template switch failed; restoring snapshot:', error);
    try {
      await restoreTemplateSwitchSnapshot(snapshot.id, profile.id);
    } catch (restoreError) {
      console.error('Template switch snapshot restore failed:', restoreError);
    }
    return {
      ok: false,
      error: 'The template could not be applied. Your previous website was restored.',
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/pages');
  revalidatePath('/dashboard/templates');
  revalidatePath('/editor');
  revalidatePath(`/${profile.username}`);
  revalidatePath('/sitemap.xml');
  for (const page of profile.pages) {
    revalidatePath(page.slug ? `/${profile.username}/${page.slug}` : `/${profile.username}`);
  }

  return {
    ok: true,
    templateId: plan.templateId,
    updatedPages: plan.updates.length,
    createdPages: plan.creates.length,
    preservedPages: plan.preservedPageIds.length,
    snapshotId: snapshot.id,
  };
}

export async function previewTemplate(oldDoc: PageDocument, templateId: string): Promise<PageDocument> {
  const user = await authService.requireCreator();
  if (!user.profile) throw new Error('Profile not found');
  return await mergeTemplateContent(oldDoc, templateId);
}
