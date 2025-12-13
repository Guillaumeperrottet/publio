"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagSelectorProps {
  value: string[]; // Tags sélectionnés
  onChange: (tags: string[]) => void;
  suggestions?: string[]; // Suggestions prédéfinies
  placeholder?: string;
  maxTags?: number;
  allowCustom?: boolean; // Permettre la création de tags personnalisés
}

export function TagSelector({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Sélectionnez ou créez...",
  maxTags,
  allowCustom = true,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les suggestions en fonction de l'input et exclure les tags déjà sélectionnés
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Ajouter un tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    if (value.includes(trimmedTag)) return;
    if (maxTags && value.length >= maxTags) return;

    onChange([...value, trimmedTag]);
    setInputValue("");
    setIsDropdownOpen(false);
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  // Gérer la touche Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() && allowCustom) {
        addTag(inputValue);
      } else if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      }
    }
  };

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      {/* Tags sélectionnés */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-artisan-yellow/20 text-matte-black border-artisan-yellow hover:bg-artisan-yellow/30 transition-colors"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-red-600 transition-colors"
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
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              maxTags && value.length >= maxTags
                ? `Maximum ${maxTags} atteint`
                : placeholder
            }
            disabled={maxTags ? value.length >= maxTags : false}
            className="flex-1"
          />
          {allowCustom && inputValue.trim() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(inputValue)}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          )}
        </div>

        {/* Dropdown de suggestions */}
        {isDropdownOpen && (filteredSuggestions.length > 0 || inputValue) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border-2 border-matte-black rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.length > 0 ? (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1 font-semibold">
                  Suggestions
                </p>
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addTag(suggestion)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-artisan-yellow/10 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-sm">{suggestion}</span>
                    <Check className="w-4 h-4 text-artisan-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              allowCustom &&
              inputValue.trim() && (
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => addTag(inputValue)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-artisan-yellow/10 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      <Plus className="w-3 h-3 inline mr-2" />
                      Créer &quot;{inputValue}&quot;
                    </span>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxTags} sélectionné{value.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
