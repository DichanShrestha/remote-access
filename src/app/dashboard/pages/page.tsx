import { redirect } from 'next/navigation';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { buildPagePath, type WebsitePageType } from '@/lib/page-engine/page-types';
import { PagesClient } from './PagesClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPagesPage() {
  const user = await authService.requireCreator();
  if (!user.profile) redirect('/onboarding');

  const profile = await db.profile.findUnique({
    where: { id: user.profile.id },
    include: {
      pages: { orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!profile) redirect('/onboarding');

  const pages = profile.pages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    pageType: page.pageType as WebsitePageType,
    isPublished: page.isPublished,
    showInNavigation: page.showInNavigation,
    navOrder: page.navOrder,
    updatedAt: page.updatedAt.toISOString(),
    path: buildPagePath(profile.username, page.slug),
  }));

  return (
    <PagesClient
      username={profile.username}
      pages={pages}
      homePageId={profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '')?.id ?? null}
    />
  );
}
