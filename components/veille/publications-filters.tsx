"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { PUBLICATION_TYPE_LABELS } from "@/features/veille/types";

interface PublicationsFiltersProps {
  communes: string[];
  selectedCommune: string | null;
  onCommuneChange: (commune: string | null) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  sources: string[];
  selectedSource: string | null;
  onSourceChange: (source: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function PublicationsFilters({
  communes,
  selectedCommune,
  onCommuneChange,
  selectedType,
  onTypeChange,
  sources,
  selectedSource,
  onSourceChange,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: PublicationsFiltersProps) {
  const hasActiveFilters =
    selectedCommune || selectedType || selectedSource || searchQuery.length > 0;

  const clearFilters = () => {
    onCommuneChange(null);
    onTypeChange(null);
    onSourceChange(null);
    onSearchChange("");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher dans les publications..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedCommune || "all"}
          onValueChange={(value) =>
            onCommuneChange(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Toutes les communes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les communes</SelectItem>
            {communes.map((commune) => (
              <SelectItem key={commune} value={commune}>
                {commune}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedType || "all"}
          onValueChange={(value) =>
            onTypeChange(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(PUBLICATION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {sources.length > 0 && (
          <Select
            value={selectedSource || "all"}
            onValueChange={(value) =>
              onSourceChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Toutes les sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {filteredCount === totalCount ? (
            <span>
              <strong>{totalCount}</strong> publication
              {totalCount > 1 ? "s" : ""}
            </span>
          ) : (
            <span>
              <strong>{filteredCount}</strong> sur {totalCount} publication
              {totalCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            Filtres actifs
          </Badge>
        )}
      </div>
    </div>
  );
}
