/**
 * Actions pour la gestion des commentaires sur les offres
 */
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createOrganizationNotification } from "@/features/notifications/actions";
import { toastError, handleError } from "@/lib/utils/toast-messages";
import { toast } from "sonner";

/**
 * Ajouter un commentaire sur une offre
 * Accessible à tous les membres de l'organisation émettrice
 */
export async function addOfferComment(offerId: string, content: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a accès à l'offre
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
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

    if (!offer) {
      toast.error("Offre introuvable", {
        description: "Cette offre n'existe pas ou a été supprimée.",
      });
      return { error: "Offre introuvable" };
    }

    if (!offer.tender.organization.members.length) {
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour commenter cette offre",
      };
    }

    // Créer le commentaire
    const comment = await prisma.offerComment.create({
      data: {
        offerId,
        content,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Envoyer une notification aux autres membres de l'équipe
    await createOrganizationNotification(
      offer.tender.organizationId,
      user.id, // Exclure l'auteur du commentaire
      {
        type: "COMMENT_ADDED",
        title: "Nouveau commentaire",
        message: `${user.name || user.email} a commenté l'offre de ${
          offer.organization.name
        }`,
        metadata: {
          offerId: offer.id,
          tenderId: offer.tenderId,
          commentId: comment.id,
          organizationName: offer.organization.name,
        },
      }
    );

    toast.success("Commentaire ajouté", {
      description: "Votre commentaire a été ajouté avec succès.",
    });

    return { success: true, comment };
  } catch (error) {
    handleError(error, "addOfferComment");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Récupérer tous les commentaires d'une offre
 */
export async function getOfferComments(offerId: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a accès à l'offre
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

    if (!offer?.tender.organization.members.length) {
      throw new Error("Unauthorized");
    }

    // Récupérer les commentaires
    const comments = await prisma.offerComment.findMany({
      where: { offerId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

/**
 * Supprimer un commentaire
 * Seul l'auteur peut supprimer son propre commentaire
 */
export async function deleteOfferComment(commentId: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que le commentaire existe et appartient à l'utilisateur
    const comment = await prisma.offerComment.findUnique({
      where: { id: commentId },
      include: {
        offer: {
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
        },
      },
    });

    if (!comment) {
      toast.error("Commentaire introuvable", {
        description: "Ce commentaire n'existe pas ou a été supprimé.",
      });
      return { error: "Commentaire introuvable" };
    }

    // Vérifier que l'utilisateur est membre de l'organisation
    if (!comment.offer.tender.organization.members.length) {
      toastError.unauthorized();
      return { error: "Non autorisé" };
    }

    // Vérifier que l'utilisateur est l'auteur du commentaire
    if (comment.authorId !== user.id) {
      toast.error("Action non autorisée", {
        description: "Vous ne pouvez supprimer que vos propres commentaires.",
      });
      return {
        error: "Vous ne pouvez supprimer que vos propres commentaires",
      };
    }

    // Supprimer le commentaire
    await prisma.offerComment.delete({
      where: { id: commentId },
    });

    toast.success("Commentaire supprimé", {
      description: "Le commentaire a été supprimé avec succès.",
    });

    return { success: true };
  } catch (error) {
    handleError(error, "deleteOfferComment");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Ajouter ou modifier une note interne sur une offre
 * @deprecated Utiliser addOfferComment à la place
 */
export async function updateOfferInternalNote(
  offerId: string,
  note: string | null
) {
  // Pour compatibilité ascendante, on crée un commentaire
  if (!note) {
    return { success: true };
  }
  return addOfferComment(offerId, note);
}

/**
 * Récupérer l'historique des modifications de la note interne
 * @deprecated Utiliser getOfferComments à la place
 */
export async function getOfferNoteHistory(offerId: string) {
  return getOfferComments(offerId);
}
