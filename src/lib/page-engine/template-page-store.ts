import 'server-only';
import type { Prisma } from '@prisma/client';
import { PageDocument, PageDocumentSchema } from './schemas';
import { buildTemplatePages } from './template-pages';
import { toPageContentDocument } from './site-config';

/** Add only missing starter pages; never replace a customer's existing page. */
export async function ensureTemplateStarterPages(
  tx: Prisma.TransactionClient,
  profileId: string,
  templateId: string,
  document: PageDocument,
) {
  const { starterPages } = buildTemplatePages(templateId, document);
  if (!starterPages.length) return;

  const existing = await tx.page.findMany({
    where: { profileId },
    select: { slug: true, navOrder: true },
  });
  const existingSlugs = new Set(existing.map((page) => page.slug));
  let navOrder = Math.max(-1, ...existing.map((page) => page.navOrder)) + 1;

  for (const starter of starterPages) {
    if (existingSlugs.has(starter.slug)) continue;
    const pageDocument = PageDocumentSchema.parse({ ...document, sections: starter.sections });
    await tx.page.create({
      data: {
        profileId,
        title: starter.title,
        slug: starter.slug,
        pageType: starter.pageType,
        showInNavigation: true,
        navOrder: navOrder++,
        draftConfig: toPageContentDocument(pageDocument) as unknown as Prisma.InputJsonValue,
      },
    });
    existingSlugs.add(starter.slug);
  }
}
