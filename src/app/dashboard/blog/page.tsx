import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BlogStudio } from '@/components/dashboard/BlogStudio';

export default async function BlogPage() {
  const user = await authService.requireCreator();
  if (!user.profile) redirect('/onboarding');
  const rows = await db.blogArticle.findMany({
    where: { profileId: user.profile.id }, orderBy: [{ updatedAt: 'desc' }],
    select: { id: true, title: true, slug: true, publicSlug: true, excerpt: true, bodyHtml: true, featuredImageUrl: true, featuredImageAlt: true, categories: true, tags: true, authorName: true, authorAvatarUrl: true, seoTitle: true, seoDescription: true, canonicalUrl: true, ogImage: true, noindex: true, status: true, publishedAt: true, scheduledFor: true, updatedAt: true },
  });
  return <BlogStudio username={user.profile.username} initialArticles={rows.map(row => ({ ...row, publishedAt: row.publishedAt?.toISOString() || null, scheduledFor: row.scheduledFor?.toISOString() || null, updatedAt: row.updatedAt.toISOString() }))} />;
}
