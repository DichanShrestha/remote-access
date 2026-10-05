import { TEMPLATES_MAP } from '@/lib/page-engine/templates';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { notFound } from 'next/navigation';

/**
 * Lightweight preview route for templates.
 * Loaded inside an iframe so scroll-based effects (zoom reveal, parallax)
 * get their own viewport and behave identically to the published page.
 */
export default async function TemplatePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const templateId = params.id;

  if (!templateId || !TEMPLATES_MAP[templateId]) {
    notFound();
  }

  const doc = TEMPLATES_MAP[templateId];

  return <PageRenderer document={doc} isPreview={false} />;
}
