"use client";

import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { COMMUNES_ROMANDES, type Commune } from "@/features/veille/types";

interface CommuneSelectorProps {
  selectedCommunes: string[];
  onChange: (communes: string[]) => void;
  maxCommunes?: number;
  disabled?: boolean;
}

export function CommuneSelector({
  selectedCommunes,
  onChange,
  maxCommunes = -1,
  disabled = false,
}: CommuneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Grouper les communes par canton
  const communesByCanton = COMMUNES_ROMANDES.reduce((acc, commune) => {
    if (!acc[commune.canton]) {
      acc[commune.canton] = [];
    }
    acc[commune.canton].push(commune);
    return acc;
  }, {} as Record<string, Commune[]>);

  const canAddMore =
    maxCommunes === -1 || selectedCommunes.length < maxCommunes;
  const isMaxReached =
    maxCommunes !== -1 && selectedCommunes.length >= maxCommunes;

  const handleSelect = (communeName: string) => {
    if (selectedCommunes.includes(communeName)) {
      // Retirer la commune
      onChange(selectedCommunes.filter((c) => c !== communeName));
    } else {
      // Ajouter la commune (si limite non atteinte)
      if (canAddMore) {
        onChange([...selectedCommunes, communeName]);
      }
    }
  };

  const handleRemove = (communeName: string) => {
    onChange(selectedCommunes.filter((c) => c !== communeName));
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || isMaxReached}
          >
            {selectedCommunes.length === 0
              ? "Sélectionner des communes..."
              : `${selectedCommunes.length} commune${
                  selectedCommunes.length > 1 ? "s" : ""
                } sélectionnée${selectedCommunes.length > 1 ? "s" : ""}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[600px] p-0 bg-white shadow-lg border"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Rechercher une commune..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>Aucune commune trouvée.</CommandEmpty>

              {Object.entries(communesByCanton).map(([canton, communes]) => {
                // Filtrer les communes selon la recherche
                const filteredCommunes = searchTerm
                  ? communes.filter((c) =>
                      c.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  : communes;

                if (filteredCommunes.length === 0) return null;

                return (
                  <CommandGroup key={canton} heading={`Canton ${canton}`}>
                    {filteredCommunes.map((commune) => {
                      const isSelected = selectedCommunes.includes(
                        commune.name
                      );
                      const isDisabled = !isSelected && !canAddMore;

                      return (
                        <CommandItem
                          key={commune.name}
                          value={commune.name}
                          onSelect={() => handleSelect(commune.name)}
                          disabled={isDisabled}
                          className={isDisabled ? "opacity-50" : ""}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              isSelected ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div className="flex-1">
                            <span>{commune.name}</span>
                            {commune.npa && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({commune.npa})
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {commune.canton}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Liste des communes sélectionnées */}
      {selectedCommunes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCommunes.map((communeName) => {
            const commune = COMMUNES_ROMANDES.find(
              (c) => c.name === communeName
            );
            return (
              <Badge
                key={communeName}
                variant="secondary"
                className="pl-3 pr-1 py-1"
              >
                <span className="mr-1">{communeName}</span>
                {commune && (
                  <span className="text-xs text-muted-foreground mr-2">
                    ({commune.canton})
                  </span>
                )}
                <button
                  onClick={() => handleRemove(communeName)}
                  disabled={disabled}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Afficher la limite */}
      {maxCommunes !== -1 && (
        <p className="text-sm text-muted-foreground">
          {selectedCommunes.length} / {maxCommunes} commune
          {maxCommunes > 1 ? "s" : ""} sélectionnée
          {selectedCommunes.length > 1 ? "s" : ""}
          {isMaxReached && (
            <span className="text-amber-600 ml-2">
              Limite atteinte. Passez à un plan supérieur pour ajouter plus de
              communes.
            </span>
          )}
        </p>
      )}
    </div>
  );
}
