/**
 * Actions serveur pour la gestion de la facturation et des abonnements
 */

"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Type pour subscription Stripe avec toutes les propriétés nécessaires
type StripeSubscriptionExtended = Stripe.Response<Stripe.Subscription> & {
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
};

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Récupérer les informations d'abonnement de l'organisation
 */
export async function getOrganizationSubscription(organizationId: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionPlan: true,
      },
    });

    if (!organization) {
      return null;
    }

    // Si pas d'abonnement Stripe, retourner plan FREE
    if (!organization.stripeSubscriptionId) {
      return {
        plan: "FREE",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    // Récupérer les détails depuis Stripe
    try {
      const subscription = (await stripe.subscriptions.retrieve(
        organization.stripeSubscriptionId
      )) as StripeSubscriptionExtended;

      return {
        plan: organization.stripeSubscriptionPlan || "FREE",
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items?.data?.[0]?.price?.id,
      };
    } catch (error) {
      console.error("Error fetching Stripe subscription:", error);
      return {
        plan: organization.stripeSubscriptionPlan || "FREE",
        status: "unknown",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
  } catch (error) {
    console.error("[getOrganizationSubscription] Error:", error);
    return null;
  }
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

/**
 * Récupérer l'historique des factures de l'organisation
 */
export async function getOrganizationInvoices(organizationId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limiter à 50 dernières factures
    });

    return invoices;
  } catch (error) {
    console.error("[getOrganizationInvoices] Error:", error);
    return [];
  }
}

/**
 * Récupérer une facture spécifique
 */
export async function getInvoice(invoiceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Non authentifié");
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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

    // Vérifier que l'utilisateur a accès à cette facture
    if (!invoice || invoice.organization.members.length === 0) {
      throw new Error("Facture non trouvée ou accès refusé");
    }

    return invoice;
  } catch (error) {
    console.error("[getInvoice] Error:", error);
    throw error;
  }
}

/**
 * Télécharger une facture PDF depuis Stripe
 */
export async function downloadInvoicePdf(stripeInvoiceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Non authentifié");
    }

    // Récupérer la facture depuis Stripe
    const invoice = await stripe.invoices.retrieve(stripeInvoiceId);

    if (!invoice.invoice_pdf) {
      throw new Error("PDF de facture non disponible");
    }

    return {
      url: invoice.invoice_pdf,
      number: invoice.number,
    };
  } catch (error) {
    console.error("[downloadInvoicePdf] Error:", error);
    throw error;
  }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Obtenir des statistiques de paiement pour l'organisation
 */
export async function getOrganizationPaymentStats(organizationId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
    });

    const totalSpent = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const pendingAmount = invoices
      .filter((inv) => inv.status === "PENDING")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalSpent,
      pendingAmount,
      invoiceCount: invoices.length,
      paidInvoiceCount: invoices.filter((inv) => inv.status === "PAID").length,
    };
  } catch (error) {
    console.error("[getOrganizationPaymentStats] Error:", error);
    return {
      totalSpent: 0,
      pendingAmount: 0,
      invoiceCount: 0,
      paidInvoiceCount: 0,
    };
  }
}

/**
 * Obtenir le nombre de tenders et offres publiés
 */
export async function getOrganizationUsageStats(organizationId: string) {
  try {
    const [tenderCount, offerCount] = await Promise.all([
      prisma.tender.count({
        where: {
          organizationId,
          status: { in: ["PUBLISHED", "CLOSED", "AWARDED"] },
        },
      }),
      prisma.offer.count({
        where: {
          organizationId,
          status: { in: ["SUBMITTED", "ACCEPTED"] },
        },
      }),
    ]);

    return {
      tenderCount,
      offerCount,
    };
  } catch (error) {
    console.error("[getOrganizationUsageStats] Error:", error);
    return {
      tenderCount: 0,
      offerCount: 0,
    };
  }
}
