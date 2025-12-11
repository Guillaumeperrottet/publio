import type { ScrapedPublication, Canton } from "../types";

/**
 * Scraper pour la Feuille Officielle du Canton de Fribourg
 * https://fo.fr.ch/
 *
 * La Feuille Officielle sort chaque semaine (généralement le vendredi)
 * et contient toutes les publications légales du canton.
 */
export class FribourgOfficialGazetteScraper {
  private baseUrl = "https://fo.fr.ch";
  canton: Canton = "FR";

  /**
   * Scraper les dernières publications depuis la Feuille Officielle
   */
  async scrape(): Promise<ScrapedPublication[]> {
    try {
      console.log(
        "[Fribourg FO] Début du scraping de la Feuille Officielle..."
      );

      // 1. Récupérer la page d'accueil pour trouver le dernier numéro
      const homeResponse = await fetch(this.baseUrl);
      const homeHtml = await homeResponse.text();

      // 2. Extraire les liens vers les PDFs récents
      const pdfLinks = this.extractPDFLinks(homeHtml);
      console.log(`[Fribourg FO] ${pdfLinks.length} PDF(s) trouvé(s)`);

      if (pdfLinks.length === 0) {
        console.warn("[Fribourg FO] Aucun PDF trouvé");
        return [];
      }

      const allPublications: ScrapedPublication[] = [];

      // 3. Traiter les 2 derniers numéros (2 dernières semaines)
      const pdfsToProcess = pdfLinks.slice(0, 2);

      for (const pdfUrl of pdfsToProcess) {
        try {
          console.log(`[Fribourg FO] Traitement du PDF: ${pdfUrl}`);
          const publications = await this.processPDF(pdfUrl);
          allPublications.push(...publications);
        } catch (error) {
          console.error(`[Fribourg FO] Erreur PDF ${pdfUrl}:`, error);
        }
      }

      console.log(
        `[Fribourg FO] ${allPublications.length} publication(s) extraite(s)`
      );

      return allPublications;
    } catch (error) {
      console.error("[Fribourg FO] Erreur:", error);
      return [];
    }
  }

  /**
   * Extraire les liens vers les PDFs depuis la page d'accueil
   */
  private extractPDFLinks(html: string): string[] {
    const links: string[] = [];

    console.log(`[Fribourg FO] Analyse du HTML (${html.length} caractères)...`);

    // Patterns multiples pour trouver les PDFs
    const patterns = [
      // Pattern 1: FOprint.php avec numéro
      /href=["']([^"']*FOprint\.php\?numero=\d+[^"']*)/gi,
      // Pattern 2: Fichiers PDF directs
      /href=["']([^"']*\.pdf[^"']*)/gi,
      // Pattern 3: Liens vers /app/
      /href=["']([^"']*\/app\/[^"']*(?:FO|feuille)[^"']*)/gi,
      // Pattern 4: Tout lien contenant "FO" ou "feuille"
      /href=["']([^"']*(?:FO|feuille|officielle)[^"']*\.pdf[^"']*)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let url = match[1];

        // Construire l'URL complète si nécessaire
        if (!url.startsWith("http")) {
          url = url.startsWith("/")
            ? `${this.baseUrl}${url}`
            : `${this.baseUrl}/${url}`;
        }

        // Éviter les doublons
        if (!links.includes(url)) {
          links.push(url);
          console.log(`[Fribourg FO] PDF trouvé: ${url}`);
        }
      }
    }

    // Si aucun PDF trouvé, essayer une approche alternative
    if (links.length === 0) {
      console.log(
        "[Fribourg FO] Aucun PDF trouvé avec les patterns, tentative alternative..."
      );

      // Chercher tous les liens et les afficher pour debugging
      const allLinksRegex = /href=["']([^"']+)/gi;
      let linkMatch;
      const allLinks: string[] = [];

      while ((linkMatch = allLinksRegex.exec(html)) !== null) {
        allLinks.push(linkMatch[1]);
      }

      console.log(`[Fribourg FO] ${allLinks.length} liens trouvés au total`);

      // Afficher les 10 premiers liens pour debugging
      const sampleLinks = allLinks.slice(0, 10);
      console.log("[Fribourg FO] Exemples de liens:", sampleLinks);

      // Essayer de construire l'URL manuellement pour le dernier numéro
      // Format typique: https://fo.fr.ch/app/de/texts_of_law/FOprint.php?numero=9525
      const currentYear = new Date().getFullYear();
      const estimatedNumber =
        9500 +
        Math.floor(
          (new Date().getTime() - new Date(currentYear, 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );

      console.log(
        `[Fribourg FO] Tentative avec numéro estimé: ${estimatedNumber}`
      );

      // Essayer les 5 derniers numéros
      for (let i = 0; i < 5; i++) {
        const numero = estimatedNumber - i;
        const url = `${this.baseUrl}/app/de/texts_of_law/FOprint.php?numero=${numero}`;
        links.push(url);
        console.log(`[Fribourg FO] URL construite: ${url}`);
      }
    }

    return links;
  }

  /**
   * Télécharger et parser un PDF
   */
  private async processPDF(pdfUrl: string): Promise<ScrapedPublication[]> {
    try {
      // Télécharger le PDF
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extraire le texte du PDF avec l'API v2 de pdf-parse
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      const text = result.text;

      console.log(`[Fribourg FO] Texte extrait (${text.length} caractères)`);

      // Parser les publications
      return this.parsePublications(text, pdfUrl);
    } catch (error) {
      console.error(`[Fribourg FO] Erreur traitement PDF:`, error);
      return [];
    }
  }

  /**
   * Parser le texte extrait du PDF pour identifier les publications
   */
  private parsePublications(
    text: string,
    sourceUrl: string
  ): ScrapedPublication[] {
    const publications: ScrapedPublication[] = [];

    // Nettoyer le texte (enlever les doubles espaces, normaliser)
    const cleanText = text.replace(/\s+/g, " ").trim();

    // Identifier les sections principales
    const sections = this.identifySections(cleanText);

    for (const section of sections) {
      // Extraire les publications de chaque section
      const sectionPublications = this.extractPublicationsFromSection(
        section,
        sourceUrl
      );
      publications.push(...sectionPublications);
    }

    return publications;
  }

  /**
   * Identifier les sections du document (Mises à l'enquête, Permis, etc.)
   */
  private identifySections(
    text: string
  ): Array<{ type: string; content: string }> {
    const sections: Array<{ type: string; content: string }> = [];

    // Patterns de sections typiques dans la Feuille Officielle FR
    const sectionPatterns = [
      {
        name: "MISE_A_LENQUETE",
        patterns: [
          /MISES?\s+À\s+L['']ENQUÊTE/gi,
          /MISE\s+À\s+L['']ENQUÊTE\s+PUBLIQUE/gi,
          /ENQUÊTE\s+PUBLIQUE/gi,
        ],
      },
      {
        name: "PERMIS_CONSTRUIRE",
        patterns: [
          /PERMIS\s+DE\s+CONSTRUIRE/gi,
          /AUTORISATION\s+DE\s+CONSTRUIRE/gi,
        ],
      },
      {
        name: "AVIS_OFFICIEL",
        patterns: [/AVIS\s+OFFICIEL/gi, /PUBLICATIONS?\s+OFFICIELLE?/gi],
      },
      {
        name: "OPPOSITION",
        patterns: [/DÉLAI\s+D['']OPPOSITION/gi, /OPPOSITION/gi],
      },
    ];

    // Rechercher chaque type de section
    for (const sectionType of sectionPatterns) {
      for (const pattern of sectionType.patterns) {
        const matches = text.matchAll(new RegExp(pattern.source, "gi"));

        for (const match of matches) {
          if (match.index !== undefined) {
            // Extraire environ 5000 caractères après le titre de section
            const start = match.index;
            const end = Math.min(start + 5000, text.length);
            const content = text.substring(start, end);

            sections.push({
              type: sectionType.name,
              content,
            });
          }
        }
      }
    }

    return sections;
  }

  /**
   * Extraire les publications individuelles d'une section
   */
  private extractPublicationsFromSection(
    section: { type: string; content: string },
    sourceUrl: string
  ): ScrapedPublication[] {
    const publications: ScrapedPublication[] = [];

    // Patterns pour identifier les en-têtes à ignorer
    const headerPatterns = [
      /Lieu-dit ou rue.*Coordonnées géographiques/i,
      /Bezirk Gemeinde.*Objet Objekt/i,
      /Commune.*Architecte.*Mandataire/i,
      /District.*Commune.*Projet/i,
    ];

    // Pattern pour identifier les communes (capture uniquement le nom, pas l'adresse)
    // Capture jusqu'à : virgule, deux espaces, nombre, ou mots-clés comme "Le dossier", "Route", etc.
    const communePattern =
      /(?:COMMUNE|VILLE|Commune|Ville)\s+de\s+([A-ZÉÈÊÀÙÇ][a-zéèêàùçA-ZÉÈÊÀÙÇ\-']+(?:\s+[A-ZÉÈÊÀÙÇ][a-zéèêàùçA-ZÉÈÊÀÙÇ\-']+)?)(?=\s+(?:Le dossier|Route|Rue|Avenue|Chemin|,|\d|Aliénateurs|Transfert))/gi;
    const communeMatches = [...section.content.matchAll(communePattern)];

    for (const communeMatch of communeMatches) {
      const commune = this.normalizeCommune(communeMatch[1]);
      const startIndex = communeMatch.index || 0;

      // Extraire le texte concernant cette commune (jusqu'à la prochaine commune ou 800 caractères)
      const nextCommuneIndex = section.content.indexOf(
        "COMMUNE",
        startIndex + 10
      );
      const endIndex =
        nextCommuneIndex !== -1
          ? nextCommuneIndex
          : Math.min(startIndex + 800, section.content.length);

      const publicationText = section.content.substring(startIndex, endIndex);

      // Ignorer si c'est un en-tête de tableau
      if (headerPatterns.some((pattern) => pattern.test(publicationText))) {
        continue;
      }

      // Ignorer si le nom de commune est trop long (probablement un en-tête)
      if (commune.length > 50) {
        continue;
      }

      // Ignorer si contient des mots-clés d'en-têtes
      if (
        /Architecte.*Mandataire|Coordonnées géographiques|Bezirk|Geographische/i.test(
          commune
        )
      ) {
        continue;
      }

      // Extraire les informations détaillées
      const details = this.extractDetails(publicationText);

      // Créer le titre
      const title = this.generateTitle(commune, details, section.type);

      // Créer la description
      const description = this.generateDescription(publicationText);

      publications.push({
        type: section.type as ScrapedPublication["type"],
        commune,
        canton: "FR",
        title,
        description,
        url: sourceUrl,
        publishedAt: new Date(), // On pourrait extraire la date du PDF
        metadata: {
          source: "Feuille Officielle Fribourg",
          plateforme: "fo.fr.ch",
          ...details,
        },
      });
    }

    return publications;
  }

  /**
   * Normaliser le nom de la commune
   */
  private normalizeCommune(commune: string): string {
    // Nettoyer et normaliser
    let normalized = commune
      .trim()
      .replace(/\s+/g, " ")
      // Enlever les textes parasites d'abord
      .replace(
        /\s+(Le dossier|Route|Rue|Avenue|Chemin|Aliénateurs|Transfert).*$/i,
        ""
      );

    // Enlever "De" seulement s'il n'est pas suivi de "La" ou "Le" (préserver "La Verrerie", "Le Mouret")
    normalized = normalized.replace(/^De\s+(?!La\s|Le\s)/i, "");

    // Normaliser la casse
    return normalized
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Extraire les détails (parcelle, adresse, type de projet)
   */
  private extractDetails(text: string): Record<string, string> {
    const details: Record<string, string> = {};

    // Parcelle
    const parcelleMatch = text.match(/parcelle\s+n?[°o]?\s*(\d+)/i);
    if (parcelleMatch) {
      details.parcelle = parcelleMatch[1];
    }

    // Adresse
    const adresseMatch = text.match(
      /(?:adresse|lieu|situé|sis)\s*:?\s*([^,\n]{10,80})/i
    );
    if (adresseMatch) {
      details.adresse = adresseMatch[1].trim();
    }

    // Type de projet
    const projetMatch = text.match(
      /(?:construction|rénovation|transformation|démolition|agrandissement)\s+(?:d['']?une?\s+)?([^,\.\n]{5,60})/i
    );
    if (projetMatch) {
      details.typeProjet = projetMatch[0].trim();
    }

    // Propriétaire (optionnel, peut être anonymisé)
    const proprioMatch = text.match(/propriétaire\s*:?\s*([^,\n]{5,50})/i);
    if (proprioMatch) {
      details.proprietaire = proprioMatch[1].trim();
    }

    return details;
  }

  /**
   * Générer un titre descriptif
   */
  private generateTitle(
    commune: string,
    details: Record<string, string>,
    type: string
  ): string {
    const typeLabel =
      type === "MISE_A_LENQUETE"
        ? "Mise à l'enquête"
        : type === "PERMIS_CONSTRUIRE"
        ? "Permis de construire"
        : "Publication";

    if (details.typeProjet) {
      return `${commune} - ${typeLabel}: ${details.typeProjet}`;
    } else if (details.parcelle) {
      return `${commune} - ${typeLabel} (Parcelle ${details.parcelle})`;
    } else {
      return `${commune} - ${typeLabel}`;
    }
  }

  /**
   * Générer une description à partir du texte
   */
  private generateDescription(text: string): string {
    // Prendre les 200 premiers caractères du texte, nettoyé
    let description = text.substring(0, 200).replace(/\s+/g, " ").trim();

    if (text.length > 200) {
      description += "...";
    }

    return description;
  }
}
