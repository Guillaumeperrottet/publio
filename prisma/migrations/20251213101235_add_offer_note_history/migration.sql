-- CreateTable
CREATE TABLE "offer_note_history" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_note_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offer_note_history_offerId_idx" ON "offer_note_history"("offerId");

-- CreateIndex
CREATE INDEX "offer_note_history_authorId_idx" ON "offer_note_history"("authorId");

-- AddForeignKey
ALTER TABLE "offer_note_history" ADD CONSTRAINT "offer_note_history_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_note_history" ADD CONSTRAINT "offer_note_history_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
