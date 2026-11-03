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
import { parseDocument, parseTXT } from '@/lib/documents/parser';

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const MAX_IMPORT_CHARS = 120_000;

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
    const article = result.article;
    return {
      success: true,
      articleCount: result.articleCount,
      ...(result.articleCount >= 16 ? { warning: `You have ${result.articleCount} of 20 Growth blog posts. Delete a post to free a slot.` } : {}),
      articleId: article.id,
      slug: article.slug,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        publicSlug: article.publicSlug,
        excerpt: article.excerpt,
        bodyHtml: article.bodyHtml,
        featuredImageUrl: article.featuredImageUrl,
        featuredImageAlt: article.featuredImageAlt,
        categories: article.categories,
        tags: article.tags,
        authorName: article.authorName,
        authorAvatarUrl: article.authorAvatarUrl,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        canonicalUrl: article.canonicalUrl,
        ogImage: article.ogImage,
        noindex: article.noindex,
        status: article.status,
        publishedAt: article.publishedAt?.toISOString() || null,
        scheduledFor: article.scheduledFor?.toISOString() || null,
        updatedAt: article.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Create blog article error:', error);
    return { error: 'The article could not be created. Please try again.' };
  }
}

/**
 * Extract plain text from an imported draft (.pdf, .docx, .txt, .md).
 *
 * The client converts the returned text into editable paragraphs; this action
 * never writes to the article on its own.
 */
type ImportBlogDraftResult =
  | { success: true; text: string; fileName: string }
  | { success: false; error: string };

export async function importBlogDraftAction(formData: FormData): Promise<ImportBlogDraftResult> {
  const user = await authService.requireCreator();
  await requirePageAccess(user.id);
  if (!user.profile) return { success: false, error: 'Your profile is not ready yet.' };

  const file = formData.get('file');
  if (!(file instanceof File)) return { success: false, error: 'Choose a file to import.' };
  if (file.size === 0) return { success: false, error: 'That file is empty.' };
  if (file.size > MAX_IMPORT_BYTES) return { success: false, error: 'Import a file smaller than 10 MB.' };

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!['pdf', 'docx', 'txt', 'md'].includes(extension)) {
    return { success: false, error: 'Import a PDF, DOCX, TXT or Markdown file.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = extension === 'md'
      ? parseTXT(buffer)
      : await parseDocument(buffer, file.name);

    const trimmed = text.replace(/\u0000/g, '').replace(/\r\n/g, '\n').trim();
    if (trimmed.length < 40) {
      return {
        success: false,
        error: 'We could not find enough text in that file. Try pasting the draft instead.',
      };
    }

    return {
      success: true,
      text: trimmed.slice(0, MAX_IMPORT_CHARS),
      fileName: file.name,
    };
  } catch (error) {
    console.error('Import blog draft error:', error);
    return {
      success: false,
      error: error instanceof Error && error.message.startsWith('Unsupported')
        ? error.message
        : 'That file could not be read. Try a different file or paste the draft instead.',
    };
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
