import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  MasterScraper,
  deduplicatePublications,
  filterRecentPublications,
} from "@/features/veille/scraper";

/**
 * Endpoint Cron pour scraper les publications communales
 * Sécurisé par CRON_SECRET
 *
 * Configuration dans vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/scrape-veille",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
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

    // 1. Scraper toutes les sources
    const scraper = new MasterScraper();
    const rawPublications = await scraper.scrapeAll();

    // 2. Déduplicater et filtrer (30 derniers jours)
    let publications = deduplicatePublications(rawPublications);
    publications = filterRecentPublications(publications, 30);

    console.log(
      `[Veille Cron] ${publications.length} publication(s) à traiter`
    );

    // 3. Enregistrer en base de données
    let created = 0;
    let skipped = 0;

    for (const pub of publications) {
      try {
        // Vérifier si la publication existe déjà
        const existing = await prisma.veillePublication.findFirst({
          where: {
            url: pub.url,
            commune: pub.commune,
          },
        });

        if (existing) {
          skipped++;
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
      `[Veille Cron] Terminé - ${created} créées, ${skipped} ignorées`
    );

    return NextResponse.json({
      success: true,
      scraped: rawPublications.length,
      processed: publications.length,
      created,
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
