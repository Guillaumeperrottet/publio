-- AlterTable
ALTER TABLE "tenders" ADD COLUMN     "images" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "pdfs" JSONB[] DEFAULT ARRAY[]::JSONB[];
