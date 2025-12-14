// Actions pour la gestion des paiements des tenders
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  TenderStatus,
  MarketType,
  TenderVisibility,
  TenderMode,
  TenderProcedure,
} from "@prisma/client";
import { createTenderPaymentSession } from "@/lib/stripe";
import {
  type CFCCategory,
  getMarketTypeFromCFCCategory,
} from "@/lib/constants/cfc-codes";

/**
 * Créer un tender avec paiement Stripe
 * Le tender est créé en DRAFT, puis publié via webhook après paiement
 */
export async function createTenderWithPayment(data: {
  organizationId: string;
  title: string;
  summary?: string;
  description: string;
  currentSituation?: string;
  cfcCategory?: CFCCategory; // Catégorie CFC choisie
  cfcCodes?: string[];
  budget?: number;
  showBudget?: boolean;
  surfaceM2?: number;
  volumeM3?: number;
  constraints?: string[];
  contractDuration?: string;
  contractStartDate?: string;
  isRenewable?: boolean;
  deadline: Date;
  questionDeadline?: string;
  visibility: string;
  mode: string;
  procedure?: string;
  selectionPriorities?: string[];
  city?: string;
  postalCode?: string;
  canton?: string;
  location?: string;
  address?: string;
  country?: string;
  hasLots?: boolean;
  allowPartialOffers?: boolean;
  participationConditions?: string[];
  requiredDocuments?: string[];
  requiresReferences?: boolean;
  requiresInsurance?: boolean;
  minExperience?: string;
  contractualTerms?: string[];
  images?: Array<{ url: string; name: string; type: "image" }>;
  pdfs?: Array<{ url: string; name: string; type: "pdf" }>;
  lots?: Array<{
    number: number;
    title: string;
    description: string;
    budget?: string;
  }>;
  criteria?: Array<{
    name: string;
    description: string;
    weight: number;
    order: number;
  }>;
}) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a les droits
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: data.organizationId,
        userId: user.id,
        role: {
          in: ["OWNER", "ADMIN", "EDITOR"],
        },
      },
    });

    if (!membership) {
      return {
        error:
          "Vous n'avez pas les droits pour créer un appel d'offres pour cette organisation",
      };
    }

    // Dériver le marketType depuis la catégorie CFC, ou utiliser OTHER par défaut
    const marketType = data.cfcCategory
      ? getMarketTypeFromCFCCategory(data.cfcCategory)
      : "OTHER";

    // Créer le tender en mode DRAFT
    const tender = await prisma.tender.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        summary: data.summary,
        description: data.description,
        currentSituation: data.currentSituation,
        marketType: marketType as MarketType,
        cfcCodes: data.cfcCodes || [],
        budget: data.budget,
        showBudget: data.showBudget ?? false,
        surfaceM2: data.surfaceM2,
        volumeM3: data.volumeM3,
        constraints: data.constraints || [],
        deadline: data.deadline,
        location: data.location,
        city: data.city,
        canton: data.canton,
        address: data.address,
        country: data.country,
        visibility: data.visibility as TenderVisibility,
        mode: data.mode as TenderMode,
        status: TenderStatus.DRAFT,
        selectionPriorities:
          data.selectionPriorities && data.selectionPriorities.length > 0
            ? (data.selectionPriorities as (
                | "LOWEST_PRICE"
                | "QUALITY_PRICE"
                | "FASTEST_DELIVERY"
                | "BEST_REFERENCES"
                | "ECO_FRIENDLY"
              )[])
            : ["QUALITY_PRICE"],
        contractDuration: data.contractDuration
          ? parseInt(data.contractDuration)
          : undefined,
        contractStartDate: data.contractStartDate
          ? new Date(data.contractStartDate)
          : undefined,
        isRenewable: data.isRenewable ?? false,
        procedure: data.procedure as TenderProcedure | undefined,
        questionDeadline: data.questionDeadline
          ? new Date(data.questionDeadline)
          : undefined,
        participationConditions: data.participationConditions,
        requiredDocuments: data.requiredDocuments,
        requiresReferences: data.requiresReferences ?? false,
        requiresInsurance: data.requiresInsurance ?? false,
        minExperience: data.minExperience || undefined,
        contractualTerms: data.contractualTerms,
        hasLots: data.hasLots ?? false,
        allowPartialOffers: data.allowPartialOffers ?? true,
        images: data.images || [],
        pdfs: data.pdfs || [],
      },
    });

    // Créer les lots si présents
    if (data.lots && data.lots.length > 0) {
      await prisma.tenderLot.createMany({
        data: data.lots.map((lot) => ({
          tenderId: tender.id,
          number: lot.number,
          title: lot.title,
          description: lot.description,
          budget: lot.budget ? parseFloat(lot.budget) : undefined,
        })),
      });
    }

    // Créer les critères si présents
    if (data.criteria && data.criteria.length > 0) {
      await prisma.tenderCriteria.createMany({
        data: data.criteria.map((criteria) => ({
          tenderId: tender.id,
          name: criteria.name,
          description: criteria.description,
          weight: criteria.weight,
          order: criteria.order,
        })),
      });
    }

    // Créer la session de paiement Stripe
    const paymentSession = await createTenderPaymentSession({
      tenderId: tender.id,
      organizationId: data.organizationId,
      tenderTitle: data.title,
    });

    // Note: stripeSessionId sera géré ultérieurement dans une migration Prisma
    // Pour l'instant, on stocke l'info dans les métadonnées Stripe

    return {
      success: true,
      tenderId: tender.id,
      checkoutUrl: paymentSession.url,
    };
  } catch (error) {
    console.error("Error creating tender with payment:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'appel d'offres",
    };
  }
}

/**
 * Confirmer la publication d'un tender après paiement Stripe
 * Appelé par le webhook Stripe
 */
export async function confirmTenderPayment(tenderId: string) {
  const tender = await prisma.tender.update({
    where: { id: tenderId },
    data: {
      status: TenderStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  return tender;
}

/**
 * Publier un tender DRAFT existant avec paiement Stripe
 */
export async function publishTenderWithPayment(tenderId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer le tender avec les vérifications
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!tender) {
      throw new Error("Appel d'offres non trouvé");
    }

    // Vérifier les permissions
    const membership = tender.organization.members[0];
    if (
      !membership ||
      !["OWNER", "ADMIN", "EDITOR"].includes(membership.role)
    ) {
      throw new Error(
        "Vous n'avez pas les droits pour publier cet appel d'offres"
      );
    }

    // Vérifier que le tender est en DRAFT
    if (tender.status !== TenderStatus.DRAFT) {
      throw new Error(
        "Seuls les appels d'offres en brouillon peuvent être publiés"
      );
    }

    // Créer la session de paiement Stripe
    const paymentSession = await createTenderPaymentSession({
      tenderId: tender.id,
      organizationId: tender.organizationId,
      tenderTitle: tender.title,
    });

    return {
      success: true,
      url: paymentSession.url!,
    };
  } catch (error) {
    console.error("Error publishing tender with payment:", error);
    throw error;
  }
}

/**
 * Sauvegarder un tender en brouillon (sans paiement)
 */
export async function saveDraftTender(data: {
  organizationId: string;
  title: string;
  summary?: string;
  description: string;
  currentSituation?: string;
  cfcCategory?: CFCCategory;
  cfcCodes?: string[];
  budget?: number;
  showBudget?: boolean;
  surfaceM2?: number;
  volumeM3?: number;
  constraints?: string[];
  contractDuration?: string;
  contractStartDate?: string;
  isRenewable?: boolean;
  deadline: Date;
  questionDeadline?: string;
  visibility: string;
  mode: string;
  procedure?: string;
  selectionPriorities: string[];
  city?: string;
  postalCode?: string;
  canton?: string;
  location?: string;
  address?: string;
  country?: string;
  hasLots?: boolean;
  allowPartialOffers?: boolean;
  participationConditions?: string[];
  requiredDocuments?: string[];
  requiresReferences?: boolean;
  requiresInsurance?: boolean;
  minExperience?: string;
  contractualTerms?: string[];
  images?: Array<{ url: string; name: string; type: "image" }>;
  pdfs?: Array<{ url: string; name: string; type: "pdf" }>;
  isSimpleMode?: boolean;
  lots?: Array<{
    number: number;
    title: string;
    description: string;
    budget?: string;
  }>;
  criteria?: Array<{
    name: string;
    description: string;
    weight: number;
    order: number;
  }>;
}) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a les droits
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: data.organizationId,
        userId: user.id,
        role: {
          in: ["OWNER", "ADMIN", "EDITOR"],
        },
      },
    });

    if (!membership) {
      return {
        error:
          "Vous n'avez pas les droits pour créer un appel d'offres pour cette organisation",
      };
    }

    // Dériver le marketType depuis la catégorie CFC, ou utiliser OTHER par défaut
    const marketType = data.cfcCategory
      ? getMarketTypeFromCFCCategory(data.cfcCategory)
      : "OTHER";

    // Créer le tender en mode DRAFT
    const tender = await prisma.tender.create({
      data: {
        organizationId: data.organizationId,
        title: data.title || "Brouillon sans titre",
        summary: data.summary || null,
        description: data.description || "",
        currentSituation: data.currentSituation || null,
        marketType: marketType as MarketType,
        cfcCodes: data.cfcCodes || [],
        budget: data.budget ? parseFloat(data.budget.toString()) : null,
        showBudget: data.showBudget || false,
        surfaceM2: data.surfaceM2
          ? parseFloat(data.surfaceM2.toString())
          : null,
        volumeM3: data.volumeM3 ? parseFloat(data.volumeM3.toString()) : null,
        constraints: data.constraints || [],
        contractDuration: data.contractDuration
          ? parseInt(data.contractDuration.toString())
          : null,
        contractStartDate: data.contractStartDate
          ? new Date(data.contractStartDate)
          : null,
        isRenewable: data.isRenewable || false,
        deadline: data.deadline,
        questionDeadline: data.questionDeadline
          ? new Date(data.questionDeadline)
          : null,
        visibility: data.visibility as TenderVisibility,
        mode: data.mode as TenderMode,
        procedure: (data.procedure as TenderProcedure) || "OPEN",
        selectionPriorities:
          data.selectionPriorities && data.selectionPriorities.length > 0
            ? (data.selectionPriorities as (
                | "LOWEST_PRICE"
                | "QUALITY_PRICE"
                | "FASTEST_DELIVERY"
                | "BEST_REFERENCES"
                | "ECO_FRIENDLY"
              )[])
            : ["QUALITY_PRICE"],
        city: data.city || null,
        canton: data.canton || null,
        location: data.location || null,
        address: data.address || null,
        country: data.country || "CH",
        hasLots: data.hasLots || false,
        allowPartialOffers: data.allowPartialOffers !== false,
        participationConditions: data.participationConditions || undefined,
        requiredDocuments: data.requiredDocuments || undefined,
        requiresReferences: data.requiresReferences || false,
        requiresInsurance: data.requiresInsurance || false,
        minExperience: data.minExperience || null,
        contractualTerms: data.contractualTerms || undefined,
        isSimpleMode: data.isSimpleMode !== false,
        status: TenderStatus.DRAFT,
        images: data.images || [],
        pdfs: data.pdfs || [],
      },
    });

    // Créer les lots si présents
    if (data.lots && data.lots.length > 0) {
      await prisma.tenderLot.createMany({
        data: data.lots.map((lot) => ({
          tenderId: tender.id,
          number: lot.number,
          title: lot.title,
          description: lot.description,
          budget: lot.budget ? parseFloat(lot.budget) : null,
        })),
      });
    }

    // Créer les critères si présents
    if (data.criteria && data.criteria.length > 0) {
      await prisma.tenderCriteria.createMany({
        data: data.criteria.map((c) => ({
          tenderId: tender.id,
          name: c.name,
          description: c.description || null,
          weight: c.weight,
          order: c.order,
        })),
      });
    }

    return {
      success: true,
      tenderId: tender.id,
    };
  } catch (error) {
    console.error("Error saving draft tender:", error);
    return {
      error: "Erreur lors de la sauvegarde du brouillon",
    };
  }
}

/**
 * Mettre à jour complètement un tender DRAFT (version complète avec tous les champs)
 * Utilisé par le stepper unifié en mode édition
 */
export async function updateDraftTenderComplete(data: {
  id: string;
  title?: string;
  summary?: string;
  description?: string;
  currentSituation?: string;
  cfcCategory?: CFCCategory;
  cfcCodes?: string[];
  budget?: number;
  showBudget?: boolean;
  surfaceM2?: number;
  volumeM3?: number;
  constraints?: string[];
  contractDuration?: string;
  contractStartDate?: string;
  isRenewable?: boolean;
  deadline?: Date;
  address?: string;
  city?: string;
  postalCode?: string;
  canton?: string;
  location?: string;
  country?: string;
  images?: Array<{ url: string; name: string; type: string }>;
  pdfs?: Array<{ url: string; name: string; type: string }>;
  hasLots?: boolean;
  allowPartialOffers?: boolean;
  lots?: Array<{
    number: number;
    title: string;
    description: string;
    budget?: string;
  }>;
  criteria?: Array<{
    name: string;
    description: string;
    weight: number;
    order: number;
  }>;
  questionDeadline?: string;
  participationConditions?: string[];
  requiredDocuments?: string[];
  requiresReferences?: boolean;
  requiresInsurance?: boolean;
  minExperience?: string;
  contractualTerms?: string[];
  procedure?: string;
  visibility?: string;
  mode?: string;
  selectionPriorities?: string[];
  isSimpleMode?: boolean;
}) {
  try {
    const user = await getCurrentUser();

    // Vérifier que le tender existe et est en DRAFT
    const tender = await prisma.tender.findUnique({
      where: { id: data.id },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!tender) {
      return { error: "Appel d'offres non trouvé" };
    }

    if (tender.status !== TenderStatus.DRAFT) {
      return { error: "Seuls les brouillons peuvent être modifiés" };
    }

    const membership = tender.organization.members[0];
    if (
      !membership ||
      !["OWNER", "ADMIN", "EDITOR"].includes(membership.role)
    ) {
      return {
        error: "Vous n'avez pas les droits pour modifier cet appel d'offres",
      };
    }

    // Dériver le marketType depuis la catégorie CFC si fournie
    const marketType = data.cfcCategory
      ? getMarketTypeFromCFCCategory(data.cfcCategory)
      : tender.marketType;

    // Mettre à jour le tender
    await prisma.tender.update({
      where: { id: data.id },
      data: {
        title: data.title,
        summary: data.summary,
        description: data.description,
        currentSituation: data.currentSituation,
        marketType: marketType as MarketType,
        cfcCodes: data.cfcCodes || [],
        budget: data.budget,
        showBudget: data.showBudget ?? false,
        surfaceM2: data.surfaceM2,
        volumeM3: data.volumeM3,
        constraints: data.constraints || [],
        contractDuration: data.contractDuration
          ? parseInt(data.contractDuration)
          : null,
        contractStartDate: data.contractStartDate
          ? new Date(data.contractStartDate)
          : null,
        isRenewable: data.isRenewable ?? false,
        deadline: data.deadline,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        canton: data.canton,
        location: data.location,
        country: data.country || "CH",
        images: data.images || [],
        pdfs: data.pdfs || [],
        hasLots: data.hasLots ?? false,
        allowPartialOffers: data.allowPartialOffers ?? true,
        questionDeadline: data.questionDeadline
          ? new Date(data.questionDeadline)
          : null,
        participationConditions: data.participationConditions,
        requiredDocuments: data.requiredDocuments,
        requiresReferences: data.requiresReferences ?? false,
        requiresInsurance: data.requiresInsurance ?? false,
        minExperience: data.minExperience || null,
        contractualTerms: data.contractualTerms,
        procedure: data.procedure as TenderProcedure | undefined,
        visibility: data.visibility as TenderVisibility | undefined,
        mode: data.mode as TenderMode | undefined,
        selectionPriorities: data.selectionPriorities
          ? (data.selectionPriorities as (
              | "LOWEST_PRICE"
              | "QUALITY_PRICE"
              | "FASTEST_DELIVERY"
              | "BEST_REFERENCES"
              | "ECO_FRIENDLY"
            )[])
          : undefined,
        isSimpleMode: data.isSimpleMode !== false,
      },
    });

    // Gérer les lots - supprimer et recréer
    await prisma.tenderLot.deleteMany({
      where: { tenderId: data.id },
    });

    if (data.lots && data.lots.length > 0) {
      await prisma.tenderLot.createMany({
        data: data.lots.map((lot) => ({
          tenderId: data.id,
          number: lot.number,
          title: lot.title,
          description: lot.description,
          budget: lot.budget ? parseFloat(lot.budget) : null,
        })),
      });
    }

    // Gérer les critères - supprimer et recréer
    await prisma.tenderCriteria.deleteMany({
      where: { tenderId: data.id },
    });

    if (data.criteria && data.criteria.length > 0) {
      await prisma.tenderCriteria.createMany({
        data: data.criteria.map((c) => ({
          tenderId: data.id,
          name: c.name,
          description: c.description || null,
          weight: c.weight,
          order: c.order,
        })),
      });
    }

    return {
      success: true,
      tenderId: data.id,
    };
  } catch (error) {
    console.error("Error updating draft tender:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du brouillon",
    };
  }
}
