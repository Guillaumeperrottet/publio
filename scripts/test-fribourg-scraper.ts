#!/usr/bin/env tsx
/**
 * Script de test pour le scraper Feuille Officielle Fribourg
 *
 * Usage:
 *   npx tsx scripts/test-fribourg-scraper.ts
 */

import { FribourgOfficialGazetteScraper } from "@/features/veille/scrapers/fribourg-official";

async function testFribourgScraper() {
  console.log("🧪 TEST DU SCRAPER FEUILLE OFFICIELLE FRIBOURG");
  console.log("=".repeat(60));
  console.log(`Démarrage: ${new Date().toISOString()}\n`);

  try {
    const scraper = new FribourgOfficialGazetteScraper();

    console.log("📥 Téléchargement et parsing des PDFs...\n");
    const publications = await scraper.scrape();

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSULTATS");
    console.log("=".repeat(60));
    console.log(`Total: ${publications.length} publication(s) trouvée(s)\n`);

    if (publications.length > 0) {
      console.log("📋 Aperçu des publications:\n");

      publications.slice(0, 5).forEach((pub, index) => {
        console.log(`\n${index + 1}. ${pub.title}`);
        console.log(`   Commune: ${pub.commune}`);
        console.log(`   Type: ${pub.type}`);
        console.log(`   URL: ${pub.url}`);

        if (pub.metadata) {
          if (pub.metadata.parcelle) {
            console.log(`   Parcelle: ${pub.metadata.parcelle}`);
          }
          if (pub.metadata.adresse) {
            console.log(`   Adresse: ${pub.metadata.adresse}`);
          }
          if (pub.metadata.typeProjet) {
            console.log(`   Projet: ${pub.metadata.typeProjet}`);
          }
        }

        if (pub.description) {
          console.log(
            `   Description: ${pub.description.substring(0, 100)}...`
          );
        }
      });

      if (publications.length > 5) {
        console.log(
          `\n... et ${publications.length - 5} autre(s) publication(s)`
        );
      }

      // Statistiques par type
      console.log("\n" + "=".repeat(60));
      console.log("📈 STATISTIQUES PAR TYPE");
      console.log("=".repeat(60));

      const byType = publications.reduce((acc, pub) => {
        acc[pub.type] = (acc[pub.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(byType).forEach(([type, count]) => {
        console.log(`${type}: ${count}`);
      });

      // Statistiques par commune
      console.log("\n" + "=".repeat(60));
      console.log("🏘️  TOP 10 COMMUNES");
      console.log("=".repeat(60));

      const byCommune = publications.reduce((acc, pub) => {
        acc[pub.commune] = (acc[pub.commune] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCommunes = Object.entries(byCommune)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      topCommunes.forEach(([commune, count]) => {
        console.log(`${commune}: ${count} publication(s)`);
      });
    } else {
      console.log("⚠️  Aucune publication trouvée");
      console.log("\nPossible raisons:");
      console.log("- Le site https://fo.fr.ch/ n'est pas accessible");
      console.log("- Le format du PDF a changé");
      console.log("- Aucun PDF récent disponible");
    }
  } catch (error) {
    console.error("\n❌ ERREUR:", error);
    if (error instanceof Error) {
      console.error("\nStack trace:", error.stack);
    }
    process.exit(1);
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Test terminé: ${new Date().toISOString()}`);
  console.log("=".repeat(60));
}

// Exécuter le test
testFribourgScraper()
  .then(() => {
    console.log("\n✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Le script a échoué:", error);
    process.exit(1);
  });
