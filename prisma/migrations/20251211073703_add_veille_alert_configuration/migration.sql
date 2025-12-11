-- AlterTable
ALTER TABLE "veille_subscriptions" ADD COLUMN     "alertCommunes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "alertFrequency" TEXT NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "alertKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "alertTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastAlertSent" TIMESTAMP(3);
