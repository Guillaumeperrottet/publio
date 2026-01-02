import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getTenderById } from "@/features/tenders/actions";
import { prisma } from "@/lib/db/prisma";
import { AwardedSuccessContent } from "@/components/tenders/awarded-success-content";
import ProtectedLayout from "@/components/layout/protected-layout";

export default async function TenderAwardedSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const organization = memberships[0].organization;

  // Récupérer le tender
  const tender = await getTenderById(id);

  console.log("=== AWARDED PAGE DEBUG ===");
  console.log("Tender:", tender?.id, "Status:", tender?.status);
  console.log("Organization from membership:", organization.id);
  console.log("Tender organizationId:", tender?.organizationId);

  if (!tender) {
    console.log("REDIRECT: Tender not found");
    notFound();
  }

  // Vérifier que le tender a bien été attribué
  if (tender.status !== "AWARDED") {
    console.log("REDIRECT: Status is not AWARDED, it's:", tender.status);
    redirect(`/dashboard/tenders/${id}`);
  }

  // Récupérer l'offre gagnante
  const winningOffer = await prisma.offer.findFirst({
    where: {
      tenderId: id,
      status: "AWARDED",
    },
    include: {
      organization: true,
    },
  });

  console.log("Winning offer:", winningOffer?.id);
  console.log("Winning offer organizationId:", winningOffer?.organizationId);

  if (!winningOffer) {
    console.log("REDIRECT: No winning offer found");
    redirect(`/dashboard/tenders/${id}`);
  }

  // Vérifier que l'utilisateur est soit l'émetteur du tender, soit le gagnant
  const isEmitter = tender.organizationId === organization.id;
  const isWinner = winningOffer.organizationId === organization.id;

  console.log("Is emitter?", isEmitter);
  console.log("Is winner?", isWinner);

  if (!isEmitter && !isWinner) {
    console.log("REDIRECT: User is neither emitter nor winner");
    redirect("/dashboard/tenders");
  }

  console.log("=== ALL CHECKS PASSED - RENDERING PAGE ===");

  return (
    <ProtectedLayout>
      <AwardedSuccessContent
        tender={tender}
        winningOffer={winningOffer}
        emitterOrganization={tender.organization}
        isWinner={isWinner}
      />
    </ProtectedLayout>
  );
}
