import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { confirmOfferPayment } from "@/features/offers/actions";
import { confirmTenderPayment } from "@/features/tenders/payment-actions";
import { prisma } from "@/lib/db/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Webhook Stripe pour gérer les événements de paiement
 * Endpoint : POST /api/stripe/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("Checkout session completed:", session.id);

        // Récupérer les métadonnées
        const type = session.metadata?.type;
        const offerId = session.metadata?.offerId;
        const tenderId = session.metadata?.tenderId;
        const organizationId = session.metadata?.organizationId;

        // Vérifier que le paiement a bien été effectué
        if (session.payment_status === "paid") {
          if (type === "tender_publication" && tenderId) {
            // Confirmer la publication du tender
            await confirmTenderPayment(tenderId);
            console.log(`Tender ${tenderId} published after payment`);
          } else if (type === "offer_submission" && offerId) {
            // Confirmer le paiement de l'offre (logique ancienne, gardée pour compatibilité)
            await confirmOfferPayment(offerId, session.id);
            console.log(`Offer ${offerId} payment confirmed`);
          } else if (type === "veille_subscription" && organizationId) {
            // L'abonnement veille est géré par customer.subscription.created
            console.log(
              `Veille subscription checkout completed for org ${organizationId}`
            );
          } else {
            console.error(
              "Unknown payment type or missing IDs:",
              session.metadata
            );
          }
        } else {
          console.error("Payment not completed:", session.payment_status);
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("Checkout session expired:", session.id);

        // Récupérer les métadonnées
        const type = session.metadata?.type;
        const offerId = session.metadata?.offerId;
        const tenderId = session.metadata?.tenderId;

        if (type === "tender_publication" && tenderId) {
          // Supprimer le tender en DRAFT si le paiement a expiré
          await prisma.tender.delete({
            where: { id: tenderId },
          });
          console.log(`Tender ${tenderId} deleted (session expired)`);
        } else if (type === "offer_submission" && offerId) {
          // Marquer l'offre comme expirée / annulée
          await prisma.offer.update({
            where: { id: offerId },
            data: {
              paymentStatus: "FAILED",
            },
          });
          console.log(`Offer ${offerId} marked as failed (session expired)`);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("Payment failed:", paymentIntent.id);

        // Gérer l'échec du paiement si nécessaire
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("Subscription event:", event.type, subscription.id);

        const organizationId = subscription.metadata?.organizationId;
        const planId = subscription.metadata?.planId;

        if (!organizationId || !planId) {
          console.error(
            "Missing metadata in subscription:",
            subscription.metadata
          );
          break;
        }

        // Mettre à jour l'organisation avec les infos Stripe
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionPlan: planId,
            stripeCustomerId: subscription.customer as string,
          },
        });

        // Mettre à jour ou créer la VeilleSubscription
        await prisma.veilleSubscription.upsert({
          where: { organizationId },
          create: {
            organizationId,
            cantons: [],
            keywords: [],
            emailNotifications: true,
            appNotifications: true,
          },
          update: {
            // Rien à mettre à jour pour l'instant
          },
        });

        console.log(
          `Veille subscription ${subscription.status} for org ${organizationId}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("Subscription deleted:", subscription.id);

        const organizationId = subscription.metadata?.organizationId;

        if (!organizationId) {
          console.error("Missing organizationId in subscription metadata");
          break;
        }

        // Réinitialiser les champs Stripe
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            stripeSubscriptionId: null,
            stripeSubscriptionPlan: null,
          },
        });

        // Désactiver la veille
        await prisma.veilleSubscription.update({
          where: { organizationId },
          data: {
            cantons: [],
            keywords: [],
          },
        });

        console.log(`Veille subscription cancelled for org ${organizationId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
