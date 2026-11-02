-- Multi-page websites
-- Existing Page rows become the published homepage for each business. All
-- business-level design lives in the new Website row so pages can share a
-- single theme, header, footer, and navigation.

CREATE TYPE "PageType" AS ENUM ('HOME', 'ABOUT', 'SERVICES', 'PRODUCTS', 'CONTACT', 'FAQ', 'GALLERY', 'BLOG', 'CUSTOM');

ALTER TABLE "Page"
  ADD COLUMN "title" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "slug" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "pageType" "PageType" NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN "showInNavigation" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "navOrder" INTEGER NOT NULL DEFAULT 0;

-- Existing websites keep their current homepage URL. The empty slug is
-- reserved for the homepage so it can never collide with a child page slug.
UPDATE "Page"
SET "pageType" = 'HOME', "slug" = '', "navOrder" = 0
WHERE "pageType" = 'CUSTOM';

UPDATE "Page" AS page
SET "title" = profile."displayName"
FROM "Profile" AS profile
WHERE page."profileId" = profile."id" AND page."title" = '';

DROP INDEX "Page_profileId_key";
CREATE UNIQUE INDEX "Page_profileId_slug_key" ON "Page"("profileId", "slug");
CREATE INDEX "Page_profileId_pageType_idx" ON "Page"("profileId", "pageType");
CREATE INDEX "Page_profileId_isPublished_showInNavigation_navOrder_idx" ON "Page"("profileId", "isPublished", "showInNavigation", "navOrder");

CREATE TABLE "Website" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "draftConfig" JSONB NOT NULL DEFAULT '{}',
  "publishedConfig" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Website_profileId_key" ON "Website"("profileId");

ALTER TABLE "Website" ADD CONSTRAINT "Website_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PageSlugRedirect" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PageSlugRedirect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PageSlugRedirect_profileId_slug_key" ON "PageSlugRedirect"("profileId", "slug");
CREATE INDEX "PageSlugRedirect_pageId_idx" ON "PageSlugRedirect"("pageId");

ALTER TABLE "PageSlugRedirect" ADD CONSTRAINT "PageSlugRedirect_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageSlugRedirect" ADD CONSTRAINT "PageSlugRedirect_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
