import { authService } from '@/services/auth';
import { getTemplateDetails } from '@/lib/page-engine/template-catalog';
import { redirect, notFound } from 'next/navigation';
import { PersonalizePageForm } from '@/components/onboarding/PersonalizePageForm';
import { getPublicOrigin } from '@/lib/public-origin';

export default async function PersonalizePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const user = await authService.requireUser();
  const { template: templateId } = await searchParams;
  const template = templateId ? getTemplateDetails(templateId) : null;
  if (!user.profile) redirect('/onboarding');
  if (!template) notFound();
  return <PersonalizePageForm templateId={template.id} templateName={template.name} displayName={user.profile.displayName || user.name || ''} username={user.profile.username} domain={new URL(await getPublicOrigin()).host} />;
}
