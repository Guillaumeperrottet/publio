import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Créer une session Stripe Customer Portal
 * POST /api/stripe/create-portal-session
 *
 * Permet aux utilisateurs de :
 * - Gérer leurs moyens de paiement
 * - Consulter l'historique des factures
 * - Annuler/Réactiver leur abonnement
 * - Télécharger les factures PDF
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing organizationId" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de l'organisation
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId,
        role: { in: ["OWNER", "ADMIN"] }, // Seuls OWNER et ADMIN peuvent gérer la facturation
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { stripeCustomerId: true },
    });

    if (!organization?.stripeCustomerId) {
      return NextResponse.json(
        {
          error: "No Stripe customer found. Please subscribe to a plan first.",
        },
        { status: 400 }
      );
    }

    // Créer une session du portail client Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
