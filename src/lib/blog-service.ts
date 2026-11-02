import { BlogStatus } from '@prisma/client';
import type { BlogArticle, Prisma } from '@prisma/client';
import db from './prisma';
import {
  BLOG_MAX_BODY_LENGTH,
  BLOG_MAX_CATEGORIES,
  BLOG_MAX_EXCERPT_LENGTH,
  BLOG_MAX_TAGS,
  BLOG_MAX_TITLE_LENGTH,
  createBlogExcerpt,
  getBlogPublishSnapshot,
  isBlogBodyEmpty,
  normalizeBlogSlug,
  normalizeBlogTerms,
  safeBlogMediaUrl,
  sanitizeBlogHtml,
  slugifyBlogTitle,
  validateBlogSlug,
} from './blog';

/**
 * Database operations for blog articles. Server actions add authentication,
 * entitlement checks and cache revalidation; keeping the core operations here
 * makes the create → edit → publish → delete lifecycle testable end to end.
 */

export type SaveBlogArticleInput = {
  articleId: string;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  categories?: unknown;
  tags?: unknown;
  authorName?: string;
  authorAvatarUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
};

export type BlogServiceError = {
  ok: false;
  error: string;
  code: 'NOT_FOUND' | 'SLUG_TAKEN' | 'INVALID' | 'CONFLICT';
};

export type BlogServiceSuccess<T> = { ok: true; article: T; previousPublicSlug?: string | null };
export type BlogServiceResult<T> = BlogServiceSuccess<T> | BlogServiceError;

async function uniqueBlogSlug(
  tx: Prisma.TransactionClient,
  profileId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const normalized = normalizeBlogSlug(base) || 'article';
  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = attempt === 0 ? normalized : `${normalized}-${attempt + 1}`;
    const existing = await tx.blogArticle.findFirst({
      where: { profileId, slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `${normalized}-${Date.now().toString(36)}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002');
}

export async function createBlogArticle(
  profileId: string,
  input: { title?: string; slug?: string } = {},
) {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { displayName: true, avatarUrl: true },
  });
  if (!profile) throw new Error('Profile not found');

  const title = (input.title || '').trim().slice(0, BLOG_MAX_TITLE_LENGTH) || 'Untitled article';
  const requestedSlug = (input.slug || '').trim();

  if (requestedSlug) {
    const validation = validateBlogSlug(requestedSlug);
    if (!validation.valid) return { ok: false as const, error: validation.error || 'Enter a valid article URL.', code: 'INVALID' as const };
  }

  try {
    const article = await db.$transaction(async (tx) => {
      const slug = requestedSlug
        ? normalizeBlogSlug(requestedSlug)
        : await uniqueBlogSlug(tx, profileId, slugifyBlogTitle(title));

      if (requestedSlug) {
        const duplicate = await tx.blogArticle.findFirst({
          where: { profileId, slug },
          select: { id: true },
        });
        if (duplicate) throw new BlogSlugTakenError();
      }

      await tx.blogArticleSlugRedirect.deleteMany({ where: { profileId, slug } });

      return tx.blogArticle.create({
        data: {
          profileId,
          title,
          slug,
          authorName: profile.displayName || '',
          authorAvatarUrl: profile.avatarUrl,
          status: BlogStatus.DRAFT,
        },
      });
    });

    return { ok: true as const, article };
  } catch (error) {
    if (error instanceof BlogSlugTakenError || isUniqueConstraintError(error)) {
      return { ok: false as const, error: 'That article URL is already in use. Choose another one.', code: 'SLUG_TAKEN' as const };
    }
    throw error;
  }
}

export async function saveBlogArticle(
  profileId: string,
  input: SaveBlogArticleInput,
): Promise<BlogServiceResult<BlogArticle>> {
  const article = await db.blogArticle.findFirst({
    where: { id: input.articleId, profileId },
    select: { id: true, slug: true, status: true },
  });
  if (!article) return { ok: false, error: 'Article not found.', code: 'NOT_FOUND' };

  const title = input.title.trim().slice(0, BLOG_MAX_TITLE_LENGTH) || 'Untitled article';
  const requestedSlug = input.slug.trim();
  const parsedSlug = requestedSlug
    ? validateBlogSlug(requestedSlug)
    : { valid: true, slug: slugifyBlogTitle(title) };
  if (!parsedSlug.valid) {
    return { ok: false, error: parsedSlug.error || 'Enter a valid article URL.', code: 'INVALID' };
  }

  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  if (bodyHtml.length > BLOG_MAX_BODY_LENGTH) {
    return { ok: false, error: 'This article is too large. Try splitting it into multiple articles.', code: 'INVALID' };
  }

  const duplicate = await db.blogArticle.findFirst({
    where: { profileId, slug: parsedSlug.slug, id: { not: article.id } },
    select: { id: true },
  });
  if (duplicate) {
    return { ok: false, error: 'That article URL is already in use. Choose another one.', code: 'SLUG_TAKEN' };
  }

  try {
    const updated = await db.blogArticle.update({
      where: { id: article.id },
      data: {
        title,
        slug: parsedSlug.slug,
        excerpt: (input.excerpt || '').trim().slice(0, BLOG_MAX_EXCERPT_LENGTH),
        bodyHtml,
        featuredImageUrl: safeBlogMediaUrl(input.featuredImageUrl),
        featuredImageAlt: input.featuredImageAlt?.trim().slice(0, 300) || null,
        categories: normalizeBlogTerms(input.categories, BLOG_MAX_CATEGORIES),
        tags: normalizeBlogTerms(input.tags, BLOG_MAX_TAGS),
        authorName: (input.authorName || '').trim().slice(0, 120),
        authorAvatarUrl: safeBlogMediaUrl(input.authorAvatarUrl),
        seoTitle: input.seoTitle?.trim().slice(0, 120) || null,
        seoDescription: input.seoDescription?.trim().slice(0, 320) || null,
        canonicalUrl: input.canonicalUrl?.trim().slice(0, 2000) || null,
        ogImage: safeBlogMediaUrl(input.ogImage),
        noindex: input.noindex === true,
      },
    });
    return { ok: true, article: updated };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: 'That article URL is already in use. Choose another one.', code: 'SLUG_TAKEN' };
    }
    throw error;
  }
}

export async function publishBlogArticle(
  profileId: string,
  articleId: string,
  options: { scheduledFor?: Date | string | null } = {},
): Promise<BlogServiceResult<BlogArticle>> {
  const article = await db.blogArticle.findFirst({
    where: { id: articleId, profileId },
  });
  if (!article) return { ok: false, error: 'Article not found.', code: 'NOT_FOUND' };

  const title = article.title.trim();
  const bodyHtml = sanitizeBlogHtml(article.bodyHtml);
  if (!title) return { ok: false, error: 'Add a title before publishing.', code: 'INVALID' };
  if (isBlogBodyEmpty(bodyHtml)) return { ok: false, error: 'Add some article content before publishing.', code: 'INVALID' };

  const slugValidation = validateBlogSlug(article.slug);
  if (!slugValidation.valid) {
    return { ok: false, error: slugValidation.error || 'Choose a valid article URL.', code: 'INVALID' };
  }
  const slug = slugValidation.slug;

  const publicConflict = await db.blogArticle.findFirst({
    where: { profileId, publicSlug: slug, id: { not: article.id } },
    select: { id: true },
  });
  if (publicConflict) {
    return { ok: false, error: 'That article URL is already used by another live article.', code: 'SLUG_TAKEN' };
  }

  const now = new Date();
  let scheduledFor: Date | null = null;
  if (options.scheduledFor) {
    const parsed = options.scheduledFor instanceof Date ? options.scheduledFor : new Date(options.scheduledFor);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: 'Choose a valid publication date.', code: 'INVALID' };
    }
    if (parsed.getTime() > now.getTime()) scheduledFor = parsed;
  }

  const publishedAt = article.publishedAt ?? scheduledFor ?? now;
  const publishData = getBlogPublishSnapshot({
    title,
    slug,
    excerpt: article.excerpt || createBlogExcerpt(bodyHtml),
    bodyHtml,
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
    publishedAt,
    updatedAt: now,
  });

  const status = scheduledFor ? BlogStatus.SCHEDULED : BlogStatus.PUBLISHED;

  try {
    const updated = await db.$transaction(async (tx) => {
      if (article.publicSlug && article.publicSlug !== slug) {
        // A live URL moved: keep the old address working and reclaim the new
        // address for this article if it was a previously retired slug.
        await tx.blogArticleSlugRedirect.deleteMany({ where: { profileId, slug } });
        await tx.blogArticleSlugRedirect.upsert({
          where: { profileId_slug: { profileId, slug: article.publicSlug } },
          create: { profileId, articleId: article.id, slug: article.publicSlug },
          update: { articleId: article.id },
        });
      } else if (!article.publicSlug) {
        await tx.blogArticleSlugRedirect.deleteMany({ where: { profileId, slug } });
      }

      return tx.blogArticle.update({
        where: { id: article.id },
        data: {
          title,
          bodyHtml,
          status,
          scheduledFor,
          publicSlug: slug,
          publishedAt,
          publishedSnapshot: publishData.snapshot as unknown as Prisma.InputJsonValue,
          publishedNoindex: publishData.publishedNoindex,
          publishedCanonicalUrl: publishData.publishedCanonicalUrl,
        },
      });
    });

    return { ok: true, article: updated, previousPublicSlug: article.publicSlug };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: 'That article URL is already in use. Choose another one.', code: 'SLUG_TAKEN' };
    }
    throw error;
  }
}

export async function unpublishBlogArticle(
  profileId: string,
  articleId: string,
): Promise<BlogServiceResult<BlogArticle>> {
  const article = await db.blogArticle.findFirst({
    where: { id: articleId, profileId },
    select: { id: true },
  });
  if (!article) return { ok: false, error: 'Article not found.', code: 'NOT_FOUND' };

  const updated = await db.blogArticle.update({
    where: { id: article.id },
    data: { status: BlogStatus.DRAFT, scheduledFor: null },
  });
  return { ok: true, article: updated };
}

export async function deleteBlogArticle(
  profileId: string,
  articleId: string,
): Promise<BlogServiceResult<{ id: string; publicSlug: string | null; slug: string }>> {
  const article = await db.blogArticle.findFirst({
    where: { id: articleId, profileId },
    select: { id: true, publicSlug: true, slug: true },
  });
  if (!article) return { ok: false, error: 'Article not found.', code: 'NOT_FOUND' };

  await db.blogArticle.delete({ where: { id: article.id } });
  return { ok: true, article };
}

class BlogSlugTakenError extends Error {}
