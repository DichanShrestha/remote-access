-- AlterTable
ALTER TABLE "catalog_images" ADD COLUMN IF NOT EXISTS "size_bytes" BIGINT NOT NULL DEFAULT 0;
