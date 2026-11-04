import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { getAvailableTemplates, getTemplateDetails } from '@/lib/page-engine/template-catalog';
import { parseWebsiteConfig } from '@/lib/page-engine/site-config';
import { parsePageDocument } from '@/lib/page-engine/site-store';
import {
  detectTemplateId,
  templateCategoryForProfile,
} from '@/lib/page-engine/template-switch';
import { redirect } from 'next/navigation';
import { TemplatesClient } from './TemplatesClient';

export default async function DashboardTemplatesPage() {
  const user = await authService.requireUser();
  if (!user.profile) redirect('/onboarding');

  const profile = await db.profile.findUnique({
    where: { id: user.profile.id },
    include: {
      pages: { orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }] },
      website: { select: { draftConfig: true } },
    },
  });
  if (!profile) redirect('/onboarding');

  const home = profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '');
  const storedTemplateId = parseWebsiteConfig(profile.website?.draftConfig)?.templateId;
  const currentTemplateId =
    (storedTemplateId && getTemplateDetails(storedTemplateId) ? storedTemplateId : null) ||
    detectTemplateId(
      home ? parsePageDocument(home.draftConfig) : null,
      profile.pages.map((page) => ({
        slug: page.slug,
        pageType: page.pageType,
        draftDocument: parsePageDocument(page.draftConfig),
      })),
    );
  const currentTemplate = currentTemplateId ? getTemplateDetails(currentTemplateId) : null;
  const compatibleCategory =
    currentTemplate?.category ?? templateCategoryForProfile(profile.type);
  const managedPageCount = profile.pages.filter(
    (page) => page.pageType !== 'CUSTOM' && page.showInNavigation,
  ).length;

  // Browse every template, but the apply button only enables designs that
  // share this website's category so business and creator structures never mix.
  const allTemplates = getAvailableTemplates();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#292A25] mb-2 font-serif">
          Templates
        </h1>
        <p className="text-[#777970] text-[15px]">
          Change the design of your entire website. Your content, pages, blog posts, URLs, SEO, leads, and analytics are preserved.
        </p>
      </div>

      <TemplatesClient
        templates={allTemplates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          mood: t.mood,
          category: t.category
        }))}
        currentTemplateId={currentTemplateId}
        currentTemplateName={currentTemplate?.name ?? null}
        compatibleCategory={compatibleCategory}
        managedPageCount={managedPageCount}
      />
    </div>
  );
}
