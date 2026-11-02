'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { authService } from '@/services/auth';
import { requirePageAccess } from '@/lib/billing/entitlements';
import {
  blogArticlePath,
  blogListingPath,
} from '@/lib/blog';
import {
  createBlogArticle as createBlogArticleRecord,
  deleteBlogArticle as deleteBlogArticleRecord,
  publishBlogArticle as publishBlogArticleRecord,
  saveBlogArticle as saveBlogArticleRecord,
  unpublishBlogArticle as unpublishBlogArticleRecord,
} from '@/lib/blog-service';
import { removeUnusedPageMedia } from '@/app/editor/actions';

const saveArticleSchema = z.object({
  articleId: z.string().min(1),
  title: z.string().max(140),
  slug: z.string().max(80),
  excerpt: z.string().max(320).optional().default(''),
  bodyHtml: z.string().max(400_000),
  featuredImageUrl: z.string().max(2000).nullable().optional(),
  featuredImageAlt: z.string().max(300).nullable().optional(),
  categories: z.array(z.string().max(40)).max(8).optional().default([]),
  tags: z.array(z.string().max(40)).max(20).optional().default([]),
  authorName: z.string().max(120).optional().default(''),
  authorAvatarUrl: z.string().max(2000).nullable().optional(),
  seoTitle: z.string().max(120).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  canonicalUrl: z.string().max(2000).nullable().optional(),
  ogImage: z.string().max(2000).nullable().optional(),
  noindex: z.boolean().optional().default(false),
});

function revalidateArticlePaths(
  username: string,
  article: { slug: string; publicSlug?: string | null },
  previousPublicSlug?: string | null,
) {
  revalidatePath(blogListingPath(username));
  revalidatePath('/dashboard/blog');
  if (article.publicSlug) revalidatePath(blogArticlePath(username, article.publicSlug));
  if (article.slug) revalidatePath(blogArticlePath(username, article.slug));
  if (previousPublicSlug) revalidatePath(blogArticlePath(username, previousPublicSlug));
}

export async function createBlogArticleAction() {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  try {
    const result = await createBlogArticleRecord(user.profile.id);
    if (!result.ok) return { error: result.error, code: result.code };
    revalidatePath('/dashboard/blog');
    return {
      success: true,
      articleId: result.article.id,
      slug: result.article.slug,
    };
  } catch (error) {
    console.error('Create blog article error:', error);
    return { error: 'The article could not be created. Please try again.' };
  }
}

export async function saveBlogArticleAction(input: unknown) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  const parsed = saveArticleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Some article fields are invalid. Check the title, URL and content.' };
  }

  try {
    const result = await saveBlogArticleRecord(user.profile.id, parsed.data);
    if (!result.ok) return { error: result.error, code: result.code };

    return {
      success: true,
      slug: result.article.slug,
      updatedAt: result.article.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Save blog article error:', error);
    return { error: 'Your changes could not be saved. Please try again.' };
  }
}

export async function publishBlogArticleAction(articleId: string, scheduledFor?: string | null) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  if (typeof articleId !== 'string' || !articleId) return { error: 'Article not found.' };

  try {
    const result = await publishBlogArticleRecord(user.profile.id, articleId, {
      scheduledFor: scheduledFor || null,
    });
    if (!result.ok) return { error: result.error, code: result.code };

    revalidateArticlePaths(user.profile.username, result.article, result.previousPublicSlug);
    return {
      success: true,
      status: result.article.status,
      publicSlug: result.article.publicSlug,
      publishedAt: result.article.publishedAt?.toISOString() || null,
      scheduledFor: result.article.scheduledFor?.toISOString() || null,
    };
  } catch (error) {
    console.error('Publish blog article error:', error);
    return { error: 'The article could not be published. Please try again.' };
  }
}

export async function unpublishBlogArticleAction(articleId: string) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  try {
    const result = await unpublishBlogArticleRecord(user.profile.id, articleId);
    if (!result.ok) return { error: result.error, code: result.code };

    revalidateArticlePaths(user.profile.username, result.article, result.article.publicSlug);
    return { success: true };
  } catch (error) {
    console.error('Unpublish blog article error:', error);
    return { error: 'The article could not be unpublished. Please try again.' };
  }
}

export async function deleteBlogArticleAction(articleId: string) {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { error: 'Your profile is not ready yet.' };

  try {
    const result = await deleteBlogArticleRecord(user.profile.id, articleId);
    if (!result.ok) return { error: result.error, code: result.code };

    revalidateArticlePaths(user.profile.username, {
      slug: result.article.slug,
      publicSlug: result.article.publicSlug,
    });
    await removeUnusedPageMedia(user.id, user.profile.id);
    return { success: true };
  } catch (error) {
    console.error('Delete blog article error:', error);
    return { error: 'The article could not be deleted. Please try again.' };
  }
}
