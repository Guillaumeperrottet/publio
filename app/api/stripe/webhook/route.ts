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

            // Créer une facture pour la publication du tender
            if (organizationId) {
              await prisma.invoice.create({
                data: {
                  number: `INV-TENDER-${tenderId
                    .substring(0, 8)
                    .toUpperCase()}`,
                  amount: (session.amount_total || 1000) / 100, // Convertir centimes → CHF
                  currency: (session.currency || "chf").toUpperCase(),
                  status: "PAID",
                  description: `Publication d'appel d'offres`,
                  stripePaymentIntentId: session.payment_intent as string,
                  paidAt: new Date(),
                  organizationId,
                },
              });
              console.log(`Invoice created for tender publication ${tenderId}`);
            }
          } else if (type === "offer_submission" && offerId) {
            // Confirmer le paiement de l'offre (logique ancienne, gardée pour compatibilité)
            await confirmOfferPayment(offerId, session.id);
            console.log(`Offer ${offerId} payment confirmed`);

            // Créer une facture pour le dépôt d'offre
            if (organizationId) {
              await prisma.invoice.create({
                data: {
                  number: `INV-OFFER-${offerId.substring(0, 8).toUpperCase()}`,
                  amount: (session.amount_total || 1000) / 100,
                  currency: (session.currency || "chf").toUpperCase(),
                  status: "PAID",
                  description: `Dépôt d'offre`,
                  stripePaymentIntentId: session.payment_intent as string,
                  paidAt: new Date(),
                  organizationId,
                },
              });
              console.log(`Invoice created for offer submission ${offerId}`);
            }
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

        // Récupérer les métadonnées pour identifier l'organisation
        const organizationId = paymentIntent.metadata?.organizationId;

        if (organizationId) {
          // Créer une facture avec statut FAILED
          await prisma.invoice.create({
            data: {
              number: `INV-FAILED-${Date.now()}`,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: "FAILED",
              description: "Échec de paiement",
              stripePaymentIntentId: paymentIntent.id,
              organizationId,
            },
          });

          console.log(
            `Payment failed invoice created for org ${organizationId}`
          );
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        console.log("Invoice paid:", invoice.id);

        let organizationId = invoice.metadata?.organizationId;

        // Si pas de métadonnées, chercher par customer ID
        if (!organizationId && invoice.customer) {
          const org = await prisma.organization.findFirst({
            where: { stripeCustomerId: invoice.customer as string },
          });
          if (org) {
            organizationId = org.id;
            console.log(`Found organization by customer: ${organizationId}`);
          }
        }

        if (!organizationId) {
          console.error("Could not find organization for invoice", invoice.id);
          break;
        }

        // Créer une facture dans notre base de données
        await prisma.invoice.create({
          data: {
            number: invoice.number || `INV-${Date.now()}`,
            amount: invoice.amount_paid / 100, // Convertir centimes → CHF
            currency: invoice.currency.toUpperCase(),
            status: "PAID",
            description:
              invoice.lines.data[0]?.description || "Abonnement Veille",
            stripeInvoiceId: invoice.id,
            stripePaymentIntentId: invoice.payment_intent as string,
            paidAt: invoice.status_transitions.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : new Date(),
            organizationId,
          },
        });

        console.log(`Invoice created in database for org ${organizationId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        console.log("Invoice payment failed:", invoice.id);

        let organizationId = invoice.metadata?.organizationId;

        // Si pas de métadonnées, chercher par customer ID
        if (!organizationId && invoice.customer) {
          const org = await prisma.organization.findFirst({
            where: { stripeCustomerId: invoice.customer as string },
          });
          if (org) {
            organizationId = org.id;
            console.log(`Found organization by customer: ${organizationId}`);
          }
        }

        if (!organizationId) {
          console.error("Could not find organization for invoice", invoice.id);
          break;
        }

        // Créer une facture avec statut FAILED
        await prisma.invoice.create({
          data: {
            number: invoice.number || `INV-FAILED-${Date.now()}`,
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            status: "FAILED",
            description:
              invoice.lines.data[0]?.description ||
              "Échec de paiement abonnement",
            stripeInvoiceId: invoice.id,
            stripePaymentIntentId: invoice.payment_intent as string,
            organizationId,
          },
        });

        console.log(
          `Failed invoice created in database for org ${organizationId}`
        );
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("Subscription event:", event.type, subscription.id);
        console.log("Subscription metadata:", subscription.metadata);
        console.log("Subscription customer:", subscription.customer);

        // Essayer de récupérer organizationId des métadonnées
        let organizationId = subscription.metadata?.organizationId;

        // Si pas dans les métadonnées, chercher via le stripeCustomerId
        if (!organizationId) {
          console.log(
            "No organizationId in metadata, searching by customer ID..."
          );
          const org = await prisma.organization.findFirst({
            where: { stripeCustomerId: subscription.customer as string },
          });

          if (org) {
            organizationId = org.id;
            console.log(`Found organization: ${organizationId}`);
          }
        }

        // TOUJOURS déterminer le plan depuis le price_id (ne pas faire confiance aux métadonnées)
        // Car Stripe ne met pas à jour les métadonnées lors d'un changement de plan via Customer Portal
        const priceId = subscription.items.data[0]?.price.id;
        console.log("Price ID from subscription:", priceId);

        let planId: string | null = null;
        if (priceId === process.env.STRIPE_VEILLE_BASIC_PRICE_ID) {
          planId = "VEILLE_BASIC";
        } else if (priceId === process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID) {
          planId = "VEILLE_UNLIMITED";
        }

        console.log("Determined plan:", planId);

        if (!organizationId) {
          console.error(
            "Could not determine organizationId for subscription:",
            subscription.id
          );
          break;
        }

        if (!planId) {
          console.error(
            "Could not determine planId for subscription:",
            subscription.id
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

        console.log(
          `Organization ${organizationId} updated with plan ${planId}`
        );

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
            // Mettre à jour si nécessaire
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
