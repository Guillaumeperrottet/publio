import type { ScrapedPublication } from "../types";

/**
 * Scraper pour le Bulletin Officiel du canton du Valais
 * https://amtsblatt.vs.ch/
 *
 * Le Bulletin Officiel du Valais publie quotidiennement les publications
 * officielles via une API qui retourne directement un PDF.
 */
export class ValaisOfficialScraper {
  private apiUrl =
    "https://amtsblatt.vs.ch/api/v1/archive/issue-of-today?tenant=kabvs&language=fr";
  private baseUrl = "https://amtsblatt.vs.ch";

  /**
   * Scraper le Bulletin Officiel du Valais
   */
  async scrape(): Promise<ScrapedPublication[]> {
    try {
      console.log("[ValaisOfficialScraper] Début du scraping...");

      // Télécharger le PDF via l'API
      const response = await fetch(this.apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/pdf,*/*",
        },
      });

      if (!response.ok) {
        console.error(
          `[ValaisOfficialScraper] Erreur API: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(
        `[ValaisOfficialScraper] PDF téléchargé: ${buffer.length} bytes`
      );

      // Parser le PDF avec l'API v2 de pdf-parse
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      const text = result.text;

      console.log(
        `[ValaisOfficialScraper] PDF parsé: ${text.length} caractères`
      );

      // Extraire les publications
      const publications = this.parsePublications(text);

      console.log(
        `[ValaisOfficialScraper] ${publications.length} publication(s) trouvée(s)`
      );

      return publications;
    } catch (error) {
      console.error("[ValaisOfficialScraper] Erreur:", error);
      return [];
    }
  }

  /**
   * Parser le texte du PDF et extraire les publications
   */
  private parsePublications(text: string): ScrapedPublication[] {
    const publications: ScrapedPublication[] = [];

    // Le bulletin Valais est structuré avec des sections et des publications séparées
    // Format typique:
    // Titre de la publication
    // Commune de [Nom]
    // Type de procédure
    // Délai / Date
    // Description...
    // Point de contact

    // Diviser par les grandes sections
    const sections = text.split(
      /\n(?=Construction, territoire|Autorités et droits|Décisions, avis)/
    );

    for (const section of sections) {
      // Extraire les publications dans chaque section
      // On cherche les blocs qui commencent par un titre et contiennent une commune
      const lines = section.split("\n");
      let currentPub: Partial<ScrapedPublication> | null = null;
      let currentTitle = "";
      let currentDescription: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Détecter le début d'une nouvelle publication
        // Titres communs: "Décision", "Demande", "Avis", etc.
        if (
          /^(Décision|Demande|Avis|Mise|Opposition|Signalisation|Autorisation|Permis)/i.test(
            line
          )
        ) {
          // Sauvegarder la publication précédente
          if (currentPub && currentTitle) {
            publications.push({
              title: currentTitle,
              description: currentDescription.join(" ").substring(0, 500),
              url: this.baseUrl,
              commune: currentPub.commune || "Non spécifiée",
              canton: "VS",
              type: this.detectPublicationType(
                currentTitle + " " + currentDescription.join(" ")
              ),
              publishedAt: new Date(),
              metadata: {
                source: "Bulletin Officiel Valais",
                url: this.apiUrl,
              },
            });
          }

          // Nouvelle publication
          currentTitle = line;
          currentDescription = [];
          // Extraire la commune depuis le titre
          const commune = this.extractCommuneFromTitle(line, "");
          currentPub = {
            commune: commune !== "Non spécifiée" ? commune : undefined,
          };
        }
        // Détecter la commune dans le contenu
        else if (/^Commune (de|d')/i.test(line)) {
          if (currentPub) {
            const match = line.match(/Commune (?:de|d')\s+(.+)/i);
            if (match) {
              currentPub.commune = match[1].trim();
            }
          }
        }
        // Ignorer certaines lignes
        else if (
          /^(Délai|Point de contact|Type de|Numéro|Date)/i.test(line) ||
          line.length < 10
        ) {
          // Ligne de métadonnées, on l'ignore ou on l'ajoute à la description
          if (currentDescription.length > 0) {
            currentDescription.push(line);
          }
        }
        // Description
        else if (currentPub) {
          currentDescription.push(line);
        }
      }

      // Sauvegarder la dernière publication
      if (currentPub && currentTitle) {
        publications.push({
          title: currentTitle,
          description: currentDescription.join(" ").substring(0, 500),
          url: this.baseUrl,
          commune: currentPub.commune || "Non spécifiée",
          canton: "VS",
          type: this.detectPublicationType(
            currentTitle + " " + currentDescription.join(" ")
          ),
          publishedAt: new Date(),
          metadata: {
            source: "Bulletin Officiel Valais",
            url: this.apiUrl,
          },
        });
      }
    }

    return publications;
  }

  /**
   * Détecter le type de publication
   */
  private detectPublicationType(text: string): PublicationType {
    const textLower = text.toLowerCase();

    // Permis et autorisations
    if (
      textLower.includes("permis de construire") ||
      textLower.includes("autorisation de construire") ||
      textLower.includes("demande d'autorisation de construire")
    ) {
      return "PERMIS_CONSTRUIRE";
    }

    if (
      textLower.includes("autorisation de") ||
      textLower.includes("demande d'autorisation")
    ) {
      return "AUTORISATION_CONSTRUIRE";
    }

    // Mise à l'enquête
    if (
      textLower.includes("mise à l'enquête") ||
      textLower.includes("mise à l'enquete") ||
      textLower.includes("enquête publique") ||
      textLower.includes("consultation publique")
    ) {
      return "MISE_A_LENQUETE";
    }

    // Oppositions et recours
    if (
      textLower.includes("opposition") ||
      textLower.includes("délai d'opposition") ||
      textLower.includes("recours")
    ) {
      return "OPPOSITION";
    }

    // Décisions
    if (
      textLower.includes("décision") ||
      textLower.includes("decision") ||
      textLower.includes("jugement")
    ) {
      return "AVIS_OFFICIEL";
    }

    // Avis officiels
    if (textLower.includes("avis") || textLower.includes("publication")) {
      return "AVIS_OFFICIEL";
    }

    return "AUTRE";
  }

  /**
   * Extraire le nom de la commune depuis le titre ou le contenu
   */
  private extractCommuneFromTitle(title: string, content: string): string {
    // 1. Chercher dans le titre après une virgule (ex: "Décision – Signalisation routière, Chalais")
    const titleMatch = title.match(
      /,\s*([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+(?:[-\s][A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+)*)/
    );
    if (titleMatch) {
      const commune = titleMatch[1].trim();
      // Vérifier que ce n'est pas un mot-clé générique
      if (!["Délai", "Point", "Avis", "Type", "Numéro"].includes(commune)) {
        return commune;
      }
    }

    // 2. Format: "Commune de XXX" ou "Gemeinde XXX"
    const communeMatch = content.match(
      /(?:Commune|Gemeinde)\s+(?:de\s+)?([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+(?:[-\s][A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+)*)/i
    );
    if (communeMatch) {
      return communeMatch[1].trim();
    }

    // 3. Chercher dans les premières lignes du contenu
    const lines = content.split("\n").slice(0, 5);
    for (const line of lines) {
      const match = line.match(
        /^([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+(?:[-\s][A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ-]+)*)$/
      );
      if (match && match[1].length > 3) {
        const candidate = match[1].trim();
        // Liste blanche de communes valaisannes connues
        const valaisCommunes = [
          "Sion",
          "Sierre",
          "Martigny",
          "Monthey",
          "Brig",
          "Visp",
          "Naters",
          "Conthey",
          "Bagnes",
          "Fully",
          "Saxon",
          "Vétroz",
          "Savièse",
          "Chalais",
          "Chippis",
          "Vex",
          "Salvan",
          "Zermatt",
          "Hohtenn",
          "Collombey-Muraz",
          "Ayent",
          "Grimisuat",
          "Chamoson",
        ];
        if (valaisCommunes.some((c) => candidate.includes(c))) {
          return candidate;
        }
      }
    }

    return "Non spécifiée";
  }
}

/**
 * Type de publication
 */
type PublicationType =
  | "MISE_A_LENQUETE"
  | "PERMIS_CONSTRUIRE"
  | "AUTORISATION_CONSTRUIRE"
  | "OPPOSITION"
  | "AVIS_OFFICIEL"
  | "APPEL_DOFFRES"
  | "AUTRE";
