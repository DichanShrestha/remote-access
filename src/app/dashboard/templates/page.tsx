import { authService } from '@/services/auth';
import { getAvailableTemplates } from '@/lib/page-engine/template-catalog';
import { redirect } from 'next/navigation';
import { TemplatesClient } from './TemplatesClient';

export default async function DashboardTemplatesPage() {
  const user = await authService.requireUser();
  if (!user.profile) redirect('/onboarding');
  
  // Show all templates regardless of the user's selected category.
  const allTemplates = getAvailableTemplates();
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#292A25] mb-2 font-serif">
          Templates
        </h1>
        <p className="text-[#777970] text-[15px]">
          Change your page's visual design. Your content, leads, and analytics will be preserved.
        </p>
      </div>

      <TemplatesClient templates={allTemplates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        mood: t.mood,
        category: t.category
      }))} />
    </div>
  );
}
