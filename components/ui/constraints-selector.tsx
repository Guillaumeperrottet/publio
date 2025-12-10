"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface ConstraintsSelectorProps {
  value: string[];
  onChange: (constraints: string[]) => void;
  label?: string;
  placeholder?: string;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Accès difficile",
  "Site occupé",
  "Horaires limités",
  "Visite sur place souhaitée",
  "Étages sans ascenseur",
  "Zone piétonne",
  "Stationnement limité",
  "Protection des meubles/sols requise",
];

export function ConstraintsSelector({
  value = [],
  onChange,
  label = "Contraintes & Particularités",
  placeholder = "Ajouter une contrainte...",
  suggestions = DEFAULT_SUGGESTIONS,
}: ConstraintsSelectorProps) {
  const [customInput, setCustomInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAdd = (constraint: string) => {
    if (constraint.trim() && !value.includes(constraint.trim())) {
      onChange([...value, constraint.trim()]);
      setCustomInput("");
      setShowSuggestions(false);
    }
  };

  const handleRemove = (constraint: string) => {
    onChange(value.filter((c) => c !== constraint));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customInput.trim()) {
      e.preventDefault();
      handleAdd(customInput);
    }
  };

  const availableSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>

      {/* Contraintes sélectionnées */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((constraint) => (
            <Badge
              key={constraint}
              variant="outline"
              className="px-3 py-1.5 text-sm bg-orange-50 border-orange-200 text-orange-900 gap-2"
            >
              {constraint}
              <button
                type="button"
                onClick={() => handleRemove(constraint)}
                className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input et suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAdd(customInput)}
            disabled={!customInput.trim()}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Dropdown suggestions */}
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Suggestions
              </div>
              {availableSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAdd(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Ajoutez les contraintes spécifiques au chantier pour des offres plus
        précises
      </p>
    </div>
  );
}
