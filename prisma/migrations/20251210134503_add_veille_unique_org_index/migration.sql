/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `veille_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "veille_subscriptions_organizationId_key" ON "veille_subscriptions"("organizationId");
