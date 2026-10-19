CREATE TABLE "plan_access_requests" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "requestType" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "quotedAmount" DECIMAL(12,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "affiliateId" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" UUID,
    "reviewReason" TEXT,
    CONSTRAINT "plan_access_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "plan_access_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "plan_access_requests_status_requestedAt_idx" ON "plan_access_requests"("status", "requestedAt");
CREATE INDEX "plan_access_requests_userId_requestedAt_idx" ON "plan_access_requests"("userId", "requestedAt");
CREATE UNIQUE INDEX "plan_access_requests_one_pending_per_user" ON "plan_access_requests"("userId") WHERE "status" = 'pending';
