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
import { Search, X } from "lucide-react";
import { MarketType, TenderMode } from "@prisma/client";
import { CitySearchSelect } from "@/components/ui/city-search-select";

export type TenderFilters = {
  search?: string;
  canton?: string;
  city?: string;
  marketType?: MarketType;
  budgetMin?: number;
  budgetMax?: number;
  mode?: TenderMode;
};

type TenderFiltersProps = {
  filters: TenderFilters;
  onFiltersChange: (filters: TenderFilters) => void;
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

const marketTypes = [
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "ENGINEERING", label: "Ingénierie" },
  { value: "ARCHITECTURE", label: "Architecture" },
  { value: "IT_SERVICES", label: "Services IT" },
  { value: "CONSULTING", label: "Conseil" },
  { value: "SUPPLIES", label: "Fournitures" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Autre" },
];

export function TenderFilters({
  filters,
  onFiltersChange,
}: TenderFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TenderFilters>(filters);

  const handleFilterChange = (
    key: keyof TenderFilters,
    value: string | number | MarketType | TenderMode | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <div className="bg-white rounded-lg border-2 border-matte-black p-6 space-y-6">
      {/* Recherche */}
      <div>
        <Label htmlFor="search" className="text-sm font-semibold mb-2 block">
          Recherche
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Mots-clés, ville, projet..."
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Canton */}
      <div>
        <Label htmlFor="canton" className="text-sm font-semibold mb-2 block">
          Canton
        </Label>
        <Select
          value={localFilters.canton || "all"}
          onValueChange={(value) =>
            handleFilterChange("canton", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger id="canton">
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
      <div>
        <Label htmlFor="city" className="text-sm font-semibold mb-2 block">
          Ville ou code postal
        </Label>
        <CitySearchSelect
          value={localFilters.city}
          onChange={(value) => handleFilterChange("city", value)}
          canton={localFilters.canton}
          placeholder="Ex: Lausanne, 1000, Genève..."
        />
      </div>

      {/* Type de marché */}
      <div>
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
            {marketTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Budget (CHF)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
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
            />
          </div>
          <div>
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
            />
          </div>
        </div>
      </div>

      {/* Mode d'offres */}
      <div>
        <Label htmlFor="mode" className="text-sm font-semibold mb-2 block">
          Mode d&apos;offres
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
            <SelectValue placeholder="Tous les modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les modes</SelectItem>
            <SelectItem value="ANONYMOUS">Offres anonymes</SelectItem>
            <SelectItem value="CLASSIC">Offres classiques</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={applyFilters} className="flex-1">
          <Search className="w-4 h-4 mr-2" />
          Appliquer
        </Button>
        {hasActiveFilters && (
          <Button onClick={resetFilters} variant="outline">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
