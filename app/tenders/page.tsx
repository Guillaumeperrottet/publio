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
      <div className="bg-white min-h-screen">
        {/* Contenu principal - Full width sans padding container */}
        <TendersCatalogClient
          initialTenders={tenders}
          initialFilters={filters}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </PublicLayout>
  );
}
