// Service de génération de PDF pour les offres - Style Baloise
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
      pdfMake.vfs = pdfFonts.vfs;

      // Configurer les polices à utiliser
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
      // Côté client - configurer les polices si ce n'est pas déjà fait
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

export interface OfferData {
  // Informations de l'offre
  offerNumber: string;
  offerDate: Date;
  validityDays: number;

  // Organisation émettrice
  organization: {
    name: string;
    logo?: string | null;
    address?: string | null;
    city?: string | null;
    canton?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    vatNumber?: string | null;
    bankName?: string | null;
    iban?: string | null;
    accountNumber?: string | null;
    swiftCode?: string | null;
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
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Prix
  priceType: "GLOBAL" | "DETAILED";
  currency: string;
  lineItems?: Array<{
    position: number;
    article?: string;
    description: string;
    quantity?: number | string;
    unit?: string;
    priceHT: number;
    tvaRate: number;
  }>;
  price?: number;
  totalHT?: number;
  totalTVA?: number;
  tvaRate?: number;
  discount?: number; // Rabais en pourcentage

  // Documents joints
  documents?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  // Délais
  timeline?: string;
  durationDays?: number | null;
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
 * Convertir une image URL en base64 (pour PDF)
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    if (typeof window !== "undefined") {
      // Côté client
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Côté serveur
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
 * Générer le contenu du PDF - Style Baloise
 */
async function generateOfferContent(data: OfferData): Promise<Content> {
  const content: Content = [];

  // Convertir le logo de l'organisation si présent
  let logoBase64 = "";
  if (data.organization.logo) {
    logoBase64 = await imageUrlToBase64(data.organization.logo);
  }

  // Convertir le logo Publio (toujours présent)
  const publioLogoUrl =
    typeof window !== "undefined"
      ? "/logo/logo_nobackground.png"
      : `${process.cwd()}/public/logo/logo_nobackground.png`;

  let publioLogoBase64 = "";
  try {
    if (typeof window !== "undefined") {
      const response = await fetch(publioLogoUrl);
      if (!response.ok) {
        console.error("Failed to fetch Publio logo:", response.status);
      }
      const blob = await response.blob();
      publioLogoBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      console.log(
        "Publio logo loaded (client), length:",
        publioLogoBase64.length
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      const buffer = fs.readFileSync(publioLogoUrl);
      publioLogoBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
      console.log(
        "Publio logo loaded (server), length:",
        publioLogoBase64.length
      );
    }
  } catch (error) {
    console.error("Error loading Publio logo:", error);
  }

  // EN-TÊTE - Style Baloise avec logos
  const logoSection = logoBase64
    ? {
        image: logoBase64,
        width: 120,
        height: 60,
        fit: [120, 60] as [number, number],
      }
    : {
        stack: [
          {
            text: data.organization.name,
            fontSize: 16,
            bold: true,
            color: "#2563eb",
          },
        ],
      };

  // Stack pour la colonne de droite avec logo Publio
  const rightColumnStack: Content[] = [
    {
      text: data.organization.name,
      fontSize: 11,
      bold: true,
      margin: [0, 0, 0, 3],
    },
    {
      text: data.organization.address || "Rue Example 21",
      fontSize: 9,
      margin: [0, 0, 0, 1],
    },
    {
      text: data.organization.city
        ? `${data.organization.canton ? data.organization.canton + "-" : ""}${
            data.organization.city
          }`
        : "CH-9999 Ville Example",
      fontSize: 9,
      margin: [0, 0, 0, 3],
    },
    {
      text: data.organization.phone || "+41 33 999 99 99",
      fontSize: 9,
      margin: [0, 0, 0, 1],
    },
    {
      text: data.organization.email || "peter@musterfirma.ch",
      fontSize: 9,
      margin: [0, 0, 0, 1],
    },
    {
      text: data.organization.website || "www.societeexemple.ch",
      fontSize: 9,
    },
  ];

  // Ajouter le logo Publio en premier si disponible
  if (publioLogoBase64) {
    console.log(
      "Adding Publio logo to PDF, data length:",
      publioLogoBase64.length
    );
    rightColumnStack.unshift({
      image: publioLogoBase64,
      width: 120,
      height: 48,
      fit: [120, 48] as [number, number],
      alignment: "right" as const,
      margin: [0, 0, 0, 10],
    });
  } else {
    console.warn("Publio logo not loaded - publioLogoBase64 is empty");
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

  // DESTINATAIRE + INFORMATIONS DE L'OFFRE
  content.push({
    columns: [
      {
        width: "50%",
        stack: [
          {
            text: data.tender.organization.name || "Jean Exemple",
            fontSize: 9,
            margin: [0, 0, 0, 1],
          },
          {
            text: data.tender.organization.address || "Mustergasse 1",
            fontSize: 9,
            margin: [0, 0, 0, 1],
          },
          {
            text: data.tender.organization.city || "CH-6396 Ville Exemple",
            fontSize: 9,
          },
        ],
      },
      {
        width: "50%",
        alignment: "left" as const,
        stack: [
          {
            columns: [
              { width: 100, text: "Offre n°:", fontSize: 9, bold: true },
              { width: "*", text: data.offerNumber || "", fontSize: 9 },
            ],
            margin: [0, 0, 0, 2],
          },
          {
            columns: [
              { width: 100, text: "Date de l'offre:", fontSize: 9, bold: true },
              { width: "*", text: formatDate(data.offerDate), fontSize: 9 },
            ],
            margin: [0, 0, 0, 2],
          },
          {
            columns: [
              { width: 100, text: "Interlocuteur:", fontSize: 9, bold: true },
              { width: "*", text: data.contactPerson || "", fontSize: 9 },
            ],
            margin: [0, 0, 0, 2],
          },
          {
            columns: [
              { width: 100, text: "E-mail:", fontSize: 9, bold: true },
              { width: "*", text: data.contactEmail || "", fontSize: 9 },
            ],
            margin: [0, 0, 0, 2],
          },
          {
            columns: [
              { width: 100, text: "Téléphone:", fontSize: 9, bold: true },
              { width: "*", text: data.contactPhone || "", fontSize: 9 },
            ],
          },
        ],
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // TITRE DE L'OFFRE
  content.push({
    text: [
      { text: "Offre: ", fontSize: 11, bold: true },
      { text: data.tender.title, fontSize: 11, bold: true },
    ],
    margin: [0, 0, 0, 15],
  });

  // INTRODUCTION
  content.push({
    text: "Monsieur, | Madame,",
    fontSize: 9,
    margin: [0, 0, 0, 5],
  });

  content.push({
    text: data.projectSummary,
    fontSize: 9,
    margin: [0, 0, 0, 20],
  });

  // TABLEAU DES POSITIONS - Style Baloise
  if (data.lineItems && data.lineItems.length > 0) {
    const tableBody: TableCell[][] = [
      [
        {
          text: "Pos",
          style: "tableHeader",
          alignment: "center",
          fillColor: "#f3f4f6",
        },
        {
          text: "Article",
          style: "tableHeader",
          alignment: "center",
          fillColor: "#f3f4f6",
        },
        {
          text: "Désignation",
          style: "tableHeader",
          fillColor: "#f3f4f6",
        },
        {
          text: "Nombre",
          style: "tableHeader",
          alignment: "center",
          fillColor: "#f3f4f6",
        },
        {
          text: "Prix/pièce",
          style: "tableHeader",
          alignment: "right",
          fillColor: "#f3f4f6",
        },
        {
          text: "Total (CHF)",
          style: "tableHeader",
          alignment: "right",
          fillColor: "#f3f4f6",
        },
      ],
    ];

    // Lignes de positions
    data.lineItems.forEach((item) => {
      const qty = typeof item.quantity === "number" ? item.quantity : 1;
      const total = item.priceHT * qty;

      tableBody.push([
        {
          text: String(item.position).padStart(2, "0"),
          alignment: "center",
          fontSize: 9,
        },
        {
          text: item.article || item.unit || "Art. n° " + item.position,
          alignment: "center",
          fontSize: 9,
        },
        {
          text: item.description,
          fontSize: 9,
        },
        {
          text:
            typeof item.quantity === "string"
              ? item.quantity
              : item.quantity || "#",
          alignment: "center",
          fontSize: 9,
        },
        {
          text: formatCurrency(item.priceHT, data.currency),
          alignment: "right",
          fontSize: 9,
        },
        {
          text:
            typeof item.quantity === "number"
              ? formatCurrency(total, data.currency)
              : "x xxx.xx",
          alignment: "right",
          fontSize: 9,
        },
      ]);
    });

    // Somme intermédiaire
    const subtotal = data.lineItems.reduce((sum, item) => {
      const qty = typeof item.quantity === "number" ? item.quantity : 0;
      return sum + item.priceHT * qty;
    }, 0);

    tableBody.push([
      { text: "", colSpan: 5, border: [false, true, false, false] },
      {},
      {},
      {},
      {},
      {
        text: formatCurrency(subtotal, data.currency),
        alignment: "right",
        bold: true,
        fontSize: 9,
        border: [false, true, false, false],
      },
    ]);

    tableBody.push([
      {
        text: "",
        colSpan: 4,
        border: [false, false, false, false],
        fillColor: "#f9fafb",
      },
      {},
      {},
      {},
      {
        text: "Somme intermédiaire",
        alignment: "right",
        bold: true,
        fontSize: 9,
        border: [false, false, false, false],
        fillColor: "#f9fafb",
      },
      {
        text: formatCurrency(subtotal, data.currency),
        alignment: "right",
        bold: true,
        fontSize: 9,
        border: [false, false, false, false],
        fillColor: "#f9fafb",
      },
    ]);

    // Rabais (si applicable)
    if (data.discount && data.discount > 0) {
      const discountAmount = subtotal * (data.discount / 100);
      tableBody.push([
        {
          text: "",
          colSpan: 4,
          border: [false, false, false, false],
        },
        {},
        {},
        {},
        {
          text: `Rabais ${data.discount.toFixed(1)} %`,
          alignment: "right",
          fontSize: 9,
          border: [false, false, false, false],
        },
        {
          text: formatCurrency(discountAmount, data.currency),
          alignment: "right",
          fontSize: 9,
          border: [false, false, false, false],
        },
      ]);
    }

    // Total HT
    tableBody.push([
      {
        text: "",
        colSpan: 4,
        border: [false, false, false, false],
        fillColor: "#f9fafb",
      },
      {},
      {},
      {},
      {
        text: "Total hors TVA",
        alignment: "right",
        bold: true,
        fontSize: 9,
        border: [false, false, false, false],
        fillColor: "#f9fafb",
      },
      {
        text: formatCurrency(data.totalHT || 0, data.currency),
        alignment: "right",
        bold: true,
        fontSize: 9,
        border: [false, false, false, false],
        fillColor: "#f9fafb",
      },
    ]);

    // TVA
    const tvaRate = data.tvaRate || 7.7;
    tableBody.push([
      {
        text: "",
        colSpan: 4,
        border: [false, false, false, false],
      },
      {},
      {},
      {},
      {
        text: `TVA ${tvaRate.toFixed(1)} %`,
        alignment: "right",
        fontSize: 9,
        border: [false, false, false, false],
      },
      {
        text: formatCurrency(data.totalTVA || 0, data.currency),
        alignment: "right",
        fontSize: 9,
        border: [false, false, false, false],
      },
    ]);

    // Total TTC
    tableBody.push([
      {
        text: "",
        colSpan: 4,
        border: [false, true, false, true],
        fillColor: "#fef3c7",
      },
      {},
      {},
      {},
      {
        text: "Total TVA incluse",
        alignment: "right",
        bold: true,
        fontSize: 10,
        border: [false, true, false, true],
        fillColor: "#fef3c7",
      },
      {
        text: formatCurrency(data.price || 0, data.currency),
        alignment: "right",
        bold: true,
        fontSize: 10,
        color: "#065f46",
        border: [false, true, false, true],
        fillColor: "#fef3c7",
      },
    ]);

    content.push({
      table: {
        headerRows: 1,
        widths: [35, 60, "*", 50, 70, 70],
        body: tableBody,
      },
      layout: {
        hLineWidth: (i: number, node: { table: { body: unknown[] } }) => {
          return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
        },
        vLineWidth: () => 0.5,
        hLineColor: () => "#e5e7eb",
        vLineColor: () => "#e5e7eb",
      },
      margin: [0, 0, 0, 20],
    });
  }

  // NOTE LÉGALE
  content.push({
    text: "Les prestations supplémentaires qui ne sont pas explicitement mentionnées dans cette offre seront facturées séparément.",
    fontSize: 8,
    italics: true,
    color: "#666",
    margin: [0, 10, 0, 10],
  });

  // CONDITIONS
  content.push({
    columns: [
      {
        width: "50%",
        stack: [
          {
            text: [
              { text: "Validité: ", bold: true, fontSize: 9 },
              {
                text: `${data.validityDays} jours à compter de la date d'émission`,
                fontSize: 9,
              },
            ],
          },
        ],
      },
      {
        width: "50%",
        stack: [
          {
            text: [
              { text: "Délai de livraison: ", bold: true, fontSize: 9 },
              { text: data.timeline || "à convenir", fontSize: 9 },
            ],
          },
        ],
      },
    ],
    margin: [0, 0, 0, 15],
  });

  // DOCUMENTS JOINTS
  console.log(
    "Documents in data:",
    data.documents ? data.documents.length : "undefined"
  );
  if (data.documents && data.documents.length > 0) {
    console.log(
      "Creating Documents joints section with",
      data.documents.length,
      "documents"
    );
    content.push({
      text: "Documents joints",
      fontSize: 11,
      bold: true,
      margin: [0, 15, 0, 8],
    });

    // Tableau des documents
    const documentRows: TableCell[][] = [];

    for (const doc of data.documents) {
      const sizeInMB = (doc.size / (1024 * 1024)).toFixed(2);
      const isImage = doc.mimeType.startsWith("image/");

      documentRows.push([
        {
          text: doc.name,
          fontSize: 9,
          margin: [5, 3, 5, 3],
        },
        {
          text: `${sizeInMB} MB`,
          fontSize: 9,
          alignment: "center" as const,
          margin: [5, 3, 5, 3],
        },
        {
          text: isImage ? "Image" : "Document",
          fontSize: 9,
          alignment: "center" as const,
          margin: [5, 3, 5, 3],
        },
      ]);

      // Si c'est une image, essayer de l'afficher
      if (isImage) {
        try {
          const imageBase64 = await imageUrlToBase64(doc.url);
          if (imageBase64) {
            documentRows.push([
              {
                image: imageBase64,
                width: 200,
                fit: [200, 150] as [number, number],
                alignment: "center" as const,
                margin: [5, 5, 5, 10],
                colSpan: 3,
              },
              {},
              {},
            ]);
          }
        } catch (error) {
          console.error(`Error loading image ${doc.name}:`, error);
        }
      }
    }

    content.push({
      table: {
        widths: ["*", 60, 80],
        headerRows: 1,
        body: [
          [
            {
              text: "Nom du fichier",
              fontSize: 9,
              bold: true,
              fillColor: "#f3f4f6",
              margin: [5, 5, 5, 5],
            },
            {
              text: "Taille",
              fontSize: 9,
              bold: true,
              fillColor: "#f3f4f6",
              alignment: "center" as const,
              margin: [5, 5, 5, 5],
            },
            {
              text: "Type",
              fontSize: 9,
              bold: true,
              fillColor: "#f3f4f6",
              alignment: "center" as const,
              margin: [5, 5, 5, 5],
            },
          ],
          ...documentRows,
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#e5e7eb",
        vLineColor: () => "#e5e7eb",
      },
      margin: [0, 0, 0, 15],
    });
  }

  // FORMULE DE POLITESSE
  content.push({
    text: "Nous vous prions d'agréer, Madame, Monsieur, nos salutations les meilleures.",
    fontSize: 9,
    margin: [0, 10, 0, 5],
  });

  content.push({
    text: data.organization.name,
    fontSize: 9,
    bold: true,
    margin: [0, 0, 0, 20],
  });

  content.push({
    text: data.contactPerson || "Prénom Nom",
    fontSize: 9,
    margin: [0, 0, 0, 30],
  });

  // PIED DE PAGE - Style Baloise
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
        width: "50%",
        stack: [
          {
            text: "Taxe sur la valeur ajoutée:",
            fontSize: 7,
            bold: true,
            color: "#666",
            margin: [0, 0, 0, 2],
          },
          {
            text: data.organization.vatNumber || "CHE-123.456.789 TVA",
            fontSize: 7,
            color: "#666",
          },
        ],
      },
      {
        width: "50%",
        stack: [
          {
            text: "Coordonnées bancaires:",
            fontSize: 7,
            bold: true,
            color: "#666",
            margin: [0, 0, 0, 2],
          },
          {
            text:
              data.organization.bankName ||
              "Banque Exemple, CH-3030 Ville Exemple",
            fontSize: 7,
            color: "#666",
            margin: [0, 0, 0, 1],
          },
          {
            text: [
              {
                text:
                  data.organization.iban || "IBAN: CH99 0000 0000 0000 0000 9",
                fontSize: 7,
                color: "#666",
              },
              { text: "  |  ", fontSize: 7, color: "#999" },
              {
                text: data.organization.accountNumber || "Compte 1111-1111.222",
                fontSize: 7,
                color: "#666",
              },
            ],
            margin: [0, 0, 0, 1],
          },
          {
            text: data.organization.swiftCode || "Code SWIFT: ABCDEFGH12I",
            fontSize: 7,
            color: "#666",
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
  // Initialiser les polices côté serveur
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfFonts = require("pdfmake/build/vfs_fonts");

      // Essayer différentes structures possibles
      if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      } else if (pdfFonts.vfs) {
        pdfMake.vfs = pdfFonts.vfs;
      } else {
        // Fallback: utiliser pdfFonts directement comme vfs
        pdfMake.vfs = pdfFonts;
      }

      // Ne pas configurer de polices personnalisées - utiliser les polices par défaut
    } catch (error) {
      console.error("Error initializing PDF fonts:", error);
      throw new Error("Failed to initialize PDF fonts");
    }
  }

  const content = await generateOfferContent(data);

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 60],
    content,
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
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
  if (typeof window !== "undefined") {
    // Charger les polices côté client si nécessaire
    if (!pdfMake.vfs) {
      const pdfFonts = await import("pdfmake/build/vfs_fonts");
      pdfMake.vfs = pdfFonts.vfs;
    }

    // Ne pas configurer de polices personnalisées - utiliser les polices par défaut
  }

  initializeFonts();

  const content = await generateOfferContent(data);

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 60],
    content,
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
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
