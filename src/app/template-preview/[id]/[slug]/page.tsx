import { PageRenderer } from '@/components/page-render/PageRenderer';
import { getTemplatePreview } from '@/lib/page-engine/template-preview';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Path-based preview route for a template's secondary page, e.g.
 * /template-preview/corporate-consulting/services.
 * Using a real URL keeps preview navigation out of homepage anchor jumps.
 */
export default async function TemplatePreviewChildPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const preview = getTemplatePreview(id, slug);
  if (!preview?.page) notFound();

  return <PageRenderer document={preview.document} isPreview={false} />;
}
