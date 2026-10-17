import type { MetadataRoute } from 'next';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await db.profile.findMany({
    where: { page: { is: { isPublished: true } } },
    select: {
      username: true,
      page: { select: { updatedAt: true } },
      user: {
        select: {
          createdAt: true,
          trialGrantedAt: true,
          subscriptions: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: { planId: true, tier: true, status: true, trialStart: true, trialEnd: true, currentPeriodEnd: true },
          },
        },
      },
    },
  });
  const now = new Date();
  const indexableProfiles = profiles.filter(({ user }) => {
    const entitlement = getSmartPageEntitlement(user, now);
    return !entitlement.trialExpired || now <= entitlement.publicGraceEndsAt;
  });

  return [
    { url: 'https://pageory.app/', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://pageory.app/privacy', changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://pageory.app/terms', changeFrequency: 'monthly', priority: 0.3 },
    ...indexableProfiles
      .filter(({ username }) => username.toLowerCase() !== 'demo')
      .map(({ username, page }) => ({
        url: `https://pageory.app/${encodeURIComponent(username)}`,
        lastModified: page?.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
  ];
}
