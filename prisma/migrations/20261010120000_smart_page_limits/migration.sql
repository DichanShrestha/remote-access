ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "billingMethod" TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS "trialStart" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "trialEnd" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "dodoCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "currentPeriodStart" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "trialEverGranted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "aiRepliesUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "aiRepliesReserved" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "aiRepliesPeriodStart" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastProviderEventAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "aiAccessEndedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "aiKnowledgePurgedAt" TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialGrantedAt" TIMESTAMP(3);

ALTER TABLE "Usage"
  ADD COLUMN IF NOT EXISTS "pageMediaBytes" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "knowledgeBytes" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "indexedTokens" INTEGER NOT NULL DEFAULT 0;

UPDATE "Subscription" SET "trialEverGranted" = true WHERE "trialStart" IS NOT NULL OR "status" = 'trialing';
UPDATE "Subscription" SET
  "trialStart" = COALESCE("trialStart", "currentPeriodEnd" - INTERVAL '14 days'),
  "trialEnd" = COALESCE("trialEnd", "currentPeriodEnd")
WHERE "status" = 'trialing' AND "currentPeriodEnd" IS NOT NULL;
UPDATE "User" u SET "trialGrantedAt" = t."firstTrial" FROM (SELECT "userId", MIN("trialStart") AS "firstTrial" FROM "Subscription" WHERE "trialStart" IS NOT NULL GROUP BY "userId") t WHERE u.id = t."userId";
UPDATE "Subscription" SET "currentPeriodStart" = "createdAt" WHERE "billingMethod" = 'dodo' AND "currentPeriodStart" IS NULL;

CREATE TABLE "ai_request_usage" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "botId" UUID NOT NULL,
  "modelId" TEXT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "costUsd" DECIMAL(12,8) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_request_usage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ai_request_usage_requestId_key" ON "ai_request_usage"("requestId");
CREATE INDEX "ai_request_usage_userId_createdAt_idx" ON "ai_request_usage"("userId", "createdAt");
ALTER TABLE "ai_request_usage" ADD CONSTRAINT "ai_request_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_request_usage" ADD CONSTRAINT "ai_request_usage_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "page_media_assets" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "bucket" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "contentType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "page_media_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "page_media_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "page_media_assets_bucket_objectKey_key" ON "page_media_assets"("bucket", "objectKey");
CREATE INDEX "page_media_assets_userId_idx" ON "page_media_assets"("userId");
