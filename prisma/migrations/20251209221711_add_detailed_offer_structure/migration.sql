/*
  Warnings:

  - Added the required column `projectSummary` to the `offers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "insuranceAmount" DOUBLE PRECISION,
ADD COLUMN     "manufacturerWarranty" TEXT,
ADD COLUMN     "offerNumber" TEXT,
ADD COLUMN     "paymentTerms" JSONB,
ADD COLUMN     "priceType" TEXT NOT NULL DEFAULT 'GLOBAL',
ADD COLUMN     "projectSummary" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "totalHT" DOUBLE PRECISION,
ADD COLUMN     "totalTVA" DOUBLE PRECISION,
ADD COLUMN     "tvaRate" DOUBLE PRECISION NOT NULL DEFAULT 7.7,
ADD COLUMN     "validityDays" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "warrantyYears" INTEGER;

-- CreateTable
CREATE TABLE "offer_line_items" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "priceHT" DOUBLE PRECISION NOT NULL,
    "tvaRate" DOUBLE PRECISION NOT NULL DEFAULT 7.7,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "offer_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_inclusions" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "offer_inclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_exclusions" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "offer_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_materials" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "range" TEXT,
    "manufacturerWarranty" TEXT,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "offer_materials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "offer_line_items" ADD CONSTRAINT "offer_line_items_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_inclusions" ADD CONSTRAINT "offer_inclusions_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_exclusions" ADD CONSTRAINT "offer_exclusions_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_materials" ADD CONSTRAINT "offer_materials_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
