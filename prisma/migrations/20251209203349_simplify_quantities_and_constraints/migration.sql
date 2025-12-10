/*
  Warnings:

  - You are about to drop the column `hasAccessConstraints` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `limitedHours` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `siteOccupied` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `siteVisitRequested` on the `tenders` table. All the data in the column will be lost.
  - You are about to drop the column `unitsQuantity` on the `tenders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenders" DROP COLUMN "hasAccessConstraints",
DROP COLUMN "limitedHours",
DROP COLUMN "siteOccupied",
DROP COLUMN "siteVisitRequested",
DROP COLUMN "unitsQuantity",
ADD COLUMN     "constraints" TEXT[] DEFAULT ARRAY[]::TEXT[];
