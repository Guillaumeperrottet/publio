"use client";

import { useState, useEffect, useRef } from "react";
import {
  searchCFCCodes,
  type CFCCode,
  type CFCCategory,
} from "@/lib/constants/cfc-codes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

interface CFCSelectorProps {
  value?: string; // Code CFC sélectionné
  onChange: (code: string | undefined) => void;
  category?: CFCCategory; // Catégorie pour filtrer les résultats
  label?: string;
  placeholder?: string;
  description?: string;
}

export function CFCSelector({
  value,
  onChange,
  category,
  label = "Code de Frais de Construction (CFC)",
  placeholder = "Rechercher un code CFC (ex: 224 pour Couverture)...",
  description = "Sélectionnez le code CFC correspondant à votre projet",
}: CFCSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculer le CFC sélectionné à partir du value
  const selectedCFC = value
    ? searchCFCCodes(value, 1).find((cfc) => cfc.code === value) || null
    : null;

  // Calculer les résultats de recherche avec filtre de catégorie
  const results =
    searchTerm.length > 0 || category
      ? searchCFCCodes(searchTerm, 15, category)
      : searchCFCCodes("", 15);

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

  const handleSelect = (cfc: CFCCode) => {
    onChange(cfc.code);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <Label className="text-base font-semibold">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Affichage du code sélectionné */}
      {selectedCFC ? (
        <div className="flex items-center gap-2 p-3 border-2 border-artisan-yellow bg-artisan-yellow/5 rounded-lg">
          <div className="flex-1">
            <div className="font-semibold text-sm">
              {selectedCFC.code} - {selectedCFC.label}
            </div>
            <div className="text-xs text-muted-foreground">
              Code CFC SIA 416
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Champ de recherche */}
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
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {results.length > 0 ? (
                <ul className="py-1">
                  {results.map((cfc) => (
                    <li key={cfc.code}>
                      <button
                        type="button"
                        onClick={() => handleSelect(cfc)}
                        className="w-full px-4 py-3 text-left hover:bg-artisan-yellow/10 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-sm">
                          {cfc.code} - {cfc.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Code CFC SIA 416
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aucun code CFC trouvé pour &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Info helper */}
      <p className="text-xs text-muted-foreground">
        💡 Les codes CFC (Codes de Frais de Construction) permettent de
        catégoriser précisément les travaux selon la norme SIA 416
      </p>
    </div>
  );
}
