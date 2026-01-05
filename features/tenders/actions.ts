// Actions pour la gestion des appels d'offres
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  TenderVisibility,
  TenderMode,
  TenderStatus,
  MarketType,
  TenderProcedure,
  SelectionPriority,
  OfferStatus,
} from "@prisma/client";
import {
  sendTenderPublishedEmail,
  sendDeadlinePassedEmail,
  sendTenderAwardedWinnerEmail,
  sendTenderAwardedLosersEmail,
  sendTenderAwardedEmitterEmail,
  sendTenderCancelledEmail,
} from "@/lib/email/tender-emails";
import { createEquityLog } from "@/features/equity-log/actions";
import {
  createOrganizationNotification,
  notifyMatchingSavedSearches,
} from "@/features/notifications/actions";
import { toastError, handleError } from "@/lib/utils/toast-messages";
import { toast } from "sonner";

/**
 * Créer un nouvel appel d'offres
 */
export async function createTender(data: {
  organizationId: string;
  title: string;
  description: string;
  budget?: number;
  deadline: Date;
  visibility: TenderVisibility;
  mode: TenderMode;
  marketType: MarketType;
  city?: string;
  canton?: string;
  location?: string;
}) {
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
    throw new Error("Unauthorized");
  }

  const tender = await prisma.tender.create({
    data: {
      ...data,
      status: TenderStatus.DRAFT,
    },
  });

  // Log de création
  await createEquityLog({
    tenderId: tender.id,
    userId: user.id,
    action: "TENDER_CREATED",
    description: `Appel d'offres créé : "${tender.title}"`,
    metadata: {
      marketType: tender.marketType,
      visibility: tender.visibility,
      mode: tender.mode,
    },
  });

  return tender;
}

/**
 * Récupérer les appels d'offres publics
 */
export async function getPublicTenders(filters?: {
  search?: string;
  canton?: string;
  city?: string;
  marketType?: MarketType;
  budgetMin?: number;
  budgetMax?: number;
  mode?: TenderMode;
  procedure?: TenderProcedure;
  selectionPriority?: SelectionPriority;
  deadlineFrom?: string;
  deadlineTo?: string;
  surfaceMin?: number;
  surfaceMax?: number;
  isRenewable?: boolean;
  cfcCodes?: string[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    visibility: TenderVisibility.PUBLIC,
    status: TenderStatus.PUBLISHED,
    deadline: {
      gte: new Date(), // Ne pas afficher les tenders expirés
    },
  };

  // Filtres de recherche
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.canton) {
    where.canton = filters.canton;
  }

  if (filters?.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }

  if (filters?.marketType) {
    where.marketType = filters.marketType;
  }

  if (filters?.mode) {
    where.mode = filters.mode;
  }

  if (filters?.procedure) {
    where.procedure = filters.procedure;
  }

  if (filters?.selectionPriority) {
    where.selectionPriority = filters.selectionPriority;
  }

  if (filters?.isRenewable !== undefined) {
    where.isRenewable = filters.isRenewable;
  }

  // Filtre par codes CFC - matcher au moins un code
  if (filters?.cfcCodes && filters.cfcCodes.length > 0) {
    where.cfcCodes = {
      hasSome: filters.cfcCodes,
    };
  }

  // Filtres de budget
  if (filters?.budgetMin || filters?.budgetMax) {
    where.budget = {};
    if (filters.budgetMin) {
      where.budget.gte = filters.budgetMin;
    }
    if (filters.budgetMax) {
      where.budget.lte = filters.budgetMax;
    }
  }

  // Filtres de surface
  if (filters?.surfaceMin || filters?.surfaceMax) {
    where.surfaceM2 = {};
    if (filters.surfaceMin) {
      where.surfaceM2.gte = filters.surfaceMin;
    }
    if (filters.surfaceMax) {
      where.surfaceM2.lte = filters.surfaceMax;
    }
  }

  // Filtres de date limite
  if (filters?.deadlineFrom || filters?.deadlineTo) {
    where.deadline = {};
    if (filters.deadlineFrom) {
      where.deadline.gte = new Date(filters.deadlineFrom);
    }
    if (filters.deadlineTo) {
      where.deadline.lte = new Date(filters.deadlineTo);
    }
  }

  const tenders = await prisma.tender.findMany({
    where,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return tenders;
}

/**
 * Récupérer un appel d'offres par son ID
 */
export async function getTenderById(id: string) {
  const tender = await prisma.tender.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      },
      documents: true,
      lots: {
        orderBy: {
          number: "asc",
        },
      },
      criteria: {
        orderBy: {
          order: "asc",
        },
      },
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });

  return tender;
}

/**
 * Publier un appel d'offres
 */
export async function publishTender(tenderId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur a les droits
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      organization: {
        include: {
          members: {
            where: {
              userId: user.id,
              role: {
                in: ["OWNER", "ADMIN", "EDITOR"],
              },
            },
          },
        },
      },
    },
  });

  if (!tender?.organization.members.length) {
    throw new Error("Unauthorized");
  }

  const updatedTender = await prisma.tender.update({
    where: { id: tenderId },
    data: {
      status: TenderStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: {
      organization: {
        include: {
          members: {
            where: {
              role: {
                in: ["OWNER", "ADMIN"],
              },
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  // Envoyer email de confirmation aux admins/owners
  const adminEmails = updatedTender.organization.members
    .map((m) => m.user.email)
    .filter((email): email is string => !!email);

  if (adminEmails.length > 0) {
    try {
      await sendTenderPublishedEmail({
        to: adminEmails,
        tenderTitle: updatedTender.title,
        tenderId: updatedTender.id,
        deadline: updatedTender.deadline,
        budget: updatedTender.budget || undefined,
      });
    } catch (error) {
      console.error("Error sending publication email:", error);
      // Ne pas bloquer la publication si l'email échoue
    }
  }

  // Log de publication
  await createEquityLog({
    tenderId: updatedTender.id,
    userId: user.id,
    action: "TENDER_PUBLISHED",
    description: `Appel d'offres publié : "${updatedTender.title}"`,
    metadata: {
      publishedAt: updatedTender.publishedAt,
      deadline: updatedTender.deadline,
    },
  });

  // Notify users with matching saved searches
  try {
    await notifyMatchingSavedSearches(updatedTender.id);
  } catch (error) {
    console.error("Error notifying saved searches:", error);
    // Don't block publication if notification fails
  }

  return updatedTender;
}

/**
 * Récupérer les appels d'offres d'une organisation
 */
export async function getOrganizationTenders(organizationId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur fait partie de l'organisation
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
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
              status: {
                not: "DRAFT",
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tenders;
}

/**
 * Mettre à jour un tender en brouillon
 */
export async function updateDraftTender(data: {
  id: string;
  title?: string;
  summary?: string;
  description?: string;
  marketType?: string;
  budget?: number;
  showBudget?: boolean;
  contractDuration?: string;
  contractStartDate?: string;
  isRenewable?: boolean;
  deadline?: Date;
  address?: string;
  city?: string;
  canton?: string;
  country?: string;
  location?: string;
  isSimpleMode?: boolean;
  hasLots?: boolean;
  lots?: Array<{
    number: number;
    title: string;
    description: string;
    budget?: string;
  }>;
  criteria?: Array<{
    id?: string;
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
  allowPartialOffers?: boolean;
  visibility?: string;
  mode?: string;
}) {
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
    throw new Error("Tender not found");
  }

  if (tender.status !== TenderStatus.DRAFT) {
    throw new Error("Only draft tenders can be edited");
  }

  const membership = tender.organization.members[0];
  if (!membership || !["OWNER", "ADMIN", "EDITOR"].includes(membership.role)) {
    throw new Error("Unauthorized");
  }

  // Mettre à jour le tender
  const updatedTender = await prisma.tender.update({
    where: { id: data.id },
    data: {
      title: data.title,
      summary: data.summary,
      description: data.description,
      marketType: data.marketType as MarketType,
      budget: data.budget,
      showBudget: data.showBudget,
      contractDuration: data.contractDuration
        ? parseInt(data.contractDuration)
        : null,
      contractStartDate: data.contractStartDate
        ? new Date(data.contractStartDate)
        : null,
      isRenewable: data.isRenewable,
      deadline: data.deadline,
      address: data.address,
      city: data.city,
      canton: data.canton,
      country: data.country,
      location: data.location,
      isSimpleMode: data.isSimpleMode,
      hasLots: data.hasLots,
      allowPartialOffers: data.allowPartialOffers,
      questionDeadline: data.questionDeadline
        ? new Date(data.questionDeadline)
        : null,
      participationConditions: data.participationConditions,
      requiredDocuments: data.requiredDocuments,
      requiresReferences: data.requiresReferences,
      requiresInsurance: data.requiresInsurance,
      minExperience: data.minExperience || null,
      contractualTerms: data.contractualTerms,
      procedure: data.procedure as TenderProcedure,
      visibility: data.visibility as TenderVisibility,
      mode: data.mode as TenderMode,
    },
  });

  // Gérer les lots - toujours supprimer et recréer
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

  // Gérer les critères - toujours supprimer et recréer
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

  return updatedTender;
}

/**
 * Supprimer un appel d'offres en brouillon
 */
export async function deleteDraftTender(tenderId: string) {
  const user = await getCurrentUser();

  // Récupérer le tender pour vérifier les droits
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

  if (!tender) {
    throw new Error("Tender not found");
  }

  // Vérifier que l'utilisateur a les droits
  const membership = tender.organization.members[0];
  if (!membership || !["OWNER", "ADMIN", "EDITOR"].includes(membership.role)) {
    throw new Error("Unauthorized");
  }

  // Vérifier que le tender est bien en brouillon
  if (tender.status !== TenderStatus.DRAFT) {
    throw new Error("Only draft tenders can be deleted");
  }

  // Supprimer le tender (cascade supprimera les documents, lots, critères)
  await prisma.tender.delete({
    where: { id: tenderId },
  });

  return { success: true };
}

// ============================================
// GESTION DU CYCLE DE VIE DES TENDERS
// ============================================

/**
 * Clôturer un appel d'offres
 * L'émetteur ferme manuellement l'appel d'offres après la deadline
 */
export async function closeTender(tenderId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer le tender
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
                role: {
                  in: ["OWNER", "ADMIN", "EDITOR"],
                },
              },
            },
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    if (!tender) {
      toast.error("Appel d'offres introuvable", {
        description: "Cet appel d'offres n'existe pas ou a été supprimé.",
      });
      return { error: "Appel d'offres introuvable" };
    }

    // Vérifier que l'utilisateur a les droits
    if (!tender.organization.members.length) {
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour clôturer cet appel d'offres",
      };
    }

    // Vérifier que le tender est publié
    if (tender.status !== TenderStatus.PUBLISHED) {
      toast.error("Action impossible", {
        description: "Seuls les appels d'offres publiés peuvent être clôturés.",
      });
      return {
        error: "Seuls les appels d'offres publiés peuvent être clôturés",
      };
    }

    // Optionnel : vérifier que la deadline est passée
    // (mais on permet de clôturer avant si besoin)

    // Mettre à jour le tender et révéler l'identité si anonyme
    const updateData: {
      status: TenderStatus;
      identityRevealed?: boolean;
      revealedAt?: Date;
    } = {
      status: TenderStatus.CLOSED,
    };

    // Si le tender est en mode anonyme, révéler l'identité après clôture
    if (tender.mode === TenderMode.ANONYMOUS && !tender.identityRevealed) {
      updateData.identityRevealed = true;
      updateData.revealedAt = new Date();
    }

    const updatedTender = await prisma.tender.update({
      where: { id: tenderId },
      data: updateData,
      include: {
        organization: {
          include: {
            members: {
              where: {
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Envoyer email de notification si des offres ont été reçues
    if (tender._count.offers > 0) {
      const adminEmails = updatedTender.organization.members
        .map((m) => m.user.email)
        .filter((email): email is string => !!email);

      if (adminEmails.length > 0) {
        try {
          await sendDeadlinePassedEmail({
            to: adminEmails,
            tenderTitle: updatedTender.title,
            tenderId: updatedTender.id,
            offersCount: tender._count.offers,
          });
        } catch (error) {
          console.error("Error sending closure email:", error);
          // Ne pas bloquer la clôture si l'email échoue
        }
      }
    }

    // Log de clôture
    await createEquityLog({
      tenderId: updatedTender.id,
      userId: user.id,
      action: "TENDER_CLOSED",
      description: `Appel d'offres clôturé avec ${tender._count.offers} offre(s) reçue(s)`,
      metadata: {
        offersCount: tender._count.offers,
        identityRevealed: updatedTender.identityRevealed,
      },
    });

    toast.success("Appel d'offres clôturé", {
      description: `L'appel d'offres "${tender.title}" a été clôturé avec ${tender._count.offers} offre(s) reçue(s).`,
    });

    return { success: true, tender: updatedTender };
  } catch (error) {
    handleError(error, "closeTender");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Attribuer le marché à une offre gagnante
 */
export async function awardTender(tenderId: string, winningOfferId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer le tender avec l'offre gagnante
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
            },
          },
        },
        offers: {
          where: {
            id: winningOfferId,
          },
          include: {
            organization: true,
          },
        },
      },
    });

    if (!tender) {
      toast.error("Appel d'offres introuvable", {
        description: "Cet appel d'offres n'existe pas ou a été supprimé.",
      });
      return { error: "Appel d'offres introuvable" };
    }

    // Vérifier que l'utilisateur a les droits (OWNER ou ADMIN seulement)
    if (!tender.organization.members.length) {
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour attribuer cet appel d'offres",
      };
    }

    // Vérifier que le tender est clôturé ou publié
    if (
      tender.status !== TenderStatus.CLOSED &&
      tender.status !== TenderStatus.PUBLISHED
    ) {
      toast.error("Action impossible", {
        description:
          "L'appel d'offres doit être clôturé avant d'être attribué.",
      });
      return {
        error: "L'appel d'offres doit être clôturé avant d'être attribué",
      };
    }

    // Vérifier que l'offre existe
    const winningOffer = tender.offers[0];
    if (!winningOffer) {
      toast.error("Offre gagnante introuvable", {
        description: "L'offre sélectionnée n'existe pas ou a été supprimée.",
      });
      return { error: "Offre gagnante introuvable" };
    }

    // Vérifier que l'offre est soumise ou pré-sélectionnée
    if (
      winningOffer.status !== "SUBMITTED" &&
      winningOffer.status !== "SHORTLISTED"
    ) {
      toast.error("Action impossible", {
        description:
          "L'offre doit être soumise ou pré-sélectionnée pour être attribuée.",
      });
      return {
        error:
          "L'offre doit être soumise ou pré-sélectionnée pour être attribuée",
      };
    }

    // Transaction : mettre à jour tender + offre gagnante + rejeter les autres
    await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le tender et révéler l'identité si anonyme
      const tenderUpdateData: {
        status: TenderStatus;
        identityRevealed?: boolean;
        revealedAt?: Date;
      } = {
        status: TenderStatus.AWARDED,
      };

      // Si le tender est en mode anonyme, révéler l'identité après attribution
      if (tender.mode === TenderMode.ANONYMOUS && !tender.identityRevealed) {
        tenderUpdateData.identityRevealed = true;
        tenderUpdateData.revealedAt = new Date();
      }

      await tx.tender.update({
        where: { id: tenderId },
        data: tenderUpdateData,
      });

      // 2. Marquer l'offre gagnante comme AWARDED
      await tx.offer.update({
        where: { id: winningOfferId },
        data: {
          status: OfferStatus.AWARDED,
        },
      });

      // 3. Rejeter automatiquement toutes les autres offres (SUBMITTED + SHORTLISTED)
      await tx.offer.updateMany({
        where: {
          tenderId,
          id: {
            not: winningOfferId,
          },
          status: {
            in: ["SUBMITTED", "SHORTLISTED"],
          },
        },
        data: {
          status: OfferStatus.REJECTED,
        },
      });
    });

    // Notification in-app au gagnant
    try {
      await createOrganizationNotification(
        winningOffer.organizationId,
        user.id,
        {
          type: "TENDER_AWARDED",
          title: "Marché attribué",
          message: `Félicitations ! Le marché ${tender.title} vous a été attribué`,
          metadata: {
            tenderId: tender.id,
            offerId: winningOffer.id,
            tenderTitle: tender.title,
          },
        }
      );
    } catch (error) {
      console.error("Error sending tender awarded notification:", error);
    }

    // Récupérer les informations complètes pour les emails
    const finalTender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
              include: {
                user: true,
              },
            },
          },
        },
        offers: {
          include: {
            organization: {
              include: {
                members: {
                  where: {
                    role: {
                      in: ["OWNER", "ADMIN"],
                    },
                  },
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (finalTender) {
      // Email au gagnant avec les coordonnées de l'émetteur
      const winner = finalTender.offers.find((o) => o.id === winningOfferId);
      if (winner) {
        const winnerEmails = winner.organization.members
          .map((m) => m.user.email)
          .filter((email): email is string => !!email);

        if (winnerEmails.length > 0) {
          try {
            await sendTenderAwardedWinnerEmail({
              to: winnerEmails,
              tenderTitle: finalTender.title,
              tenderId: finalTender.id,
              offerPrice: winner.price,
              offerCurrency: winner.currency,
              organizationName: finalTender.organization.name,
              organizationEmail: finalTender.organization.email || undefined,
              organizationPhone: finalTender.organization.phone || undefined,
              organizationAddress:
                finalTender.organization.address || undefined,
              organizationCity: finalTender.organization.city || undefined,
              organizationCanton: finalTender.organization.canton || undefined,
            });
          } catch (error) {
            console.error("Error sending winner email:", error);
          }
        }
      }

      // Email à l'émetteur avec les coordonnées du gagnant
      if (winner) {
        const emitterEmails = finalTender.organization.members
          .filter((m) => m.role === "OWNER" || m.role === "ADMIN")
          .map((m) => m.user.email)
          .filter((email): email is string => !!email);

        if (emitterEmails.length > 0) {
          try {
            await sendTenderAwardedEmitterEmail({
              to: emitterEmails,
              tenderTitle: finalTender.title,
              tenderId: finalTender.id,
              offerPrice: winner.price,
              offerCurrency: winner.currency,
              winnerOrganizationName: winner.organization.name,
              winnerEmail: winner.organization.email || undefined,
              winnerPhone: winner.organization.phone || undefined,
              winnerCity: winner.organization.city || undefined,
              winnerCanton: winner.organization.canton || undefined,
            });
          } catch (error) {
            console.error("Error sending emitter email:", error);
          }
        }
      }

      // Emails aux perdants
      const losers = finalTender.offers.filter(
        (o) => o.id !== winningOfferId && o.status === "REJECTED"
      );

      for (const loser of losers) {
        const loserEmails = loser.organization.members
          .map((m) => m.user.email)
          .filter((email): email is string => !!email);

        if (loserEmails.length > 0) {
          try {
            await sendTenderAwardedLosersEmail({
              to: loserEmails,
              tenderTitle: finalTender.title,
            });
          } catch (error) {
            console.error("Error sending loser email:", error);
          }
        }
      }
    }

    // Log d'attribution
    const winner = finalTender?.offers.find((o) => o.id === winningOfferId);
    if (winner) {
      await createEquityLog({
        tenderId,
        userId: user.id,
        action: "TENDER_AWARDED",
        description: `Marché attribué à "${
          winner.organization.name
        }" pour ${new Intl.NumberFormat("fr-CH", {
          style: "currency",
          currency: winner.currency,
        }).format(winner.price)}`,
        metadata: {
          winnerId: winningOfferId,
          winnerOrganization: winner.organization.name,
          price: winner.price,
          currency: winner.currency,
        },
      });

      // Log des offres rejetées (groupé)
      const losersCount =
        finalTender?.offers.filter((o) => o.status === "REJECTED").length || 0;
      if (losersCount > 0 && finalTender) {
        await createEquityLog({
          tenderId,
          userId: user.id,
          action: "OFFER_REJECTED",
          description: `${losersCount} ${
            losersCount === 1 ? "offre rejetée" : "offres rejetées"
          } automatiquement`,
          metadata: {
            rejectedCount: losersCount,
            winnerId: winningOfferId,
          },
        });
      }
    }

    toast.success("Marché attribué", {
      description: `Le marché "${tender.title}" a été attribué avec succès.`,
    });

    return { success: true };
  } catch (error) {
    handleError(error, "awardTender");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Révéler manuellement l'identité de l'organisation émettrice (mode anonyme)
 * Accessible uniquement aux OWNER et ADMIN après la deadline
 */
export async function revealTenderIdentity(tenderId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer le tender
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
            },
          },
        },
      },
    });

    if (!tender) {
      toast.error("Appel d'offres introuvable", {
        description: "Cet appel d'offres n'existe pas ou a été supprimé.",
      });
      return { error: "Appel d'offres introuvable" };
    }

    // Vérifier que l'utilisateur a les droits
    if (!tender.organization.members.length) {
      toastError.unauthorized();
      return {
        error:
          "Vous n'avez pas les droits pour révéler l'identité de cet appel d'offres",
      };
    }

    // Vérifier que le tender est en mode anonyme
    if (tender.mode !== TenderMode.ANONYMOUS) {
      toast.error("Action impossible", {
        description: "Cet appel d'offres n'est pas en mode anonyme.",
      });
      return {
        error: "Cet appel d'offres n'est pas en mode anonyme",
      };
    }

    // Vérifier que l'identité n'a pas déjà été révélée
    if (tender.identityRevealed) {
      toast.error("Déjà révélée", {
        description: "L'identité a déjà été révélée pour cet appel d'offres.",
      });
      return {
        error: "L'identité a déjà été révélée",
      };
    }

    // Vérifier que la deadline est passée
    if (new Date() < tender.deadline) {
      return {
        error:
          "L'identité ne peut être révélée qu'après la deadline de l'appel d'offres",
      };
    }

    // Révéler l'identité
    const updatedTender = await prisma.tender.update({
      where: { id: tenderId },
      data: {
        identityRevealed: true,
        revealedAt: new Date(),
      },
    });

    return { success: true, tender: updatedTender };
  } catch (error) {
    console.error("Error revealing tender identity:", error);
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Annuler un appel d'offres
 */
export async function cancelTender(tenderId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer le tender
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
            },
          },
        },
      },
    });

    if (!tender) {
      toast.error("Appel d'offres introuvable", {
        description: "Cet appel d'offres n'existe pas ou a été supprimé.",
      });
      return { error: "Appel d'offres introuvable" };
    }

    // Vérifier que l'utilisateur a les droits (OWNER ou ADMIN seulement)
    if (!tender.organization.members.length) {
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour annuler cet appel d'offres",
      };
    }

    // Ne peut pas annuler un tender déjà attribué
    if (tender.status === TenderStatus.AWARDED) {
      toast.error("Action impossible", {
        description: "Impossible d'annuler un appel d'offres déjà attribué.",
      });
      return {
        error: "Impossible d'annuler un appel d'offres déjà attribué",
      };
    }

    // Mettre à jour le tender
    const updatedTender = await prisma.tender.update({
      where: { id: tenderId },
      data: {
        status: TenderStatus.CANCELLED,
      },
    });

    // Récupérer toutes les offres soumises pour cet appel d'offres
    const submittedOffers = await prisma.offer.findMany({
      where: {
        tenderId: tenderId,
        status: {
          in: [
            OfferStatus.SUBMITTED,
            OfferStatus.SHORTLISTED,
            OfferStatus.ACCEPTED,
          ],
        },
      },
      include: {
        organization: {
          select: {
            email: true,
            members: {
              select: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Envoyer email d'annulation à tous les soumissionnaires
    for (const offer of submittedOffers) {
      try {
        // Récupérer les emails des membres de l'organisation
        const memberEmails = offer.organization.members.map(
          (m) => m.user.email
        );
        const recipientEmail = offer.organization.email || memberEmails[0];

        if (recipientEmail) {
          await sendTenderCancelledEmail({
            to: recipientEmail,
            tenderTitle: tender.title,
            tenderId: tender.id,
            organizationName: tender.organization.name,
          });
        }
      } catch (emailError) {
        console.error(
          `Error sending cancellation email for offer ${offer.id}:`,
          emailError
        );
        // Ne pas bloquer l'action si un email échoue
      }
    }

    return { success: true, tender: updatedTender };
  } catch (error) {
    console.error("Error cancelling tender:", error);
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
