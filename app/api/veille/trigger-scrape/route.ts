import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { SimapScraper } from "@/features/veille/scrapers/simap";
import {
  deduplicatePublications,
  filterRecentPublications,
} from "@/features/veille/scraper";
import type { Canton } from "@/features/veille/types";

/**
 * Endpoint pour déclencher un scraping à la demande
 * Utilisé quand un utilisateur modifie son abonnement veille
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { organizationId, cantons } = await request.json();

    if (!organizationId || !cantons || !Array.isArray(cantons)) {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN", "EDITOR"] },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    console.log(
      `[Trigger Scrape] Début du scraping pour ${cantons.join(", ")}`
    );

    // Scraper SIMAP pour les cantons spécifiés
    const simapScraper = new SimapScraper();
    const simapPublications = await simapScraper.scrape(cantons as Canton[]);

    // Déduplicater et filtrer (30 derniers jours)
    let publications = deduplicatePublications(simapPublications);
    publications = filterRecentPublications(publications, 30);

    console.log(
      `[Trigger Scrape] ${publications.length} publication(s) trouvée(s)`
    );

    // Enregistrer en base de données
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const pub of publications) {
      try {
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
          // Mettre à jour si l'URL a changé
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
          `[Trigger Scrape] Erreur lors de l'enregistrement:`,
          error
        );
      }
    }

    console.log(
      `[Trigger Scrape] Résumé: ${created} créées, ${updated} mises à jour, ${skipped} inchangées`
    );

    return NextResponse.json({
      success: true,
      total: publications.length,
      created,
      updated,
      skipped,
    });
  } catch (error) {
    console.error("[Trigger Scrape] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors du scraping" },
      { status: 500 }
    );
  }
}
