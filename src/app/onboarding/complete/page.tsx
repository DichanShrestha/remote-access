import { redirect } from 'next/navigation';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { TrialSuccess } from '@/components/onboarding/TrialSuccess';
import { getPublicOrigin } from '@/lib/public-origin';

export default async function TrialCompletePage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id }, include: { page: true } });
  if (!profile?.page?.isPublished) redirect('/dashboard');
  return <TrialSuccess name={profile.displayName} username={profile.username} domain={new URL(await getPublicOrigin()).host} />;
}
