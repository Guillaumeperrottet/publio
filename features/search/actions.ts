"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

/**
 * Créer une recherche sauvegardée
 */
export async function createSavedSearch(params: {
  name: string;
  criteria: Prisma.InputJsonValue;
  alertsEnabled?: boolean;
}) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        name: params.name,
        criteria: params.criteria,
        alertsEnabled: params.alertsEnabled || false,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/saved-searches");

    return { success: true, data: savedSearch };
  } catch (error) {
    console.error("Error creating saved search:", error);
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

/**
 * Récupérer toutes les recherches sauvegardées de l'utilisateur
 */
export async function getUserSavedSearches() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return [];
    }

    const searches = await prisma.savedSearch.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return searches;
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return [];
  }
}

/**
 * Récupérer une recherche sauvegardée par ID
 */
export async function getSavedSearchById(searchId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const search = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId: user.id,
      },
    });

    return search;
  } catch (error) {
    console.error("Error fetching saved search:", error);
    return null;
  }
}

/**
 * Mettre à jour une recherche sauvegardée
 */
export async function updateSavedSearch(
  searchId: string,
  params: {
    name?: string;
    criteria?: Prisma.InputJsonValue;
    alertsEnabled?: boolean;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    // Vérifier que la recherche appartient à l'utilisateur
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId: user.id,
      },
    });

    if (!existingSearch) {
      return { success: false, error: "Recherche non trouvée" };
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        name: params.name,
        criteria: params.criteria,
        alertsEnabled: params.alertsEnabled,
      },
    });

    revalidatePath("/dashboard/saved-searches");

    return { success: true, data: updatedSearch };
  } catch (error) {
    console.error("Error updating saved search:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Supprimer une recherche sauvegardée
 */
export async function deleteSavedSearch(searchId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    // Vérifier que la recherche appartient à l'utilisateur
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId: user.id,
      },
    });

    if (!existingSearch) {
      return { success: false, error: "Recherche non trouvée" };
    }

    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    revalidatePath("/dashboard/saved-searches");

    return { success: true };
  } catch (error) {
    console.error("Error deleting saved search:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

/**
 * Basculer les alertes pour une recherche
 */
export async function toggleSearchAlerts(searchId: string, enabled: boolean) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const search = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId: user.id,
      },
    });

    if (!search) {
      return { success: false, error: "Recherche non trouvée" };
    }

    const updated = await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        alertsEnabled: enabled,
      },
    });

    revalidatePath("/dashboard/saved-searches");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling alerts:", error);
    return { success: false, error: "Erreur lors de la modification" };
  }
}
