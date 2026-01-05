/**
 * Actions de gestion du cycle de vie des offres
 * Gestion des statuts : shortlist, reject, accept
 */
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { OfferStatus } from "@prisma/client";
import {
  sendOfferAcceptedEmail,
  sendOfferRejectedEmail,
} from "@/lib/email/tender-emails";
import { createOrganizationNotification } from "@/features/notifications/actions";
import { createEquityLog } from "@/features/equity-log/actions";
import { toastError, handleError } from "@/lib/utils/toast-messages";
import { toast } from "sonner";

/**
 * Accepter une offre (marquer comme gagnante)
 * @deprecated Utiliser awardTender() de features/tenders pour attribuer un marché
 */
export async function acceptOffer(offerId: string) {
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
                    role: {
                      in: ["OWNER", "ADMIN", "EDITOR"],
                    },
                  },
                },
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!offer) {
      toast.error("Offre introuvable", {
        description: "Cette offre n'existe pas ou a été supprimée.",
      });
      return { error: "Offre introuvable" };
    }

    // Vérifier que l'utilisateur a les droits
    if (!offer.tender.organization.members.length) {
      toastError.unauthorized();
      return { error: "Vous n'avez pas les droits pour accepter cette offre" };
    }

    // Vérifier que l'offre est bien soumise
    if (offer.status !== "SUBMITTED") {
      toast.error("Action impossible", {
        description: "Seules les offres soumises peuvent être acceptées.",
      });
      return { error: "Seules les offres soumises peuvent être acceptées" };
    }

    console.warn(
      "⚠️ acceptOffer() est déprécié. Utilisez awardOffer() pour attribuer un marché."
    );

    // Mettre à jour l'offre
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.ACCEPTED,
      },
    });

    toast.success("Offre acceptée", {
      description: `L'offre de ${offer.organization.name} a été acceptée.`,
    });

    // Récupérer les admins de l'organisation soumissionnaire
    const submitterOrg = await prisma.organization.findUnique({
      where: { id: offer.organizationId },
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
    });

    // Envoyer email de félicitations
    if (submitterOrg) {
      const submitterEmails = submitterOrg.members
        .map((m) => m.user.email)
        .filter((email): email is string => !!email);

      if (submitterEmails.length > 0) {
        try {
          await sendOfferAcceptedEmail({
            to: submitterEmails,
            tenderTitle: offer.tender.title,
            tenderId: offer.tender.id,
            offerPrice: offer.price,
            offerCurrency: offer.currency,
            organizationName: offer.tender.organization.name,
          });
        } catch (error) {
          console.error("Error sending acceptance email:", error);
        }
      }
    }

    return { success: true, offer: updatedOffer };
  } catch (error) {
    handleError(error, "acceptOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Rejeter une offre
 */
export async function rejectOffer(offerId: string) {
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
                    role: {
                      in: ["OWNER", "ADMIN", "EDITOR"],
                    },
                  },
                },
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!offer) {
      toast.error("Offre introuvable", {
        description: "Cette offre n'existe pas ou a été supprimée.",
      });
      return { error: "Offre introuvable" };
    }

    // Vérifier que l'utilisateur a les droits
    if (!offer.tender.organization.members.length) {
      toastError.unauthorized();
      return { error: "Vous n'avez pas les droits pour rejeter cette offre" };
    }

    // Vérifier que l'offre est soumise ou pré-sélectionnée
    if (offer.status !== "SUBMITTED" && offer.status !== "SHORTLISTED") {
      toast.error("Action impossible", {
        description:
          "Seules les offres soumises ou pré-sélectionnées peuvent être rejetées.",
      });
      return {
        error:
          "Seules les offres soumises ou pré-sélectionnées peuvent être rejetées",
      };
    }

    // Mettre à jour l'offre
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.REJECTED,
      },
    });

    toast.success("Offre rejetée", {
      description: `L'offre de ${offer.organization.name} a été rejetée.`,
    });

    // Notification in-app au soumissionnaire
    try {
      await createOrganizationNotification(offer.organizationId, user.id, {
        type: "OFFER_REJECTED",
        title: "Offre non retenue",
        message: `Votre offre pour "${offer.tender.title}" n'a pas été retenue`,
        metadata: {
          tenderId: offer.tender.id,
          offerId: offer.id,
          tenderTitle: offer.tender.title,
        },
      });
    } catch (error) {
      console.error("Error sending offer rejected notification:", error);
    }

    // Récupérer les admins de l'organisation soumissionnaire
    const submitterOrg = await prisma.organization.findUnique({
      where: { id: offer.organizationId },
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
    });

    // Envoyer email de rejet
    if (submitterOrg) {
      const submitterEmails = submitterOrg.members
        .map((m) => m.user.email)
        .filter((email): email is string => !!email);

      if (submitterEmails.length > 0) {
        try {
          await sendOfferRejectedEmail({
            to: submitterEmails,
            tenderTitle: offer.tender.title,
          });
        } catch (error) {
          console.error("Error sending rejection email:", error);
        }
      }
    }

    // Log d'équité pour traçabilité
    try {
      await createEquityLog({
        tenderId: offer.tender.id,
        userId: user.id,
        action: "OFFER_REJECTED",
        description: `Offre de "${
          offer.organization.name
        }" rejetée (${new Intl.NumberFormat("fr-CH", {
          style: "currency",
          currency: offer.currency,
        }).format(offer.price)})`,
        metadata: {
          offerId: offer.id,
          organizationName: offer.organization.name,
          price: offer.price,
          currency: offer.currency,
          previousStatus:
            offer.status === "SUBMITTED" ? "SUBMITTED" : "SHORTLISTED",
        },
      });
    } catch (error) {
      console.error("Error creating equity log for rejection:", error);
    }

    return { success: true, offer: updatedOffer };
  } catch (error) {
    handleError(error, "rejectOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Pré-sélectionner une offre (mettre en liste restreinte)
 * Accessible uniquement aux OWNER et ADMIN de l'organisation émettrice
 */
export async function shortlistOffer(offerId: string) {
  console.log("🔵 shortlistOffer called with offerId:", offerId);
  try {
    const user = await getCurrentUser();
    console.log("🔵 Current user:", user.id, user.email);

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
                    role: {
                      in: ["OWNER", "ADMIN"], // Seulement OWNER et ADMIN
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("🔵 Offer found:", offer?.id, "status:", offer?.status);
    console.log(
      "🔵 Members with rights:",
      offer?.tender.organization.members.length
    );

    if (!offer) {
      console.log("🔴 Error: Offre introuvable");
      toast.error("Offre introuvable", {
        description: "Cette offre n'existe pas ou a été supprimée.",
      });
      return { error: "Offre introuvable" };
    }

    // Vérifier que l'utilisateur a les droits (OWNER ou ADMIN)
    if (!offer.tender.organization.members.length) {
      console.log("🔴 Error: Pas de droits");
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour pré-sélectionner cette offre",
      };
    }

    // Vérifier que l'offre est bien soumise
    if (offer.status !== "SUBMITTED") {
      console.log("🔴 Error: Statut invalide:", offer.status);
      toast.error("Action impossible", {
        description:
          "Seules les offres soumises peuvent être pré-sélectionnées.",
      });
      return {
        error: "Seules les offres soumises peuvent être pré-sélectionnées",
      };
    }

    console.log("🟢 Updating offer to SHORTLISTED...");
    // Mettre à jour l'offre
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.SHORTLISTED,
      },
      include: {
        organization: true,
        tender: {
          include: {
            organization: true,
          },
        },
      },
    });

    console.log(
      "🟢 Offer updated successfully:",
      updatedOffer.id,
      updatedOffer.status
    );

    toast.success("Offre pré-sélectionnée", {
      description: `L'offre de ${updatedOffer.organization.name} a été mise en liste restreinte.`,
    });

    // Notification in-app à l'organisation soumissionnaire (sauf si tender anonyme non révélé)
    if (
      updatedOffer.tender.mode !== "ANONYMOUS" ||
      updatedOffer.tender.identityRevealed
    ) {
      try {
        await createOrganizationNotification(
          updatedOffer.organizationId,
          user.id,
          {
            type: "OFFER_SHORTLISTED",
            title: "Offre mise à l'étude",
            message: `Votre offre pour ${updatedOffer.tender.title} a été mise à l'étude`,
            metadata: {
              tenderId: updatedOffer.tender.id,
              offerId: updatedOffer.id,
              tenderTitle: updatedOffer.tender.title,
            },
          }
        );
      } catch (error) {
        console.error("Error sending offer shortlisted notification:", error);
      }
    }

    return { success: true, offer: updatedOffer };
  } catch (error) {
    console.error("🔴 Error shortlisting offer:", error);
    handleError(error, "shortlistOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Retirer une offre de la liste restreinte (remettre en SUBMITTED)
 * Accessible uniquement aux OWNER et ADMIN de l'organisation émettrice
 */
export async function unshortlistOffer(offerId: string) {
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
                    role: {
                      in: ["OWNER", "ADMIN"], // Seulement OWNER et ADMIN
                    },
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

    // Vérifier que l'utilisateur a les droits (OWNER ou ADMIN)
    if (!offer.tender.organization.members.length) {
      toastError.unauthorized();
      return {
        error:
          "Vous n'avez pas les droits pour retirer cette offre de la liste",
      };
    }

    // Vérifier que l'offre est bien pré-sélectionnée
    if (offer.status !== "SHORTLISTED") {
      toast.error("Action impossible", {
        description:
          "Seules les offres pré-sélectionnées peuvent être retirées de la liste.",
      });
      return {
        error:
          "Seules les offres pré-sélectionnées peuvent être retirées de la liste",
      };
    }

    // Mettre à jour l'offre
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.SUBMITTED,
      },
    });

    toast.success("Offre retirée de la sélection", {
      description: "L'offre a été retirée de la liste des pré-sélectionnées.",
    });

    return { success: true, offer: updatedOffer };
  } catch (error) {
    handleError(error, "unshortlistOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
