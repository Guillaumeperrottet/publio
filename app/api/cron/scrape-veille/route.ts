import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  MasterScraper,
  deduplicatePublications,
  filterRecentPublications,
} from "@/features/veille/scraper";
import { SimapScraper } from "@/features/veille/scrapers/simap";
import type { Canton } from "@/features/veille/types";

/**
 * Endpoint Cron pour scraper les publications communales (SIMAP uniquement)
 * Sécurisé par CRON_SECRET
 *
 * Configuration dans vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/scrape-veille",
 *     "schedule": "0 4,7,10,13,16,19 * * *"
 *   }]
 * }
 *
 * Exécuté 6 fois par jour : 4h, 7h, 10h, 13h, 16h, 19h (UTC)
 * En Suisse (UTC+2 été / UTC+1 hiver) :
 * - Été : 6h, 9h, 12h, 15h, 18h, 21h
 * - Hiver : 5h, 8h, 11h, 14h, 17h, 20h
 *
 * Note : Les sources hebdomadaires (Fribourg FO) sont gérées par
 * /api/cron/scrape-veille-weekly (jeudis 7h UTC)
 */
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Veille Cron] CRON_SECRET non configurée");
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("[Veille Cron] Tentative d'accès non autorisée");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("[Veille Cron] Début du scraping...");

    // 1. Récupérer tous les cantons actifs (depuis les abonnements)
    const activeSubscriptions = await prisma.veilleSubscription.findMany({
      select: { cantons: true },
    });

    const allCantons = Array.from(
      new Set(activeSubscriptions.flatMap((sub) => sub.cantons))
    );

    console.log(`[Veille Cron] Cantons surveillés: ${allCantons.join(", ")}`);

    // 2. Scraper SIMAP (plateforme nationale - source principale)
    const simapScraper = new SimapScraper();
    const simapPublications = await simapScraper.scrape(allCantons as Canton[]);

    console.log(
      `[Veille Cron] SIMAP: ${simapPublications.length} publications`
    );

    // 3. Scraper les sources cantonales complémentaires
    const scraper = new MasterScraper();
    const cantonPublications = await scraper.scrapeAll();

    console.log(
      `[Veille Cron] Sources cantonales: ${cantonPublications.length} publications`
    );

    // 4. Combiner toutes les publications
    const rawPublications = [...simapPublications, ...cantonPublications];

    // 5. Déduplicater et filtrer (30 derniers jours)
    let publications = deduplicatePublications(rawPublications);
    publications = filterRecentPublications(publications, 30);

    console.log(
      `[Veille Cron] ${publications.length} publication(s) à traiter`
    );

    // 6. Enregistrer en base de données
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const pub of publications) {
      try {
        // Pour SIMAP, utiliser projectNumber comme identifiant unique
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
          } else {
            skipped++;
          }
          continue;
        }

        // Créer la nouvelle publication
        await prisma.veillePublication.create({
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
      } catch (error) {
        console.error(
          `[Veille Cron] Erreur enregistrement "${pub.title}":`,
          error
        );
      }
    }

    console.log(
      `[Veille Cron] Terminé - ${created} créées, ${updated} mises à jour, ${skipped} ignorées`
    );

    return NextResponse.json({
      success: true,
      scraped: rawPublications.length,
      processed: publications.length,
      created,
      updated,
      skipped,
    });
  } catch (error) {
    console.error("[Veille Cron] Erreur critique:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
