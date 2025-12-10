"use client";

import {
  OfferFormData,
  OfferInclusion,
  OfferExclusion,
  OfferMaterial,
} from "../submit-offer-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Plus, Trash2, CheckCircle, XCircle, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OfferStep2Props {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
  tender: {
    title: string;
  };
}

export function OfferStep2({ formData, updateFormData }: OfferStep2Props) {
  // Gestion des prestations incluses
  const addInclusion = () => {
    const newInclusion: OfferInclusion = {
      position: formData.inclusions.length + 1,
      description: "",
    };
    updateFormData({ inclusions: [...formData.inclusions, newInclusion] });
  };

  const updateInclusion = (index: number, description: string) => {
    const updated = formData.inclusions.map((inc, i) =>
      i === index ? { ...inc, description } : inc
    );
    updateFormData({ inclusions: updated });
  };

  const removeInclusion = (index: number) => {
    const updated = formData.inclusions
      .filter((_, i) => i !== index)
      .map((inc, i) => ({ ...inc, position: i + 1 }));
    updateFormData({ inclusions: updated });
  };

  // Gestion des exclusions
  const addExclusion = () => {
    const newExclusion: OfferExclusion = {
      position: formData.exclusions.length + 1,
      description: "",
    };
    updateFormData({ exclusions: [...formData.exclusions, newExclusion] });
  };

  const updateExclusion = (index: number, description: string) => {
    const updated = formData.exclusions.map((exc, i) =>
      i === index ? { ...exc, description } : exc
    );
    updateFormData({ exclusions: updated });
  };

  const removeExclusion = (index: number) => {
    const updated = formData.exclusions
      .filter((_, i) => i !== index)
      .map((exc, i) => ({ ...exc, position: i + 1 }));
    updateFormData({ exclusions: updated });
  };

  // Gestion des matériaux
  const addMaterial = () => {
    const newMaterial: OfferMaterial = {
      position: formData.materials.length + 1,
      name: "",
    };
    updateFormData({ materials: [...formData.materials, newMaterial] });
  };

  const updateMaterial = (index: number, updates: Partial<OfferMaterial>) => {
    const updated = formData.materials.map((mat, i) =>
      i === index ? { ...mat, ...updates } : mat
    );
    updateFormData({ materials: updated });
  };

  const removeMaterial = (index: number) => {
    const updated = formData.materials
      .filter((_, i) => i !== index)
      .map((mat, i) => ({ ...mat, position: i + 1 }));
    updateFormData({ materials: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Détail des prestations</h2>
          <p className="text-sm text-muted-foreground">
            Définissez précisément ce qui est inclus et exclu
          </p>
        </div>
      </div>

      {/* Prestations incluses */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Prestations incluses *
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Liste détaillée de tout ce que vous allez réaliser
          </p>

          {formData.inclusions.map((inclusion, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder={`Ex: ${
                    index === 0
                      ? "Dépose et évacuation des anciens éléments"
                      : index === 1
                      ? "Fourniture et pose du matériel"
                      : "Nettoyage fin de chantier"
                  }`}
                  value={inclusion.description}
                  onChange={(e) => updateInclusion(index, e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInclusion(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addInclusion}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une prestation incluse
          </Button>

          {formData.inclusions.length === 0 && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded">
              ⚠️ Vous devez ajouter au moins une prestation incluse
            </p>
          )}
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Prestations NON incluses */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Prestations NON incluses (important !)
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Clarifiez ce qui n&apos;est PAS compris dans votre offre pour éviter
            les malentendus
          </p>

          {formData.exclusions.map((exclusion, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder={`Ex: ${
                    index === 0
                      ? "Peinture"
                      : index === 1
                      ? "Travaux électriques supplémentaires"
                      : "Autorisations communales"
                  }`}
                  value={exclusion.description}
                  onChange={(e) => updateExclusion(index, e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExclusion(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addExclusion}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une exclusion
          </Button>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Matériaux proposés */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Matériaux et équipements proposés
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Détaillez les matériaux et équipements que vous allez utiliser
          </p>

          {formData.materials.map((material, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-3 bg-sand-light/20"
            >
              <div className="flex gap-2 items-start">
                <Input
                  placeholder="Nom du matériau / équipement *"
                  value={material.name}
                  onChange={(e) =>
                    updateMaterial(index, { name: e.target.value })
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Marque"
                  value={material.brand || ""}
                  onChange={(e) =>
                    updateMaterial(index, { brand: e.target.value })
                  }
                />
                <Input
                  placeholder="Modèle"
                  value={material.model || ""}
                  onChange={(e) =>
                    updateMaterial(index, { model: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Gamme (ex: Standard, Premium)"
                  value={material.range || ""}
                  onChange={(e) =>
                    updateMaterial(index, { range: e.target.value })
                  }
                />
                <Input
                  placeholder="Garantie fabricant"
                  value={material.manufacturerWarranty || ""}
                  onChange={(e) =>
                    updateMaterial(index, {
                      manufacturerWarranty: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addMaterial}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un matériau / équipement
          </Button>
        </HandDrawnCardContent>
      </HandDrawnCard>

      <Separator />

      {/* Description générale de l'approche */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            📝 Description de votre approche
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">
                Description générale de votre offre *
              </Label>
              <span
                className={`text-xs ${
                  formData.description.length < 50
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {formData.description.length} / 50 minimum
              </span>
            </div>
            <Textarea
              id="description"
              rows={4}
              placeholder="Décrivez votre approche globale, vos atouts, votre compréhension des enjeux..."
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="methodology">
              Méthodologie détaillée (optionnel)
            </Label>
            <Textarea
              id="methodology"
              rows={6}
              placeholder="Expliquez en détail votre méthodologie, les étapes de réalisation, les ressources mobilisées..."
              value={formData.methodology || ""}
              onChange={(e) => updateFormData({ methodology: e.target.value })}
            />
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    </div>
  );
}
