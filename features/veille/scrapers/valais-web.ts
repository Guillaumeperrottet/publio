import puppeteer, { type Browser } from "puppeteer";
import type { ScrapedPublication } from "../types";

/**
 * Scraper pour le Bulletin Officiel du Valais (version web)
 * https://www.bulletinvalaiswallis.ch/fr/avis-officiels/
 *
 * Ce scraper utilise Puppeteer pour extraire les données du site web Nuxt.js
 * après l'exécution du JavaScript
 *
 * FILTRAGE: Exclut les catégories déjà couvertes par le scraper PDF:
 * - Marchés publics (SIMAP aussi)
 * - Annonces officielles (dans PDF)
 * - Commission cantonale de constructions (dans PDF)
 *
 * Cible: Actes judiciaires, Faillites, Poursuites, Ministère public, etc.
 */
export class ValaisWebScraper {
  private baseUrl = "https://www.bulletinvalaiswallis.ch";
  private searchUrl = `${this.baseUrl}/fr/avis-officiels/`;

  // Catégories à EXCLURE (déjà dans le PDF ou SIMAP)
  private excludedCategories = [
    "marchés publics",
    "simap",
    "annonces officielles",
    "commission cantonale de constructions",
    "mise au concours", // Souvent dans les annonces officielles du PDF
  ];

  /**
   * Scraper les publications du Bulletin Officiel du Valais
   */
  async scrape(): Promise<ScrapedPublication[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      console.log("[ValaisWebScraper] Début du scraping...");

      const publications: ScrapedPublication[] = [];
      const maxPages = 3; // Limiter à 3 pages pour éviter de surcharger (30 publications)

      for (let page = 1; page <= maxPages; page++) {
        console.log(`[ValaisWebScraper] Scraping page ${page}...`);

        const pagePublications = await this.scrapePage(browser, page);
        publications.push(...pagePublications);

        // Pause entre les pages pour éviter de surcharger le serveur
        if (page < maxPages) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(
        `[ValaisWebScraper] Scraping terminé: ${publications.length} publications trouvées`
      );

      return publications;
    } catch (error) {
      console.error("[ValaisWebScraper] Erreur:", error);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Scraper une page spécifique avec Puppeteer
   */
  private async scrapePage(
    browser: Browser,
    pageNum: number
  ): Promise<ScrapedPublication[]> {
    const page = await browser.newPage();

    try {
      const url = `${this.searchUrl}?page=${pageNum}`;
      console.log(`[ValaisWebScraper] Récupération de ${url}...`);

      // Naviguer vers la page
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Attendre que les publications soient chargées
      await page.waitForSelector("h3.uppercase.text-brand-gray", {
        timeout: 10000,
      });

      // Attendre un peu pour que tout soit chargé
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Debug: capturer les logs du navigateur
      page.on("console", (msg) => {
        console.log(`[Browser] ${msg.text()}`);
      });

      // Extraire les données des publications directement du DOM
      const publications = await page.evaluate((baseUrl: string) => {
        const items: Array<{
          title: string;
          commune: string;
          category: string;
          date: string;
          url: string;
        }> = [];

        // Il y a plusieurs conteneurs .divide-y, on veut celui qui contient les publications
        const allDivideY = document.querySelectorAll(".divide-y");
        const publicationsContainer = Array.from(allDivideY).find(
          (c) => c.querySelector("h3.uppercase.text-brand-gray") !== null
        );

        if (!publicationsContainer) {
          console.log("Conteneur de publications non trouvé");
          return items;
        }

        const publicationElements = publicationsContainer.querySelectorAll(
          ":scope > div.bg-white.py-6"
        );

        console.log(
          `Nombre de publications trouvées: ${publicationElements.length}`
        );

        publicationElements.forEach((element, index) => {
          try {
            // Commune (dans le h3)
            const communeElement = element.querySelector(
              "h3.uppercase.text-brand-gray"
            );
            let commune =
              communeElement?.textContent?.trim() || "Non spécifiée";

            // Nettoyer le nom de la commune (enlever "Commune de")
            commune = commune.replace(/^Commune de\s+/i, "").trim();

            // Catégorie (dans le span avec bg-brand-red)
            const categoryElement = element.querySelector(
              "span.bg-brand-red.text-white"
            );
            const category = categoryElement?.textContent?.trim() || "";

            // Titre (dans le h2)
            const titleElement = element.querySelector("h2.pb-2");
            const title = titleElement?.textContent?.trim() || "";

            // Lien (chercher tous les liens et prendre celui qui va vers /content/)
            const linkElement = element.querySelector("a[href*='/content/']");
            const href = linkElement?.getAttribute("href") || "";
            const url = href
              ? href.startsWith("http")
                ? href
                : `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`
              : baseUrl;

            // Date (chercher dans les spans avec text-brand-gray text-sm)
            const dateSpans = element.querySelectorAll(
              "span.text-brand-gray.text-sm"
            );
            let dateText = "";
            dateSpans.forEach((span) => {
              const text = span.textContent?.trim() || "";
              // Chercher un pattern de date comme "11.12.2024"
              if (/\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) {
                dateText = text;
              }
            });

            console.log(
              `Publication ${index + 1}: ${title.substring(
                0,
                50
              )} - ${commune} - ${category}`
            );

            // Filtrer les catégories exclues (gérées par le PDF scraper)
            if (title && commune) {
              items.push({
                title,
                commune,
                category,
                date: dateText,
                url,
              });
            }
          } catch (err) {
            console.error("Erreur lors du parsing d'un élément:", err);
          }
        });

        return items;
      }, this.baseUrl);

      console.log(
        `[ValaisWebScraper] ${publications.length} publications trouvées sur la page ${pageNum}`
      );

      // Convertir en ScrapedPublication
      const scrapedPubs = publications.map((item: (typeof publications)[0]) =>
        this.convertToScrapedPublication(item)
      );

      // Filtrer les catégories exclues
      const filteredPubs = scrapedPubs.filter((pub) =>
        this.shouldIncludePublication(pub)
      );

      console.log(
        `[ValaisWebScraper] ${
          filteredPubs.length
        } publications après filtrage (${
          publications.length - filteredPubs.length
        } exclues)`
      );

      return filteredPubs;
    } catch (error) {
      console.error(
        `[ValaisWebScraper] Erreur lors du scraping de la page ${pageNum}:`,
        error
      );
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Vérifier si une publication doit être incluse (filtrage des catégories)
   */
  private shouldIncludePublication(pub: ScrapedPublication): boolean {
    const category = pub.metadata?.category as string | undefined;
    if (!category) return true; // Garder si pas de catégorie

    const lowerCategory = category.toLowerCase();

    // Exclure si la catégorie est dans la liste d'exclusion
    return !this.excludedCategories.some((excluded) =>
      lowerCategory.includes(excluded.toLowerCase())
    );
  }

  /**
   * Convertir un item scraped en ScrapedPublication
   */
  private convertToScrapedPublication(item: {
    title: string;
    commune: string;
    category: string;
    date: string;
    url: string;
  }): ScrapedPublication {
    // Parser la date
    let publicationDate = new Date();
    if (item.date) {
      // Format attendu: "11.12.2024" ou similaire
      const dateParts = item.date.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (dateParts) {
        const day = parseInt(dateParts[1], 10);
        const month = parseInt(dateParts[2], 10) - 1; // Les mois commencent à 0
        const year = parseInt(dateParts[3], 10);
        publicationDate = new Date(year, month, day);
      }
    }

    // Mapper la catégorie
    const type = this.mapCategoryToType(item.category);

    return {
      title: item.title,
      url: item.url,
      publishedAt: publicationDate,
      canton: "VS" as const,
      commune: item.commune,
      type,
      description: "",
      metadata: {
        category: item.category,
      },
    };
  }

  /**
   * Mapper les catégories du site vers nos types
   */
  private mapCategoryToType(
    category: string
  ): import("../types").PublicationType {
    const lowerCategory = category.toLowerCase();

    // Marchés publics / SIMAP
    if (
      lowerCategory.includes("marché") ||
      lowerCategory.includes("appel d'offre") ||
      lowerCategory.includes("soumission") ||
      lowerCategory.includes("simap")
    ) {
      return "APPEL_DOFFRES";
    }

    // Enquêtes publiques
    if (
      lowerCategory.includes("enquête") ||
      lowerCategory.includes("mise à l'enquête")
    ) {
      return "MISE_A_LENQUETE";
    }

    // Oppositions
    if (lowerCategory.includes("opposition")) {
      return "OPPOSITION";
    }

    // Permis de construire
    if (lowerCategory.includes("permis de construire")) {
      return "PERMIS_CONSTRUIRE";
    }

    // Autorisation de construire / Commission cantonale de constructions
    if (
      lowerCategory.includes("construction") ||
      lowerCategory.includes("autorisation de construire") ||
      lowerCategory.includes("commission cantonale de constructions")
    ) {
      return "AUTORISATION_CONSTRUIRE";
    }

    // Avis officiel / Annonces officielles / Citations / Décisions
    if (
      lowerCategory.includes("avis") ||
      lowerCategory.includes("officiel") ||
      lowerCategory.includes("annonce") ||
      lowerCategory.includes("citation") ||
      lowerCategory.includes("décision") ||
      lowerCategory.includes("judiciaire") ||
      lowerCategory.includes("autorité") ||
      lowerCategory.includes("application des peines") ||
      lowerCategory.includes("exécution")
    ) {
      return "AVIS_OFFICIEL";
    }

    return "AUTRE";
  }
}
