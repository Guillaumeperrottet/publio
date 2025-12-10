import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { getOrganizationOffers } from "@/features/offers/actions";
import { OffersList } from "@/components/tenders/offers-list";

export default async function DashboardOffersPage() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  // Récupérer les offres de l'organisation
  const offers = await getOrganizationOffers(organization.id);

  return (
    <ProtectedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <HandDrawnHighlight variant="yellow">
              Mes offres déposées
            </HandDrawnHighlight>
          </h1>
          <p className="text-lg text-muted-foreground">
            Consultez toutes les offres soumises par votre organisation
          </p>
        </div>

        {/* Liste des offres */}
        <OffersList offers={offers} />
      </div>
    </ProtectedLayout>
  );
}
