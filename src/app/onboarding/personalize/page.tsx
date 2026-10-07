import { authService } from '@/services/auth';
import { getTemplateDetails } from '@/lib/page-engine/template-catalog';
import { redirect, notFound } from 'next/navigation';
import { PersonalizePageForm } from '@/components/onboarding/PersonalizePageForm';

export default async function PersonalizePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const user = await authService.requireUser();
  const { template: templateId } = await searchParams;
  const template = templateId ? getTemplateDetails(templateId) : null;
  if (!user.profile) redirect('/onboarding');
  if (!template || template.category !== user.profile.type) notFound();
  return <PersonalizePageForm templateId={template.id} templateName={template.name} displayName={user.profile.displayName || user.name || ''} bio={user.profile.bio || ''} avatarUrl={user.profile.avatarUrl || user.avatarUrl || ''} />;
}
