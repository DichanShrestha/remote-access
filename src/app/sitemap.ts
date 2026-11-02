import type { MetadataRoute } from 'next';
import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await db.profile.findMany({
    where: { pages: { some: { isPublished: true } } },
    select: {
      username: true,
      pages: {
        where: { isPublished: true },
        orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }],
        select: { slug: true, pageType: true, updatedAt: true },
      },
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
      .flatMap(({ username, pages }) =>
        pages.map((page) => {
          const base = `https://pageory.app/${encodeURIComponent(username)}`;
          const isHome = page.pageType === 'HOME' || page.slug === '';
          return {
            url: isHome ? base : `${base}/${encodeURIComponent(page.slug)}`,
            lastModified: page.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: isHome ? 0.7 : 0.6,
          };
        }),
      ),
  ];
}
