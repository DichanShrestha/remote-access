ALTER TABLE "Usage"
  ADD COLUMN "articleGenerationsUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "articleGenerationsReserved" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "writingCreditsUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "writingCreditsReserved" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "quotaPeriodStart" TIMESTAMP(3),
  ADD COLUMN "quotaPeriodEnd" TIMESTAMP(3);

CREATE TABLE "BlogAIUsage" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "costUsd" DECIMAL(12,8),
  "credits" INTEGER NOT NULL DEFAULT 0,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlogAIUsage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BlogAIUsage_userId_periodStart_createdAt_idx" ON "BlogAIUsage"("userId", "periodStart", "createdAt");
ALTER TABLE "BlogAIUsage" ADD CONSTRAINT "BlogAIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BlogAIQuotaReservation" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'reserved',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finalizedAt" TIMESTAMP(3),
  CONSTRAINT "BlogAIQuotaReservation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BlogAIQuotaReservation_requestId_key" ON "BlogAIQuotaReservation"("requestId");
CREATE INDEX "BlogAIQuotaReservation_userId_periodStart_status_idx" ON "BlogAIQuotaReservation"("userId", "periodStart", "status");
ALTER TABLE "BlogAIQuotaReservation" ADD CONSTRAINT "BlogAIQuotaReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BillingNotice" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingNotice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BillingNotice_subscriptionId_kind_key" ON "BillingNotice"("subscriptionId", "kind");
CREATE INDEX "BillingNotice_userId_createdAt_idx" ON "BillingNotice"("userId", "createdAt");
ALTER TABLE "BillingNotice" ADD CONSTRAINT "BillingNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UsageNotice" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageNotice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UsageNotice_userId_key_key" ON "UsageNotice"("userId", "key");
CREATE INDEX "UsageNotice_userId_createdAt_idx" ON "UsageNotice"("userId", "createdAt");
ALTER TABLE "UsageNotice" ADD CONSTRAINT "UsageNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
