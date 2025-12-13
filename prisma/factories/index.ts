/**
 * Factory functions pour générer des données de test réalistes
 * Utilise Faker pour les données aléatoires et nos données suisses
 */

import { faker } from "@faker-js/faker/locale/fr_CH"; // Locale suisse française
import {
  PrismaClient,
  OrganizationType,
  OrganizationRole,
} from "@prisma/client";
import { auth } from "@/lib/auth/config";
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

  const isAnonymous = faker.datatype.boolean({ probability: 0.3 }); // 30% anonymes
  const isPublished = faker.datatype.boolean({ probability: 0.7 }); // 70% publiés

  // Date deadline entre 7 et 60 jours
  const deadline = faker.date.soon({
    days: faker.number.int({ min: 7, max: 60 }),
  });

  // Générer 1-3 images via Lorem Picsum (plus rapide que Unsplash)
  const imageCount = faker.number.int({ min: 0, max: 3 });
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

  // Générer 0-2 PDFs fictifs (juste des exemples)
  const pdfCount = faker.number.int({ min: 0, max: 2 });
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

  return prisma.tender.create({
    data: {
      title,
      summary: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(3),
      marketType,
      cfcCodes: faker.helpers.arrayElements(["211", "221", "231"], {
        min: 1,
        max: 2,
      }),
      budget: faker.number.int({ min: 15000, max: 500000 }),
      showBudget: faker.datatype.boolean({ probability: 0.8 }),
      status: isPublished ? "PUBLISHED" : "DRAFT",
      mode: isAnonymous ? "ANONYMOUS" : "CLASSIC",
      visibility: "PUBLIC",
      procedure: faker.helpers.arrayElement(["OPEN", "SELECTIVE"]),
      deadline,
      publishedAt: isPublished ? faker.date.recent({ days: 30 }) : null,
      city: faker.helpers.arrayElement(SWISS_CANTONS).cities[0],
      canton: faker.helpers.arrayElement(SWISS_CANTONS).code,
      requiresReferences: faker.datatype.boolean({ probability: 0.6 }),
      requiresInsurance: faker.datatype.boolean({ probability: 0.4 }),
      images,
      pdfs,
      organizationId,
      ...overrides,
    },
  });
}

/**
 * Crée une offre réaliste pour un tender
 */
export async function createOffer(
  tenderId: string,
  organizationId: string,
  tender: { budget?: number | null }
) {
  const isSubmitted = faker.datatype.boolean({ probability: 0.8 }); // 80% soumises

  // Prix autour du budget du tender (+/- 20%)
  const budgetVariation = faker.number.float({ min: 0.8, max: 1.2 });
  const price = Math.round((tender.budget || 50000) * budgetVariation);

  return prisma.offer.create({
    data: {
      tenderId,
      organizationId,
      price,
      currency: "CHF",
      projectSummary: faker.helpers.arrayElement([
        "Nous avons pris connaissance du projet et proposons une solution complète.",
        "Notre entreprise dispose de l'expertise nécessaire pour ce type de projet.",
        "Nous garantissons un travail de qualité dans les délais impartis.",
      ]),
      description: faker.helpers.arrayElement(OFFER_DESCRIPTIONS),
      timeline: `${faker.number.int({ min: 2, max: 12 })} semaines`,
      durationDays: faker.number.int({ min: 14, max: 90 }),
      warrantyYears: faker.number.int({ min: 1, max: 10 }),
      references: faker.datatype.boolean()
        ? "Projets similaires réalisés à Lausanne (2023), Genève (2022) et Fribourg (2021)."
        : null,
      status: isSubmitted ? "SUBMITTED" : "DRAFT",
      submittedAt: isSubmitted ? faker.date.recent({ days: 10 }) : null,
      validityDays: 60,
    },
  });
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
