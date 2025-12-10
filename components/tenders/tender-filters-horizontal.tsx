"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  MarketType,
  TenderMode,
  TenderProcedure,
  SelectionPriority,
} from "@prisma/client";
import { CitySearchSelect } from "@/components/ui/city-search-select";
import { CFCMultiSelector } from "@/components/ui/cfc-multi-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

type TenderFiltersHorizontalProps = {
  filters: TenderFilters;
  onFiltersChange: (filters: TenderFilters) => void;
  resultsCount?: number;
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

export function TenderFiltersHorizontal({
  filters,
  onFiltersChange,
  resultsCount,
}: TenderFiltersHorizontalProps) {
  const [localFilters, setLocalFilters] = useState<TenderFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (
    key: keyof TenderFilters,
    value:
      | string
      | number
      | MarketType
      | TenderMode
      | TenderProcedure
      | SelectionPriority
      | boolean
      | string[]
      | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setShowAdvanced(false);
  };

  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setShowAdvanced(false);
  };

  const activeFiltersCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== ""
  ).length;
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="bg-white border-2 border-matte-black rounded-lg p-6 space-y-4">
      {/* Première ligne - Filtres principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Recherche */}
        <div className="lg:col-span-2">
          <Label
            htmlFor="search"
            className="text-xs font-semibold mb-1.5 block"
          >
            Recherche
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Mots-clés, projet..."
              value={localFilters.search || ""}
              onChange={(e) => {
                handleFilterChange("search", e.target.value);
                // Auto-apply sur la recherche
                const newFilters = { ...localFilters, search: e.target.value };
                onFiltersChange(newFilters);
              }}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Canton */}
        <div>
          <Label
            htmlFor="canton"
            className="text-xs font-semibold mb-1.5 block"
          >
            Canton
          </Label>
          <Select
            value={localFilters.canton || "all"}
            onValueChange={(value) => {
              const newValue = value === "all" ? undefined : value;
              handleFilterChange("canton", newValue);
              const newFilters = { ...localFilters, canton: newValue };
              onFiltersChange(newFilters);
            }}
          >
            <SelectTrigger id="canton" className="h-10">
              <SelectValue placeholder="Tous" />
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
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">
            Ville / NPA
          </Label>
          <CitySearchSelect
            value={localFilters.city}
            onChange={(value) => {
              handleFilterChange("city", value);
              const newFilters = { ...localFilters, city: value };
              onFiltersChange(newFilters);
            }}
            canton={localFilters.canton}
            placeholder="Lausanne, 1000..."
          />
        </div>

        {/* Codes CFC */}
        <div className="lg:col-span-2">
          <Label className="text-xs font-semibold mb-1.5 block">
            Codes CFC
          </Label>
          <CFCMultiSelector
            value={localFilters.cfcCodes || []}
            onChange={(codes) => {
              handleFilterChange("cfcCodes", codes);
              const newFilters = { ...localFilters, cfcCodes: codes };
              onFiltersChange(newFilters);
            }}
            placeholder="Ex: C22, 221, Maçonnerie..."
            label=""
            description=""
            maxSelection={5}
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* Bouton Filtres avancés */}
          <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres avancés
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-terra-cotta text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>Filtres avancés</DialogTitle>
                <DialogDescription>
                  Affinez votre recherche avec des critères supplémentaires
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 py-4">
                {/* Procédure */}
                <div>
                  <Label
                    htmlFor="procedure"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Type de procédure
                  </Label>
                  <Select
                    value={localFilters.procedure || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "procedure",
                        value === "all" ? undefined : (value as TenderProcedure)
                      )
                    }
                  >
                    <SelectTrigger id="procedure">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les procédures</SelectItem>
                      <SelectItem value="OPEN">Ouverte</SelectItem>
                      <SelectItem value="SELECTIVE">Sélective</SelectItem>
                      <SelectItem value="INVITATION">Sur invitation</SelectItem>
                      <SelectItem value="NEGOTIATED">Négociée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode d'offre */}
                <div>
                  <Label
                    htmlFor="mode"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Mode d&apos;offre
                  </Label>
                  <Select
                    value={localFilters.mode || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "mode",
                        value === "all" ? undefined : (value as TenderMode)
                      )
                    }
                  >
                    <SelectTrigger id="mode">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les modes</SelectItem>
                      <SelectItem value="ANONYMOUS">Anonyme</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priorité de sélection */}
                <div>
                  <Label
                    htmlFor="selectionPriority"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Critère prioritaire
                  </Label>
                  <Select
                    value={localFilters.selectionPriority || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "selectionPriority",
                        value === "all"
                          ? undefined
                          : (value as SelectionPriority)
                      )
                    }
                  >
                    <SelectTrigger id="selectionPriority">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les critères</SelectItem>
                      <SelectItem value="QUALITY_PRICE">
                        Qualité-Prix
                      </SelectItem>
                      <SelectItem value="LOWEST_PRICE">
                        Prix le plus bas
                      </SelectItem>
                      <SelectItem value="QUALITY">Qualité</SelectItem>
                      <SelectItem value="BEST_VALUE">
                        Meilleure valeur
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contrat reconductible */}
                <div>
                  <Label
                    htmlFor="isRenewable"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Type de contrat
                  </Label>
                  <Select
                    value={
                      localFilters.isRenewable === undefined
                        ? "all"
                        : localFilters.isRenewable
                        ? "yes"
                        : "no"
                    }
                    onValueChange={(value) =>
                      handleFilterChange(
                        "isRenewable",
                        value === "all" ? undefined : value === "yes"
                      )
                    }
                  >
                    <SelectTrigger id="isRenewable">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les contrats</SelectItem>
                      <SelectItem value="yes">Reconductible</SelectItem>
                      <SelectItem value="no">Ponctuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget min */}
                <div>
                  <Label
                    htmlFor="budgetMin"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Budget minimum (CHF)
                  </Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="Ex: 10000"
                    value={localFilters.budgetMin || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "budgetMin",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Budget max */}
                <div>
                  <Label
                    htmlFor="budgetMax"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Budget maximum (CHF)
                  </Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="Ex: 100000"
                    value={localFilters.budgetMax || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "budgetMax",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Surface min */}
                <div>
                  <Label
                    htmlFor="surfaceMin"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Surface minimum (m²)
                  </Label>
                  <Input
                    id="surfaceMin"
                    type="number"
                    placeholder="Ex: 50"
                    value={localFilters.surfaceMin || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "surfaceMin",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Surface max */}
                <div>
                  <Label
                    htmlFor="surfaceMax"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Surface maximum (m²)
                  </Label>
                  <Input
                    id="surfaceMax"
                    type="number"
                    placeholder="Ex: 200"
                    value={localFilters.surfaceMax || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "surfaceMax",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Date limite de (from) */}
                <div>
                  <Label
                    htmlFor="deadlineFrom"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Échéance à partir du
                  </Label>
                  <Input
                    id="deadlineFrom"
                    type="date"
                    value={localFilters.deadlineFrom || ""}
                    onChange={(e) =>
                      handleFilterChange("deadlineFrom", e.target.value)
                    }
                  />
                </div>

                {/* Date limite jusqu'à (to) */}
                <div>
                  <Label
                    htmlFor="deadlineTo"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Échéance jusqu&apos;au
                  </Label>
                  <Input
                    id="deadlineTo"
                    type="date"
                    value={localFilters.deadlineTo || ""}
                    onChange={(e) =>
                      handleFilterChange("deadlineTo", e.target.value)
                    }
                  />
                </div>

                {/* Type de marché */}
                <div className="col-span-2">
                  <Label
                    htmlFor="marketType"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Type de marché
                  </Label>
                  <Select
                    value={localFilters.marketType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "marketType",
                        value === "all" ? undefined : (value as MarketType)
                      )
                    }
                  >
                    <SelectTrigger id="marketType">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="WORKS">Travaux</SelectItem>
                      <SelectItem value="SUPPLIES">Fournitures</SelectItem>
                      <SelectItem value="SERVICES">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Réinitialiser */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="w-4 h-4 mr-2" />
              Effacer
            </Button>
          )}
        </div>

        {/* Nombre de résultats */}
        {resultsCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-matte-black">
              {resultsCount}
            </span>{" "}
            résultat
            {resultsCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
