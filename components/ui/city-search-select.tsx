"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SWISS_CITIES,
  searchCities,
  getCitiesByCanton,
} from "@/lib/constants/swiss-cities";
import { MapPin, X } from "lucide-react";

interface CitySearchSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  canton?: string; // Filtrer par canton si spécifié
  placeholder?: string;
}

export function CitySearchSelect({
  value,
  onChange,
  canton,
  placeholder = "Rechercher ville ou code postal...",
}: CitySearchSelectProps) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(SWISS_CITIES.slice(0, 10));
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rechercher les villes
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);

    if (!searchQuery.trim()) {
      // Afficher les villes du canton sélectionné ou les premières villes
      if (canton) {
        setSuggestions(getCitiesByCanton(canton));
      } else {
        setSuggestions(SWISS_CITIES.slice(0, 10));
      }
    } else {
      // Rechercher
      let results = searchCities(searchQuery);

      // Filtrer par canton si spécifié
      if (canton) {
        results = results.filter((city) => city.canton === canton);
      }

      setSuggestions(results.slice(0, 20)); // Limiter à 20 résultats
    }
  };

  // Sélectionner une ville
  const handleSelect = (cityName: string) => {
    setQuery(cityName);
    onChange(cityName);
    setIsOpen(false);
  };

  // Effacer la sélection
  const handleClear = () => {
    setQuery("");
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-matte-black rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((city) => (
            <button
              key={`${city.name}-${city.postalCode}`}
              type="button"
              onClick={() => handleSelect(city.name)}
              className="w-full px-4 py-2 text-left hover:bg-sand-light transition-colors border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{city.name}</span>
                <span className="text-sm text-muted-foreground">
                  {city.postalCode} - {city.canton}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Aucun résultat */}
      {isOpen && query && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-matte-black rounded-lg shadow-lg p-4 text-center text-muted-foreground">
          Aucune ville trouvée
        </div>
      )}
    </div>
  );
}
