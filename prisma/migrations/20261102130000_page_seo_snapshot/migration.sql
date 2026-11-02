-- Published SEO snapshot for sitemap generation.
-- Editable SEO values stay in the page document settings (draft + published),
-- while these two columns mirror the currently published state so the sitemap
-- can query millions of pages without parsing every JSON document.

ALTER TABLE "Page"
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "noindex" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Page"
SET "publishedAt" = "updatedAt"
WHERE "isPublished" = true;

CREATE INDEX "Page_isPublished_noindex_updatedAt_idx"
  ON "Page"("isPublished", "noindex", "updatedAt");
