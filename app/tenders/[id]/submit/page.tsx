import ProtectedLayout from "@/components/layout/protected-layout";
import { getTenderById } from "@/features/tenders/actions";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { SubmitOfferStepper } from "@/components/offers/submit-offer-stepper";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function SubmitOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ offerId?: string }>;
}) {
  const { id } = await params;
  const { offerId } = await searchParams;
  const user = await getCurrentUser();
  const tender = await getTenderById(id);

  if (!tender) {
    notFound();
  }

  // Vérifier que l'utilisateur a une organisation
  const memberships = await getUserOrganizations();
  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  // Si offerId est fourni, récupérer le brouillon existant
  let existingOffer = null;
  if (offerId) {
    existingOffer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        documents: true,
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

    // Vérifier que le brouillon appartient à l'organisation
    if (
      existingOffer &&
      (existingOffer.organizationId !== organization.id ||
        existingOffer.status !== "DRAFT")
    ) {
      redirect(`/tenders/${id}/submit`);
    }
  }

  // Vérifier que l'utilisateur ne fait pas partie de l'organisation du tender
  const isOwner = tender.organization.members.some(
    (member: { userId: string }) => member.userId === user.id
  );

  if (isOwner) {
    // Rediriger vers la page du tender avec un message d'erreur
    redirect(`/tenders/${id}?error=own-tender`);
  }

  // Vérifier que le tender n'est pas expiré
  const now = new Date();
  const deadline = new Date(tender.deadline);
  const isExpired = now > deadline;

  if (isExpired) {
    redirect(`/tenders/${id}`);
  }

  // Vérifier que l'organisation n'est pas l'émettrice
  if (tender.organizationId === organization.id) {
    redirect(`/tenders/${id}`);
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={existingOffer ? "/dashboard/offers" : `/tenders/${id}`}
            className="text-sm text-muted-foreground hover:text-matte-black transition-colors"
          >
            ←{" "}
            {existingOffer ? "Retour à mes offres" : "Retour à l'appel d'offre"}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <HandDrawnHighlight variant="yellow">
              {existingOffer ? "Modifier votre offre" : "Soumettre une offre"}
            </HandDrawnHighlight>
          </h1>
          <p className="text-lg text-muted-foreground">
            {existingOffer ? "Modifiez" : "Déposez"} votre offre pour le projet{" "}
            <span className="font-semibold">{tender.title}</span>
          </p>
        </div>

        {/* Stepper complet */}
        <SubmitOfferStepper
          tender={{
            id: tender.id,
            title: tender.title,
            mode: tender.mode,
            currency: tender.currency,
            description: tender.description,
            budget: tender.budget || undefined,
          }}
          organization={organization}
          userId={user.id}
          existingOffer={existingOffer}
        />
      </div>
    </ProtectedLayout>
  );
}
