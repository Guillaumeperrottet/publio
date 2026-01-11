/**
 * Factory functions pour générer des données de test réalistes
 * Utilise Faker pour les données aléatoires et nos données suisses
 */

import { faker } from "@faker-js/faker/locale/fr_CH"; // Locale suisse française
import {
  PrismaClient,
  OrganizationType,
  OrganizationRole,
  Prisma,
} from "@prisma/client";
// Import dynamique de auth depuis le dossier parent
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  SWISS_CANTONS,
  COMMUNE_NAMES,
  COMPANY_NAMES,
  ARCHITECTURE_NAMES,
  ENGINEERING_NAMES,
  PRIVATE_NAMES,
  TENDER_TITLES,
  OFFER_DESCRIPTIONS,
} from "../data/swiss-data";

const prisma = new PrismaClient();

// Créer l'instance auth localement pour éviter les problèmes d'import
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  socialProviders: {},
});

/**
 * Crée un utilisateur via Better Auth (avec email/password hashé)
 */
export async function createUser(
  email: string,
  password: string,
  name: string
) {
  try {
    // Vérifier si existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return existingUser;

    // Créer via Better Auth API
    await auth.api.signUpEmail({
      body: { email, password, name },
    });

    // Récupérer et vérifier l'email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`User ${email} not found after creation`);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return user;
  } catch (error) {
    console.error(`Error creating user ${email}:`, error);
    throw error;
  }
}

/**
 * Génère un nom d'organisation selon le type
 */
function generateOrgName(type: OrganizationType): string {
  switch (type) {
    case "COMMUNE":
      return faker.helpers.arrayElement(COMMUNE_NAMES);
    case "ENTREPRISE":
      const isArchitect = faker.datatype.boolean();
      const isEngineer = faker.datatype.boolean();
      if (isArchitect) return faker.helpers.arrayElement(ARCHITECTURE_NAMES);
      if (isEngineer) return faker.helpers.arrayElement(ENGINEERING_NAMES);
      return faker.helpers.arrayElement(COMPANY_NAMES);
    case "PRIVE":
      return faker.helpers.arrayElement(PRIVATE_NAMES);
    default:
      return faker.company.name();
  }
}

/**
 * Crée une organisation réaliste
 */
export async function createOrganization(
  creatorId: string,
  type: OrganizationType = faker.helpers.arrayElement([
    "COMMUNE",
    "ENTREPRISE",
    "PRIVE",
  ] as OrganizationType[])
) {
  const canton = faker.helpers.arrayElement(SWISS_CANTONS);
  const city = faker.helpers.arrayElement(canton.cities);

  return prisma.organization.create({
    data: {
      name: generateOrgName(type),
      type,
      city,
      canton: canton.code,
      country: "CH",
      email: faker.internet.email(),
      phone: `+41 ${faker.string.numeric(2)} ${faker.string.numeric(
        3
      )} ${faker.string.numeric(2)} ${faker.string.numeric(2)}`,
      address: `${faker.location.streetAddress()}, ${city}`,
      description:
        type === "COMMUNE"
          ? `Administration communale de ${city}`
          : type === "ENTREPRISE"
          ? "Entreprise spécialisée dans la construction et la rénovation en Suisse romande."
          : "Propriétaire privé",
      createdBy: creatorId,
    },
  });
}

/**
 * Ajoute un membre à une organisation
 */
export async function addOrganizationMember(
  userId: string,
  organizationId: string,
  role: OrganizationRole = "EDITOR"
) {
  // Vérifier si déjà membre
  const existing = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
  });

  if (existing) return existing;

  return prisma.organizationMember.create({
    data: {
      userId,
      organizationId,
      role,
    },
  });
}

/**
 * Crée un appel d'offres réaliste
 */
export async function createTender(
  organizationId: string,
  overrides: Record<string, unknown> = {}
) {
  const marketType = (overrides.marketType ||
    faker.helpers.arrayElement([
      "CONSTRUCTION",
      "ENGINEERING",
      "ARCHITECTURE",
      "SUPPLIES",
      "MAINTENANCE",
    ])) as
    | "CONSTRUCTION"
    | "ENGINEERING"
    | "ARCHITECTURE"
    | "SUPPLIES"
    | "MAINTENANCE";

  const titles =
    TENDER_TITLES[marketType as keyof typeof TENDER_TITLES] ||
    TENDER_TITLES.CONSTRUCTION;
  const title = faker.helpers.arrayElement(titles);

  const isSimpleMode =
    overrides.isSimpleMode ?? faker.datatype.boolean({ probability: 0.4 }); // 40% mode simple
  const isAnonymous = isSimpleMode
    ? false
    : faker.datatype.boolean({ probability: 0.3 }); // Pas d'anonymat en mode simple
  const isPublished = faker.datatype.boolean({ probability: 0.8 }); // 80% publiés

  // Deadlines variées : 20% passées, 30% imminentes (1-7j), 50% futures (8-90j)
  const deadlineType = faker.number.float();
  let deadline: Date;

  if (deadlineType < 0.2) {
    // 20% deadlines passées (pour tester cron job)
    deadline = faker.date.recent({ days: 30 });
  } else if (deadlineType < 0.5) {
    // 30% deadlines imminentes (1-7 jours)
    deadline = faker.date.soon({ days: faker.number.int({ min: 1, max: 7 }) });
  } else {
    // 50% deadlines futures (8-90 jours)
    deadline = faker.date.soon({ days: faker.number.int({ min: 8, max: 90 }) });
  }

  // Question deadline (avant la deadline principale)
  const questionDeadline = new Date(deadline);
  questionDeadline.setDate(questionDeadline.getDate() - 7); // 7 jours avant

  // Mode simple = moins d'images, budget plus petit
  const imageCount = isSimpleMode
    ? faker.number.int({ min: 0, max: 2 })
    : faker.number.int({ min: 1, max: 3 });
  const images = Array.from({ length: imageCount }, () => ({
    url: `https://picsum.photos/seed/${faker.string.alphanumeric(10)}/800/600`,
    name:
      faker.helpers.arrayElement([
        "Plan du site",
        "Vue d'ensemble",
        "Photo actuelle",
        "État des lieux",
        "Schéma technique",
        "Exemple référence",
      ]) + `.jpg`,
    type: "image" as const,
  }));

  // Mode simple = moins de PDFs
  const pdfCount = isSimpleMode ? 0 : faker.number.int({ min: 0, max: 2 });
  const pdfs = Array.from({ length: pdfCount }, () => ({
    url: `https://www.example.com/documents/${faker.string.alphanumeric(
      16
    )}.pdf`,
    name:
      faker.helpers.arrayElement([
        "Cahier des charges",
        "Spécifications techniques",
        "Plans architecturaux",
        "Devis estimatif",
        "Normes SIA",
      ]) + `.pdf`,
    type: "pdf" as const,
  }));

  // Budget adapté au type
  const budgetRange = isSimpleMode
    ? { min: 5000, max: 50000 } // Particuliers : 5k-50k CHF
    : { min: 15000, max: 500000 }; // Communes/Entreprises : 15k-500k CHF

  const budget = faker.number.int(budgetRange);
  const canton = faker.helpers.arrayElement(SWISS_CANTONS);
  const city = faker.helpers.arrayElement(canton.cities);

  // Codes CFC variés selon le marketType
  const cfcCodesByType: Record<string, string[]> = {
    CONSTRUCTION: ["211", "212", "213", "221", "222", "231", "232"],
    ENGINEERING: ["221", "222", "223", "224"],
    ARCHITECTURE: ["211", "212", "221"],
    SUPPLIES: ["271", "272", "273"],
    MAINTENANCE: ["281", "282", "283"],
  };

  const availableCfcCodes = cfcCodesByType[marketType] || ["211", "221"];

  // Champs avancés
  const hasLots = !isSimpleMode && faker.datatype.boolean({ probability: 0.3 });
  const currentSituation = !isSimpleMode
    ? faker.helpers.arrayElement([
        "Bâtiment existant nécessitant une rénovation complète.",
        "Terrain nu avec toutes les autorisations en ordre.",
        "Infrastructure vieillissante à remplacer.",
        "Extension d'un bâtiment existant.",
      ])
    : undefined;

  const contractStartDate = faker.date.soon({ days: 60 });
  const contractDuration = faker.number.int({ min: 30, max: 365 });

  return prisma.tender.create({
    data: {
      title,
      summary: isSimpleMode ? faker.lorem.sentence() : faker.lorem.sentences(2),
      description: isSimpleMode
        ? faker.lorem.paragraphs(2) // Plus court pour privés
        : faker.lorem.paragraphs(3),
      currentSituation,
      marketType,
      cfcCodes: faker.helpers.arrayElements(availableCfcCodes, {
        min: 1,
        max: 3,
      }),
      budget,
      showBudget: faker.datatype.boolean({ probability: 0.8 }),
      surfaceM2:
        marketType === "CONSTRUCTION" || marketType === "ARCHITECTURE"
          ? faker.number.float({ min: 50, max: 5000, fractionDigits: 2 })
          : null,
      volumeM3:
        marketType === "CONSTRUCTION"
          ? faker.number.float({ min: 200, max: 20000, fractionDigits: 2 })
          : null,
      constraints: !isSimpleMode
        ? faker.helpers.arrayElements(
            [
              "Accès difficile au chantier",
              "Site occupé pendant les travaux",
              "Horaires de travail limités (08h-17h)",
              "Protection du patrimoine nécessaire",
              "Coordination avec autres corps de métier",
            ],
            { min: 0, max: 3 }
          )
        : [],
      contractDuration,
      contractStartDate,
      isRenewable: faker.datatype.boolean({ probability: 0.2 }),
      status: isPublished ? "PUBLISHED" : "DRAFT",
      mode: isAnonymous ? "ANONYMOUS" : "CLASSIC",
      visibility: "PUBLIC",
      procedure: isSimpleMode
        ? "OPEN"
        : faker.helpers.arrayElement(["OPEN", "SELECTIVE"]),
      isSimpleMode: isSimpleMode as boolean,
      selectionPriorities: faker.helpers.arrayElements(
        [
          "LOWEST_PRICE",
          "QUALITY_PRICE",
          "FASTEST_DELIVERY",
          "BEST_REFERENCES",
          "ECO_FRIENDLY",
        ],
        { min: 1, max: 3 }
      ),
      deadline,
      questionDeadline: !isSimpleMode ? questionDeadline : null,
      publishedAt: isPublished ? faker.date.recent({ days: 30 }) : null,
      city,
      postalCode: faker.location.zipCode("####"),
      address: faker.location.streetAddress(),
      canton: canton.code,
      country: "CH",
      location: `${city}, ${canton.name}`,
      hasLots,
      allowPartialOffers: hasLots
        ? true
        : faker.datatype.boolean({ probability: 0.7 }),
      participationConditions: !isSimpleMode
        ? faker.helpers.arrayElements(
            [
              "Être inscrit au registre du commerce",
              "Avoir une assurance RC professionnelle",
              "Fournir des garanties financières",
              "Disposer d'un certificat de qualification",
            ],
            { min: 1, max: 3 }
          )
        : [],
      requiredDocuments: !isSimpleMode
        ? faker.helpers.arrayElements(
            [
              "Extrait du registre du commerce",
              "Attestation d'assurance RC",
              "Références de projets similaires",
              "Liste du personnel qualifié",
              "Certificats de formation",
            ],
            { min: 1, max: 4 }
          )
        : [],
      requiresReferences: isSimpleMode
        ? false
        : faker.datatype.boolean({ probability: 0.6 }),
      requiresInsurance: faker.datatype.boolean({ probability: 0.4 }),
      minExperience: !isSimpleMode
        ? faker.helpers.arrayElement([
            "5 ans d'expérience minimum",
            "3 projets similaires réalisés",
            "10 ans dans le domaine",
            "Aucune exigence particulière",
          ])
        : null,
      contractualTerms: !isSimpleMode
        ? faker.helpers.arrayElements(
            [
              "Paiement 30% à l'avance, 40% en cours, 30% à la fin",
              "Garantie décennale obligatoire",
              "Pénalités de retard : 0.5% par jour",
              "Clause de révision des prix",
            ],
            { min: 1, max: 3 }
          )
        : [],
      identityRevealed: isAnonymous && isPublished && deadlineType < 0.2, // Révélé si déjà clôturé
      revealedAt:
        isAnonymous && isPublished && deadlineType < 0.2 ? deadline : null,
      images,
      pdfs,
      organizationId,
      ...overrides,
    },
  });
}

/**
 * Crée une offre réaliste complète pour un tender
 */
export async function createOffer(
  tenderId: string,
  organizationId: string,
  tender: { budget?: number | null; mode?: string },
  options: { withDetails?: boolean } = {}
) {
  const isSubmitted = faker.datatype.boolean({ probability: 0.8 }); // 80% soumises
  const withDetails =
    options.withDetails ?? faker.datatype.boolean({ probability: 0.6 }); // 60% avec détails

  // Prix autour du budget du tender (+/- 20%)
  const budgetVariation = faker.number.float({ min: 0.8, max: 1.2 });
  const price = Math.round((tender.budget || 50000) * budgetVariation);
  const totalHT = withDetails ? Math.round(price / 1.077) : null;
  const totalTVA = withDetails ? Math.round(price - (totalHT || 0)) : null;

  const submittedAt = isSubmitted ? faker.date.recent({ days: 10 }) : null;
  const viewedAt =
    isSubmitted && faker.datatype.boolean({ probability: 0.6 })
      ? faker.date.between({
          from: submittedAt!,
          to: new Date(),
        })
      : null;

  const offer = await prisma.offer.create({
    data: {
      tenderId,
      organizationId,
      offerNumber: `OFF-${faker.string.numeric(6)}`,
      validityDays: faker.helpers.arrayElement([30, 60, 90]),
      usesTenderDeadline: faker.datatype.boolean({ probability: 0.3 }),
      projectSummary: faker.helpers.arrayElement([
        "Nous avons pris connaissance du projet et proposons une solution complète.",
        "Notre entreprise dispose de l'expertise nécessaire pour ce type de projet.",
        "Nous garantissons un travail de qualité dans les délais impartis.",
        "Nous vous proposons une approche personnalisée répondant à vos besoins.",
      ]),
      // Coordonnées de contact
      contactPerson: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: `+41 ${faker.string.numeric(2)} ${faker.string.numeric(
        3
      )} ${faker.string.numeric(2)} ${faker.string.numeric(2)}`,
      organizationAddress: faker.location.streetAddress(),
      organizationCity: faker.helpers.arrayElement(SWISS_CANTONS).cities[0],
      organizationPhone: `+41 ${faker.string.numeric(2)} ${faker.string.numeric(
        3
      )} ${faker.string.numeric(2)} ${faker.string.numeric(2)}`,
      organizationEmail: faker.internet.email(),
      organizationWebsite: faker.internet.url(),
      price,
      currency: "CHF",
      priceType: withDetails ? "DETAILED" : "GLOBAL",
      totalHT,
      totalTVA,
      tvaRate: 7.7,
      discount: faker.datatype.boolean({ probability: 0.2 })
        ? faker.number.float({ min: 2, max: 10, fractionDigits: 1 })
        : null,
      description: faker.helpers.arrayElement(OFFER_DESCRIPTIONS),
      methodology: withDetails ? faker.lorem.paragraphs(2) : null,
      timeline: `${faker.number.int({ min: 2, max: 12 })} semaines`,
      startDate: faker.date.soon({ days: 30 }),
      durationDays: faker.number.int({ min: 14, max: 90 }),
      constraints: faker.datatype.boolean({ probability: 0.4 })
        ? "Dépend de la disponibilité des matériaux et des conditions météo."
        : null,
      paymentTerms: (withDetails
        ? {
            deposit: 30,
            intermediate: 40,
            final: 30,
            netDays: 30,
          }
        : null) as Prisma.InputJsonValue,
      warrantyYears: faker.number.int({ min: 1, max: 10 }),
      insuranceAmount: faker.number.int({ min: 1000000, max: 5000000 }),
      manufacturerWarranty: faker.datatype.boolean({ probability: 0.6 })
        ? "Garantie fabricant 2-5 ans selon les équipements"
        : null,
      references: faker.datatype.boolean({ probability: 0.7 })
        ? "Projets similaires réalisés à Lausanne (2023), Genève (2022) et Fribourg (2021)."
        : null,
      signature: null, // Pas de signature par défaut
      status: isSubmitted ? "SUBMITTED" : "DRAFT",
      submittedAt,
      viewedAt,
      paymentStatus: isSubmitted ? "PAID" : "PENDING",
      stripePaymentId: isSubmitted
        ? `pi_${faker.string.alphanumeric(24)}`
        : null,
      paidAt: isSubmitted ? submittedAt : null,
    },
  });

  // Ajouter des détails si demandé
  if (withDetails && totalHT) {
    // Lignes de prix (3-6 postes)
    const numItems = faker.number.int({ min: 3, max: 6 });
    const itemPriceHT = Math.round(totalHT / numItems);

    const categories = [
      "Main d'œuvre",
      "Matériaux",
      "Équipements",
      "Transport",
      "Gestion",
    ];

    for (let i = 0; i < numItems; i++) {
      await prisma.offerLineItem.create({
        data: {
          offerId: offer.id,
          position: i + 1,
          description: faker.helpers.arrayElement([
            "Démolition et évacuation",
            "Maçonnerie et gros œuvre",
            "Charpente et couverture",
            "Menuiseries extérieures",
            "Isolation thermique",
            "Électricité et domotique",
            "Plomberie et sanitaires",
            "Finitions et peinture",
          ]),
          quantity: faker.number.float({
            min: 10,
            max: 200,
            fractionDigits: 2,
          }),
          unit: faker.helpers.arrayElement(["m²", "ml", "pce", "h"]),
          priceHT: itemPriceHT,
          tvaRate: 7.7,
          category: faker.helpers.arrayElement(categories),
          sectionOrder: i,
        },
      });
    }

    // Inclusions (2-4 prestations)
    const inclusions = [
      "Nettoyage final du chantier",
      "Garantie décennale incluse",
      "Plans d'exécution",
      "Suivi de chantier hebdomadaire",
      "Coordination avec autres corps de métier",
    ];
    const numInclusions = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numInclusions; i++) {
      await prisma.offerInclusion.create({
        data: {
          offerId: offer.id,
          position: i + 1,
          description: inclusions[i % inclusions.length],
        },
      });
    }

    // Exclusions (1-3 prestations)
    const exclusions = [
      "Raccordements aux réseaux publics",
      "Aménagements extérieurs",
      "Mobilier et équipements",
    ];
    const numExclusions = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numExclusions; i++) {
      await prisma.offerExclusion.create({
        data: {
          offerId: offer.id,
          position: i + 1,
          description: exclusions[i % exclusions.length],
        },
      });
    }

    // Matériaux (2-4 matériaux)
    const materials = [
      { name: "Béton C25/30", brand: "Holcim", warranty: "10 ans" },
      {
        name: "Fenêtres PVC triple vitrage",
        brand: "Finstral",
        model: "FIN-Project Nova-line",
        range: "Premium",
        warranty: "5 ans",
      },
      {
        name: "Isolation laine de roche",
        brand: "Rockwool",
        model: "Superrock",
        warranty: "30 ans",
      },
      {
        name: "Tuiles en terre cuite",
        brand: "Eternit",
        model: "Ratio",
        warranty: "30 ans",
      },
    ];
    const numMaterials = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numMaterials; i++) {
      const mat = materials[i % materials.length];
      await prisma.offerMaterial.create({
        data: {
          offerId: offer.id,
          position: i + 1,
          name: mat.name,
          brand: mat.brand,
          model: mat.model || null,
          range: mat.range || null,
          manufacturerWarranty: mat.warranty,
        },
      });
    }
  }

  return offer;
}

/**
 * Crée une recherche sauvegardée
 */
export async function createSavedSearch(userId: string) {
  const canton = faker.helpers.arrayElement(SWISS_CANTONS);

  return prisma.savedSearch.create({
    data: {
      userId,
      name: faker.helpers.arrayElement([
        `Projets ${canton.name}`,
        "Constructions > 50k",
        "Appels d'offres récents",
        "Marchés publics",
      ]),
      criteria: {
        canton: canton.code,
        marketType: faker.helpers.arrayElement(["CONSTRUCTION", "ENGINEERING"]),
        minBudget: faker.number.int({ min: 10000, max: 50000 }),
      },
      alertsEnabled: faker.datatype.boolean({ probability: 0.7 }),
    },
  });
}

/**
 * Crée une publication de veille
 */
export async function createVeillePublication() {
  const canton = faker.helpers.arrayElement(SWISS_CANTONS);
  const city = faker.helpers.arrayElement(canton.cities);

  return prisma.veillePublication.create({
    data: {
      title: faker.helpers.arrayElement([
        `Mise à l'enquête - ${city}`,
        `Permis de construire - ${city}`,
        `Avis public - Projet ${city}`,
      ]),
      description: faker.lorem.paragraph(),
      commune: city,
      canton: canton.code,
      type: faker.helpers.arrayElement([
        "MISE_A_LENQUETE",
        "PERMIS_CONSTRUIRE",
        "AVIS",
      ]),
      url: `https://example.com/publications/${faker.string.alphanumeric(8)}`,
      publishedAt: faker.date.recent({ days: 60 }),
    },
  });
}

/**
 * Crée un journal d'équité (equity log) pour un tender
 */
export async function createEquityLog(
  tenderId: string,
  userId: string,
  action:
    | "TENDER_CREATED"
    | "TENDER_PUBLISHED"
    | "TENDER_UPDATED"
    | "TENDER_CLOSED"
    | "TENDER_AWARDED"
    | "TENDER_CANCELLED"
    | "OFFER_RECEIVED"
    | "OFFER_SHORTLISTED"
    | "OFFER_REJECTED"
    | "OFFER_AWARDED"
    | "IDENTITY_REVEALED"
    | "DEADLINE_EXTENDED"
    | "INVITATION_SENT",
  metadata?: Record<string, unknown>
) {
  const descriptions: Record<string, string> = {
    TENDER_CREATED: "Appel d'offres créé en brouillon",
    TENDER_PUBLISHED: "Appel d'offres publié et visible publiquement",
    TENDER_UPDATED: "Appel d'offres modifié",
    TENDER_CLOSED: "Appel d'offres clôturé (deadline atteinte)",
    TENDER_AWARDED: "Marché attribué",
    TENDER_CANCELLED: "Appel d'offres annulé",
    OFFER_RECEIVED: "Nouvelle offre reçue",
    OFFER_SHORTLISTED: "Offre mise en liste restreinte",
    OFFER_REJECTED: "Offre rejetée",
    OFFER_AWARDED: "Offre retenue (gagnante)",
    IDENTITY_REVEALED: "Identité des soumissionnaires révélée",
    DEADLINE_EXTENDED: "Deadline prolongée",
    INVITATION_SENT: "Invitation envoyée",
  };

  return prisma.equityLog.create({
    data: {
      tenderId,
      userId,
      action,
      description: descriptions[action],
      metadata: (metadata || {}) as Prisma.InputJsonValue,
    },
  });
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(
  userId: string,
  type:
    | "COMMENT_ADDED"
    | "OFFER_RECEIVED"
    | "OFFER_WITHDRAWN"
    | "OFFER_SHORTLISTED"
    | "OFFER_REJECTED"
    | "TENDER_AWARDED"
    | "TENDER_CLOSING_SOON"
    | "TENDER_MATCH"
    | "VEILLE_MATCH",
  metadata?: Record<string, unknown>
) {
  const notificationData: Record<string, { title: string; message: string }> = {
    COMMENT_ADDED: {
      title: "Nouveau commentaire",
      message: "Un nouveau commentaire a été ajouté sur une offre",
    },
    OFFER_RECEIVED: {
      title: "Nouvelle offre reçue",
      message: "Vous avez reçu une nouvelle offre",
    },
    OFFER_WITHDRAWN: {
      title: "Offre retirée",
      message: "Une offre a été retirée",
    },
    OFFER_SHORTLISTED: {
      title: "Offre présélectionnée",
      message: "Votre offre a été mise en liste restreinte",
    },
    OFFER_REJECTED: {
      title: "Offre rejetée",
      message: "Votre offre n'a pas été retenue",
    },
    TENDER_AWARDED: {
      title: "Marché attribué",
      message: "Le marché a été attribué",
    },
    TENDER_CLOSING_SOON: {
      title: "Deadline proche",
      message: "Un appel d'offres se clôture bientôt",
    },
    TENDER_MATCH: {
      title: "Nouvel appel d'offres",
      message: "Un nouvel appel d'offres correspond à vos critères",
    },
    VEILLE_MATCH: {
      title: "Nouvelle publication",
      message: "Une nouvelle publication de veille est disponible",
    },
  };

  const data = notificationData[type];

  return prisma.notification.create({
    data: {
      userId,
      type,
      title: data.title,
      message: data.message,
      read: faker.datatype.boolean({ probability: 0.3 }), // 30% lues
      metadata: (metadata || {}) as Prisma.InputJsonValue,
    },
  });
}

/**
 * Crée des préférences de notification pour un utilisateur
 */
export async function createNotificationPreferences(userId: string) {
  return prisma.notificationPreferences.create({
    data: {
      userId,
      inAppEnabled: true,
      emailEnabled: faker.datatype.boolean({ probability: 0.8 }),
      pushEnabled: faker.datatype.boolean({ probability: 0.3 }),
      enabledTypes: [], // Tous les types activés
      emailFrequency: faker.helpers.arrayElement([
        "INSTANT",
        "DAILY_DIGEST",
        "WEEKLY_DIGEST",
      ]),
      digestTime: "09:00",
      digestDay: 1,
    },
  });
}

/**
 * Sauvegarde un tender pour un utilisateur (favoris)
 */
export async function createSavedTender(userId: string, tenderId: string) {
  try {
    return await prisma.savedTender.create({
      data: {
        userId,
        tenderId,
      },
    });
  } catch (error) {
    // Ignorer si déjà existant (unique constraint)
    return null;
  }
}

/**
 * Crée une subscription veille pour une organisation
 */
export async function createVeilleSubscription(organizationId: string) {
  const cantons = faker.helpers.arrayElements(
    ["VD", "GE", "VS", "FR", "NE", "JU", "BE"],
    { min: 1, max: 3 }
  );

  return prisma.veilleSubscription.create({
    data: {
      organizationId,
      cantons,
      keywords: faker.helpers.arrayElements(
        [
          "construction",
          "rénovation",
          "infrastructure",
          "bâtiment",
          "voirie",
          "aménagement",
        ],
        { min: 2, max: 4 }
      ),
      emailNotifications: true,
      appNotifications: true,
      alertFrequency: faker.helpers.arrayElement([
        "INSTANT",
        "DAILY",
        "WEEKLY",
      ]),
      alertTypes: [],
      alertKeywords: [],
      alertCommunes: [],
    },
  });
}

/**
 * Crée un lot pour un tender
 */
export async function createTenderLot(
  tenderId: string,
  lotNumber: number,
  budget?: number
) {
  const lotTitles = [
    "Gros œuvre et maçonnerie",
    "Charpente et couverture",
    "Menuiseries extérieures",
    "Électricité et domotique",
    "Plomberie et sanitaires",
    "Finitions et peinture",
    "Aménagements extérieurs",
    "Voirie et réseaux",
  ];

  return prisma.tenderLot.create({
    data: {
      tenderId,
      number: lotNumber,
      title: lotTitles[lotNumber - 1] || `Lot ${lotNumber}`,
      description: faker.lorem.paragraph(),
      budget,
    },
  });
}

/**
 * Crée des critères d'évaluation pour un tender
 */
export async function createTenderCriteria(tenderId: string) {
  const criteria = [
    { name: "Prix", description: "Prix total de l'offre", weight: 40 },
    {
      name: "Qualité technique",
      description: "Qualité de la proposition technique",
      weight: 30,
    },
    {
      name: "Délais",
      description: "Délais d'exécution proposés",
      weight: 20,
    },
    {
      name: "Références",
      description: "Expérience et références",
      weight: 10,
    },
  ];

  for (let i = 0; i < criteria.length; i++) {
    await prisma.tenderCriteria.create({
      data: {
        tenderId,
        name: criteria[i].name,
        description: criteria[i].description,
        weight: criteria[i].weight,
        order: i + 1,
      },
    });
  }
}

/**
 * Crée un commentaire interne sur une offre
 */
export async function createOfferComment(
  offerId: string,
  authorId: string,
  content?: string
) {
  const comments = [
    "Cette offre semble intéressante, à discuter en équipe.",
    "Prix correct mais les délais me semblent courts.",
    "Bonnes références, entreprise fiable.",
    "À creuser : qu'en est-il de la garantie ?",
    "Proposition technique solide, j'approuve.",
    "Trop cher par rapport aux autres offres.",
  ];

  return prisma.offerComment.create({
    data: {
      offerId,
      authorId,
      content: content || faker.helpers.arrayElement(comments),
    },
  });
}

/**
 * Crée une invitation pour rejoindre une organisation
 */
export async function createInvitationToken(
  organizationId: string,
  invitedBy: string,
  email: string,
  role: "ADMIN" | "EDITOR" | "VIEWER" = "EDITOR"
) {
  const token = faker.string.alphanumeric(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

  return prisma.invitationToken.create({
    data: {
      token,
      email,
      role,
      organizationId,
      invitedBy,
      expiresAt,
      status: faker.helpers.arrayElement(["PENDING", "PENDING", "ACCEPTED"]), // 66% pending
    },
  });
}

/**
 * Crée une facture pour une organisation
 */
export async function createInvoice(
  organizationId: string,
  type: "tender" | "offer" | "subscription",
  amount: number
) {
  const invoiceNumber = `INV-${type.toUpperCase()}-${faker.string
    .alphanumeric(8)
    .toUpperCase()}`;

  const descriptions: Record<string, string> = {
    tender: "Publication d'appel d'offres",
    offer: "Dépôt d'offre",
    subscription: "Abonnement veille communale",
  };

  return prisma.invoice.create({
    data: {
      organizationId,
      number: invoiceNumber,
      amount,
      currency: "CHF",
      status: faker.helpers.arrayElement(["PAID", "PAID", "PAID", "PENDING"]), // 75% payées
      description: descriptions[type],
      stripeInvoiceId: `inv_${faker.string.alphanumeric(24)}`,
      stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
      paidAt: faker.datatype.boolean({ probability: 0.75 })
        ? faker.date.recent({ days: 30 })
        : null,
      dueDate: faker.date.soon({ days: 30 }),
    },
  });
}

/**
 * Crée une subscription (abonnement veille) pour une organisation
 */
export async function createSubscription(
  organizationId: string,
  plan: "FREE" | "VEILLE_BASIC" | "VEILLE_UNLIMITED"
) {
  const isActive = faker.datatype.boolean({ probability: 0.9 });

  return prisma.subscription.create({
    data: {
      organizationId,
      plan,
      status: isActive ? "ACTIVE" : "CANCELLED",
      stripeSubscriptionId:
        plan !== "FREE" ? `sub_${faker.string.alphanumeric(24)}` : null,
      stripeCustomerId:
        plan !== "FREE" ? `cus_${faker.string.alphanumeric(24)}` : null,
      stripePriceId:
        plan === "VEILLE_BASIC"
          ? "price_basic"
          : plan === "VEILLE_UNLIMITED"
          ? "price_unlimited"
          : null,
      currentPeriodStart: isActive ? faker.date.past({ years: 0.5 }) : null,
      currentPeriodEnd: isActive ? faker.date.future({ years: 0.1 }) : null,
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Crée un log d'activité pour super admin
 */
export async function createActivityLog(
  type:
    | "USER_CREATED"
    | "ORGANIZATION_CREATED"
    | "TENDER_PUBLISHED"
    | "OFFER_SUBMITTED"
    | "PAYMENT_SUCCESS",
  userId?: string,
  metadata?: Record<string, unknown>
) {
  const descriptions: Record<string, string> = {
    USER_CREATED: "Nouvel utilisateur créé",
    ORGANIZATION_CREATED: "Nouvelle organisation créée",
    TENDER_PUBLISHED: "Appel d'offres publié",
    OFFER_SUBMITTED: "Offre soumise",
    PAYMENT_SUCCESS: "Paiement effectué avec succès",
  };

  return prisma.activityLog.create({
    data: {
      type,
      description: descriptions[type],
      metadata: (metadata || {}) as Prisma.InputJsonValue,
      userId: userId || null,
      ipAddress: faker.internet.ipv4(),
      userAgent: faker.internet.userAgent(),
    },
  });
}
