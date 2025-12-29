// Service de génération de PDF pour les offres
import pdfMake from "pdfmake/build/pdfmake";
import type {
  TDocumentDefinitions,
  Content,
  TableCell,
} from "pdfmake/interfaces";

// Initialisation lazy des polices
let fontsInitialized = false;

function initializeFonts() {
  if (!fontsInitialized) {
    if (typeof window === "undefined") {
      // Côté serveur
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfFonts = require("pdfmake/build/vfs_fonts");
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      fontsInitialized = true;
    } else {
      // Côté client - les polices seront chargées dynamiquement
      fontsInitialized = true;
    }
  }
}

interface OfferData {
  // Informations de l'offre
  offerNumber: string;
  offerDate: Date;
  validityDays: number;

  // Organisation émettrice
  organization: {
    name: string;
    address?: string | null;
    city?: string | null;
    canton?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };

  // Appel d'offres (destinataire)
  tender: {
    title: string;
    organization: {
      name: string;
      address?: string | null;
      city?: string | null;
      phone?: string | null;
      email?: string | null;
    };
  };

  // Contenu de l'offre
  projectSummary: string;

  // Prestations
  inclusions?: Array<{ position: number; description: string }>;
  exclusions?: Array<{ position: number; description: string }>;
  materials?: Array<{
    name: string;
    brand?: string;
    model?: string;
    manufacturerWarranty?: string;
  }>;

  // Prix
  priceType: "GLOBAL" | "DETAILED";
  currency: string;
  lineItems?: Array<{
    position: number;
    description: string;
    quantity?: number;
    unit?: string;
    priceHT: number;
    tvaRate: number;
  }>;
  price?: number;
  totalHT?: number;
  totalTVA?: number;
  tvaRate?: number;

  // Délais
  timeline?: string;
  startDate?: Date | null;
  durationDays?: number | null;
  constraints?: string;

  // Conditions
  paymentTerms?: {
    deposit?: number;
    intermediate?: number;
    final?: number;
    netDays?: number;
  };
  warrantyYears?: number | null;
  insuranceAmount?: number | null;
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
 * Générer le contenu du PDF
 */
function generateOfferContent(data: OfferData): Content {
  const content: Content = [];

  // ===========================================
  // EN-TÊTE avec logo Publio
  // ===========================================
  content.push({
    columns: [
      {
        width: "*",
        text: [
          { text: "Publio\n", fontSize: 20, bold: true, color: "#2563eb" },
          {
            text: "Plateforme de mise en relation\n",
            fontSize: 10,
            color: "#666",
          },
          {
            text: "Document indicatif",
            fontSize: 8,
            italics: true,
            color: "#999",
          },
        ],
      },
      {
        width: "auto",
        alignment: "right" as const,
        text: [
          { text: `${data.organization.name}\n`, fontSize: 12, bold: true },
          data.organization.address ? `${data.organization.address}\n` : "",
          data.organization.city
            ? `${
                data.organization.canton ? data.organization.canton + "-" : ""
              }${data.organization.city}\n`
            : "",
          data.organization.phone ? `Tél: ${data.organization.phone}\n` : "",
          data.organization.email ? `${data.organization.email}\n` : "",
          data.organization.website ? `${data.organization.website}` : "",
        ].filter((t) => t !== ""),
        fontSize: 9,
        color: "#333",
      },
    ],
    margin: [0, 0, 0, 30],
  });

  // ===========================================
  // INFORMATIONS DESTINATAIRE
  // ===========================================
  content.push({
    columns: [
      {
        width: "50%",
        text: [
          { text: `${data.tender.organization.name}\n`, bold: true },
          data.tender.organization.address
            ? `${data.tender.organization.address}\n`
            : "",
          data.tender.organization.city
            ? `${data.tender.organization.city}\n`
            : "",
        ].filter((t) => t !== ""),
        fontSize: 10,
      },
      {
        width: "50%",
        alignment: "right" as const,
        text: [
          { text: "Offre n°: ", bold: true },
          data.offerNumber,
          "\n",
          { text: "Date de l'offre: ", bold: true },
          formatDate(data.offerDate),
          "\n",
          { text: "Validité: ", bold: true },
          `${data.validityDays} jours`,
        ],
        fontSize: 10,
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // ===========================================
  // OBJET DE L'OFFRE
  // ===========================================
  content.push({
    text: `Offre: ${data.tender.title}`,
    fontSize: 14,
    bold: true,
    margin: [0, 0, 0, 10],
  });

  // ===========================================
  // RÉSUMÉ DU PROJET
  // ===========================================
  if (data.projectSummary) {
    content.push({
      text: "Résumé du projet",
      fontSize: 11,
      bold: true,
      margin: [0, 10, 0, 5],
    });
    content.push({
      text: data.projectSummary,
      fontSize: 10,
      margin: [0, 0, 0, 15],
    });
  }

  // ===========================================
  // PRESTATIONS INCLUSES
  // ===========================================
  if (data.inclusions && data.inclusions.length > 0) {
    content.push({
      text: "Prestations incluses",
      fontSize: 11,
      bold: true,
      margin: [0, 10, 0, 5],
    });

    const inclusionsList = data.inclusions.map((inc) => inc.description);
    content.push({
      ul: inclusionsList,
      fontSize: 9,
      margin: [0, 0, 0, 10],
    });
  }

  // ===========================================
  // PRESTATIONS NON INCLUSES
  // ===========================================
  if (data.exclusions && data.exclusions.length > 0) {
    content.push({
      text: "Prestations non incluses",
      fontSize: 11,
      bold: true,
      margin: [0, 10, 0, 5],
    });

    const exclusionsList = data.exclusions.map((exc) => exc.description);
    content.push({
      ul: exclusionsList,
      fontSize: 9,
      margin: [0, 0, 0, 10],
    });
  }

  // ===========================================
  // MATÉRIAUX PROPOSÉS
  // ===========================================
  if (data.materials && data.materials.length > 0) {
    content.push({
      text: "Matériaux et équipements proposés",
      fontSize: 11,
      bold: true,
      margin: [0, 10, 0, 5],
    });

    const materialsList = data.materials.map((mat) => {
      let text = mat.name;
      if (mat.brand) text += ` - ${mat.brand}`;
      if (mat.model) text += ` (${mat.model})`;
      if (mat.manufacturerWarranty)
        text += ` - Garantie: ${mat.manufacturerWarranty}`;
      return text;
    });

    content.push({
      ul: materialsList,
      fontSize: 9,
      margin: [0, 0, 0, 10],
    });
  }

  // ===========================================
  // TABLEAU DES PRIX
  // ===========================================
  content.push({
    text: "Décomposition tarifaire",
    fontSize: 11,
    bold: true,
    margin: [0, 15, 0, 10],
    pageBreak:
      data.lineItems && data.lineItems.length > 5
        ? ("before" as const)
        : undefined,
  });

  if (
    data.priceType === "DETAILED" &&
    data.lineItems &&
    data.lineItems.length > 0
  ) {
    // Prix détaillé avec lignes
    const tableBody: TableCell[][] = [
      [
        { text: "Pos", style: "tableHeader", alignment: "center" },
        { text: "Désignation", style: "tableHeader" },
        { text: "Quantité", style: "tableHeader", alignment: "center" },
        { text: "Prix/pièce", style: "tableHeader", alignment: "right" },
        { text: "Total (CHF)", style: "tableHeader", alignment: "right" },
      ],
    ];

    data.lineItems.forEach((item) => {
      const total = item.priceHT * (item.quantity || 1);
      tableBody.push([
        {
          text: item.position.toString().padStart(2, "0"),
          alignment: "center",
        },
        item.description,
        {
          text: item.quantity ? `${item.quantity} ${item.unit || ""}` : "-",
          alignment: "center",
        },
        {
          text: formatCurrency(item.priceHT, data.currency),
          alignment: "right",
        },
        { text: formatCurrency(total, data.currency), alignment: "right" },
      ]);
    });

    // Ligne somme intermédiaire
    tableBody.push([
      { text: "", colSpan: 4, border: [false, false, false, false] },
      {},
      {},
      {},
      {
        text: formatCurrency(data.totalHT || 0, data.currency),
        alignment: "right",
        bold: true,
      },
    ]);

    // Ligne rabais (si applicable)
    // Note: Vous pouvez ajouter un champ rabais dans OfferData si nécessaire

    // Ligne Total HT
    tableBody.push([
      { text: "", colSpan: 3, border: [false, false, false, false] },
      {},
      {},
      { text: "Total hors TVA", alignment: "right", bold: true },
      {
        text: formatCurrency(data.totalHT || 0, data.currency),
        alignment: "right",
        bold: true,
      },
    ]);

    // Ligne TVA
    const tvaRate = data.tvaRate || 7.7;
    tableBody.push([
      { text: "", colSpan: 3, border: [false, false, false, false] },
      {},
      {},
      { text: `TVA ${tvaRate.toFixed(1)}%`, alignment: "right" },
      {
        text: formatCurrency(data.totalTVA || 0, data.currency),
        alignment: "right",
      },
    ]);

    // Ligne Total TTC
    const totalTTC = (data.totalHT || 0) + (data.totalTVA || 0);
    tableBody.push([
      { text: "", colSpan: 3, border: [false, false, false, false] },
      {},
      {},
      {
        text: "Total TVA incluse",
        alignment: "right",
        bold: true,
        fontSize: 11,
      },
      {
        text: formatCurrency(totalTTC, data.currency),
        alignment: "right",
        bold: true,
        fontSize: 11,
        fillColor: "#f3f4f6",
      },
    ]);

    content.push({
      table: {
        headerRows: 1,
        widths: [30, "*", 60, 80, 80],
        body: tableBody,
      },
      layout: {
        fillColor: (rowIndex: number) => {
          return rowIndex === 0 ? "#e5e7eb" : null;
        },
      },
      margin: [0, 0, 0, 15],
    });
  } else {
    // Prix global simple
    const tableBody: TableCell[][] = [
      [
        { text: "Pos", style: "tableHeader", alignment: "center" },
        { text: "Article", style: "tableHeader" },
        { text: "Désignation", style: "tableHeader" },
        { text: "Nombre", style: "tableHeader", alignment: "center" },
        { text: "Prix/pièce", style: "tableHeader", alignment: "right" },
        { text: "Total (CHF)", style: "tableHeader", alignment: "right" },
      ],
    ];

    // Une seule ligne pour l'offre globale
    tableBody.push([
      { text: "01", alignment: "center" },
      { text: "Global", alignment: "center" },
      data.tender.title,
      { text: "forfait", alignment: "center" },
      {
        text: formatCurrency(data.price || 0, data.currency),
        alignment: "right",
      },
      {
        text: formatCurrency(data.price || 0, data.currency),
        alignment: "right",
      },
    ]);

    // Somme intermédiaire
    tableBody.push([
      {
        text: "",
        colSpan: 5,
        border: [false, true, false, false],
        margin: [0, 5, 0, 0],
      },
      {},
      {},
      {},
      {},
      {
        text: formatCurrency(data.price || 0, data.currency),
        alignment: "right",
        bold: true,
        border: [false, true, false, false],
        margin: [0, 5, 0, 0],
      },
    ]);

    // Total HT
    const tvaRate = data.tvaRate || 7.7;
    const totalHT = data.totalHT || (data.price || 0) / (1 + tvaRate / 100);
    const totalTVA = data.totalTVA || (data.price || 0) - totalHT;

    tableBody.push([
      { text: "", colSpan: 4, border: [false, false, false, false] },
      {},
      {},
      {},
      {
        text: "Total hors TVA",
        alignment: "right",
        bold: true,
        border: [false, false, false, false],
      },
      {
        text: formatCurrency(totalHT, data.currency),
        alignment: "right",
        bold: true,
        border: [false, false, false, false],
      },
    ]);

    // TVA
    tableBody.push([
      { text: "", colSpan: 4, border: [false, false, false, false] },
      {},
      {},
      {},
      {
        text: `TVA ${tvaRate.toFixed(1)}%`,
        alignment: "right",
        border: [false, false, false, false],
      },
      {
        text: formatCurrency(totalTVA, data.currency),
        alignment: "right",
        border: [false, false, false, false],
      },
    ]);

    // Total TTC
    tableBody.push([
      { text: "", colSpan: 4, border: [false, false, false, false] },
      {},
      {},
      {},
      {
        text: "Total TVA incluse",
        alignment: "right",
        bold: true,
        fontSize: 11,
        border: [false, true, false, true],
      },
      {
        text: formatCurrency(data.price || 0, data.currency),
        alignment: "right",
        bold: true,
        fontSize: 11,
        fillColor: "#f3f4f6",
        border: [false, true, false, true],
      },
    ]);

    content.push({
      table: {
        headerRows: 1,
        widths: [30, 50, "*", 50, 70, 70],
        body: tableBody,
      },
      layout: {
        fillColor: (rowIndex: number) => {
          return rowIndex === 0 ? "#e5e7eb" : null;
        },
      },
      margin: [0, 0, 0, 15],
    });
  }

  // ===========================================
  // DÉLAIS & CONDITIONS
  // ===========================================
  content.push({
    text: "Conditions et délais",
    fontSize: 11,
    bold: true,
    margin: [0, 10, 0, 5],
  });

  const conditions: string[] = [];

  // Validité
  const expiryDate = new Date(data.offerDate);
  expiryDate.setDate(expiryDate.getDate() + data.validityDays);
  conditions.push(
    `Validité: ${
      data.validityDays
    } jours à compter de la date d'émission | Délai de livraison: ${
      data.timeline || "à convenir"
    }`
  );

  // Date de début et durée
  if (data.startDate || data.durationDays) {
    let delaiText = "";
    if (data.startDate) {
      delaiText = `Date de début possible: ${formatDate(data.startDate)}`;
    }
    if (data.durationDays) {
      delaiText += delaiText
        ? ` | Durée estimée: ${data.durationDays} jours`
        : `Durée estimée: ${data.durationDays} jours`;
    }
    if (delaiText) conditions.push(delaiText);
  }

  // Contraintes
  if (data.constraints) {
    conditions.push(`Contraintes: ${data.constraints}`);
  }

  content.push({
    text: conditions.join("\n"),
    fontSize: 9,
    margin: [0, 0, 0, 10],
  });

  // ===========================================
  // CONDITIONS DE PAIEMENT
  // ===========================================
  if (data.paymentTerms) {
    const pt = data.paymentTerms;
    const paymentText: string[] = [];

    if (pt.deposit) paymentText.push(`Acompte: ${pt.deposit}%`);
    if (pt.intermediate) paymentText.push(`Intermédiaire: ${pt.intermediate}%`);
    if (pt.final) paymentText.push(`Solde: ${pt.final}%`);
    if (pt.netDays) paymentText.push(`Paiement net: ${pt.netDays} jours`);

    if (paymentText.length > 0) {
      content.push({
        text: `Conditions de paiement: ${paymentText.join(" | ")}`,
        fontSize: 9,
        margin: [0, 0, 0, 10],
      });
    }
  }

  // ===========================================
  // GARANTIES
  // ===========================================
  const warranties: string[] = [];
  if (data.warrantyYears) {
    warranties.push(`Garantie travaux: ${data.warrantyYears} ans`);
  }
  if (data.insuranceAmount) {
    warranties.push(
      `RC professionnelle: ${formatCurrency(
        data.insuranceAmount,
        data.currency
      )}`
    );
  }

  if (warranties.length > 0) {
    content.push({
      text: warranties.join(" | "),
      fontSize: 9,
      margin: [0, 0, 0, 10],
    });
  }

  // ===========================================
  // NOTES LÉGALES
  // ===========================================
  content.push({
    text: "Les prestations supplémentaires qui ne sont pas explicitement mentionnées dans cette offre seront facturées séparément.",
    fontSize: 8,
    italics: true,
    color: "#666",
    margin: [0, 20, 0, 5],
  });

  content.push({
    text: [
      "Nous vous prions d'agréer, Madame, Monsieur, nos salutations les meilleures.\n",
      { text: data.organization.name, bold: true },
    ],
    fontSize: 9,
    margin: [0, 10, 0, 30],
  });

  // ===========================================
  // PIED DE PAGE - Important
  // ===========================================
  content.push({
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 0.5,
        lineColor: "#cbd5e1",
      },
    ],
    margin: [0, 20, 0, 10],
  });

  content.push({
    columns: [
      {
        width: "*",
        text: [
          {
            text: "Document généré via Publio\n",
            fontSize: 7,
            color: "#999",
            italics: true,
          },
          {
            text: "Cette offre est indicative et facilitera votre mise en relation. ",
            fontSize: 7,
            color: "#999",
          },
          {
            text: "Une fois le marché validé, vous êtes en contact direct avec le prestataire.",
            fontSize: 7,
            color: "#999",
          },
        ],
      },
    ],
  });

  return content;
}

/**
 * Générer un PDF d'offre
 * @returns Le PDF sous forme de Buffer
 */
export async function generateOfferPDF(data: OfferData): Promise<Buffer> {
  // Initialiser les polices avant de générer le PDF
  initializeFonts();

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content: generateOfferContent(data),
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "#1f2937",
      },
    },
    defaultStyle: {
      fontSize: 10,
      color: "#374151",
    },
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Générer un PDF et le télécharger côté client
 */
export async function downloadOfferPDF(
  data: OfferData,
  filename?: string
): Promise<void> {
  // Charger les polices côté client si nécessaire
  if (typeof window !== "undefined" && !pdfMake.vfs) {
    const pdfFonts = await import("pdfmake/build/vfs_fonts");
    pdfMake.vfs = pdfFonts.vfs;
  }

  // Initialiser les polices si côté serveur
  initializeFonts();

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content: generateOfferContent(data),
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "#1f2937",
      },
    },
    defaultStyle: {
      fontSize: 10,
      color: "#374151",
    },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  const name = filename || `offre-${data.offerNumber || "publio"}.pdf`;
  pdfDoc.download(name);
}
