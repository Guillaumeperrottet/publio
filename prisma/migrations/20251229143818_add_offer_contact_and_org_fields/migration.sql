-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "organizationAddress" TEXT,
ADD COLUMN     "organizationCity" TEXT,
ADD COLUMN     "organizationEmail" TEXT,
ADD COLUMN     "organizationPhone" TEXT,
ADD COLUMN     "organizationWebsite" TEXT,
ADD COLUMN     "usesTenderDeadline" BOOLEAN NOT NULL DEFAULT false;
