/*
  Warnings:

  - The `participationConditions` column on the `tenders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requiredDocuments` column on the `tenders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contractualTerms` column on the `tenders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tenders" DROP COLUMN "participationConditions",
ADD COLUMN     "participationConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "requiredDocuments",
ADD COLUMN     "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "minExperience" SET DATA TYPE TEXT,
DROP COLUMN "contractualTerms",
ADD COLUMN     "contractualTerms" TEXT[] DEFAULT ARRAY[]::TEXT[];
