/*
  Warnings:

  - You are about to drop the column `config` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "config",
ADD COLUMN     "draftConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "publishedConfig" JSONB;
