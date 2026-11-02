-- Blog & Content Studio.
-- Draft content lives in the main columns. Publishing writes an immutable
-- snapshot so autosave never changes a live article, while the public slug,
-- canonical and noindex values are denormalised for sitemap queries.

CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

CREATE TABLE "BlogArticle" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  "slug" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL DEFAULT '',
  "bodyHtml" TEXT NOT NULL DEFAULT '',
  "featuredImageUrl" TEXT,
  "featuredImageAlt" TEXT,
  "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "authorName" TEXT NOT NULL DEFAULT '',
  "authorAvatarUrl" TEXT,
  "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledFor" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "publicSlug" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "canonicalUrl" TEXT,
  "ogImage" TEXT,
  "noindex" BOOLEAN NOT NULL DEFAULT false,
  "publishedSnapshot" JSONB,
  "publishedNoindex" BOOLEAN NOT NULL DEFAULT false,
  "publishedCanonicalUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BlogArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogArticle_profileId_slug_key" ON "BlogArticle"("profileId", "slug");
CREATE UNIQUE INDEX "BlogArticle_profileId_publicSlug_key" ON "BlogArticle"("profileId", "publicSlug");
CREATE INDEX "BlogArticle_profileId_status_updatedAt_idx" ON "BlogArticle"("profileId", "status", "updatedAt");
CREATE INDEX "BlogArticle_profileId_status_publishedAt_idx" ON "BlogArticle"("profileId", "status", "publishedAt");
CREATE INDEX "BlogArticle_status_scheduledFor_idx" ON "BlogArticle"("status", "scheduledFor");
CREATE INDEX "BlogArticle_status_publicSlug_idx" ON "BlogArticle"("status", "publicSlug");

ALTER TABLE "BlogArticle" ADD CONSTRAINT "BlogArticle_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BlogArticleSlugRedirect" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlogArticleSlugRedirect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogArticleSlugRedirect_profileId_slug_key" ON "BlogArticleSlugRedirect"("profileId", "slug");
CREATE INDEX "BlogArticleSlugRedirect_articleId_idx" ON "BlogArticleSlugRedirect"("articleId");

ALTER TABLE "BlogArticleSlugRedirect" ADD CONSTRAINT "BlogArticleSlugRedirect_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogArticleSlugRedirect" ADD CONSTRAINT "BlogArticleSlugRedirect_articleId_fkey"
  FOREIGN KEY ("articleId") REFERENCES "BlogArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
