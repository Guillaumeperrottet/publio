-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('USER_CREATED', 'USER_DELETED', 'USER_BLOCKED', 'USER_UNBLOCKED', 'ORGANIZATION_CREATED', 'ORGANIZATION_DELETED', 'ORGANIZATION_SUSPENDED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_CANCELLED', 'TENDER_PUBLISHED', 'OFFER_SUBMITTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'ADMIN_LOGIN', 'IMPERSONATION_START', 'IMPERSONATION_END', 'FEATURE_FLAG_CHANGED', 'SYSTEM_ERROR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_type_idx" ON "activity_logs"("type");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
