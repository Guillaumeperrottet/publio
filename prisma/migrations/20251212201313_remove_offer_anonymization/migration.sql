/*
  Warnings:

  - You are about to drop the column `anonymousId` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `isAnonymized` on the `offers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "offers_anonymousId_key";

-- AlterTable
ALTER TABLE "offers" DROP COLUMN "anonymousId",
DROP COLUMN "isAnonymized";
