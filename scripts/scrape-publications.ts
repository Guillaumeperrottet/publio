#!/usr/bin/env tsx
/**
 * Script de scraping des publications communales
 * Exécuté par cron job (6x/jour pour SIMAP)
 *
 * Usage:
 *   npx tsx scripts/scrape-publications.ts [--include-weekly]
 *
 * Options:
 *   --include-weekly : Inclut les sources hebdomadaires (Fribourg FO, etc.)
 */

import { prisma } from "@/lib/db/prisma";
import {
  MasterScraper,
  deduplicatePublications,
  filterRecentPublications,
} from "@/features/veille/scraper";
import { SimapScraper } from "@/features/veille/scrapers/simap";
import { FribourgOfficialGazetteScraper } from "@/features/veille/scrapers/fribourg-official";
import { ValaisOfficialScraper } from "@/features/veille/scrapers/valais-official";
import { ValaisWebScraper } from "@/features/veille/scrapers/valais-web";
import { notifyMatchingVeilleSubscriptions } from "@/features/notifications/actions";

async function scrapeAndStorePublications(includeWeekly = false) {
  console.log("=".repeat(60));
  console.log("📡 SCRAPING DES PUBLICATIONS CANTONALES");
  console.log("=".repeat(60));
  console.log(`Démarrage: ${new Date().toISOString()}\n`);

  try {
    // 1. Récupérer tous les cantons actifs (depuis les abonnements)
    const activeSubscriptions = await prisma.veilleSubscription.findMany({
      select: { cantons: true },
    });

    const allCantons = Array.from(
      new Set(activeSubscriptions.flatMap((sub) => sub.cantons))
    );

    console.log(
      `📍 Cantons surveillés: ${allCantons.length} (${allCantons.join(", ")})\n`
    );

    // 2. Scraper SIMAP (plateforme nationale)
    const simapScraper = new SimapScraper();
    const simapPublications = await simapScraper.scrape(
      allCantons as (
        | "VD"
        | "GE"
        | "VS"
        | "FR"
        | "NE"
        | "JU"
        | "BE"
        | "TI"
        | "GR"
      )[]
    );

    console.log(
      `🇨🇭 SIMAP: ${simapPublications.length} publication(s) trouvée(s)`
    );

    // 3. Scraper Fribourg (Feuille Officielle PDF) - uniquement si demandé
    let fribourgPublications: any[] = [];
    if (includeWeekly && allCantons.includes("FR")) {
      console.log(`\n📄 Scraping Fribourg FO (hebdomadaire)...`);
      const fribourgScraper = new FribourgOfficialGazetteScraper();
      fribourgPublications = await fribourgScraper.scrape();
      console.log(
        `📄 Fribourg FO: ${fribourgPublications.length} publication(s) trouvée(s)`
      );
    } else if (!includeWeekly) {
      console.log(
        `\n⏭️  Fribourg FO ignoré (sources hebdomadaires désactivées)`
      );
    }

    // 4. Scraper Valais - Double approche pour couverture complète
    let valaisPublications: any[] = [];
    if (allCantons.includes("VS")) {
      // 4a. PDF Bulletin Officiel (constructions, marchés publics, annonces)
      console.log(`\n📰 Scraping Valais BO PDF (constructions & marchés)...`);
      const valaisPdfScraper = new ValaisOfficialScraper();
      const valaisPdfPubs = await valaisPdfScraper.scrape();
      console.log(
        `📰 Valais PDF: ${valaisPdfPubs.length} publication(s) trouvée(s)`
      );

      // 4b. Web scraping (actes judiciaires, faillites, etc.)
      console.log(`\n🌐 Scraping Valais BO Web (actes & faillites)...`);
      const valaisWebScraper = new ValaisWebScraper();
      const valaisWebPubs = await valaisWebScraper.scrape();
      console.log(
        `🌐 Valais Web: ${valaisWebPubs.length} publication(s) trouvée(s)`
      );

      valaisPublications = [...valaisPdfPubs, ...valaisWebPubs];
    }

    // 5. Scraper les autres sources (canton-specific)
    const scraper = new MasterScraper();
    const cantonPublications = await scraper.scrapeAll();

    console.log(
      `🏛️  Sources cantonales: ${cantonPublications.length} publication(s) trouvée(s)`
    );

    // 5. Combiner toutes les publications
    const rawPublications = [
      ...simapPublications,
      ...fribourgPublications,
      ...valaisPublications,
      ...cantonPublications,
    ];

    console.log(
      `\n✅ Scraping terminé: ${rawPublications.length} publication(s) brute(s)\n`
    );

    // 2. Déduplicater et filtrer (30 derniers jours)
    let publications = deduplicatePublications(rawPublications);
    publications = filterRecentPublications(publications, 30);

    console.log(
      `\n📊 Après traitement: ${publications.length} publication(s) à traiter\n`
    );

    if (publications.length === 0) {
      console.log("ℹ️  Aucune nouvelle publication à enregistrer");
      return { processed: 0, created: 0, skipped: 0 };
    }

    // 3. Enregistrer en base de données
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const pub of publications) {
      try {
        // Pour SIMAP, utiliser projectNumber comme identifiant unique
        // Pour les autres sources, utiliser l'URL
        const isSIMAP = pub.metadata?.source === "SIMAP";
        const projectNumber = pub.metadata?.projectNumber;

        let existing = null;

        if (isSIMAP && projectNumber) {
          // Chercher par projectNumber SIMAP
          existing = await prisma.veillePublication.findFirst({
            where: {
              metadata: {
                path: ["projectNumber"],
                equals: projectNumber,
              },
            },
          });
        } else {
          // Chercher par URL pour les autres sources
          existing = await prisma.veillePublication.findFirst({
            where: {
              url: pub.url,
              commune: pub.commune,
            },
          });
        }

        if (existing) {
          // Mettre à jour l'URL si elle a changé (important pour SIMAP)
          if (existing.url !== pub.url) {
            await prisma.veillePublication.update({
              where: { id: existing.id },
              data: {
                url: pub.url,
                title: pub.title,
                description: pub.description || null,
                metadata: pub.metadata || {},
              },
            });
            updated++;
            console.log(
              `🔄 Mise à jour: ${pub.commune} - ${pub.title.substring(
                0,
                50
              )}...`
            );
          } else {
            skipped++;
            console.log(
              `⏭️  Inchangée: ${pub.commune} - ${pub.title.substring(0, 50)}...`
            );
          }
          continue;
        }

        // Créer la nouvelle publication
        const newPublication = await prisma.veillePublication.create({
          data: {
            title: pub.title,
            description: pub.description || null,
            url: pub.url,
            commune: pub.commune,
            canton: pub.canton,
            type: pub.type,
            publishedAt: pub.publishedAt,
            metadata: pub.metadata || {},
          },
        });

        created++;
        console.log(
          `✅ Créée: ${pub.commune} - ${pub.title.substring(0, 50)}...`
        );

        // Notify matching veille subscriptions
        try {
          await notifyMatchingVeilleSubscriptions(newPublication.id);
        } catch (notifError) {
          console.error(
            `⚠️  Error notifying subscriptions for ${newPublication.id}:`,
            notifError
          );
          // Don't block the scraping if notification fails
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'enregistrement de "${pub.title}":`,
          error
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`Publications scrapées:    ${rawPublications.length}`);
    console.log(`Après déduplications:     ${publications.length}`);
    console.log(`Nouvelles créées:         ${created}`);
    console.log(`URLs mises à jour:        ${updated}`);
    console.log(`Déjà existantes:          ${skipped}`);
    console.log("=".repeat(60));
    console.log(`Terminé: ${new Date().toISOString()}`);

    return { processed: publications.length, created, updated, skipped };
  } catch (error) {
    console.error("\n❌ ERREUR CRITIQUE:", error);
    throw error;
  }
}

// Exécuter le script
const includeWeekly = process.argv.includes("--include-weekly");

scrapeAndStorePublications(includeWeekly)
  .then(() => {
    console.log("\n✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Le script a échoué:", error);
    process.exit(1);
  });
