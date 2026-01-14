import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Prix Stripe pour les abonnements Veille
 * À créer dans le dashboard Stripe : https://dashboard.stripe.com/products
 */
const VEILLE_PRICE_IDS = {
  VEILLE_BASIC: process.env.STRIPE_VEILLE_BASIC_PRICE_ID!,
  VEILLE_UNLIMITED: process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID!,
};

/**
 * Créer une session Stripe Checkout pour l'abonnement Veille
 * POST /api/stripe/create-veille-subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, planId } = body;

    if (!organizationId || !planId) {
      return NextResponse.json(
        { error: "Missing organizationId or planId" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Vérifier que le plan est valide
    if (planId !== "VEILLE_BASIC" && planId !== "VEILLE_UNLIMITED") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = VEILLE_PRICE_IDS[planId as keyof typeof VEILLE_PRICE_IDS];

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan ${planId}` },
        { status: 500 }
      );
    }

    // Récupérer ou créer le customer Stripe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { stripeCustomerId: true },
    });

    let customerId = organization?.stripeCustomerId;

    // Si pas de customer Stripe, en créer un
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          organizationId,
        },
        email: user.email,
      });

      customerId = customer.id;

      // Sauvegarder le customer ID
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    } else {
      // Vérifier que le customer existe dans Stripe
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error: unknown) {
        const stripeError = error as { statusCode?: number; code?: string };
        if (
          stripeError.statusCode === 404 ||
          stripeError.code === "resource_missing"
        ) {
          // Le customer n'existe plus dans Stripe, en créer un nouveau
          console.warn(
            `Customer ${customerId} not found in Stripe, creating new one`
          );

          const customer = await stripe.customers.create({
            metadata: {
              organizationId,
            },
            email: user.email,
          });

          customerId = customer.id;

          // Mettre à jour le customer ID
          await prisma.organization.update({
            where: { id: organizationId },
            data: { stripeCustomerId: customerId },
          });
        } else {
          throw error;
        }
      }
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/veille/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/veille/settings?canceled=true`,
      metadata: {
        organizationId,
        planId,
        type: "veille_subscription",
      },
      subscription_data: {
        metadata: {
          organizationId,
          planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating veille subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
