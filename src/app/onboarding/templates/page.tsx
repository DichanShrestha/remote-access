import { authService } from '@/services/auth';
import { getAvailableTemplates } from '@/lib/page-engine/template-catalog';
import { redirect } from 'next/navigation';
import { TemplateLibrary } from '@/components/onboarding/TemplateLibrary';

export default async function OnboardingTemplates() {
  const user = await authService.requireUser();
  if (!user.profile) redirect('/onboarding');
  const templates = getAvailableTemplates(user.profile.type);
  return <TemplateLibrary category={user.profile.type} templates={templates.map(({ id, name, description, mood }) => ({ id, name, description, mood }))} />;
}
