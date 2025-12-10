/*
  Warnings:

  - You are about to drop the column `cfcCode` on the `tenders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenders" DROP COLUMN "cfcCode",
ADD COLUMN     "cfcCodes" TEXT[];
