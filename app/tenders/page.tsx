import PublicLayout from "@/components/layout/public-layout";
import { getPublicTenders } from "@/features/tenders/actions";
import { TendersCatalogClient } from "./client";
import {
  MarketType,
  TenderMode,
  TenderProcedure,
  SelectionPriority,
} from "@prisma/client";
import { getSession } from "@/lib/auth/session";

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    canton?: string;
    city?: string;
    marketType?: string;
    budgetMin?: string;
    budgetMax?: string;
    mode?: string;
    procedure?: string;
    selectionPriority?: string;
    deadlineFrom?: string;
    deadlineTo?: string;
    surfaceMin?: string;
    surfaceMax?: string;
    isRenewable?: string;
    cfcCodes?: string;
  }>;
}) {
  const params = await searchParams;

  // Vérifier si l'utilisateur est connecté
  const session = await getSession();
  const isAuthenticated = !!session;

  // Convertir les paramètres URL en filtres
  const filters = {
    search: params.search,
    canton: params.canton,
    city: params.city,
    marketType: params.marketType as MarketType | undefined,
    budgetMin: params.budgetMin ? parseInt(params.budgetMin) : undefined,
    budgetMax: params.budgetMax ? parseInt(params.budgetMax) : undefined,
    mode: params.mode as TenderMode | undefined,
    procedure: params.procedure as TenderProcedure | undefined,
    selectionPriority: params.selectionPriority as
      | SelectionPriority
      | undefined,
    deadlineFrom: params.deadlineFrom,
    deadlineTo: params.deadlineTo,
    surfaceMin: params.surfaceMin ? parseFloat(params.surfaceMin) : undefined,
    surfaceMax: params.surfaceMax ? parseFloat(params.surfaceMax) : undefined,
    isRenewable:
      params.isRenewable === "true"
        ? true
        : params.isRenewable === "false"
        ? false
        : undefined,
    cfcCodes: params.cfcCodes ? params.cfcCodes.split(",") : undefined,
  };

  const tenders = await getPublicTenders(filters);

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen relative overflow-hidden">
        {/* Formes grises décoratives */}
        <div className="absolute -left-32 top-40 w-[500px] h-[500px] bg-gray-100 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute -right-40 bottom-40 w-[600px] h-[600px] bg-gray-100 rounded-full opacity-25 pointer-events-none" />

        {/* Hero Header - Réduit */}
        <div className="border-b border-gray-100 relative z-10">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Appels d&apos;offres
              </h1>
              <p className="text-sm text-muted-foreground">
                Découvrez les projets publics et privés en Suisse romande.
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 md:px-6 py-6 relative z-10">
          <TendersCatalogClient
            initialTenders={tenders}
            initialFilters={filters}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
