// API route pour générer le PDF d'une offre
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { generateOfferPDF } from "@/lib/pdf/offer-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { offerId } = await params;

    // Récupérer l'offre avec toutes les relations nécessaires
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        organization: true,
        tender: {
          include: {
            organization: true,
          },
        },
        lineItems: {
          orderBy: { position: "asc" },
        },
        inclusions: {
          orderBy: { position: "asc" },
        },
        exclusions: {
          orderBy: { position: "asc" },
        },
        materials: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    // Vérifier les droits : soit l'émetteur de l'offre, soit le propriétaire du tender
    const isOfferOwner = await prisma.organizationMember.findFirst({
      where: {
        organizationId: offer.organizationId,
        userId: user.id,
      },
    });

    const isTenderOwner = await prisma.organizationMember.findFirst({
      where: {
        organizationId: offer.tender.organizationId,
        userId: user.id,
      },
    });

    if (!isOfferOwner && !isTenderOwner) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Préparer les données pour le PDF
    const pdfData = {
      offerNumber:
        offer.offerNumber || `OFF-${offer.id.substring(0, 8).toUpperCase()}`,
      offerDate: offer.submittedAt || offer.createdAt,
      validityDays: offer.validityDays,
      organization: {
        name: offer.organization.name,
        address: offer.organization.address,
        city: offer.organization.city,
        canton: offer.organization.canton,
        country: offer.organization.country,
        phone: offer.organization.phone,
        email: offer.organization.email,
        website: offer.organization.website,
      },
      tender: {
        title: offer.tender.title,
        organization: {
          name: offer.tender.organization.name,
          address: offer.tender.organization.address,
          city: offer.tender.organization.city,
          phone: offer.tender.organization.phone,
          email: offer.tender.organization.email,
        },
      },
      projectSummary: offer.projectSummary,
      inclusions: offer.inclusions,
      exclusions: offer.exclusions,
      materials: offer.materials.map((m) => ({
        name: m.name,
        brand: m.brand || undefined,
        model: m.model || undefined,
        manufacturerWarranty: m.manufacturerWarranty || undefined,
      })),
      priceType: offer.priceType as "GLOBAL" | "DETAILED",
      currency: offer.currency,
      lineItems: offer.lineItems.map((item) => ({
        position: item.position,
        description: item.description,
        quantity: item.quantity || undefined,
        unit: item.unit || undefined,
        priceHT: item.priceHT,
        tvaRate: item.tvaRate,
      })),
      price: offer.price,
      totalHT: offer.totalHT || undefined,
      totalTVA: offer.totalTVA || undefined,
      tvaRate: offer.tvaRate,
      timeline: offer.timeline || undefined,
      startDate: offer.startDate,
      durationDays: offer.durationDays || undefined,
      constraints: offer.constraints || undefined,
      paymentTerms: offer.paymentTerms as
        | {
            deposit?: number;
            intermediate?: number;
            final?: number;
            netDays?: number;
          }
        | undefined,
      warrantyYears: offer.warrantyYears || undefined,
      insuranceAmount: offer.insuranceAmount || undefined,
    };

    // Générer le PDF
    const pdfBuffer = await generateOfferPDF(pdfData);

    // Retourner le PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="offre-${pdfData.offerNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
