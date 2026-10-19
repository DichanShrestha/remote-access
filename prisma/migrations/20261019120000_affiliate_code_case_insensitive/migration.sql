-- Prisma's @unique index on the original code column remains in place.
-- This expression index additionally makes uniqueness case-insensitive in Postgres.
CREATE UNIQUE INDEX "affiliate_codes_code_upper_key"
ON "affiliate_codes" (UPPER("code"));
