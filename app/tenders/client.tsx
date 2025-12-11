"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TenderCard } from "@/components/tenders/tender-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Bookmark, Bell } from "lucide-react";
import {
  MarketType,
  TenderMode,
  TenderProcedure,
  SelectionPriority,
} from "@prisma/client";
import { CitySearchSelect } from "@/components/ui/city-search-select";
import { SaveSearchDialog } from "@/components/search/save-search-dialog";

export type TenderFilters = {
  search?: string;
  canton?: string;
  city?: string;
  marketType?: MarketType;
  budgetMin?: number;
  budgetMax?: number;
  mode?: TenderMode;
  procedure?: TenderProcedure;
  selectionPriority?: SelectionPriority;
  deadlineFrom?: string;
  deadlineTo?: string;
  surfaceMin?: number;
  surfaceMax?: number;
  isRenewable?: boolean;
  cfcCodes?: string[];
};

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
  initialFilters: TenderFilters;
  isAuthenticated: boolean;
};

const cantons = [
  "VD",
  "VS",
  "GE",
  "FR",
  "NE",
  "JU",
  "BE",
  "ZH",
  "LU",
  "UR",
  "SZ",
  "OW",
  "NW",
  "GL",
  "ZG",
  "SO",
  "BS",
  "BL",
  "SH",
  "AR",
  "AI",
  "SG",
  "GR",
  "AG",
  "TG",
  "TI",
];

export function TendersCatalogClient({
  initialTenders,
  initialFilters,
  isAuthenticated,
}: TendersCatalogClientProps) {
  const router = useRouter();
  const [localFilters, setLocalFilters] =
    useState<TenderFilters>(initialFilters);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const handleFilterChange = (key: keyof TenderFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filters: TenderFilters) => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.canton) params.set("canton", filters.canton);
    if (filters.city) params.set("city", filters.city);
    if (filters.marketType) params.set("marketType", filters.marketType);
    if (filters.budgetMin)
      params.set("budgetMin", filters.budgetMin.toString());
    if (filters.budgetMax)
      params.set("budgetMax", filters.budgetMax.toString());
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.procedure) params.set("procedure", filters.procedure);
    if (filters.selectionPriority)
      params.set("selectionPriority", filters.selectionPriority);
    if (filters.deadlineFrom) params.set("deadlineFrom", filters.deadlineFrom);
    if (filters.deadlineTo) params.set("deadlineTo", filters.deadlineTo);
    if (filters.surfaceMin)
      params.set("surfaceMin", filters.surfaceMin.toString());
    if (filters.surfaceMax)
      params.set("surfaceMax", filters.surfaceMax.toString());
    if (filters.isRenewable !== undefined)
      params.set("isRenewable", filters.isRenewable.toString());
    if (filters.cfcCodes && filters.cfcCodes.length > 0)
      params.set("cfcCodes", filters.cfcCodes.join(","));

    router.push(`/tenders?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocalFilters({});
    router.push("/tenders");
  };

  const activeFiltersCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== "" && v !== null
  ).length;
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Sidebar - Sticky on desktop, toggleable on mobile */}
      <aside className="lg:w-80 bg-white border-r border-gray-200 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filtres
            </h2>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Canton */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Canton</label>
            <Select
              value={localFilters.canton || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "canton",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="border-2 border-matte-black">
                <SelectValue placeholder="Tous les cantons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cantons</SelectItem>
                {cantons.map((canton) => (
                  <SelectItem key={canton} value={canton}>
                    {canton}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ville */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Ville / NPA</label>
            <CitySearchSelect
              value={localFilters.city}
              onChange={(value) => handleFilterChange("city", value)}
              canton={localFilters.canton}
            />
          </div>

          {/* Type de marché */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Type</label>
            <Select
              value={localFilters.marketType || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "marketType",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="border-2 border-matte-black">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="WORKS">Travaux</SelectItem>
                <SelectItem value="SERVICES">Services</SelectItem>
                <SelectItem value="SUPPLIES">Fournitures</SelectItem>
                <SelectItem value="CONCESSION">Concession</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Budget (CHF)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.budgetMin || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "budgetMin",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="border-2 border-matte-black"
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.budgetMax || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "budgetMax",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="border-2 border-matte-black"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Échéance</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={localFilters.deadlineFrom || ""}
                onChange={(e) =>
                  handleFilterChange("deadlineFrom", e.target.value)
                }
                className="border-2 border-matte-black text-xs"
              />
              <Input
                type="date"
                value={localFilters.deadlineTo || ""}
                onChange={(e) =>
                  handleFilterChange("deadlineTo", e.target.value)
                }
                className="border-2 border-matte-black text-xs"
              />
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Mode</label>
            <Select
              value={localFilters.mode || "all"}
              onValueChange={(value) =>
                handleFilterChange("mode", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="border-2 border-matte-black">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="OPEN">Ouvert</SelectItem>
                <SelectItem value="SELECTIVE">Sélectif</SelectItem>
                <SelectItem value="DIRECT">Direct</SelectItem>
                <SelectItem value="INVITATION">Invitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Search Bar - Large and prominent */}
        <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 md:px-6 py-6">
            <div className="relative max-w-4xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                placeholder="Rechercher par mots-clés, projet, entreprise..."
                value={localFilters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-14 pr-4 h-14 text-lg border-2 border-matte-black focus-visible:ring-artisan-yellow"
              />
            </div>
          </div>
        </div>

        {/* Quick Filters & Results Count */}
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Left side - Results count */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">
                  {initialTenders.length} projet
                  {initialTenders.length > 1 ? "s" : ""}
                </span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-artisan-yellow text-artisan-yellow"
                  >
                    {activeFiltersCount} filtre
                    {activeFiltersCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Right side - Save search + Quick filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Save Search Button - Appears when filters are active */}
              {hasActiveFilters && (
                <SaveSearchDialog
                  filters={localFilters}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {/* Quick action filters */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-matte-black hover:bg-artisan-yellow hover:text-matte-black"
                >
                  Nouveaux
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-matte-black hover:bg-artisan-yellow hover:text-matte-black"
                >
                  Urgent
                </Button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {initialTenders.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-12 bg-white border-2 border-matte-black rounded-lg">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">
                  Aucun projet trouvé
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-2 border-matte-black"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
              {initialTenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
