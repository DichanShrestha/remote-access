import { PageRenderer } from '@/components/page-render/PageRenderer';
import { getTemplatePreview } from '@/lib/page-engine/template-preview';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Lightweight preview route for templates.
 * Loaded inside an iframe so scroll-based effects (zoom reveal, parallax)
 * get their own viewport and behave identically to the published page.
 */
export default async function TemplatePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; page?: string }>;
}) {
  const params = await searchParams;
  const templateId = params.id;

  if (!templateId) notFound();

  const preview = getTemplatePreview(templateId, params.page);
  if (!preview) notFound();

  return <PageRenderer document={preview.document} isPreview={false} />;
}
