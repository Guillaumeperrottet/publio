-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "internalNoteAuthorId" TEXT,
ADD COLUMN     "internalNoteUpdatedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_internalNoteAuthorId_fkey" FOREIGN KEY ("internalNoteAuthorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
