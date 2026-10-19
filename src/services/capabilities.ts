import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { redirect } from 'next/navigation';

export function isAffiliateAdmin(userId: string) {
  return (process.env.AFFILIATE_ADMIN_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean).includes(userId);
}

export async function getAccountCapabilities(userId: string) {
  const [profile, application] = await Promise.all([
    db.profile.findUnique({ where: { userId }, select: { id: true } }),
    db.affiliateApplication.findUnique({ where: { userId }, select: { status: true } }),
  ]);
  return {
    creator: Boolean(profile),
    affiliate: application?.status === 'approved',
    applicationStatus: application?.status ?? null,
    admin: isAffiliateAdmin(userId),
  };
}

export async function requireApprovedAffiliate() {
  const user = await authService.requireUser();
  const application = await db.affiliateApplication.findUnique({ where: { userId: user.id }, select: { status: true } });
  if (application?.status !== 'approved') {
    if (application?.status === 'pending' || application?.status === 'rejected' || application?.status === 'suspended') redirect('/affiliate/apply');
    if (user.profile) redirect('/dashboard');
    redirect('/onboarding');
  }
  return user;
}
