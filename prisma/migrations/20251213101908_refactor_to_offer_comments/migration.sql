/*
  Warnings:

  - You are about to drop the column `internalNote` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `internalNoteAuthorId` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `internalNoteUpdatedAt` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the `offer_note_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "offer_note_history" DROP CONSTRAINT "offer_note_history_authorId_fkey";

-- DropForeignKey
ALTER TABLE "offer_note_history" DROP CONSTRAINT "offer_note_history_offerId_fkey";

-- DropForeignKey
ALTER TABLE "offers" DROP CONSTRAINT "offers_internalNoteAuthorId_fkey";

-- AlterTable
ALTER TABLE "offers" DROP COLUMN "internalNote",
DROP COLUMN "internalNoteAuthorId",
DROP COLUMN "internalNoteUpdatedAt";

-- DropTable
DROP TABLE "offer_note_history";

-- CreateTable
CREATE TABLE "offer_comments" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offer_comments_offerId_idx" ON "offer_comments"("offerId");

-- CreateIndex
CREATE INDEX "offer_comments_authorId_idx" ON "offer_comments"("authorId");

-- AddForeignKey
ALTER TABLE "offer_comments" ADD CONSTRAINT "offer_comments_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_comments" ADD CONSTRAINT "offer_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
