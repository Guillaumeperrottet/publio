/**
 * Actions de lecture/query pour les offres
 * Toutes les fonctions de récupération de données sans modification
 */
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { OfferStatus } from "@prisma/client";

/**
 * Récupérer les offres d'un appel d'offres
 */
export async function getTenderOffers(tenderId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur a accès à l'appel d'offres
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      organization: {
        include: {
          members: {
            where: {
              userId: user.id,
            },
          },
        },
      },
    },
  });

  if (!tender?.organization.members.length) {
    throw new Error("Unauthorized");
  }

  const offers = await prisma.offer.findMany({
    where: {
      tenderId: tenderId,
      status: {
        in: [
          OfferStatus.SUBMITTED,
          OfferStatus.SHORTLISTED,
          OfferStatus.REJECTED,
          OfferStatus.AWARDED,
        ], // Toutes les offres soumises et traitées
      },
    },
    include: {
      organization: true,
      documents: true,
      materials: {
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          range: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  // Les offres montrent toujours l'identité du soumissionnaire
  // Seul l'émetteur du tender est anonyme (jusqu'à révélation)
  return offers;
}

/**
 * Récupérer le détail complet d'une offre avec toutes ses relations
 */
export async function getOfferDetail(offerId: string) {
  const user = await getCurrentUser();

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      organization: true,
      tender: {
        include: {
          organization: {
            include: {
              members: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
      documents: true,
      lineItems: {
        orderBy: {
          position: "asc",
        },
      },
      inclusions: {
        orderBy: {
          position: "asc",
        },
      },
      exclusions: {
        orderBy: {
          position: "asc",
        },
      },
      materials: {
        orderBy: {
          position: "asc",
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  if (!offer) {
    throw new Error("Offer not found");
  }

  // Vérifier que l'utilisateur a accès (propriétaire du tender)
  if (!offer.tender.organization.members.length) {
    throw new Error("Unauthorized");
  }

  // Les offres montrent toujours l'identité du soumissionnaire
  return offer;
}

/**
 * Récupérer les offres de l'organisation courante
 */
export async function getOrganizationOffers(organizationId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur appartient à l'organisation
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  const offers = await prisma.offer.findMany({
    where: {
      organizationId,
    },
    include: {
      tender: {
        include: {
          organization: true,
        },
      },
      documents: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return offers;
}

/**
 * Vérifier si l'utilisateur a déjà soumis une offre pour ce tender
 */
export async function hasUserSubmittedOffer(tenderId: string): Promise<{
  hasSubmitted: boolean;
  offerId?: string;
}> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { hasSubmitted: false };
    }

    // Récupérer les organisations de l'utilisateur
    const userOrganizations = await prisma.organizationMember.findMany({
      where: {
        userId: user.id,
      },
      select: {
        organizationId: true,
      },
    });

    const organizationIds = userOrganizations.map((m) => m.organizationId);

    if (organizationIds.length === 0) {
      return { hasSubmitted: false };
    }

    // Vérifier s'il existe une offre soumise
    const existingOffer = await prisma.offer.findFirst({
      where: {
        tenderId,
        organizationId: {
          in: organizationIds,
        },
        status: "SUBMITTED",
      },
      select: {
        id: true,
      },
    });

    return {
      hasSubmitted: !!existingOffer,
      offerId: existingOffer?.id,
    };
  } catch (error) {
    console.error("Error checking user offer:", error);
    return { hasSubmitted: false };
  }
}

/**
 * Compter les offres non lues pour une organisation
 */
export async function getUnreadOffersCount(
  organizationId: string
): Promise<number> {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    if (!membership) {
      return 0;
    }

    // Compter les offres non lues pour les tenders de cette organisation
    const count = await prisma.offer.count({
      where: {
        tender: {
          organizationId,
        },
        status: "SUBMITTED",
        viewedAt: null,
      },
    });

    return count;
  } catch (error) {
    console.error("Error counting unread offers:", error);
    return 0;
  }
}

/**
 * Marquer une offre comme lue
 */
export async function markOfferAsViewed(offerId: string): Promise<void> {
  try {
    const user = await getCurrentUser();

    // Récupérer l'offre avec son tender
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        tender: {
          include: {
            organization: {
              include: {
                members: {
                  where: {
                    userId: user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Vérifier que l'utilisateur a accès
    if (!offer?.tender.organization.members.length) {
      throw new Error("Unauthorized");
    }

    // Marquer comme vue si pas déjà fait
    if (!offer.viewedAt) {
      await prisma.offer.update({
        where: { id: offerId },
        data: {
          viewedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error marking offer as viewed:", error);
    throw error;
  }
}

/**
 * Récupérer les tenders avec le nombre d'offres non lues
 */
export async function getTendersWithUnreadOffers(organizationId: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    if (!membership) {
      return [];
    }

    const tenders = await prisma.tender.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            offers: {
              where: {
                status: "SUBMITTED",
              },
            },
          },
        },
        offers: {
          where: {
            status: "SUBMITTED",
            viewedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return tenders.map((tender) => ({
      id: tender.id,
      title: tender.title,
      status: tender.status,
      totalOffers: tender._count.offers,
      unreadOffers: tender.offers.length,
      deadline: tender.deadline,
      createdAt: tender.createdAt,
    }));
  } catch (error) {
    console.error("Error getting tenders with unread offers:", error);
    return [];
  }
}
