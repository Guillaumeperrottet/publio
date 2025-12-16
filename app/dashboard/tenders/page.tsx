import { Suspense } from "react";
import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getOrganizationTenders } from "@/features/tenders/actions";
import { TendersTable } from "@/components/tenders/tenders-table";
import { SkeletonTable } from "@/components/ui/skeleton-table";

async function DashboardTendersContent() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;
  const userRole = currentMembership.role;

  // Vérifier si l'utilisateur peut créer des tenders
  const canCreateTender = ["OWNER", "ADMIN", "EDITOR"].includes(userRole);

  // Récupérer les appels d'offres de l'organisation
  const tenders = await getOrganizationTenders(organization.id);

  return (
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
        {canCreateTender && (
          <Link href="/dashboard/tenders/new">
            <Button
              size="lg"
              className="mt-4 md:mt-0 gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-semibold border-2 border-matte-black transition-all hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Créer un appel d&apos;offre
            </Button>
          </Link>
        )}
      </div>

      {/* Table des tenders */}
      <TendersTable tenders={tenders} organizationId={organization.id} />
    </div>
  );
}

function DashboardTendersSkeleton() {
  return (
    <div className="p-6 md:p-8 bg-white min-h-full">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="h-10 w-80 bg-sand-light/50 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-sand-light/50 rounded animate-pulse" />
        </div>
        <div className="h-12 w-48 bg-sand-light/50 rounded animate-pulse mt-4 md:mt-0" />
      </div>

      {/* Table skeleton */}
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}

export default function DashboardTendersPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<DashboardTendersSkeleton />}>
        <DashboardTendersContent />
      </Suspense>
    </ProtectedLayout>
  );
}
