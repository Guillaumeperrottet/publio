// Actions pour la gestion des offres
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { OfferStatus } from "@prisma/client";
import {
  sendOfferSubmittedEmail,
  sendNewOfferReceivedEmail,
  sendOfferAcceptedEmail,
  sendOfferRejectedEmail,
  sendOfferWithdrawnEmail,
} from "@/lib/email/tender-emails";
import { createOrganizationNotification } from "@/features/notifications/actions";
import { createEquityLog } from "@/features/equity-log/actions";
import {
  toastSuccess,
  toastError,
  handleError,
} from "@/lib/utils/toast-messages";
import { toast } from "sonner";

// Type pour le formulaire d'offre
interface OfferFormData {
  offerNumber?: string;
  validityDays: number;
  usesTenderDeadline?: boolean;
  projectSummary: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationWebsite?: string;
  inclusions: Array<{ position: number; description: string }>;
  exclusions: Array<{ position: number; description: string }>;
  materials: Array<{
    position: number;
    name: string;
    brand?: string;
    model?: string;
    range?: string;
    manufacturerWarranty?: string;
  }>;
  description: string;
  methodology?: string;
  priceType: "GLOBAL" | "DETAILED";
  price: number;
  totalHT?: number;
  totalTVA?: number;
  tvaRate: number;
  discount?: number;
  lineItems: Array<{
    position: number;
    description: string;
    quantity?: number;
    unit?: string;
    priceHT: number;
    tvaRate: number;
    category?: string;
    sectionOrder?: number;
  }>;
  timeline?: string;
  startDate?: string;
  durationDays?: number;
  constraints?: string;
  paymentTerms?: {
    deposit?: number;
    intermediate?: number;
    final?: number;
    netDays?: number;
  };
  warrantyYears?: number;
  insuranceAmount?: number;
  manufacturerWarranty?: string;
  references?: string;
  signature?: string;
  documents?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

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
      await prisma.offerInclusion.deleteMany({ where: { offerId: offer.id } });
      await prisma.offerExclusion.deleteMany({ where: { offerId: offer.id } });
      await prisma.offerMaterial.deleteMany({ where: { offerId: offer.id } });
      await prisma.offerLineItem.deleteMany({ where: { offerId: offer.id } });
      await prisma.offerDocument.deleteMany({ where: { offerId: offer.id } });

      if (data.formData.inclusions.length > 0) {
        await prisma.offerInclusion.createMany({
          data: data.formData.inclusions.map((inc) => ({
            offerId: offer.id,
            position: inc.position,
            description: inc.description,
          })),
        });
      }

      if (data.formData.exclusions.length > 0) {
        await prisma.offerExclusion.createMany({
          data: data.formData.exclusions.map((exc) => ({
            offerId: offer.id,
            position: exc.position,
            description: exc.description,
          })),
        });
      }

      if (data.formData.materials.length > 0) {
        await prisma.offerMaterial.createMany({
          data: data.formData.materials.map((mat) => ({
            offerId: offer.id,
            position: mat.position,
            name: mat.name,
            brand: mat.brand,
            model: mat.model,
            range: mat.range,
            manufacturerWarranty: mat.manufacturerWarranty,
          })),
        });
      }

      if (data.formData.lineItems.length > 0) {
        await prisma.offerLineItem.createMany({
          data: data.formData.lineItems.map((item) => ({
            offerId: offer.id,
            position: item.position,
            description: item.description,
            quantity: item.quantity ? parseFloat(String(item.quantity)) : null,
            unit: item.unit,
            priceHT: item.priceHT,
            tvaRate: item.tvaRate,
            category: item.category,
            sectionOrder: item.sectionOrder,
          })),
        });
      }

      if (data.formData.documents && data.formData.documents.length > 0) {
        await prisma.offerDocument.createMany({
          data: data.formData.documents.map((doc) => ({
            offerId: offer.id,
            name: doc.name,
            url: doc.url,
            size: doc.size,
            mimeType: doc.mimeType,
          })),
        });
      }

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
    if (data.formData.inclusions.length > 0) {
      await prisma.offerInclusion.createMany({
        data: data.formData.inclusions.map((inc) => ({
          offerId: offer.id,
          position: inc.position,
          description: inc.description,
        })),
      });
    }

    if (data.formData.exclusions.length > 0) {
      await prisma.offerExclusion.createMany({
        data: data.formData.exclusions.map((exc) => ({
          offerId: offer.id,
          position: exc.position,
          description: exc.description,
        })),
      });
    }

    if (data.formData.materials.length > 0) {
      await prisma.offerMaterial.createMany({
        data: data.formData.materials.map((mat) => ({
          offerId: offer.id,
          position: mat.position,
          name: mat.name,
          brand: mat.brand,
          model: mat.model,
          range: mat.range,
          manufacturerWarranty: mat.manufacturerWarranty,
        })),
      });
    }

    if (data.formData.lineItems.length > 0) {
      await prisma.offerLineItem.createMany({
        data: data.formData.lineItems.map((item) => ({
          offerId: offer.id,
          position: item.position,
          description: item.description,
          quantity: item.quantity ? parseFloat(String(item.quantity)) : null,
          unit: item.unit,
          priceHT: item.priceHT,
          tvaRate: item.tvaRate,
          category: item.category,
          sectionOrder: item.sectionOrder,
        })),
      });
    }

    if (data.formData.documents && data.formData.documents.length > 0) {
      await prisma.offerDocument.createMany({
        data: data.formData.documents.map((doc) => ({
          offerId: offer.id,
          name: doc.name,
          url: doc.url,
          size: doc.size,
          mimeType: doc.mimeType,
        })),
      });
    }

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
        await tx.offerInclusion.deleteMany({
          where: { offerId: updatedOffer.id },
        });
        await tx.offerExclusion.deleteMany({
          where: { offerId: updatedOffer.id },
        });
        await tx.offerMaterial.deleteMany({
          where: { offerId: updatedOffer.id },
        });
        await tx.offerLineItem.deleteMany({
          where: { offerId: updatedOffer.id },
        });
        await tx.offerDocument.deleteMany({
          where: { offerId: updatedOffer.id },
        });

        if (data.formData.inclusions.length > 0) {
          await tx.offerInclusion.createMany({
            data: data.formData.inclusions.map((inc) => ({
              offerId: updatedOffer.id,
              position: inc.position,
              description: inc.description,
            })),
          });
        }

        if (data.formData.exclusions.length > 0) {
          await tx.offerExclusion.createMany({
            data: data.formData.exclusions.map((exc) => ({
              offerId: updatedOffer.id,
              position: exc.position,
              description: exc.description,
            })),
          });
        }

        if (data.formData.materials.length > 0) {
          await tx.offerMaterial.createMany({
            data: data.formData.materials.map((mat) => ({
              offerId: updatedOffer.id,
              position: mat.position,
              name: mat.name,
              brand: mat.brand,
              model: mat.model,
              range: mat.range,
              manufacturerWarranty: mat.manufacturerWarranty,
            })),
          });
        }

        if (data.formData.lineItems.length > 0) {
          await tx.offerLineItem.createMany({
            data: data.formData.lineItems.map((item) => ({
              offerId: updatedOffer.id,
              position: item.position,
              description: item.description,
              quantity: item.quantity
                ? parseFloat(String(item.quantity))
                : null,
              unit: item.unit,
              priceHT: item.priceHT,
              tvaRate: item.tvaRate,
            })),
          });
        }

        if (data.formData.documents && data.formData.documents.length > 0) {
          await tx.offerDocument.createMany({
            data: data.formData.documents.map((doc) => ({
              offerId: updatedOffer.id,
              name: doc.name,
              url: doc.url,
              size: doc.size,
              mimeType: doc.mimeType,
            })),
          });
        }

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
      if (data.formData.inclusions.length > 0) {
        await tx.offerInclusion.createMany({
          data: data.formData.inclusions.map((inc) => ({
            offerId: newOffer.id,
            position: inc.position,
            description: inc.description,
          })),
        });
      }

      if (data.formData.exclusions.length > 0) {
        await tx.offerExclusion.createMany({
          data: data.formData.exclusions.map((exc) => ({
            offerId: newOffer.id,
            position: exc.position,
            description: exc.description,
          })),
        });
      }

      // Créer les matériaux
      if (data.formData.materials.length > 0) {
        await tx.offerMaterial.createMany({
          data: data.formData.materials.map((mat) => ({
            offerId: newOffer.id,
            position: mat.position,
            name: mat.name,
            brand: mat.brand,
            model: mat.model,
            range: mat.range,
            manufacturerWarranty: mat.manufacturerWarranty,
          })),
        });
      }

      // Créer les lignes de prix détaillées
      if (data.formData.lineItems.length > 0) {
        await tx.offerLineItem.createMany({
          data: data.formData.lineItems.map((item) => ({
            offerId: newOffer.id,
            position: item.position,
            description: item.description,
            quantity: item.quantity ? parseFloat(String(item.quantity)) : null,
            unit: item.unit,
            priceHT: item.priceHT,
            tvaRate: item.tvaRate,
          })),
        });
      }

      // Créer les documents liés
      if (data.formData.documents && data.formData.documents.length > 0) {
        await tx.offerDocument.createMany({
          data: data.formData.documents.map((doc) => ({
            offerId: newOffer.id,
            name: doc.name,
            url: doc.url,
            size: doc.size,
            mimeType: doc.mimeType,
          })),
        });
      }

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
      await prisma.offerDocument.createMany({
        data: data.documents.map((doc) => ({
          offerId: offer.id,
          name: doc.name,
          url: doc.url,
          size: doc.size,
          mimeType: doc.mimeType,
        })),
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

// ============================================
// GESTION DU CYCLE DE VIE DES OFFRES
// ============================================

/**
 * Accepter une offre (marquer comme gagnante)
 * Note : Pour attribuer le marché définitivement, utilisez awardTender() de features/tenders
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
    await prisma.$transaction([
      // Supprimer les commentaires
      prisma.offerComment.deleteMany({ where: { offerId } }),
      // Supprimer les documents
      prisma.offerDocument.deleteMany({ where: { offerId } }),
      // Supprimer les line items
      prisma.offerLineItem.deleteMany({ where: { offerId } }),
      // Supprimer les inclusions
      prisma.offerInclusion.deleteMany({ where: { offerId } }),
      // Supprimer les exclusions
      prisma.offerExclusion.deleteMany({ where: { offerId } }),
      // Supprimer les matériaux
      prisma.offerMaterial.deleteMany({ where: { offerId } }),
      // Supprimer l'offre
      prisma.offer.delete({ where: { id: offerId } }),
    ]);

    toastSuccess.deleted();

    return { success: true };
  } catch (error) {
    handleError(error, "deleteDraftOffer");
    return {
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
