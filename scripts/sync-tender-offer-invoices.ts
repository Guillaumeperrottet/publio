/**
 * Script pour créer les factures manquantes des tenders et offers publiés
 * Utile pour créer rétroactivement les factures des paiements passés
 *
 * Usage:
 * npx tsx scripts/sync-tender-offer-invoices.ts
 */

import { prisma } from "@/lib/db/prisma";

async function syncTenderOfferInvoices() {
  console.log("=".repeat(60));
  console.log("🔄 SYNCHRONISATION FACTURES TENDERS/OFFERS");
  console.log("=".repeat(60));

  try {
    let totalCreated = 0;

    // 1. Trouver tous les tenders PUBLISHED (forcément payés)
    console.log("\n📋 Recherche des tenders publiés...");
    const tenders = await prisma.tender.findMany({
      where: {
        status: { in: ["PUBLISHED", "CLOSED", "AWARDED"] },
      },
      select: {
        id: true,
        title: true,
        organizationId: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    console.log(`   Trouvé ${tenders.length} tender(s) payé(s)`);

    for (const tender of tenders) {
      // Vérifier si une facture existe déjà
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          number: { contains: tender.id.substring(0, 8).toUpperCase() },
          organizationId: tender.organizationId,
        },
      });

      if (existingInvoice) {
        console.log(`   ⏭️  Facture déjà existante pour tender ${tender.id}`);
        continue;
      }

      // Créer la facture
      await prisma.invoice.create({
        data: {
          number: `INV-TENDER-${tender.id.substring(0, 8).toUpperCase()}`,
          amount: 10, // CHF 10 pour publication tender
          currency: "CHF",
          status: "PAID",
          description: `Publication d'appel d'offres: ${tender.title}`,
          paidAt: tender.publishedAt || tender.createdAt,
          organizationId: tender.organizationId,
        },
      });

      console.log(`   ✅ Facture créée pour tender: ${tender.title}`);
      totalCreated++;
    }

    // 2. Trouver tous les offers SUBMITTED (forcément payés)
    console.log("\n📋 Recherche des offres soumises...");
    const offers = await prisma.offer.findMany({
      where: {
        status: { in: ["SUBMITTED", "ACCEPTED", "REJECTED"] },
      },
      select: {
        id: true,
        organizationId: true,
        submittedAt: true,
        createdAt: true,
        tender: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log(`   Trouvé ${offers.length} offre(s) payée(s)`);

    for (const offer of offers) {
      // Vérifier si une facture existe déjà
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          number: { contains: offer.id.substring(0, 8).toUpperCase() },
          organizationId: offer.organizationId,
        },
      });

      if (existingInvoice) {
        console.log(`   ⏭️  Facture déjà existante pour offer ${offer.id}`);
        continue;
      }

      // Créer la facture
      await prisma.invoice.create({
        data: {
          number: `INV-OFFER-${offer.id.substring(0, 8).toUpperCase()}`,
          amount: 10, // CHF 10 pour soumission offer
          currency: "CHF",
          status: "PAID",
          description: `Dépôt d'offre: ${offer.tender.title}`,
          paidAt: offer.submittedAt || offer.createdAt,
          organizationId: offer.organizationId,
        },
      });

      console.log(`   ✅ Facture créée pour offre sur: ${offer.tender.title}`);
      totalCreated++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ SYNCHRONISATION TERMINÉE - ${totalCreated} facture(s)`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
syncTenderOfferInvoices();
