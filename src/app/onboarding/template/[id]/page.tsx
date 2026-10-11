import { notFound } from 'next/navigation';
import { authService } from '@/services/auth';
import { getTemplateDetails } from '@/lib/page-engine/template-catalog';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { TemplateShowcase } from '@/components/onboarding/TemplateShowcase';

export default async function OnboardingTemplatePreview({ params }: { params: Promise<{ id: string }> }) {
  await authService.requireUser();
  const { id } = await params;
  const template = getTemplateDetails(id);
  if (!template) notFound();
  return <TemplateShowcase templateId={id} name={template.name} category={template.category} description={template.description} preview={<PageRenderer document={template.document} isPreview />} />;
}
