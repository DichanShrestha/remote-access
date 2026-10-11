import { notFound } from 'next/navigation';
import { authService } from '@/services/auth';
import { getTemplateDetails } from '@/lib/page-engine/template-catalog';
import { TemplateShowcase } from '@/components/onboarding/TemplateShowcase';

export default async function OnboardingTemplatePreview({ params }: { params: Promise<{ id: string }> }) {
  try {
    await authService.requireUser();
  } catch {
    // Allow previewing templates gracefully
  }
  const { id } = await params;
  const template = getTemplateDetails(id);
  if (!template) notFound();

  return (
    <TemplateShowcase
      templateId={id}
      name={template.name}
      category={template.category}
      description={template.description}
      preview={
        <iframe
          src={`/template-preview?id=${id}`}
          className="w-full h-full border-0 bg-white"
          title={`${template.name} live preview`}
        />
      }
    />
  );
}
