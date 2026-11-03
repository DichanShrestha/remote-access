import { redirect } from 'next/navigation';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { buildPagePath, type WebsitePageType } from '@/lib/page-engine/page-types';
import { ensureBlogIndexPage } from '@/lib/page-engine/site-store';
import { PagesClient } from './PagesClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPagesPage() {
  const user = await authService.requireCreator();
  if (!user.profile) redirect('/onboarding');

  await ensureBlogIndexPage(user.profile.id);

  const [profile, blogArticles] = await Promise.all([
    db.profile.findUnique({
      where: { id: user.profile.id },
      include: {
        pages: { orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    }),
    db.blogArticle.findMany({
      where: { profileId: user.profile.id },
      orderBy: [{ updatedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

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

  const articles = blogArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED',
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <PagesClient
      username={profile.username}
      pages={pages}
      articles={articles}
      homePageId={profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '')?.id ?? null}
    />
  );
}
