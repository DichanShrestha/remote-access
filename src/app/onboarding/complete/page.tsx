import { redirect } from 'next/navigation';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { TrialSuccess } from '@/components/onboarding/TrialSuccess';
import { getPublicOrigin } from '@/lib/public-origin';
import { findHomePage } from '@/lib/page-engine/site-store';

export default async function TrialCompletePage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect('/dashboard');
  const home = await findHomePage(profile.id);
  if (!home?.isPublished) redirect('/dashboard');
  return <TrialSuccess name={profile.displayName} username={profile.username} domain={new URL(await getPublicOrigin()).host} />;
}
