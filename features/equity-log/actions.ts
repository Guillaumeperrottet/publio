// Actions pour le journal d'équité
"use server";

import { prisma } from "@/lib/db/prisma";
import { EquityLogAction, Prisma } from "@prisma/client";

/**
 * Créer une entrée dans le journal d'équité
 */
export async function createEquityLog(params: {
  tenderId: string;
  userId: string;
  action: EquityLogAction;
  description: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.equityLog.create({
      data: {
        tenderId: params.tenderId,
        userId: params.userId,
        action: params.action,
        description: params.description,
        metadata: params.metadata,
      },
    });
  } catch (error) {
    console.error("Error creating equity log:", error);
    // Ne pas bloquer l'action principale si le log échoue
  }
}

/**
 * Récupérer les logs d'équité d'un appel d'offres
 */
export async function getTenderEquityLogs(tenderId: string) {
  try {
    const logs = await prisma.equityLog.findMany({
      where: { tenderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { logs };
  } catch (error) {
    console.error("Error fetching equity logs:", error);
    return { error: "Impossible de récupérer les logs" };
  }
}

/**
 * Récupérer les appels d'offres récents avec logs (pour menu utilisateur)
 */
export async function getRecentTendersWithLogs(
  organizationId: string,
  limit: number = 10
) {
  try {
    const tenders = await prisma.tender.findMany({
      where: {
        organizationId,
        equityLogs: {
          some: {}, // Uniquement les tenders avec au moins un log
        },
      },
      include: {
        _count: {
          select: {
            equityLogs: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return { tenders };
  } catch (error) {
    console.error("Error fetching recent tenders with logs:", error);
    return { error: "Impossible de récupérer les appels d'offres" };
  }
}
