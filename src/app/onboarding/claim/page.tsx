import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ClaimUsername } from '@/components/onboarding/ClaimUsername';
import { getPublicOrigin } from '@/lib/public-origin';

export default async function ClaimUsernamePage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile?.page) redirect('/onboarding');
  if (profile.page.isPublished) redirect('/dashboard');
  if (!profile.page.draftConfig || !Object.keys(profile.page.draftConfig as object).length) redirect('/onboarding');
  return <ClaimUsername currentUsername={profile.username} domain={new URL(await getPublicOrigin()).host} />;
}
