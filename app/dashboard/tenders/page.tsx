import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getOrganizationTenders } from "@/features/tenders/actions";
import { TendersTable } from "@/components/tenders/tenders-table";

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
      <div className="p-6 md:p-8 bg-white min-h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <HandDrawnHighlight variant="yellow">
                Mes appels d&apos;offres
              </HandDrawnHighlight>
            </h1>
            <p className="text-muted-foreground">
              Gérez vos appels d&apos;offres et consultez les offres reçues
            </p>
          </div>
          <Link href="/dashboard/tenders/new">
            <Button
              size="lg"
              className="mt-4 md:mt-0 gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-semibold border-2 border-matte-black transition-all hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Créer un appel d&apos;offre
            </Button>
          </Link>
        </div>

        {/* Table des tenders */}
        <TendersTable tenders={tenders} organizationId={organization.id} />
      </div>
    </ProtectedLayout>
  );
}
