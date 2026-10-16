'use server';

import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getTemplateDetails, getAvailableTemplates } from '@/lib/page-engine/template-catalog';
import { PageDocument, PageSection, GroupNode, PageNode } from '@/lib/page-engine/schemas';
import { isGroup } from '@/lib/page-engine/operations';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requirePageAccess } from '@/lib/billing/entitlements';

export async function getAvailableTemplatesForClient() {
  const templates = getAvailableTemplates();
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

export async function applyTemplateToPage(templateId: string) {
  const user = await authService.requireUser();
  await requirePageAccess(user.id);
  if (!user.profile) throw new Error('Profile not found');

  const page = await db.page.findUnique({ where: { profileId: user.profile.id } });
  if (!page || !page.draftConfig) throw new Error('Page not found');

  const mergedDoc = await mergeTemplateContent(page.draftConfig as unknown as PageDocument, templateId);

  await db.page.update({
    where: { id: page.id },
    data: { draftConfig: mergedDoc as any }
  });

  revalidatePath('/dashboard');
  revalidatePath('/editor');
  redirect('/editor');
}

export async function previewTemplate(oldDoc: PageDocument, templateId: string): Promise<PageDocument> {
  const user = await authService.requireUser();
  if (!user.profile) throw new Error('Profile not found');
  return await mergeTemplateContent(oldDoc, templateId);
}
