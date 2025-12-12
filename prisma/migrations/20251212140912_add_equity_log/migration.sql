-- CreateEnum
CREATE TYPE "EquityLogAction" AS ENUM ('TENDER_CREATED', 'TENDER_PUBLISHED', 'TENDER_UPDATED', 'TENDER_CLOSED', 'TENDER_AWARDED', 'TENDER_CANCELLED', 'OFFER_RECEIVED', 'OFFER_SHORTLISTED', 'OFFER_REJECTED', 'OFFER_AWARDED', 'IDENTITY_REVEALED', 'DEADLINE_EXTENDED', 'INVITATION_SENT');

-- CreateTable
CREATE TABLE "equity_logs" (
    "id" TEXT NOT NULL,
    "action" "EquityLogAction" NOT NULL,
    "description" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equity_logs_tenderId_createdAt_idx" ON "equity_logs"("tenderId", "createdAt");

-- CreateIndex
CREATE INDEX "equity_logs_userId_idx" ON "equity_logs"("userId");

-- AddForeignKey
ALTER TABLE "equity_logs" ADD CONSTRAINT "equity_logs_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equity_logs" ADD CONSTRAINT "equity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
