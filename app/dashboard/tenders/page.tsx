import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getOrganizationTenders } from "@/features/tenders/actions";
import { TendersList } from "@/components/tenders/tenders-list";

export default async function DashboardTendersPage() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  // Récupérer les appels d'offres de l'organisation
  const tenders = await getOrganizationTenders(organization.id);

  return (
    <ProtectedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <HandDrawnHighlight variant="yellow">
                Mes appels d&apos;offres
              </HandDrawnHighlight>
            </h1>
            <p className="text-lg text-muted-foreground">
              Gérez vos appels d&apos;offres et consultez les offres reçues
            </p>
          </div>
          <Link href="/dashboard/tenders/new">
            <Button size="lg" className="mt-4 md:mt-0">
              <Plus className="w-5 h-5 mr-2" />
              Créer un appel d&apos;offre
            </Button>
          </Link>
        </div>

        {/* Liste des tenders */}
        <TendersList tenders={tenders} organizationId={organization.id} />
      </div>
    </ProtectedLayout>
  );
}
