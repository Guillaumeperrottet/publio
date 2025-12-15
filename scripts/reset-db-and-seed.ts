/**
 * Script pour reset complètement la DB et la re-seed
 * Usage: npx tsx scripts/reset-db-and-seed.ts
 *
 * ⚠️ ATTENTION : Ce script supprime TOUTES les données !
 * À utiliser uniquement en développement local.
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function resetAndSeed() {
  console.log("⚠️  RESET COMPLET DE LA BASE DE DONNÉES\n");
  console.log("Ceci va supprimer TOUTES les données existantes.\n");

  // Vérifier qu'on est bien en dev
  if (process.env.NODE_ENV === "production") {
    console.error(
      "❌ ERREUR : Ce script ne peut pas être exécuté en production !"
    );
    process.exit(1);
  }

  try {
    console.log("🗑️  Suppression de toutes les données...\n");

    // Ordre important : supprimer d'abord les relations
    await prisma.offerComment.deleteMany();
    await prisma.offerLineItem.deleteMany();
    await prisma.offerInclusion.deleteMany();
    await prisma.offerExclusion.deleteMany();
    await prisma.offerMaterial.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.notificationPreferences.deleteMany();
    await prisma.equityLog.deleteMany();
    await prisma.savedTender.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.veillePublication.deleteMany();
    await prisma.veilleSubscription.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.tenderDocument.deleteMany();
    await prisma.tenderInvitation.deleteMany();
    await prisma.tenderLot.deleteMany();
    await prisma.tenderCriteria.deleteMany();
    await prisma.offerDocument.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.tender.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.invitationToken.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Base de données nettoyée\n");

    console.log("🌱 Lancement du seed réaliste...\n");
    execSync("npx tsx prisma/seed-realistic.ts", { stdio: "inherit" });

    console.log("\n✨ Reset et seed terminés avec succès !");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeed();
