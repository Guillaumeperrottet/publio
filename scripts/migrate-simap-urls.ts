#!/usr/bin/env tsx
/**
 * Script de migration des URLs SIMAP
 * Mettre à jour les anciennes URLs vers la nouvelle structure
 */

import { prisma } from "@/lib/db/prisma";

async function migrateSimapUrls() {
  console.log("🔄 Migration des URLs SIMAP...\n");

  try {
    // Récupérer toutes les publications SIMAP avec anciennes URLs
    const publications = await prisma.veillePublication.findMany({
      where: {
        url: {
          contains: "/shabforms/servlet/Search?NOTICE_NR=",
        },
      },
    });

    console.log(
      `📋 ${publications.length} publication(s) avec anciennes URLs trouvée(s)\n`
    );

    if (publications.length === 0) {
      console.log("✅ Aucune migration nécessaire !");
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const pub of publications) {
      try {
        // Extraire l'ID depuis les métadonnées
        const metadata = pub.metadata as { projectNumber?: string } | null;

        if (!metadata?.projectNumber) {
          console.log(
            `⚠️  Pas de projectNumber pour: ${pub.title.substring(0, 50)}...`
          );
          failed++;
          continue;
        }

        // Construire la nouvelle URL
        // Note: On utilise projectNumber car l'ancien système n'avait pas d'ID
        // Il faudrait re-scraper pour avoir les vrais IDs
        const newUrl = `https://www.simap.ch/fr/project/search?query=${metadata.projectNumber}`;

        await prisma.veillePublication.update({
          where: { id: pub.id },
          data: { url: newUrl },
        });

        updated++;
        console.log(
          `✅ Mis à jour: ${pub.title.substring(0, 50)}... → ${newUrl}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur pour "${pub.title.substring(0, 30)}...":`,
          error
        );
        failed++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`Publications traitées:  ${publications.length}`);
    console.log(`Mises à jour:           ${updated}`);
    console.log(`Échecs:                 ${failed}`);
    console.log("=".repeat(60));

    if (updated > 0) {
      console.log(
        "\n⚠️  Note: Les URLs utilisent maintenant la recherche par projectNumber"
      );
      console.log(
        "Pour des URLs exactes, il faudrait rescraper depuis SIMAP (les IDs changent)\n"
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateSimapUrls()
  .then(() => {
    console.log("✅ Migration terminée avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration échouée:", error);
    process.exit(1);
  });
