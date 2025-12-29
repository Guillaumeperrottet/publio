import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { OfferSuccessContent } from "@/components/offers/offer-success-content";

export default async function OfferSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ offerId?: string }>;
}) {
  const user = await getCurrentUser();
  const { id: tenderId } = await params;
  const { offerId } = await searchParams;

  if (!offerId) {
    redirect(`/tenders/${tenderId}`);
  }

  // Récupérer l'offre avec toutes les infos
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      tender: {
        select: {
          id: true,
          title: true,
          deadline: true,
          mode: true,
          organization: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!offer) {
    redirect(`/tenders/${tenderId}`);
  }

  // Vérifier que l'utilisateur a le droit de voir cette page
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: offer.organizationId,
      userId: user.id,
    },
  });

  if (!membership) {
    redirect(`/tenders/${tenderId}`);
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <OfferSuccessContent offer={offer} />
    </Suspense>
  );
}
