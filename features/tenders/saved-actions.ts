"use server";

import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Sauvegarder un appel d'offres
 */
export async function saveTender(tenderId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: "Non authentifié" };
    }

    // Vérifier que le tender existe
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
    });

    if (!tender) {
      return { error: "Appel d'offres introuvable" };
    }

    // Créer la sauvegarde (unique constraint gère les doublons)
    await prisma.savedTender.create({
      data: {
        userId: session.user.id,
        tenderId,
      },
    });

    revalidatePath("/tenders");
    revalidatePath("/dashboard/saved-tenders");

    return { success: true };
  } catch (error) {
    console.error("Error saving tender:", error);

    // Si c'est une erreur de contrainte unique, c'est déjà sauvegardé
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Cet appel d'offres est déjà sauvegardé" };
    }

    return { error: "Erreur lors de la sauvegarde" };
  }
}

/**
 * Retirer un appel d'offres des sauvegardes
 */
export async function unsaveTender(tenderId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: "Non authentifié" };
    }

    // Supprimer la sauvegarde
    await prisma.savedTender.deleteMany({
      where: {
        userId: session.user.id,
        tenderId,
      },
    });

    revalidatePath("/tenders");
    revalidatePath("/dashboard/saved-tenders");

    return { success: true };
  } catch (error) {
    console.error("Error unsaving tender:", error);
    return { error: "Erreur lors de la suppression" };
  }
}

/**
 * Vérifier si un tender est sauvegardé par l'utilisateur
 */
export async function isTenderSaved(tenderId: string): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return false;
    }

    const saved = await prisma.savedTender.findUnique({
      where: {
        userId_tenderId: {
          userId: session.user.id,
          tenderId,
        },
      },
    });

    return !!saved;
  } catch (error) {
    console.error("Error checking if tender is saved:", error);
    return false;
  }
}

/**
 * Récupérer tous les tenders sauvegardés par l'utilisateur
 */
export async function getSavedTenders() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: "Non authentifié" };
    }

    const savedTenders = await prisma.savedTender.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tender: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                logo: true,
                type: true,
                city: true,
                canton: true,
              },
            },
            _count: {
              select: {
                offers: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      savedTenders: savedTenders.map((st) => ({
        ...st.tender,
        savedAt: st.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error getting saved tenders:", error);
    return { error: "Erreur lors de la récupération" };
  }
}

/**
 * Récupérer les IDs des tenders sauvegardés par l'utilisateur
 */
export async function getSavedTenderIds(): Promise<string[]> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return [];
    }

    const savedTenders = await prisma.savedTender.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        tenderId: true,
      },
    });

    return savedTenders.map((st) => st.tenderId);
  } catch (error) {
    console.error("Error getting saved tender IDs:", error);
    return [];
  }
}
