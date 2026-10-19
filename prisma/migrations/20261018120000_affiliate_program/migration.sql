CREATE TABLE "affiliate_applications" (
  "id" TEXT NOT NULL, "userId" UUID NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending',
  "basedInNepal" BOOLEAN NOT NULL DEFAULT false, "details" TEXT, "reviewedBy" UUID,
  "reviewedAt" TIMESTAMP(3), "reviewNote" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "affiliate_applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "affiliate_applications_userId_key" ON "affiliate_applications"("userId");
CREATE INDEX "affiliate_applications_status_createdAt_idx" ON "affiliate_applications"("status", "createdAt");
ALTER TABLE "affiliate_applications" ADD CONSTRAINT "affiliate_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "affiliate_codes" (
  "id" TEXT NOT NULL, "affiliateId" UUID NOT NULL, "applicationId" TEXT, "code" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_codes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "affiliate_codes_code_key" ON "affiliate_codes"("code");
CREATE UNIQUE INDEX "affiliate_codes_applicationId_key" ON "affiliate_codes"("applicationId");
CREATE INDEX "affiliate_codes_affiliateId_active_idx" ON "affiliate_codes"("affiliateId", "active");
ALTER TABLE "affiliate_codes" ADD CONSTRAINT "affiliate_codes_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "affiliate_codes" ADD CONSTRAINT "affiliate_codes_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "affiliate_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "customer_referrals" (
  "id" TEXT NOT NULL, "affiliateId" UUID NOT NULL, "customerId" UUID NOT NULL, "codeId" TEXT NOT NULL,
  "referredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "firstPaidAt" TIMESTAMP(3), "discountUsed" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "customer_referrals_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "customer_referrals_customerId_key" ON "customer_referrals"("customerId");
CREATE INDEX "customer_referrals_affiliateId_referredAt_idx" ON "customer_referrals"("affiliateId", "referredAt");
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "affiliate_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "affiliate_purchases" (
  "id" TEXT NOT NULL, "customerId" UUID NOT NULL, "referralId" TEXT, "subscriptionId" TEXT, "planId" TEXT NOT NULL,
  "paymentProvider" TEXT NOT NULL DEFAULT 'manual',
  "currency" TEXT NOT NULL, "originalAmount" DECIMAL(12,2) NOT NULL, "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "expectedAmount" DECIMAL(12,2) NOT NULL,
  "paymentReference" TEXT, "proofUrl" TEXT, "status" TEXT NOT NULL DEFAULT 'pending', "verifiedAmount" DECIMAL(12,2),
  "verifiedAt" TIMESTAMP(3), "verifiedBy" UUID, "resolutionNote" TEXT, "paymentDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_purchases_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "affiliate_purchases_customerId_createdAt_idx" ON "affiliate_purchases"("customerId", "createdAt");
CREATE UNIQUE INDEX "affiliate_purchases_paymentReference_key" ON "affiliate_purchases"("paymentReference");
CREATE INDEX "affiliate_purchases_status_createdAt_idx" ON "affiliate_purchases"("status", "createdAt");
ALTER TABLE "affiliate_purchases" ADD CONSTRAINT "affiliate_purchases_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "affiliate_purchases" ADD CONSTRAINT "affiliate_purchases_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "customer_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "affiliate_purchases" ADD CONSTRAINT "affiliate_purchases_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "affiliate_payouts" (
  "id" TEXT NOT NULL, "affiliateId" UUID NOT NULL, "currency" TEXT NOT NULL, "amount" DECIMAL(12,2) NOT NULL,
  "payoutAmount" DECIMAL(12,2), "payoutCurrency" TEXT, "exchangeRate" DECIMAL(18,8), "method" TEXT NOT NULL,
  "reference" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'paid', "paidAt" TIMESTAMP(3) NOT NULL,
  "createdBy" UUID NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliate_payouts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "affiliate_payouts_affiliateId_paidAt_idx" ON "affiliate_payouts"("affiliateId", "paidAt");
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commissions" (
  "id" TEXT NOT NULL, "affiliateId" UUID NOT NULL, "referralId" TEXT NOT NULL, "purchaseId" TEXT NOT NULL,
  "subscriptionId" TEXT, "currency" TEXT NOT NULL, "eligibleRevenue" DECIMAL(12,2) NOT NULL,
  "commissionPercent" DECIMAL(5,2) NOT NULL, "amount" DECIMAL(12,2) NOT NULL, "earnedAt" TIMESTAMP(3) NOT NULL,
  "eligibilityEndsAt" TIMESTAMP(3) NOT NULL, "eligibilityStatus" TEXT NOT NULL DEFAULT 'payable',
  "payoutStatus" TEXT NOT NULL DEFAULT 'unpaid', "reversalReference" TEXT, "reversedAt" TIMESTAMP(3),
  "payoutId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "commissions_purchaseId_key" ON "commissions"("purchaseId");
CREATE INDEX "commissions_affiliateId_currency_payoutStatus_idx" ON "commissions"("affiliateId", "currency", "payoutStatus");
CREATE INDEX "commissions_referralId_earnedAt_idx" ON "commissions"("referralId", "earnedAt");
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "customer_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "affiliate_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "affiliate_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "commission_reversals" (
  "id" TEXT NOT NULL, "commissionId" TEXT NOT NULL, "refundReference" TEXT NOT NULL,
  "refundAmount" DECIMAL(12,2) NOT NULL, "commissionAmount" DECIMAL(12,2) NOT NULL,
  "refundCurrency" TEXT NOT NULL, "commissionCurrency" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "commission_reversals_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "commission_reversals_refundReference_key" ON "commission_reversals"("refundReference");
CREATE INDEX "commission_reversals_commissionId_createdAt_idx" ON "commission_reversals"("commissionId", "createdAt");
ALTER TABLE "commission_reversals" ADD CONSTRAINT "commission_reversals_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "commissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "affiliate_config" (
  "id" INTEGER NOT NULL DEFAULT 1, "customerDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 10,
  "commissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 15, "eligibilityMonths" INTEGER NOT NULL DEFAULT 12,
  "updatedBy" UUID, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "affiliate_config_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "affiliate_config_singleton_check" CHECK ("id" = 1)
);
INSERT INTO "affiliate_config" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP);

CREATE TABLE "affiliate_audit_events" (
  "id" TEXT NOT NULL, "actorId" UUID, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL, "details" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliate_audit_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "affiliate_audit_events_entityType_entityId_createdAt_idx" ON "affiliate_audit_events"("entityType", "entityId", "createdAt");
