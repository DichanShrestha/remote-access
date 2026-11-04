-- Whole-site template switching
-- A snapshot is written before a template switch so the previous website
-- configuration and every page design can be restored if the switch fails.

CREATE TABLE "TemplateSwitchSnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "fromTemplateId" TEXT,
    "toTemplateId" TEXT NOT NULL,
    "websiteConfig" JSONB NOT NULL,
    "publishedWebsiteConfig" JSONB,
    "pages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateSwitchSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TemplateSwitchSnapshot_profileId_createdAt_idx" ON "TemplateSwitchSnapshot"("profileId", "createdAt");

ALTER TABLE "TemplateSwitchSnapshot"
    ADD CONSTRAINT "TemplateSwitchSnapshot_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
