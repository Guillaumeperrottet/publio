// Configuration Stripe
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const STRIPE_CONFIG = {
  // Prix pour publier un appel d'offres (en centimes)
  TENDER_PUBLICATION_PRICE: parseInt(
    process.env.TENDER_PRICE_CHF || "1000",
    10
  ),
  CURRENCY: "chf",

  // URLs de retour après paiement
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  CANCEL_URL: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
};

/**
 * Créer une session de paiement Stripe pour la publication d'un appel d'offres
 */
export async function createTenderPaymentSession(params: {
  tenderId: string;
  organizationId: string;
  tenderTitle: string;
  amount?: number;
}) {
  const { tenderId, organizationId, tenderTitle, amount } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: STRIPE_CONFIG.CURRENCY,
          product_data: {
            name: "Publication d'appel d'offres",
            description: `Publication de: ${tenderTitle}`,
          },
          unit_amount: amount || STRIPE_CONFIG.TENDER_PUBLICATION_PRICE,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${STRIPE_CONFIG.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: STRIPE_CONFIG.CANCEL_URL,
    metadata: {
      tenderId,
      organizationId,
      type: "tender_publication",
    },
  });

  return session;
}

/**
 * Récupérer une session de paiement
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Créer un abonnement pour la veille communale
 */
export async function createVeilleSubscription(params: {
  organizationId: string;
  priceId: string;
  customerId?: string;
}) {
  const { organizationId, priceId, customerId } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    customer: customerId,
    metadata: {
      organizationId,
      type: "veille_subscription",
    },
  });

  return session;
}
