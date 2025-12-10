#!/usr/bin/env tsx
/**
 * Nettoyer les anciennes publications SIMAP
 * et laisser le prochain scraping les recréer avec les bonnes URLs
 */

import { prisma } from "@/lib/db/prisma";

async function cleanOldSimapPublications() {
  console.log("🧹 Nettoyage des publications SIMAP...\n");

  try {
    // Supprimer toutes les publications SIMAP (identifiées par metadata.source)
    const result = await prisma.veillePublication.deleteMany({
      where: {
        OR: [
          {
            url: {
              contains: "simap.ch",
            },
          },
          {
            metadata: {
              path: ["source"],
              equals: "SIMAP",
            },
          },
        ],
      },
    });

    console.log(`✅ ${result.count} publication(s) SIMAP supprimée(s)`);
    console.log(
      "\n💡 Lancez maintenant le scraping pour recréer avec les bonnes URLs:"
    );
    console.log("   npx tsx scripts/scrape-publications.ts\n");
  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanOldSimapPublications()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
