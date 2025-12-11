import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db/prisma";

/**
 * Récupérer l'URL du PDF d'une facture Stripe
 * GET /api/stripe/invoice/[invoiceId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripeInvoiceId = params.invoiceId;

    if (!stripeInvoiceId) {
      return NextResponse.json(
        { error: "Missing invoice ID" },
        { status: 400 }
      );
    }

    // Récupérer la facture de la base de données pour vérifier l'accès
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId },
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

    if (!invoice || invoice.organization.members.length === 0) {
      return NextResponse.json(
        { error: "Invoice not found or access denied" },
        { status: 403 }
      );
    }

    // Récupérer l'URL du PDF depuis Stripe
    const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId);

    if (!stripeInvoice.invoice_pdf) {
      return NextResponse.json({ error: "PDF not available" }, { status: 404 });
    }

    return NextResponse.json({
      url: stripeInvoice.invoice_pdf,
      number: stripeInvoice.number,
    });
  } catch (error) {
    console.error("Error fetching invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice PDF" },
      { status: 500 }
    );
  }
}
