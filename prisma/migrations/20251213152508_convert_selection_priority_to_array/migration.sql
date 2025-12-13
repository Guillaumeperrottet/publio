/*
  Warnings:

  - You are about to drop the column `selectionPriority` on the `tenders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenders" DROP COLUMN "selectionPriority",
ADD COLUMN     "selectionPriorities" "SelectionPriority"[] DEFAULT ARRAY['QUALITY_PRICE']::"SelectionPriority"[];
