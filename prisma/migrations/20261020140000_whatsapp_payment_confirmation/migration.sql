ALTER TABLE "affiliate_purchases"
  ADD COLUMN IF NOT EXISTS "customerConfirmedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "affiliate_purchases_customerConfirmedAt_idx"
  ON "affiliate_purchases"("customerConfirmedAt");
