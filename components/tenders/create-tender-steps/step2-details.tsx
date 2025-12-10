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
import { CFCMultiSelector } from "@/components/ui/cfc-multi-selector";
import { ConstraintsSelector } from "@/components/ui/constraints-selector";
import { CFC_CATEGORIES, type CFCCategory } from "@/lib/constants/cfc-codes";
import { Briefcase, Ruler } from "lucide-react";

interface TenderStep2Props {
  formData: {
    cfcCategory?: CFCCategory;
    cfcCodes: string[];
    budget: string;
    showBudget: boolean;
    surfaceM2: string;
    volumeM3: string;
    contractDuration: string;
    contractStartDate: string;
    isRenewable: boolean;
    deadline: string;
    constraints: string[];
  };
  updateFormData: (data: Partial<TenderStep2Props["formData"]>) => void;
}

export function TenderStep2({ formData, updateFormData }: TenderStep2Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Détails du projet</h2>
          <p className="text-sm text-muted-foreground">
            Catégorie de travaux, quantités, budget et délais
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Catégorie de travaux */}
        <div>
          <Label htmlFor="cfcCategory" className="text-base font-semibold">
            Catégorie de travaux *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Sélectionnez le type de travaux pour filtrer les codes CFC
          </p>
          <Select
            value={formData.cfcCategory}
            onValueChange={(value) =>
              updateFormData({ cfcCategory: value as CFCCategory })
            }
          >
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Choisissez une catégorie..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CFC_CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.cfcCategory && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 {CFC_CATEGORIES[formData.cfcCategory].description}
            </p>
          )}
        </div>

        {/* CFC Multi-Selector */}
        <CFCMultiSelector
          value={formData.cfcCodes}
          onChange={(codes) => updateFormData({ cfcCodes: codes })}
          category={formData.cfcCategory}
          placeholder={
            formData.cfcCategory
              ? "Recherchez un code CFC (ex: 224 pour Couverture)..."
              : "Sélectionnez d'abord une catégorie de travaux ci-dessus"
          }
        />

        {/* Quantités & Mesures */}
        <div className="border-2 border-artisan-yellow/30 rounded-lg p-5 bg-artisan-yellow/5">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-artisan-yellow" />
            <h3 className="text-base font-semibold">
              Quantités & Mesures (optionnel)
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Précisez les dimensions pour des offres plus précises
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="surfaceM2">Surface (m²)</Label>
              <Input
                id="surfaceM2"
                type="number"
                step="0.1"
                value={formData.surfaceM2}
                onChange={(e) => updateFormData({ surfaceM2: e.target.value })}
                placeholder="Ex: 150"
              />
            </div>
            <div>
              <Label htmlFor="volumeM3">Volume (m³)</Label>
              <Input
                id="volumeM3"
                type="number"
                step="0.1"
                value={formData.volumeM3}
                onChange={(e) => updateFormData({ volumeM3: e.target.value })}
                placeholder="Ex: 450"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="budget" className="text-base font-semibold">
            Budget indicatif (CHF)
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Optionnel - aide les soumissionnaires à évaluer le projet
          </p>
          <Input
            id="budget"
            type="number"
            step="1000"
            value={formData.budget}
            onChange={(e) => updateFormData({ budget: e.target.value })}
            placeholder="Ex: 150000"
            className="text-base"
          />
          {formData.budget && (
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="showBudget"
                checked={formData.showBudget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData({ showBudget: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm cursor-pointer">
                Afficher le budget publiquement
              </span>
            </label>
          )}
        </div>

        {/* Durée et planning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contractDuration">Durée du contrat (jours)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Durée estimée de la prestation (optionnel)
            </p>
            <Input
              id="contractDuration"
              type="number"
              value={formData.contractDuration}
              onChange={(e) =>
                updateFormData({ contractDuration: e.target.value })
              }
              placeholder="Ex: 90"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="contractStartDate">Date de début souhaitée</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Quand souhaitez-vous démarrer ? (optionnel)
            </p>
            <Input
              id="contractStartDate"
              type="date"
              value={formData.contractStartDate}
              onChange={(e) =>
                updateFormData({ contractStartDate: e.target.value })
              }
              className="text-base"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isRenewable"
            checked={formData.isRenewable}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFormData({ isRenewable: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-sm cursor-pointer">
            Contrat renouvelable (possibilité de prolongation)
          </span>
        </label>

        {/* Contraintes spécifiques */}
        <ConstraintsSelector
          value={formData.constraints}
          onChange={(constraints) => updateFormData({ constraints })}
        />

        <div>
          <Label htmlFor="deadline" className="text-base font-semibold">
            Date limite de soumission *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Date et heure maximales pour déposer une offre
          </p>
          <Input
            id="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => updateFormData({ deadline: e.target.value })}
            className="text-base"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      </div>
    </div>
  );
}
