import { Suspense } from "react";
import PublicLayout from "@/components/layout/public-layout";
import { getPublicTenders } from "@/features/tenders/actions";
import { getSavedTenderIds } from "@/features/tenders/saved-actions";
import { TendersCatalogClient } from "./client";
import { SkeletonCardList } from "@/components/ui/skeleton-card";
import {
  MarketType,
  TenderMode,
  TenderProcedure,
  SelectionPriority,
} from "@prisma/client";
import { getSession } from "@/lib/auth/session";

async function TendersContent({
  params,
}: {
  params: {
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
  };
}) {
  // Vérifier si l'utilisateur est connecté
  const session = await getSession();
  const isAuthenticated = !!session;

  // Récupérer les IDs des tenders sauvegardés si authentifié
  const savedTenderIds = isAuthenticated ? await getSavedTenderIds() : [];

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
    <TendersCatalogClient
      initialTenders={tenders}
      initialFilters={filters}
      isAuthenticated={isAuthenticated}
      savedTenderIds={savedTenderIds}
    />
  );
}

function TendersSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-10 w-64 bg-sand-light/50 rounded animate-pulse" />
          <div className="h-6 w-96 bg-sand-light/50 rounded animate-pulse" />
        </div>

        {/* Search bar skeleton */}
        <div className="mb-6 h-12 bg-sand-light/50 rounded animate-pulse" />

        {/* Filters skeleton */}
        <div className="mb-8 flex gap-2">
          <div className="h-10 w-32 bg-sand-light/50 rounded animate-pulse" />
          <div className="h-10 w-32 bg-sand-light/50 rounded animate-pulse" />
          <div className="h-10 w-32 bg-sand-light/50 rounded animate-pulse" />
        </div>

        {/* Cards grid skeleton */}
        <SkeletonCardList count={6} />
      </div>
    </div>
  );
}

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

  return (
    <PublicLayout>
      <Suspense fallback={<TendersSkeleton />}>
        <TendersContent params={params} />
      </Suspense>
    </PublicLayout>
  );
}
