import { Suspense } from "react";
import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { getOrganizationOffers } from "@/features/offers/actions";
import { MyOffersTable } from "@/components/offers/my-offers-table";
import { SkeletonTable } from "@/components/ui/skeleton-table";

async function OffersContent() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  // Récupérer les offres de l'organisation
  const offers = await getOrganizationOffers(organization.id);

  return <MyOffersTable offers={offers} />;
}

function OffersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="h-10 w-80 bg-sand-light/50 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-sand-light/50 rounded animate-pulse" />
          <div className="h-9 w-32 bg-sand-light/50 rounded animate-pulse" />
          <div className="h-9 w-32 bg-sand-light/50 rounded animate-pulse" />
        </div>
      </div>
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

export default function DashboardOffersPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <HandDrawnHighlight variant="yellow">
              Mes offres déposées
            </HandDrawnHighlight>
          </h1>
          <p className="text-muted-foreground">
            Consultez toutes les offres soumises par votre organisation
          </p>
        </div>

        {/* Table des offres */}
        <Suspense fallback={<OffersSkeleton />}>
          <OffersContent />
        </Suspense>
      </div>
    </ProtectedLayout>
  );
}
