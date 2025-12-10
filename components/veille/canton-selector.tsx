"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Canton } from "@/features/veille/types";
import { CANTONS_ROMANDS } from "@/features/veille/types";

interface CantonSelectorProps {
  value: Canton[];
  onChange: (cantons: Canton[]) => void;
  maxCantons?: number;
  placeholder?: string;
}

export function CantonSelector({
  value,
  onChange,
  maxCantons,
  placeholder = "Sélectionnez des cantons...",
}: CantonSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (canton: Canton) => {
    const isSelected = value.includes(canton);

    if (isSelected) {
      // Désélectionner
      onChange(value.filter((c) => c !== canton));
    } else {
      // Vérifier la limite
      if (maxCantons && value.length >= maxCantons) {
        return;
      }
      // Sélectionner
      onChange([...value, canton]);
    }
  };

  const handleRemove = (canton: Canton) => {
    onChange(value.filter((c) => c !== canton));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {value.length === 0
                ? placeholder
                : `${value.length} canton${
                    value.length > 1 ? "s" : ""
                  } sélectionné${value.length > 1 ? "s" : ""}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-white" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un canton..." />
            <CommandEmpty>Aucun canton trouvé.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {CANTONS_ROMANDS.map((canton) => {
                const isSelected = value.includes(canton.code);
                const isDisabled =
                  !isSelected &&
                  maxCantons !== undefined &&
                  value.length >= maxCantons;

                return (
                  <CommandItem
                    key={canton.code}
                    value={canton.name}
                    onSelect={() => handleSelect(canton.code)}
                    disabled={isDisabled}
                    className={cn(
                      "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{canton.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {canton.nameFull}
                      </span>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {canton.code}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Afficher les cantons sélectionnés */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((cantonCode) => {
            const canton = CANTONS_ROMANDS.find((c) => c.code === cantonCode);
            if (!canton) return null;

            return (
              <Badge
                key={canton.code}
                variant="secondary"
                className="gap-1 pr-1"
              >
                <span className="font-medium">{canton.code}</span>
                <span className="text-muted-foreground">-</span>
                <span>{canton.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0.5 hover:bg-transparent"
                  onClick={() => handleRemove(canton.code)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Message d'aide */}
      {maxCantons && (
        <p className="text-sm text-muted-foreground">
          {value.length} / {maxCantons} canton{maxCantons > 1 ? "s" : ""}{" "}
          sélectionné{maxCantons > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
