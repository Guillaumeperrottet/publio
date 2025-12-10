/**
 * Actions serveur pour le module Veille Communale
 */

"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { VeilleSubscriptionData, Canton, PublicationType } from "./types";

// ============================================
// SUBSCRIPTIONS
// ============================================

/**
 * Récupérer l'abonnement veille de l'organisation
 */
export async function getOrganizationVeilleSubscription(
  organizationId: string
) {
  try {
    const subscription = await prisma.veilleSubscription.findFirst({
      where: { organizationId },
    });

    return subscription;
  } catch (error) {
    console.error("[getOrganizationVeilleSubscription] Error:", error);
    throw new Error("Impossible de récupérer l'abonnement veille");
  }
}

/**
 * Créer ou mettre à jour un abonnement veille
 */
export async function upsertVeilleSubscription(
  organizationId: string,
  data: VeilleSubscriptionData
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Non authentifié");
    }

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      throw new Error("Non autorisé");
    }

    // Vérifier les limites du plan
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organisation introuvable");
    }

    // Récupérer le plan Stripe Veille
    const plan = organization.stripeSubscriptionPlan || "FREE";

    // Vérifier le nombre de cantons selon le plan
    const maxCantons =
      plan === "VEILLE_UNLIMITED" ? -1 : plan === "VEILLE_BASIC" ? 1 : 0;
    if (maxCantons !== -1 && data.cantons.length > maxCantons) {
      throw new Error(
        `Votre plan ${plan} est limité à ${maxCantons} canton${
          maxCantons > 1 ? "s" : ""
        }. Passez à un plan supérieur.`
      );
    }

    // Upsert l'abonnement veille
    const subscription = await prisma.veilleSubscription.upsert({
      where: {
        organizationId: organizationId,
      },
      create: {
        organizationId,
        cantons: data.cantons,
        keywords: data.keywords || [],
        emailNotifications: data.emailNotifications !== false,
        appNotifications: data.appNotifications !== false,
      },
      update: {
        cantons: data.cantons,
        keywords: data.keywords || [],
        emailNotifications: data.emailNotifications !== false,
        appNotifications: data.appNotifications !== false,
      },
    });

    revalidatePath("/dashboard/veille");
    return { success: true, subscription };
  } catch (error) {
    console.error("[upsertVeilleSubscription] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde",
    };
  }
}

/**
 * Supprimer un abonnement veille
 */
export async function deleteVeilleSubscription(organizationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Non authentifié");
    }

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      throw new Error("Non autorisé");
    }

    await prisma.veilleSubscription.delete({
      where: {
        organizationId: organizationId,
      },
    });

    revalidatePath("/dashboard/veille");
    return { success: true };
  } catch (error) {
    console.error("[deleteVeilleSubscription] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression",
    };
  }
}

// ============================================
// PUBLICATIONS
// ============================================

/**
 * Récupérer les publications pour les cantons suivis par l'organisation
 */
export async function getOrganizationVeillePublications(
  organizationId: string,
  filters?: {
    commune?: string;
    canton?: Canton;
    type?: PublicationType;
    from?: Date;
    to?: Date;
  }
) {
  try {
    // Récupérer l'abonnement veille
    const subscription = await prisma.veilleSubscription.findFirst({
      where: { organizationId },
    });

    if (!subscription) {
      return [];
    }

    // Construire les filtres
    const where: {
      commune?: string;
      canton?: { in: string[] };
      type?: string;
      publishedAt?: { gte?: Date; lte?: Date };
    } = {
      canton: { in: subscription.cantons },
    };

    if (filters?.commune) {
      where.commune = filters.commune;
    }
    if (filters?.canton) {
      where.canton = { in: [filters.canton] };
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.from || filters?.to) {
      where.publishedAt = {};
      if (filters.from) {
        where.publishedAt.gte = filters.from;
      }
      if (filters.to) {
        where.publishedAt.lte = filters.to;
      }
    } else {
      // Par défaut : 30 derniers jours seulement
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.publishedAt = { gte: thirtyDaysAgo };
    }

    const publications = await prisma.veillePublication.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 200, // Augmenter la limite à 200
    });

    return publications;
  } catch (error) {
    console.error("[getOrganizationVeillePublications] Error:", error);
    throw new Error("Impossible de récupérer les publications");
  }
}

/**
 * Compter les nouvelles publications depuis la dernière visite
 */
export async function countNewVeillePublications(
  organizationId: string,
  since: Date
) {
  try {
    const subscription = await prisma.veilleSubscription.findFirst({
      where: { organizationId },
    });

    if (!subscription) {
      return 0;
    }

    const count = await prisma.veillePublication.count({
      where: {
        canton: { in: subscription.cantons },
        publishedAt: { gte: since },
      },
    });

    return count;
  } catch (error) {
    console.error("[countNewVeillePublications] Error:", error);
    return 0;
  }
}

// ============================================
// UTILS
// ============================================

/**
 * Obtenir le nombre maximum de communes selon le plan
 */
function getMaxCommunesByPlan(plan: string): number {
  switch (plan) {
    case "FREE":
      return 0; // Pas de veille sur le plan gratuit
    case "VEILLE_BASIC":
      return 5; // 5 communes
    case "VEILLE_UNLIMITED":
      return -1; // Illimité
    default:
      return 0;
  }
}

/**
 * Vérifier si l'organisation peut activer la veille
 */
export async function canActivateVeille(organizationId: string): Promise<{
  canActivate: boolean;
  currentPlan: string;
  maxCantons: number;
}> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return {
        canActivate: false,
        currentPlan: "FREE",
        maxCantons: 0,
      };
    }

    // Vérifier le plan Stripe Veille
    const plan = organization.stripeSubscriptionPlan || "FREE";
    const maxCantons =
      plan === "VEILLE_UNLIMITED" ? 999 : plan === "VEILLE_BASIC" ? 1 : 0;

    return {
      canActivate: maxCantons !== 0,
      currentPlan: plan,
      maxCantons,
    };
  } catch (error) {
    console.error("[canActivateVeille] Error:", error);
    return {
      canActivate: false,
      currentPlan: "FREE",
      maxCantons: 0,
    };
  }
}
