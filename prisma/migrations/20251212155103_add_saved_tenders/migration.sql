-- CreateTable
CREATE TABLE "saved_tenders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_tenders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_tenders_userId_idx" ON "saved_tenders"("userId");

-- CreateIndex
CREATE INDEX "saved_tenders_tenderId_idx" ON "saved_tenders"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_tenders_userId_tenderId_key" ON "saved_tenders"("userId", "tenderId");

-- AddForeignKey
ALTER TABLE "saved_tenders" ADD CONSTRAINT "saved_tenders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_tenders" ADD CONSTRAINT "saved_tenders_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
