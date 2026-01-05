// Actions pour la gestion des offres
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { OfferStatus } from "@prisma/client";
import {
  sendOfferSubmittedEmail,
  sendNewOfferReceivedEmail,
  sendOfferWithdrawnEmail,
} from "@/lib/email/tender-emails";
import { createOrganizationNotification } from "@/features/notifications/actions";
import {
  toastSuccess,
  toastError,
  handleError,
} from "@/lib/utils/toast-messages";
import { toast } from "sonner";
import {
  updateOfferRelations,
  createOfferRelations,
  deleteOfferCompletely,
} from "./utils/relations";
import type { OfferFormData } from "./types";

// ============================================
// ACTIONS - Création et gestion des offres
// ============================================

/**
 * Sauvegarder un brouillon d'offre
 */
export async function saveDraftOffer(data: {
  offerId?: string;
  tenderId: string;
  organizationId: string;
  formData: OfferFormData;
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
        error: "Vous n'avez pas les droits",
      };
    }

    // Si l'offre existe, la mettre à jour
    if (data.offerId) {
      const offer = await prisma.offer.update({
        where: { id: data.offerId },
        data: {
          offerNumber: data.formData.offerNumber,
          validityDays: data.formData.validityDays,
          usesTenderDeadline: data.formData.usesTenderDeadline,
          projectSummary: data.formData.projectSummary,
          contactPerson: data.formData.contactPerson,
          contactEmail: data.formData.contactEmail,
          contactPhone: data.formData.contactPhone,
          organizationAddress: data.formData.organizationAddress,
          organizationCity: data.formData.organizationCity,
          organizationPhone: data.formData.organizationPhone,
          organizationEmail: data.formData.organizationEmail,
          organizationWebsite: data.formData.organizationWebsite,
          description: data.formData.description,
          methodology: data.formData.methodology,
          priceType: data.formData.priceType,
          price: data.formData.price,
          totalHT: data.formData.totalHT,
          totalTVA: data.formData.totalTVA,
          tvaRate: data.formData.tvaRate,
          discount: data.formData.discount,
          timeline: data.formData.timeline,
          startDate: data.formData.startDate
            ? new Date(data.formData.startDate)
            : null,
          durationDays: data.formData.durationDays,
          constraints: data.formData.constraints,
          paymentTerms: data.formData.paymentTerms,
          warrantyYears: data.formData.warrantyYears,
          insuranceAmount: data.formData.insuranceAmount,
          manufacturerWarranty: data.formData.manufacturerWarranty,
          references: data.formData.references,
          signature: data.formData.signature,
        },
      });

      // Mettre à jour les relations (supprimer et recréer)
      await updateOfferRelations(offer.id, {
        inclusions: data.formData.inclusions,
        exclusions: data.formData.exclusions,
        materials: data.formData.materials,
        lineItems: data.formData.lineItems,
        documents: data.formData.documents,
      });

      return { success: true, offerId: offer.id };
    }

    // Sinon, créer un nouveau brouillon
    const tender = await prisma.tender.findUnique({
      where: { id: data.tenderId },
    });

    if (!tender) {
      toast.error("Appel d'offres introuvable", {
        description: "Cet appel d'offres n'existe pas.",
      });
      return { error: "Appel d'offres introuvable" };
    }

    const offer = await prisma.offer.create({
      data: {
        tenderId: data.tenderId,
        organizationId: data.organizationId,
        offerNumber: data.formData.offerNumber,
        validityDays: data.formData.validityDays,
        usesTenderDeadline: data.formData.usesTenderDeadline,
        projectSummary: data.formData.projectSummary,
        contactPerson: data.formData.contactPerson,
        contactEmail: data.formData.contactEmail,
        contactPhone: data.formData.contactPhone,
        organizationAddress: data.formData.organizationAddress,
        organizationCity: data.formData.organizationCity,
        organizationPhone: data.formData.organizationPhone,
        organizationEmail: data.formData.organizationEmail,
        organizationWebsite: data.formData.organizationWebsite,
        description: data.formData.description,
        methodology: data.formData.methodology,
        priceType: data.formData.priceType,
        price: data.formData.price,
        totalHT: data.formData.totalHT,
        totalTVA: data.formData.totalTVA,
        tvaRate: data.formData.tvaRate,
        discount: data.formData.discount,
        timeline: data.formData.timeline,
        startDate: data.formData.startDate
          ? new Date(data.formData.startDate)
          : null,
        durationDays: data.formData.durationDays,
        constraints: data.formData.constraints,
        paymentTerms: data.formData.paymentTerms,
        warrantyYears: data.formData.warrantyYears,
        insuranceAmount: data.formData.insuranceAmount,
        manufacturerWarranty: data.formData.manufacturerWarranty,
        references: data.formData.references,
        signature: data.formData.signature,
        status: OfferStatus.DRAFT,
      },
    });

    // Créer les relations
    await createOfferRelations(offer.id, {
      inclusions: data.formData.inclusions,
      exclusions: data.formData.exclusions,
      materials: data.formData.materials,
      lineItems: data.formData.lineItems,
      documents: data.formData.documents,
    });

    return { success: true, offerId: offer.id };
  } catch (error) {
    console.error("Error saving draft:", error);
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Soumettre une offre complète
 */
export async function submitOffer(data: {
  tenderId: string;
  organizationId: string;
  formData: OfferFormData;
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
          "Vous n'avez pas les droits pour créer une offre pour cette organisation",
      };
    }

    // Vérifier que l'appel d'offres existe et est ouvert
    const tender = await prisma.tender.findUnique({
      where: { id: data.tenderId },
      include: {
        organization: true,
      },
    });

    if (!tender || tender.status !== "PUBLISHED") {
      return { error: "Cet appel d'offres n'est pas disponible" };
    }

    if (new Date() > tender.deadline) {
      return { error: "La date limite est dépassée" };
    }

    // Vérifier que l'organisation ne soumet pas une offre à son propre tender
    if (tender.organizationId === data.organizationId) {
      return {
        error:
          "Vous ne pouvez pas soumettre une offre à votre propre appel d'offres",
      };
    }

    // Vérifier si l'organisation a déjà une offre
    const existingOffer = await prisma.offer.findFirst({
      where: {
        tenderId: data.tenderId,
        organizationId: data.organizationId,
        status: {
          in: ["DRAFT", "SUBMITTED", "WITHDRAWN"],
        },
      },
    });

    // Si l'offre existe et est déjà soumise ou retirée, refuser
    if (existingOffer) {
      if (existingOffer.status === "SUBMITTED") {
        toast.error("Offre déjà soumise", {
          description:
            "Vous avez déjà soumis une offre pour cet appel d'offres.",
        });
        return {
          error: "Vous avez déjà soumis une offre pour cet appel d'offres",
        };
      } else if (existingOffer.status === "WITHDRAWN") {
        toast.error("Action impossible", {
          description:
            "Vous avez retiré votre offre. Vous ne pouvez plus soumettre de nouvelle offre.",
        });
        return {
          error:
            "Vous avez retiré votre offre pour cet appel d'offres. Vous ne pouvez plus soumettre de nouvelle offre.",
        };
      }
      // Si c'est un DRAFT, on continue pour le soumettre (ne pas retourner d'erreur)
    }

    // Générer un numéro d'offre si vide
    const offerNumber =
      data.formData.offerNumber ||
      `OFF-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    // Si un brouillon existe, le mettre à jour et le soumettre
    if (existingOffer && existingOffer.status === "DRAFT") {
      const offer = await prisma.$transaction(async (tx) => {
        // Mettre à jour l'offre existante
        const updatedOffer = await tx.offer.update({
          where: { id: existingOffer.id },
          data: {
            offerNumber,
            validityDays: data.formData.validityDays,
            usesTenderDeadline: data.formData.usesTenderDeadline,
            projectSummary: data.formData.projectSummary,
            contactPerson: data.formData.contactPerson,
            contactEmail: data.formData.contactEmail,
            contactPhone: data.formData.contactPhone,
            organizationAddress: data.formData.organizationAddress,
            organizationCity: data.formData.organizationCity,
            organizationPhone: data.formData.organizationPhone,
            organizationEmail: data.formData.organizationEmail,
            organizationWebsite: data.formData.organizationWebsite,
            description: data.formData.description,
            methodology: data.formData.methodology,
            priceType: data.formData.priceType,
            price: data.formData.price,
            totalHT: data.formData.totalHT,
            totalTVA: data.formData.totalTVA,
            tvaRate: data.formData.tvaRate,
            discount: data.formData.discount,
            timeline: data.formData.timeline,
            startDate: data.formData.startDate
              ? new Date(data.formData.startDate)
              : null,
            durationDays: data.formData.durationDays,
            constraints: data.formData.constraints,
            paymentTerms: data.formData.paymentTerms,
            warrantyYears: data.formData.warrantyYears,
            insuranceAmount: data.formData.insuranceAmount,
            manufacturerWarranty: data.formData.manufacturerWarranty,
            references: data.formData.references,
            status: OfferStatus.SUBMITTED,
            submittedAt: new Date(),
          },
        });

        // Supprimer et recréer les relations
        await updateOfferRelations(
          updatedOffer.id,
          {
            inclusions: data.formData.inclusions,
            exclusions: data.formData.exclusions,
            materials: data.formData.materials,
            lineItems: data.formData.lineItems,
            documents: data.formData.documents,
          },
          tx
        );

        return updatedOffer;
      });

      // Continuer avec les notifications (code existant)
      const submitterOrg = await prisma.organization.findUnique({
        where: { id: data.organizationId },
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

      const tenderOrg = await prisma.organization.findUnique({
        where: { id: tender.organizationId },
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

      const totalOffersCount = await prisma.offer.count({
        where: {
          tenderId: data.tenderId,
          status: "SUBMITTED",
        },
      });

      // Envoyer emails (même code que ci-dessous)
      if (submitterOrg) {
        for (const member of submitterOrg.members) {
          await sendOfferSubmittedEmail({
            to: member.user.email,
            tenderTitle: tender.title,
            tenderId: tender.id,
            offerPrice: offer.price,
            offerCurrency: offer.currency,
            deadline: tender.deadline,
          });
        }
      }

      if (tenderOrg) {
        for (const member of tenderOrg.members) {
          await sendNewOfferReceivedEmail({
            to: member.user.email,
            tenderTitle: tender.title,
            tenderId: tender.id,
            offerPrice: offer.price,
            offerCurrency: offer.currency,
            organizationName: submitterOrg?.name || "Organisation",
            totalOffersCount,
          });
        }
      }

      return { success: true, offerId: offer.id };
    }

    // Sinon, créer une nouvelle offre
    const offer = await prisma.$transaction(async (tx) => {
      // Créer l'offre en mode SUBMITTED
      const newOffer = await tx.offer.create({
        data: {
          tenderId: data.tenderId,
          organizationId: data.organizationId,
          offerNumber,
          validityDays: data.formData.validityDays,
          projectSummary: data.formData.projectSummary,
          description: data.formData.description,
          methodology: data.formData.methodology,
          priceType: data.formData.priceType,
          price: data.formData.price,
          totalHT: data.formData.totalHT,
          totalTVA: data.formData.totalTVA,
          tvaRate: data.formData.tvaRate,
          timeline: data.formData.timeline,
          startDate: data.formData.startDate
            ? new Date(data.formData.startDate)
            : null,
          durationDays: data.formData.durationDays,
          constraints: data.formData.constraints,
          paymentTerms: data.formData.paymentTerms,
          warrantyYears: data.formData.warrantyYears,
          insuranceAmount: data.formData.insuranceAmount,
          manufacturerWarranty: data.formData.manufacturerWarranty,
          references: data.formData.references,
          status: OfferStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      // Créer les relations
      await createOfferRelations(
        newOffer.id,
        {
          inclusions: data.formData.inclusions,
          exclusions: data.formData.exclusions,
          materials: data.formData.materials,
          lineItems: data.formData.lineItems,
          documents: data.formData.documents,
        },
        tx
      );

      return newOffer;
    });

    // Récupérer l'organisation avec les membres pour les emails
    const submitterOrg = await prisma.organization.findUnique({
      where: { id: data.organizationId },
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

    // Récupérer l'émetteur du tender pour notification
    const tenderOrg = await prisma.organization.findUnique({
      where: { id: tender.organizationId },
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

    // Compter le nombre total d'offres
    const totalOffersCount = await prisma.offer.count({
      where: {
        tenderId: data.tenderId,
        status: "SUBMITTED",
      },
    });

    // Email de confirmation au soumissionnaire
    if (submitterOrg) {
      const submitterEmails = submitterOrg.members
        .map((m) => m.user.email)
        .filter((email): email is string => !!email);

      if (submitterEmails.length > 0) {
        try {
          await sendOfferSubmittedEmail({
            to: submitterEmails,
            tenderTitle: tender.title,
            tenderId: tender.id,
            offerPrice: offer.price,
            offerCurrency: offer.currency,
            deadline: tender.deadline,
          });
        } catch (error) {
          console.error("Error sending submitter confirmation email:", error);
        }
      }
    }

    // Email de notification à l'émetteur
    if (tenderOrg) {
      const tenderOrgEmails = tenderOrg.members
        .map((m) => m.user.email)
        .filter((email): email is string => !!email);

      if (tenderOrgEmails.length > 0) {
        try {
          await sendNewOfferReceivedEmail({
            to: tenderOrgEmails,
            tenderTitle: tender.title,
            tenderId: tender.id,
            offerPrice: offer.price,
            offerCurrency: offer.currency,
            organizationName: submitterOrg?.name || "Organisation inconnue",
            totalOffersCount,
          });
        } catch (error) {
          console.error(
            "Error sending tender owner notification email:",
            error
          );
        }
      }
    }

    // Notification in-app à l'émetteur du tender
    try {
      await createOrganizationNotification(tender.organizationId, user.id, {
        type: "OFFER_RECEIVED",
        title: "Nouvelle offre reçue",
        message: `${
          submitterOrg?.name || "Une organisation"
        } a soumis une offre pour ${tender.title}`,
        metadata: {
          tenderId: tender.id,
          offerId: offer.id,
          organizationName: submitterOrg?.name,
          price: offer.price,
          currency: offer.currency,
        },
      });
    } catch (error) {
      console.error("Error sending offer received notification:", error);
    }

    toastSuccess.offerSubmitted();

    return {
      success: true,
      offerId: offer.id,
    };
  } catch (error) {
    handleError(error, "submitOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Créer et soumettre une offre (ANCIENNE MÉTHODE - gardée pour compatibilité)
 */
export async function createOffer(data: {
  tenderId: string;
  organizationId: string;
  price: number;
  description: string;
  methodology: string;
  timeline: string;
  references: string | null;
  documents: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
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
      toastError.unauthorized();
      return {
        error:
          "Vous n'avez pas les droits pour créer une offre pour cette organisation",
      };
    }

    // Vérifier que l'appel d'offres existe et est ouvert
    const tender = await prisma.tender.findUnique({
      where: { id: data.tenderId },
      include: {
        organization: true,
      },
    });

    if (!tender || tender.status !== "PUBLISHED") {
      toast.error("Appel d'offres indisponible", {
        description:
          "Cet appel d'offres n'est pas disponible ou n'est plus ouvert.",
      });
      return { error: "Cet appel d'offres n'est pas disponible" };
    }

    if (new Date() > tender.deadline) {
      toastError.deadlinePassed();
      return { error: "La date limite est dépassée" };
    }

    // Vérifier que l'organisation ne soumet pas une offre à son propre tender
    if (tender.organizationId === data.organizationId) {
      toast.error("Action impossible", {
        description:
          "Vous ne pouvez pas soumettre une offre à votre propre appel d'offres.",
      });
      return {
        error:
          "Vous ne pouvez pas soumettre une offre à votre propre appel d'offres",
      };
    }

    // Vérifier si l'organisation a déjà soumis une offre
    const existingOffer = await prisma.offer.findFirst({
      where: {
        tenderId: data.tenderId,
        organizationId: data.organizationId,
        status: {
          in: ["SUBMITTED"],
        },
      },
    });

    if (existingOffer) {
      toast.error("Offre déjà soumise", {
        description: "Vous avez déjà soumis une offre pour cet appel d'offres.",
      });
      return {
        error: "Vous avez déjà soumis une offre pour cet appel d'offres",
      };
    }

    // Créer l'offre directement en mode SUBMITTED
    const offer = await prisma.offer.create({
      data: {
        tenderId: data.tenderId,
        organizationId: data.organizationId,
        price: data.price,
        projectSummary: data.description.substring(0, 500), // Utiliser le début de la description comme résumé
        description: data.description,
        methodology: data.methodology,
        timeline: data.timeline,
        references: data.references,
        status: OfferStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    // Créer les documents liés
    if (data.documents.length > 0) {
      await createOfferRelations(offer.id, {
        documents: data.documents,
      });
    }

    return {
      success: true,
      offerId: offer.id,
    };
  } catch (error) {
    console.error("Error creating offer:", error);
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Créer et soumettre une offre simple (ANCIENNE MÉTHODE - Dépréciée)
 * @deprecated Utiliser submitOffer avec formData à la place
 */
export async function createOfferLegacy(data: {
  tenderId: string;
  organizationId: string;
  price: number;
  description: string;
  methodology?: string;
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

  // Vérifier que l'appel d'offres existe et est ouvert
  const tender = await prisma.tender.findUnique({
    where: { id: data.tenderId },
  });

  if (!tender || tender.status !== "PUBLISHED") {
    throw new Error("Tender not available");
  }

  if (new Date() > tender.deadline) {
    throw new Error("Deadline passed");
  }

  const offer = await prisma.offer.create({
    data: {
      ...data,
      projectSummary: data.description?.substring(0, 500) || "Offre soumise", // Fallback
      status: OfferStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });

  return offer;
}

/**
 * Confirmer le paiement d'une offre (appelé par le webhook Stripe)
 */
export async function confirmOfferPayment(
  offerId: string,
  stripePaymentId: string
) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      tender: true,
      organization: true,
    },
  });

  if (!offer) {
    throw new Error("Offer not found");
  }

  // Mettre à jour l'offre
  const updatedOffer = await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: OfferStatus.SUBMITTED,
      paymentStatus: "PAID",
      stripePaymentId,
      paidAt: new Date(),
      submittedAt: new Date(),
    },
  });

  return updatedOffer;
}

/**
 * Révéler l'identité des soumissionnaires (après deadline)
 */
export async function revealOfferIdentities(tenderId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur est propriétaire du tender
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

  if (!tender?.organization.members.length) {
    toastError.unauthorized();
    return { error: "Vous n'avez pas les droits pour révéler les identités" };
  }

  // Vérifier que la deadline est passée
  if (new Date() < tender.deadline) {
    toast.error("Action impossible", {
      description: "La date limite n'est pas encore passée.",
    });
    return { error: "La date limite n'est pas encore passée" };
  }

  // Vérifier que le tender est en mode anonyme
  if (tender.mode !== "ANONYMOUS") {
    toast.error("Action impossible", {
      description: "Cet appel d'offres n'est pas en mode anonyme.",
    });
    return { error: "Cet appel d'offres n'est pas en mode anonyme" };
  }

  // Révéler les identités
  await prisma.tender.update({
    where: { id: tenderId },
    data: {
      identityRevealed: true,
      revealedAt: new Date(),
    },
  });

  toast.success("Identités révélées", {
    description: "Les identités des soumissionnaires sont maintenant visibles.",
  });

  return { success: true };
}

/**
 * Retirer une offre (action du soumissionnaire)
 */
export async function withdrawOffer(offerId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer l'offre
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        tender: true,
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

    if (!offer) {
      toast.error("Offre introuvable", {
        description: "Cette offre n'existe pas ou a été supprimée.",
      });
      return { error: "Offre introuvable" };
    }

    // Vérifier que l'utilisateur appartient à l'organisation soumissionnaire
    if (!offer.organization.members.length) {
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour retirer cette offre",
      };
    }

    // Vérifier que l'offre est soumise ou pré-sélectionnée
    if (offer.status !== "SUBMITTED" && offer.status !== "SHORTLISTED") {
      toast.error("Action impossible", {
        description:
          "Seules les offres soumises ou pré-sélectionnées peuvent être retirées.",
      });
      return {
        error:
          "Seules les offres soumises ou pré-sélectionnées peuvent être retirées",
      };
    }

    // Vérifier que la deadline n'est pas dépassée (on peut retirer seulement avant)
    if (new Date() > offer.tender.deadline) {
      toast.error("Deadline dépassée", {
        description:
          "Vous ne pouvez plus retirer votre offre après la deadline.",
      });
      return {
        error: "Vous ne pouvez plus retirer votre offre après la deadline",
      };
    }

    // Mettre à jour l'offre
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.WITHDRAWN,
      },
    });

    toast.success("Offre retirée", {
      description: `Votre offre pour "${offer.tender.title}" a été retirée avec succès.`,
    });

    // Envoyer email de confirmation à l'organisation soumissionnaire
    try {
      await sendOfferWithdrawnEmail({
        to: offer.organization.email || user.email,
        tenderTitle: offer.tender.title,
        tenderId: offer.tender.id,
        organizationName: offer.organization.name,
      });
    } catch (emailError) {
      console.error("Error sending offer withdrawn email:", emailError);
      // Ne pas bloquer l'action si l'email échoue
    }

    // Notification in-app à l'émetteur du tender
    try {
      await createOrganizationNotification(
        offer.tender.organizationId,
        user.id,
        {
          type: "OFFER_WITHDRAWN",
          title: "Offre retirée",
          message: `${offer.organization.name} a retiré son offre pour ${offer.tender.title}`,
          metadata: {
            tenderId: offer.tender.id,
            offerId: offer.id,
            organizationName: offer.organization.name,
          },
        }
      );
    } catch (error) {
      console.error("Error sending offer withdrawn notification:", error);
    }

    return { success: true, offer: updatedOffer };
  } catch (error) {
    handleError(error, "withdrawOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Supprimer un brouillon d'offre (action du soumissionnaire)
 */
export async function deleteDraftOffer(offerId: string) {
  try {
    const user = await getCurrentUser();

    // Récupérer l'offre
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
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

    if (!offer) {
      toast.error("Offre introuvable", {
        description: "Cette offre n'existe pas ou a été supprimée.",
      });
      return { error: "Offre introuvable" };
    }

    // Vérifier que l'utilisateur appartient à l'organisation soumissionnaire
    if (!offer.organization.members.length) {
      toastError.unauthorized();
      return {
        error: "Vous n'avez pas les droits pour supprimer cette offre",
      };
    }

    // Vérifier que l'offre est bien un brouillon
    if (offer.status !== "DRAFT") {
      toast.error("Action impossible", {
        description: "Seuls les brouillons peuvent être supprimés.",
      });
      return { error: "Seuls les brouillons peuvent être supprimés" };
    }

    // Supprimer toutes les relations liées
    await deleteOfferCompletely(offerId);

    toastSuccess.deleted();

    return { success: true };
  } catch (error) {
    handleError(error, "deleteDraftOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
