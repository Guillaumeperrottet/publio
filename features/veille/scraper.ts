/**
 * Moteur de scraping pour la veille communale
 * Architecture modulaire pour supporter plusieurs sources
 */

import * as cheerio from "cheerio";
import type { ScrapedPublication } from "./types";
import { FribourgOfficialGazetteScraper } from "./scrapers/fribourg-official";

/**
 * Interface pour tous les scrapers
 */
export interface VeilleScraper {
  name: string;
  canton: string;
  scrape(): Promise<ScrapedPublication[]>;
}

/**
 * Scraper pour le Canton de Fribourg
 * Source : https://www.fr.ch/etat-et-droit/poursuites-et-faillites/appels-doffres
 */
export class FribourgScraper implements VeilleScraper {
  name = "Canton de Fribourg";
  canton = "FR";
  private baseUrl = "https://www.fr.ch";

  async scrape(): Promise<ScrapedPublication[]> {
    try {
      console.log(`[FribourgScraper] Début du scraping...`);

      const url =
        "https://www.fr.ch/etat-et-droit/poursuites-et-faillites/appels-doffres";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const publications: ScrapedPublication[] = [];

      // Chercher les articles de publication
      // La structure typique d'une page Drupal fr.ch utilise des articles ou des divs avec classe spécifique
      $("article, .node-publication, .view-content .views-row").each(
        (_, element) => {
          try {
            const $item = $(element);

            // Extraction du titre
            const titleElement = $item.find("h2, h3, .field--name-title, a");
            const title = titleElement.text().trim();

            if (!title) return; // Skip si pas de titre

            // Extraction de l'URL
            let url = titleElement.find("a").attr("href") || "";
            if (url && !url.startsWith("http")) {
              url = this.baseUrl + url;
            }

            // Extraction de la description
            const description =
              $item
                .find(".field--name-body, .field--name-field-description, p")
                .first()
                .text()
                .trim() || title;

            // Extraction de la date
            const dateText = $item
              .find(".field--name-post-date, .field--name-created, time, .date")
              .text()
              .trim();
            const publishedAt = this.parseDate(dateText);

            // Extraction de la commune (peut être dans différents champs)
            const commune =
              $item
                .find(".field--name-field-commune, .field--name-field-location")
                .text()
                .trim() || "Fribourg";

            // Métadonnées additionnelles
            const metadata: Record<string, string> = {};

            // Chercher l'adresse
            const adresse = $item
              .find(".field--name-field-address, .address")
              .text()
              .trim();
            if (adresse) metadata.adresse = adresse;

            // Chercher la parcelle
            const parcelle = $item
              .find(".field--name-field-parcel, .parcelle")
              .text()
              .trim();
            if (parcelle) metadata.parcelle = parcelle;

            publications.push({
              title,
              description,
              url:
                url ||
                `${this.baseUrl}/etat-et-droit/poursuites-et-faillites/appels-doffres`,
              commune,
              canton: "FR",
              type: "APPEL_DOFFRES", // Type par défaut pour cette page
              publishedAt,
              metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
            });
          } catch (itemError) {
            console.error("[FribourgScraper] Erreur sur un item:", itemError);
          }
        }
      );

      // Si aucune publication trouvée avec la structure standard, chercher des alternatives
      if (publications.length === 0) {
        console.log(
          "[FribourgScraper] Aucune publication trouvée avec les sélecteurs standards"
        );
        console.log("[FribourgScraper] Structure HTML de la page à analyser");

        // Chercher tous les liens contenant des mots-clés
        $('a:contains("appel"), a:contains("offre"), a:contains("publication")')
          .slice(0, 10)
          .each((_, link) => {
            const $link = $(link);
            const title = $link.text().trim();
            let url = $link.attr("href") || "";

            if (url && !url.startsWith("http")) {
              url = this.baseUrl + url;
            }

            if (title && url && !publications.find((p) => p.url === url)) {
              publications.push({
                title,
                description: title,
                url,
                commune: "Fribourg",
                canton: "FR",
                type: "APPEL_DOFFRES",
                publishedAt: new Date(),
              });
            }
          });
      }

      console.log(
        `[FribourgScraper] ${publications.length} publication(s) trouvée(s)`
      );
      return publications;
    } catch (error) {
      console.error("[FribourgScraper] Erreur:", error);
      return [];
    }
  }

  /**
   * Parse une date depuis différents formats possibles
   */
  private parseDate(dateText: string): Date {
    if (!dateText) return new Date();

    // Format DD.MM.YYYY (format suisse)
    const swissMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (swissMatch) {
      const [, day, month, year] = swissMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Format ISO ou autre
    const parsed = Date.parse(dateText);
    return isNaN(parsed) ? new Date() : new Date(parsed);
  }
}

/**
 * Scraper pour le Canton de Genève
 * Source : ge.ch/miae
 */
export class GeneveScraper implements VeilleScraper {
  name = "Canton de Genève";
  canton = "GE";

  async scrape(): Promise<ScrapedPublication[]> {
    try {
      console.log(`[GeneveScraper] Début du scraping...`);

      const publications: ScrapedPublication[] = [];

      // TODO: Implémenter le scraping de ge.ch/miae
      // Le site de Genève a une structure différente

      if (process.env.NODE_ENV === "development") {
        publications.push({
          title: "Rénovation immeuble locatif - Rue du Lac 45",
          description:
            "Rénovation complète d'un immeuble de 5 étages avec création d'une nouvelle cage d'ascenseur",
          url: "https://ge.ch/miae/exemple-1",
          commune: "Genève",
          canton: "GE",
          type: "PERMIS_CONSTRUIRE",
          publishedAt: new Date(),
          metadata: {
            parcelle: "5678",
            adresse: "Rue du Lac 45",
          },
        });
      }

      console.log(
        `[GeneveScraper] ${publications.length} publication(s) trouvée(s)`
      );
      return publications;
    } catch (error) {
      console.error("[GeneveScraper] Erreur:", error);
      return [];
    }
  }
}

/**
 * Scraper pour le Canton du Valais
 * Source : Sites communaux individuels
 */
export class ValaisScraper implements VeilleScraper {
  name = "Canton du Valais";
  canton = "VS";

  async scrape(): Promise<ScrapedPublication[]> {
    try {
      console.log(`[ValaisScraper] Début du scraping...`);

      const publications: ScrapedPublication[] = [];

      // TODO: Le Valais nécessite de scraper plusieurs sites communaux
      // On peut commencer par les principales communes (Sion, Martigny, Monthey)

      if (process.env.NODE_ENV === "development") {
        publications.push({
          title: "Agrandissement chalet - Route de la Montagne 8",
          description:
            "Extension d'un chalet existant avec construction d'une nouvelle aile",
          url: "https://www.sion.ch/mise-a-lenquete/exemple-1",
          commune: "Sion",
          canton: "VS",
          type: "MISE_A_LENQUETE",
          publishedAt: new Date(),
          metadata: {
            adresse: "Route de la Montagne 8",
            superficie: "65 m²",
          },
        });
      }

      console.log(
        `[ValaisScraper] ${publications.length} publication(s) trouvée(s)`
      );
      return publications;
    } catch (error) {
      console.error("[ValaisScraper] Erreur:", error);
      return [];
    }
  }
}

/**
 * Scraper principal qui orchestre tous les scrapers
 */
export class MasterScraper {
  private scrapers: VeilleScraper[] = [
    new FribourgScraper(),
    new GeneveScraper(),
    new ValaisScraper(),
  ];

  /**
   * Scraper toutes les sources
   */
  async scrapeAll(): Promise<ScrapedPublication[]> {
    console.log(
      `[MasterScraper] Lancement du scraping de ${this.scrapers.length} source(s)...`
    );

    const results = await Promise.allSettled(
      this.scrapers.map((scraper) => scraper.scrape())
    );

    const allPublications: ScrapedPublication[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allPublications.push(...result.value);
        console.log(
          `[MasterScraper] ${this.scrapers[index].name}: ${result.value.length} publication(s)`
        );
      } else {
        console.error(
          `[MasterScraper] ${this.scrapers[index].name}: Erreur - ${result.reason}`
        );
      }
    });

    // Ajouter le scraper Feuille Officielle Fribourg (PDF)
    try {
      const fribourgOfficialScraper = new FribourgOfficialGazetteScraper();
      const fribourgPublications = await fribourgOfficialScraper.scrape();
      allPublications.push(...fribourgPublications);
      console.log(
        `[MasterScraper] Feuille Officielle Fribourg (PDF): ${fribourgPublications.length} publication(s)`
      );
    } catch (error) {
      console.error(
        "[MasterScraper] Feuille Officielle Fribourg: Erreur -",
        error
      );
    }

    console.log(
      `[MasterScraper] Total: ${allPublications.length} publication(s) scrapée(s)`
    );
    return allPublications;
  }

  /**
   * Scraper un canton spécifique
   */
  async scrapeCanton(canton: string): Promise<ScrapedPublication[]> {
    const scraper = this.scrapers.find((s) => s.canton === canton);
    if (!scraper) {
      console.warn(
        `[MasterScraper] Aucun scraper trouvé pour le canton ${canton}`
      );
      return [];
    }

    return scraper.scrape();
  }
}

/**
 * Helper pour déduplicater les publications
 */
export function deduplicatePublications(
  publications: ScrapedPublication[]
): ScrapedPublication[] {
  const seen = new Set<string>();
  const deduplicated: ScrapedPublication[] = [];

  for (const pub of publications) {
    // Créer une clé unique basée sur l'URL et la commune
    const key = `${pub.url}-${pub.commune}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(pub);
    }
  }

  console.log(
    `[Deduplication] ${publications.length} -> ${deduplicated.length} publications`
  );
  return deduplicated;
}

/**
 * Helper pour filtrer les publications récentes
 */
export function filterRecentPublications(
  publications: ScrapedPublication[],
  daysAgo = 30
): ScrapedPublication[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  const filtered = publications.filter((pub) => pub.publishedAt >= cutoffDate);

  console.log(
    `[Filter] ${filtered.length}/${publications.length} publications des ${daysAgo} derniers jours`
  );
  return filtered;
}
