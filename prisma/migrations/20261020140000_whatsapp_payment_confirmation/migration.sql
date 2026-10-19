ALTER TABLE "affiliate_purchases"
  ADD COLUMN "customerConfirmedAt" TIMESTAMP(3);

CREATE INDEX "affiliate_purchases_customerConfirmedAt_idx"
  ON "affiliate_purchases"("customerConfirmedAt");
