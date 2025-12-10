"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Package } from "lucide-react";

interface Lot {
  number: number;
  title: string;
  description: string;
  budget: string;
}

interface Criteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface TenderStep4Props {
  formData: {
    hasLots: boolean;
    lots: Lot[];
    criteria: Criteria[];
  };
  updateFormData: (data: Partial<TenderStep4Props["formData"]>) => void;
}

export function TenderStep4({ formData, updateFormData }: TenderStep4Props) {
  const addLot = () => {
    const newLot: Lot = {
      number: formData.lots.length + 1,
      title: "",
      description: "",
      budget: "",
    };
    updateFormData({ lots: [...formData.lots, newLot], hasLots: true });
  };

  const removeLot = (index: number) => {
    const updatedLots = formData.lots.filter((_, i) => i !== index);
    updateFormData({
      lots: updatedLots,
      hasLots: updatedLots.length > 0,
    });
  };

  const updateLot = (
    index: number,
    field: keyof Lot,
    value: string | number
  ) => {
    const updatedLots = formData.lots.map((lot, i) =>
      i === index ? { ...lot, [field]: value } : lot
    );
    updateFormData({ lots: updatedLots });
  };

  const addCriteria = () => {
    const newCriteria: Criteria = {
      id: `criteria-${Date.now()}`,
      name: "",
      description: "",
      weight: 0,
    };
    updateFormData({ criteria: [...formData.criteria, newCriteria] });
  };

  const removeCriteria = (id: string) => {
    updateFormData({
      criteria: formData.criteria.filter((c) => c.id !== id),
    });
  };

  const updateCriteria = (
    id: string,
    field: keyof Criteria,
    value: string | number
  ) => {
    const updatedCriteria = formData.criteria.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    updateFormData({ criteria: updatedCriteria });
  };

  const totalWeight = formData.criteria.reduce(
    (sum, c) => sum + (c.weight || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <Package className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            Lots et critères d&apos;évaluation{" "}
            <span className="text-base font-normal text-muted-foreground">
              (optionnel)
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Pour les projets complexes : organisez en lots et définissez vos
            critères de sélection
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Gestion des lots */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Lots du projet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Divisez votre projet en plusieurs lots si nécessaire (optionnel)
          </p>

          {formData.lots.length > 0 && (
            <div className="space-y-4 mb-4">
              {formData.lots.map((lot, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Lot {lot.number}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLot(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Titre du lot</Label>
                      <Input
                        value={lot.title}
                        onChange={(e) =>
                          updateLot(index, "title", e.target.value)
                        }
                        placeholder="Ex: Gros œuvre"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={lot.description}
                        onChange={(e) =>
                          updateLot(index, "description", e.target.value)
                        }
                        placeholder="Détails du lot..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Budget indicatif (CHF)</Label>
                      <Input
                        type="number"
                        value={lot.budget}
                        onChange={(e) =>
                          updateLot(index, "budget", e.target.value)
                        }
                        placeholder="Ex: 50000"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addLot}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un lot
          </Button>
        </div>

        {/* Critères d'évaluation */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">
            Critères d&apos;évaluation
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Définissez les critères qui serviront à évaluer les offres (avec
            pondération en %)
          </p>

          {formData.criteria.length > 0 && (
            <div className="space-y-4 mb-4">
              {formData.criteria.map((criteria) => (
                <div
                  key={criteria.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Critère</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(criteria.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Nom du critère</Label>
                      <Input
                        value={criteria.name}
                        onChange={(e) =>
                          updateCriteria(criteria.id, "name", e.target.value)
                        }
                        placeholder="Ex: Prix, Qualité technique, Délais"
                      />
                    </div>

                    <div>
                      <Label>Description (optionnelle)</Label>
                      <Textarea
                        value={criteria.description}
                        onChange={(e) =>
                          updateCriteria(
                            criteria.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Comment ce critère sera évalué..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Pondération (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={criteria.weight}
                        onChange={(e) =>
                          updateCriteria(
                            criteria.id,
                            "weight",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Ex: 40"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalWeight > 0 && (
            <div
              className={`text-sm mb-3 ${
                totalWeight === 100 ? "text-green-600" : "text-orange-600"
              }`}
            >
              Total: {totalWeight}%{" "}
              {totalWeight !== 100 && "(doit être égal à 100%)"}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addCriteria}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un critère
          </Button>
        </div>
      </div>
    </div>
  );
}
