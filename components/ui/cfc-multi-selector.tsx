"use client";

import { useState, useRef, useEffect } from "react";
import {
  searchCFCCodes,
  getCFCByCode,
  type CFCCode,
  type CFCCategory,
} from "@/lib/constants/cfc-codes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus } from "lucide-react";

interface CFCMultiSelectorProps {
  value: string[]; // Codes CFC sélectionnés
  onChange: (codes: string[]) => void;
  category?: CFCCategory; // Catégorie pour filtrer les résultats
  label?: string;
  placeholder?: string;
  description?: string;
  maxSelection?: number; // Nombre maximum de sélections (optionnel)
}

export function CFCMultiSelector({
  value = [],
  onChange,
  category,
  label = "Codes de Frais de Construction (CFC)",
  placeholder = "Rechercher un code CFC (ex: 224 pour Couverture)...",
  description = "Sélectionnez les codes CFC correspondant aux différents corps de métier",
  maxSelection,
}: CFCMultiSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Récupérer les CFC sélectionnés avec leurs détails
  const selectedCFCs = value
    .map((code) => getCFCByCode(code))
    .filter((cfc): cfc is CFCCode => cfc !== undefined);

  // Calculer les résultats de recherche (exclure les déjà sélectionnés)
  const results = (
    searchTerm.length > 0 || category
      ? searchCFCCodes(searchTerm, 20, category)
      : searchCFCCodes("", 20)
  ).filter((cfc) => !value.includes(cfc.code));

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (cfc: CFCCode) => {
    if (maxSelection && value.length >= maxSelection) {
      return;
    }
    onChange([...value, cfc.code]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = (code: string) => {
    onChange(value.filter((c) => c !== code));
  };

  const canAddMore = !maxSelection || value.length < maxSelection;

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <Label className="text-base font-semibold">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Codes sélectionnés affichés en badges */}
      {selectedCFCs.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-2 border-artisan-yellow/30 bg-artisan-yellow/5 rounded-lg">
          {selectedCFCs.map((cfc) => (
            <Badge
              key={cfc.code}
              variant="outline"
              className="px-3 py-2 text-sm gap-2 bg-white border-artisan-yellow"
            >
              <span className="font-semibold">
                {cfc.code} - {cfc.label}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(cfc.code)}
                className="ml-1 hover:bg-artisan-yellow/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Champ de recherche pour ajouter des codes */}
      {canAddMore && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={
                category
                  ? "Rechercher dans la catégorie sélectionnée..."
                  : placeholder
              }
              className="pl-10"
            />
          </div>

          {/* Dropdown des résultats */}
          {isOpen && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <ul className="py-1">
                {results.map((cfc) => (
                  <li key={cfc.code}>
                    <button
                      type="button"
                      onClick={() => handleAdd(cfc)}
                      className="w-full px-4 py-3 text-left hover:bg-artisan-yellow/10 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-artisan-yellow shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {cfc.code} - {cfc.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Code CFC SIA 416
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isOpen && results.length === 0 && searchTerm.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Aucun code CFC trouvé pour &quot;{searchTerm}&quot;
              </div>
            </div>
          )}
        </>
      )}

      {maxSelection && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxSelection} codes sélectionnés
        </p>
      )}

      {/* Info helper */}
      <p className="text-xs text-muted-foreground">
        💡 Ajoutez tous les corps de métier concernés par votre projet
        (maçonnerie, électricité, sanitaire, etc.)
      </p>
    </div>
  );
}
