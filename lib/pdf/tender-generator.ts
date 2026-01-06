// Service de génération de PDF pour les appels d'offres - Style professionnel
import pdfMake from "pdfmake/build/pdfmake";
import type { TDocumentDefinitions, Content } from "pdfmake/interfaces";

// Initialisation lazy des polices
let fontsInitialized = false;

function initializeFonts() {
  if (!fontsInitialized) {
    if (typeof window === "undefined") {
      // Côté serveur
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfFonts = require("pdfmake/build/vfs_fonts");
      pdfMake.vfs = pdfFonts.vfs;

      pdfMake.fonts = {
        Roboto: {
          normal: "Roboto-Regular.ttf",
          bold: "Roboto-Medium.ttf",
          italics: "Roboto-Italic.ttf",
          bolditalics: "Roboto-MediumItalic.ttf",
        },
      };

      fontsInitialized = true;
    } else {
      // Côté client
      if (!pdfMake.fonts) {
        pdfMake.fonts = {
          Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Medium.ttf",
            italics: "Roboto-Italic.ttf",
            bolditalics: "Roboto-MediumItalic.ttf",
          },
        };
      }
      fontsInitialized = true;
    }
  }
}

export interface TenderData {
  // Informations de base
  title: string;
  summary?: string;
  description: string;
  currentSituation?: string;

  // Organisation émettrice
  organization: {
    name: string;
    logo?: string | null;
    address?: string | null;
    city?: string | null;
    canton?: string | null;
    postalCode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };

  // Détails du projet
  cfcCodes?: string[];
  cfcCategory?: string;
  budget?: number;
  showBudget: boolean;
  currency: string;
  surfaceM2?: number;
  volumeM3?: number;
  constraints?: string[];

  // Localisation
  address?: string;
  city?: string;
  postalCode?: string;
  canton?: string;
  country: string;
  location?: string;

  // Dates
  deadline: Date;
  questionDeadline?: Date;
  contractStartDate?: Date;
  contractDuration?: number;
  publishedAt?: Date;

  // Critères et conditions
  selectionPriorities?: string[];
  participationConditions?: string[];
  requiredDocuments?: string[];
  requiresReferences: boolean;
  requiresInsurance: boolean;
  minExperience?: string;

  // Paramètres
  mode: "CLASSIC" | "ANONYMOUS";
  visibility: "PUBLIC" | "PRIVATE";
  procedure: "OPEN" | "SELECTIVE" | "PRIVATE";
  allowPartialOffers: boolean;

  // Images (optionnel pour PDF)
  images?: Array<{ url: string; name: string }>;
}

/**
 * Formater un montant en CHF
 */
function formatCurrency(amount: number, currency = "CHF"): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Formater une date
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formater une date avec heure
 */
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Convertir une image URL en base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    if (typeof window !== "undefined") {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return "";
  }
}

/**
 * Labels pour les différents types
 */
const PROCEDURE_LABELS: Record<string, string> = {
  OPEN: "Procédure ouverte",
  SELECTIVE: "Procédure sélective",
  PRIVATE: "Procédure de gré à gré",
};

const SELECTION_PRIORITY_LABELS: Record<string, string> = {
  LOWEST_PRICE: "Prix le plus bas",
  QUALITY_PRICE: "Meilleur rapport qualité/prix",
  FASTEST_DELIVERY: "Délais les plus rapides",
  BEST_REFERENCES: "Bonnes références",
  ECO_FRIENDLY: "Matériaux écologiques/durables",
};

const CFC_CATEGORY_LABELS: Record<string, string> = {
  BUILDING_SHELL: "🏗️ Gros œuvre et enveloppe",
  TECHNICAL_INSTALLATIONS: "⚙️ Installations techniques",
  INTERIOR_FINISHES: "🎨 Aménagements intérieurs",
  OUTDOOR_WORKS: "🌳 Aménagements extérieurs",
  SPECIALIZED_WORKS: "🔧 Travaux spécialisés",
};

/**
 * Générer le contenu du PDF
 */
async function generateTenderContent(data: TenderData): Promise<Content> {
  const content: Content = [];

  // Charger le logo Publio
  const publioLogoUrl =
    typeof window !== "undefined"
      ? "/logo/logo_nobackground.png"
      : `${process.cwd()}/public/logo/logo_nobackground.png`;

  let publioLogoBase64 = "";
  try {
    if (typeof window !== "undefined") {
      const response = await fetch(publioLogoUrl);
      if (response.ok) {
        const blob = await response.blob();
        publioLogoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      const buffer = fs.readFileSync(publioLogoUrl);
      publioLogoBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch (error) {
    console.error("Error loading Publio logo:", error);
  }

  // Logo de l'organisation (optionnel)
  let orgLogoBase64 = "";
  if (data.organization.logo) {
    orgLogoBase64 = await imageUrlToBase64(data.organization.logo);
  }

  // ========================================
  // EN-TÊTE avec logos
  // ========================================
  const logoSection = orgLogoBase64
    ? {
        image: orgLogoBase64,
        width: 120,
        height: 60,
        fit: [120, 60] as [number, number],
      }
    : {
        text: data.organization.name,
        fontSize: 16,
        bold: true,
        color: "#2563eb",
      };

  const rightColumnStack: Content[] = [
    {
      text: data.organization.name,
      fontSize: 11,
      bold: true,
      margin: [0, 0, 0, 3],
    },
  ];

  if (data.organization.address) {
    rightColumnStack.push({
      text: data.organization.address,
      fontSize: 9,
      margin: [0, 0, 0, 1],
    });
  }

  if (data.organization.city) {
    rightColumnStack.push({
      text: `${data.organization.postalCode || ""} ${data.organization.city}${
        data.organization.canton ? `, ${data.organization.canton}` : ""
      }`,
      fontSize: 9,
      margin: [0, 0, 0, 3],
    });
  }

  if (data.organization.phone) {
    rightColumnStack.push({
      text: data.organization.phone,
      fontSize: 9,
      margin: [0, 0, 0, 1],
    });
  }

  if (data.organization.email) {
    rightColumnStack.push({
      text: data.organization.email,
      fontSize: 9,
      color: "#2563eb",
      margin: [0, 0, 0, 1],
    });
  }

  if (data.organization.website) {
    rightColumnStack.push({
      text: data.organization.website,
      fontSize: 9,
      color: "#2563eb",
    });
  }

  // Ajouter le logo Publio en haut
  if (publioLogoBase64) {
    rightColumnStack.unshift({
      image: publioLogoBase64,
      width: 120,
      height: 48,
      fit: [120, 48] as [number, number],
      alignment: "right" as const,
      margin: [0, 0, 0, 10],
    });
  }

  content.push({
    columns: [
      {
        width: 200,
        ...logoSection,
      },
      {
        width: "*",
        text: "",
      },
      {
        width: 180,
        alignment: "right" as const,
        stack: rightColumnStack,
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Ligne de séparation
  content.push({
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 1,
        lineColor: "#ddd",
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // ========================================
  // TITRE DE L'APPEL D'OFFRES
  // ========================================
  content.push({
    text: "APPEL D'OFFRES",
    fontSize: 14,
    bold: true,
    color: "#1e40af",
    margin: [0, 0, 0, 10],
  });

  content.push({
    text: data.title,
    fontSize: 18,
    bold: true,
    color: "#000",
    margin: [0, 0, 0, 15],
  });

  // Résumé si présent
  if (data.summary) {
    content.push({
      text: data.summary,
      fontSize: 11,
      color: "#4b5563",
      italics: true,
      margin: [0, 0, 0, 15],
    });
  }

  // ========================================
  // INFORMATIONS CLÉS
  // ========================================
  content.push({
    canvas: [
      {
        type: "rect",
        x: 0,
        y: 0,
        w: 515,
        h: 60,
        color: "#fef9c3",
      },
    ],
    margin: [0, 0, 0, 0],
  });

  const infoRows: Content[] = [];

  if (data.publishedAt) {
    infoRows.push({
      columns: [
        { width: 150, text: "Date de publication:", bold: true, fontSize: 10 },
        { width: "*", text: formatDate(data.publishedAt), fontSize: 10 },
      ],
      margin: [10, 5, 10, 0],
    });
  }

  infoRows.push({
    columns: [
      {
        width: 150,
        text: "Date limite de soumission:",
        bold: true,
        fontSize: 10,
        color: "#dc2626",
      },
      {
        width: "*",
        text: formatDateTime(data.deadline),
        fontSize: 10,
        color: "#dc2626",
        bold: true,
      },
    ],
    margin: [10, 5, 10, 0],
  });

  if (data.questionDeadline) {
    infoRows.push({
      columns: [
        {
          width: 150,
          text: "Date limite pour questions:",
          bold: true,
          fontSize: 10,
        },
        {
          width: "*",
          text: formatDateTime(data.questionDeadline),
          fontSize: 10,
        },
      ],
      margin: [10, 5, 10, 0],
    });
  }

  infoRows.push({
    columns: [
      { width: 150, text: "Procédure:", bold: true, fontSize: 10 },
      {
        width: "*",
        text: PROCEDURE_LABELS[data.procedure] || data.procedure,
        fontSize: 10,
      },
    ],
    margin: [10, 5, 10, 5],
  });

  content.push({
    stack: infoRows,
    margin: [0, -60, 0, 20],
  });

  // ========================================
  // DESCRIPTION DU PROJET
  // ========================================
  content.push({
    text: "1. Description du projet",
    fontSize: 14,
    bold: true,
    color: "#1e40af",
    margin: [0, 10, 0, 10],
  });

  content.push({
    text: data.description,
    fontSize: 10,
    alignment: "justify" as const,
    margin: [0, 0, 0, 10],
    lineHeight: 1.4,
  });

  // Situation actuelle
  if (data.currentSituation) {
    content.push({
      text: "Situation actuelle",
      fontSize: 11,
      bold: true,
      margin: [0, 10, 0, 5],
    });

    content.push({
      canvas: [
        {
          type: "rect",
          x: 0,
          y: 0,
          w: 515,
          h: 60,
          color: "#eff6ff",
        },
      ],
      margin: [0, 0, 0, 0],
    });

    content.push({
      text: data.currentSituation,
      fontSize: 10,
      color: "#1e40af",
      margin: [10, -50, 10, 10],
      lineHeight: 1.3,
    });
  }

  // ========================================
  // DÉTAILS TECHNIQUES
  // ========================================
  content.push({
    text: "2. Détails techniques",
    fontSize: 14,
    bold: true,
    color: "#1e40af",
    margin: [0, 15, 0, 10],
  });

  const technicalDetails: Content[] = [];

  if (data.cfcCategory) {
    technicalDetails.push({
      columns: [
        { width: 150, text: "Catégorie de travaux:", bold: true, fontSize: 10 },
        {
          width: "*",
          text: CFC_CATEGORY_LABELS[data.cfcCategory] || data.cfcCategory,
          fontSize: 10,
        },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  if (data.cfcCodes && data.cfcCodes.length > 0) {
    technicalDetails.push({
      columns: [
        { width: 150, text: "Codes CFC:", bold: true, fontSize: 10 },
        { width: "*", text: data.cfcCodes.join(", "), fontSize: 10 },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  if (data.budget && data.showBudget) {
    technicalDetails.push({
      columns: [
        { width: 150, text: "Budget indicatif:", bold: true, fontSize: 10 },
        {
          width: "*",
          text: formatCurrency(data.budget, data.currency),
          fontSize: 10,
        },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  if (data.surfaceM2) {
    technicalDetails.push({
      columns: [
        { width: 150, text: "Surface:", bold: true, fontSize: 10 },
        { width: "*", text: `${data.surfaceM2} m²`, fontSize: 10 },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  if (data.volumeM3) {
    technicalDetails.push({
      columns: [
        { width: 150, text: "Volume:", bold: true, fontSize: 10 },
        { width: "*", text: `${data.volumeM3} m³`, fontSize: 10 },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  if (data.contractDuration) {
    technicalDetails.push({
      columns: [
        { width: 150, text: "Durée du contrat:", bold: true, fontSize: 10 },
        { width: "*", text: `${data.contractDuration} jours`, fontSize: 10 },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  if (data.contractStartDate) {
    technicalDetails.push({
      columns: [
        {
          width: 150,
          text: "Date de début souhaitée:",
          bold: true,
          fontSize: 10,
        },
        { width: "*", text: formatDate(data.contractStartDate), fontSize: 10 },
      ],
      margin: [0, 0, 0, 5],
    });
  }

  content.push({
    stack: technicalDetails,
    margin: [0, 0, 0, 15],
  });

  // Contraintes
  if (data.constraints && data.constraints.length > 0) {
    content.push({
      text: "Contraintes du chantier",
      fontSize: 11,
      bold: true,
      margin: [0, 5, 0, 5],
    });

    content.push({
      ul: data.constraints,
      fontSize: 10,
      margin: [0, 0, 0, 10],
    });
  }

  // ========================================
  // LOCALISATION
  // ========================================
  content.push({
    text: "3. Localisation du projet",
    fontSize: 14,
    bold: true,
    color: "#1e40af",
    margin: [0, 15, 0, 10],
  });

  const locationDetails: string[] = [];
  if (data.address) locationDetails.push(data.address);
  if (data.postalCode || data.city) {
    locationDetails.push(`${data.postalCode || ""} ${data.city || ""}`.trim());
  }
  if (data.canton) locationDetails.push(data.canton);
  if (data.country) locationDetails.push(data.country);

  content.push({
    text: locationDetails.join("\n"),
    fontSize: 10,
    margin: [0, 0, 0, 10],
  });

  if (data.location) {
    content.push({
      text: `Lieu d'exécution: ${data.location}`,
      fontSize: 10,
      italics: true,
      margin: [0, 0, 0, 10],
    });
  }

  // ========================================
  // CRITÈRES DE SÉLECTION
  // ========================================
  if (data.selectionPriorities && data.selectionPriorities.length > 0) {
    content.push({
      text: "4. Critères de sélection",
      fontSize: 14,
      bold: true,
      color: "#1e40af",
      margin: [0, 15, 0, 10],
    });

    content.push({
      text: "Les offres seront évaluées selon les critères suivants (par ordre de priorité):",
      fontSize: 10,
      margin: [0, 0, 0, 5],
    });

    const priorities = data.selectionPriorities.map(
      (p) => SELECTION_PRIORITY_LABELS[p] || p
    );

    content.push({
      ol: priorities,
      fontSize: 10,
      margin: [0, 0, 0, 15],
    });
  }

  // ========================================
  // CONDITIONS DE PARTICIPATION
  // ========================================
  content.push({
    text: "5. Conditions de participation",
    fontSize: 14,
    bold: true,
    color: "#1e40af",
    margin: [0, 15, 0, 10],
  });

  const participationItems: string[] = [];

  if (data.requiresReferences) {
    participationItems.push("Références de projets similaires requises");
  }

  if (data.requiresInsurance) {
    participationItems.push(
      "Assurance responsabilité civile professionnelle obligatoire"
    );
  }

  if (data.minExperience) {
    participationItems.push(`Expérience minimale: ${data.minExperience}`);
  }

  if (data.participationConditions && data.participationConditions.length > 0) {
    participationItems.push(...data.participationConditions);
  }

  if (participationItems.length > 0) {
    content.push({
      ul: participationItems,
      fontSize: 10,
      margin: [0, 0, 0, 15],
    });
  } else {
    content.push({
      text: "Aucune condition spécifique.",
      fontSize: 10,
      margin: [0, 0, 0, 15],
    });
  }

  // Documents requis
  if (data.requiredDocuments && data.requiredDocuments.length > 0) {
    content.push({
      text: "Documents requis",
      fontSize: 11,
      bold: true,
      margin: [0, 5, 0, 5],
    });

    content.push({
      ul: data.requiredDocuments,
      fontSize: 10,
      margin: [0, 0, 0, 15],
    });
  }

  // ========================================
  // MODALITÉS DE SOUMISSION
  // ========================================
  content.push({
    text: "6. Modalités de soumission",
    fontSize: 14,
    bold: true,
    color: "#1e40af",
    margin: [0, 15, 0, 10],
  });

  content.push({
    text: [
      { text: "Les offres doivent être soumises ", fontSize: 10 },
      {
        text: "exclusivement via la plateforme Publio",
        fontSize: 10,
        bold: true,
      },
      { text: " avant la date limite mentionnée ci-dessus.", fontSize: 10 },
    ],
    margin: [0, 0, 0, 10],
  });

  content.push({
    text: `Mode de soumission: ${
      data.mode === "ANONYMOUS"
        ? "Anonyme (identité masquée jusqu'à la deadline)"
        : "Classique (identité visible)"
    }`,
    fontSize: 10,
    margin: [0, 0, 0, 10],
  });

  if (data.allowPartialOffers) {
    content.push({
      text: "✓ Offres partielles autorisées",
      fontSize: 10,
      color: "#16a34a",
      margin: [0, 0, 0, 10],
    });
  }

  // ========================================
  // PIED DE PAGE
  // ========================================
  content.push({
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 1,
        lineColor: "#ddd",
      },
    ],
    margin: [0, 30, 0, 15],
  });

  content.push({
    columns: [
      {
        width: "*",
        text: [
          {
            text: "Plateforme de mise en concurrence\n",
            fontSize: 8,
            color: "#6b7280",
          },
          { text: "www.publio.ch", fontSize: 9, bold: true, color: "#2563eb" },
        ],
      },
      {
        width: "auto",
        text: [
          { text: "Document généré le ", fontSize: 8, color: "#6b7280" },
          { text: formatDate(new Date()), fontSize: 8, color: "#6b7280" },
        ],
      },
    ],
  });

  return content;
}

/**
 * Générer le PDF de l'appel d'offres
 */
export async function generateTenderPDF(data: TenderData): Promise<void> {
  initializeFonts();

  const content = await generateTenderContent(data);

  const docDefinition: TDocumentDefinitions = {
    content,
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: "Roboto",
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
    },
  };

  pdfMake
    .createPdf(docDefinition)
    .download(
      `appel-offres-${data.title.toLowerCase().replace(/\s+/g, "-")}.pdf`
    );
}

/**
 * Ouvrir le PDF dans un nouvel onglet
 */
export async function openTenderPDF(data: TenderData): Promise<void> {
  initializeFonts();

  const content = await generateTenderContent(data);

  const docDefinition: TDocumentDefinitions = {
    content,
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: "Roboto",
    },
  };

  pdfMake.createPdf(docDefinition).open();
}
