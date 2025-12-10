"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TenderCard } from "@/components/tenders/tender-card";
import {
  TenderFilters as TenderFiltersType,
  TenderFiltersHorizontal,
} from "@/components/tenders/tender-filters-horizontal";
import { SaveSearchButton } from "@/components/search/save-search-button";
import { Button } from "@/components/ui/button";

type Tender = {
  id: string;
  title: string;
  description: string;
  budget?: number | null;
  deadline: Date;
  location?: string | null;
  city?: string | null;
  canton?: string | null;
  marketType: string;
  mode: string;
  createdAt: Date;
  organization: {
    name: string;
    type: string;
    city?: string | null;
    canton?: string | null;
  };
  _count: {
    offers: number;
  };
};

type TendersCatalogClientProps = {
  initialTenders: Tender[];
  initialFilters: TenderFiltersType;
};

export function TendersCatalogClient({
  initialTenders,
  initialFilters,
}: TendersCatalogClientProps) {
  const router = useRouter();

  const handleFiltersChange = (newFilters: TenderFiltersType) => {
    // Construire les paramètres URL
    const params = new URLSearchParams();

    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.canton) params.set("canton", newFilters.canton);
    if (newFilters.city) params.set("city", newFilters.city);
    if (newFilters.marketType) params.set("marketType", newFilters.marketType);
    if (newFilters.budgetMin)
      params.set("budgetMin", newFilters.budgetMin.toString());
    if (newFilters.budgetMax)
      params.set("budgetMax", newFilters.budgetMax.toString());
    if (newFilters.mode) params.set("mode", newFilters.mode);
    if (newFilters.procedure) params.set("procedure", newFilters.procedure);
    if (newFilters.selectionPriority)
      params.set("selectionPriority", newFilters.selectionPriority);
    if (newFilters.deadlineFrom)
      params.set("deadlineFrom", newFilters.deadlineFrom);
    if (newFilters.deadlineTo) params.set("deadlineTo", newFilters.deadlineTo);
    if (newFilters.surfaceMin)
      params.set("surfaceMin", newFilters.surfaceMin.toString());
    if (newFilters.surfaceMax)
      params.set("surfaceMax", newFilters.surfaceMax.toString());
    if (newFilters.isRenewable !== undefined)
      params.set("isRenewable", newFilters.isRenewable.toString());
    if (newFilters.cfcCodes && newFilters.cfcCodes.length > 0)
      params.set("cfcCodes", newFilters.cfcCodes.join(","));

    // Naviguer avec les nouveaux filtres
    router.push(`/tenders?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Filtres horizontaux en haut */}
      <TenderFiltersHorizontal
        filters={initialFilters}
        onFiltersChange={handleFiltersChange}
        resultsCount={initialTenders.length}
      />

      {/* Actions */}
      <div className="flex items-center justify-end">
        <SaveSearchButton filters={initialFilters} />
      </div>

      {/* Grille des appels d'offres */}
      {initialTenders.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block p-8 bg-sand-light rounded-lg">
            <p className="text-lg text-muted-foreground mb-2">
              Aucun appel d&apos;offres trouvé
            </p>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {initialTenders.map((tender) => (
            <TenderCard key={tender.id} tender={tender} />
          ))}
        </div>
      )}
    </div>
  );
}
