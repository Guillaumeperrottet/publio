"use client";

import { OfferFormData } from "./submit-offer-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  groupLineItemsByCategory,
  hasCategories,
} from "@/lib/utils/offer-line-items";

interface EditableOfferTemplateProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
  organization: {
    name: string;
  };
  tender: {
    title: string;
    currency: string;
  };
  currentStep: number;
}

export function EditableOfferTemplate({
  formData,
  updateFormData,
  organization,
  tender,
  currentStep,
}: EditableOfferTemplateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: tender.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const addInclusion = () => {
    updateFormData({
      inclusions: [
        ...formData.inclusions,
        { position: formData.inclusions.length + 1, description: "" },
      ],
    });
  };

  const removeInclusion = (index: number) => {
    updateFormData({
      inclusions: formData.inclusions.filter((_, i) => i !== index),
    });
  };

  const updateInclusion = (index: number, description: string) => {
    const updated = [...formData.inclusions];
    updated[index] = { ...updated[index], description };
    updateFormData({ inclusions: updated });
  };

  const addExclusion = () => {
    updateFormData({
      exclusions: [
        ...formData.exclusions,
        { position: formData.exclusions.length + 1, description: "" },
      ],
    });
  };

  const removeExclusion = (index: number) => {
    updateFormData({
      exclusions: formData.exclusions.filter((_, i) => i !== index),
    });
  };

  const updateExclusion = (index: number, description: string) => {
    const updated = [...formData.exclusions];
    updated[index] = { ...updated[index], description };
    updateFormData({ exclusions: updated });
  };

  const addMaterial = () => {
    updateFormData({
      materials: [
        ...formData.materials,
        {
          position: formData.materials.length + 1,
          name: "",
          brand: "",
          model: "",
        },
      ],
    });
  };

  const removeMaterial = (index: number) => {
    updateFormData({
      materials: formData.materials.filter((_, i) => i !== index),
    });
  };

  const updateMaterial = (
    index: number,
    field: string,
    value: string | undefined
  ) => {
    const updated = [...formData.materials];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ materials: updated });
  };

  const addLineItem = () => {
    updateFormData({
      lineItems: [
        ...formData.lineItems,
        {
          position: formData.lineItems.length + 1,
          description: "",
          quantity: 1,
          unit: "pièce",
          priceHT: 0,
          tvaRate: formData.tvaRate,
        },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    const updated = formData.lineItems.filter((_, i) => i !== index);
    updateFormData({ lineItems: updated });
    recalculateTotals(updated);
  };

  const updateLineItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...formData.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ lineItems: updated });
    recalculateTotals(updated);
  };

  const recalculateTotals = (items: OfferFormData["lineItems"]) => {
    const totalHT = items.reduce(
      (sum, item) => sum + item.priceHT * (item.quantity || 1),
      0
    );
    const totalTVA = totalHT * (formData.tvaRate / 100);
    const totalTTC = totalHT + totalTVA;

    updateFormData({
      totalHT,
      totalTVA,
      price: totalTTC,
    });
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-xl overflow-hidden">
      {/* En-tête Publio */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Publio</h1>
            <p className="text-sm opacity-90">Plateforme de mise en relation</p>
            <p className="text-xs opacity-75 italic mt-1">Document indicatif</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{organization.name}</div>
          </div>
        </div>
      </div>

      {/* Corps du document */}
      <div className="p-8 space-y-6">
        {/* Informations de base */}
        {currentStep >= 1 && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Organisation destinataire
              </label>
              <div className="mt-1 text-sm">Organisation destinataire</div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Offre n°
                </label>
                <Input
                  value={formData.offerNumber}
                  onChange={(e) =>
                    updateFormData({ offerNumber: e.target.value })
                  }
                  placeholder="OFF-2025-001"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Date de l&apos;offre
                </label>
                <div className="mt-1 text-sm">
                  {new Date().toLocaleDateString("fr-CH")}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Validité
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) =>
                      updateFormData({
                        validityDays: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-sm">jours</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Titre de l'offre */}
        <div className="border-t-2 pt-4">
          <h2 className="text-xl font-bold">Offre: {tender.title}</h2>
        </div>

        {/* Résumé du projet */}
        {currentStep >= 1 && (
          <div>
            <label className="text-sm font-bold block mb-2">
              Résumé du projet
            </label>
            <Textarea
              value={formData.projectSummary}
              onChange={(e) =>
                updateFormData({ projectSummary: e.target.value })
              }
              placeholder="Décrivez votre compréhension du projet (min. 50 caractères)..."
              rows={3}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.projectSummary.length}/50 caractères minimum
            </div>
          </div>
        )}

        {/* Prestations incluses */}
        {currentStep >= 2 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Prestations incluses</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addInclusion}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.inclusions.map((inc, index) => (
                <div key={index} className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 mt-2" />
                  <div className="flex-1">
                    <Input
                      value={inc.description}
                      onChange={(e) => updateInclusion(index, e.target.value)}
                      placeholder={`Prestation incluse ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeInclusion(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {formData.inclusions.length === 0 && (
                <div className="text-sm text-muted-foreground italic border-2 border-dashed rounded p-4 text-center">
                  Cliquez sur &quot;Ajouter&quot; pour définir les prestations
                  incluses
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prestations NON incluses */}
        {currentStep >= 2 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Prestations NON incluses</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addExclusion}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.exclusions.map((exc, index) => (
                <div key={index} className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 mt-2" />
                  <div className="flex-1">
                    <Input
                      value={exc.description}
                      onChange={(e) => updateExclusion(index, e.target.value)}
                      placeholder={`Prestation non incluse ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeExclusion(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matériaux proposés */}
        {currentStep >= 2 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">
                Matériaux et équipements proposés
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addMaterial}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.materials.map((mat, index) => (
                <div key={index} className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 mt-2" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={mat.name}
                      onChange={(e) =>
                        updateMaterial(index, "name", e.target.value)
                      }
                      placeholder="Nom du matériau"
                    />
                    <Input
                      value={mat.brand || ""}
                      onChange={(e) =>
                        updateMaterial(index, "brand", e.target.value)
                      }
                      placeholder="Marque"
                    />
                    <Input
                      value={mat.model || ""}
                      onChange={(e) =>
                        updateMaterial(index, "model", e.target.value)
                      }
                      placeholder="Modèle"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMaterial(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tableau de prix */}
        {currentStep >= 3 && (
          <div className="border-t-2 pt-6">
            <h3 className="text-sm font-bold mb-4">Décomposition tarifaire</h3>

            {formData.priceType === "DETAILED" ? (
              <div>
                <div className="flex justify-end mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addLineItem}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter une ligne
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos</TableHead>
                      <TableHead>Désignation</TableHead>
                      <TableHead className="w-24">Qté</TableHead>
                      <TableHead className="w-24">Unité</TableHead>
                      <TableHead className="w-32">Prix HT</TableHead>
                      <TableHead className="w-32">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hasCategories(formData.lineItems) ? (
                      // Affichage groupé par catégories avec sous-totaux
                      <>
                        {groupLineItemsByCategory(formData.lineItems).map(
                          (group, groupIndex) => (
                            <>
                              {/* En-tête de catégorie */}
                              <TableRow
                                key={`cat-${groupIndex}`}
                                className="bg-gray-100"
                              >
                                <TableCell
                                  colSpan={7}
                                  className="font-bold text-sm py-2"
                                >
                                  {group.category}
                                </TableCell>
                              </TableRow>

                              {/* Lignes de la catégorie */}
                              {group.items.map((item, index) => {
                                const globalIndex =
                                  formData.lineItems.indexOf(item);
                                return (
                                  <TableRow key={`${groupIndex}-${index}`}>
                                    <TableCell>
                                      {String(item.position).padStart(2, "0")}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={item.description}
                                        onChange={(e) =>
                                          updateLineItem(
                                            globalIndex,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Description"
                                        className="min-w-[200px]"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={item.quantity || ""}
                                        onChange={(e) =>
                                          updateLineItem(
                                            globalIndex,
                                            "quantity",
                                            parseFloat(e.target.value)
                                          )
                                        }
                                        className="w-full"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={item.unit || ""}
                                        onChange={(e) =>
                                          updateLineItem(
                                            globalIndex,
                                            "unit",
                                            e.target.value
                                          )
                                        }
                                        placeholder="m², h..."
                                        className="w-full"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={item.priceHT}
                                        onChange={(e) =>
                                          updateLineItem(
                                            globalIndex,
                                            "priceHT",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="w-full"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {formatCurrency(
                                        item.priceHT * (item.quantity || 1)
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          removeLineItem(globalIndex)
                                        }
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}

                              {/* Sous-total de la catégorie */}
                              <TableRow className="bg-gray-50">
                                <TableCell
                                  colSpan={5}
                                  className="text-right font-semibold text-sm"
                                >
                                  Sous-total {group.category}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-sm">
                                  {formatCurrency(group.subtotalHT)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </>
                          )
                        )}
                      </>
                    ) : (
                      // Affichage simple sans catégories
                      formData.lineItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {String(item.position).padStart(2, "0")}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateLineItem(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Description"
                              className="min-w-[200px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) =>
                                updateLineItem(
                                  index,
                                  "quantity",
                                  parseFloat(e.target.value)
                                )
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.unit || ""}
                              onChange={(e) =>
                                updateLineItem(index, "unit", e.target.value)
                              }
                              placeholder="m², h..."
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.priceHT}
                              onChange={(e) =>
                                updateLineItem(
                                  index,
                                  "priceHT",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(
                              item.priceHT * (item.quantity || 1)
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLineItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}

                    {/* Totaux finaux */}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={5} className="text-right font-bold">
                        Total hors TVA
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(formData.totalHT || 0)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right">
                        TVA {formData.tvaRate}%
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(formData.totalTVA || 0)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow className="bg-artisan-yellow/10">
                      <TableCell
                        colSpan={5}
                        className="text-right font-bold text-lg"
                      >
                        Total TVA incluse
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-deep-green">
                        {formatCurrency(formData.price)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded p-6 text-center">
                <label className="text-sm font-semibold mb-2 block">
                  Prix forfaitaire global TTC
                </label>
                <div className="flex items-center justify-center gap-3">
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      updateFormData({
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-48 text-center text-2xl font-bold"
                  />
                  <span className="text-2xl font-bold">{tender.currency}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conditions et délais */}
        {currentStep >= 4 && (
          <div className="border-t-2 pt-6 space-y-4">
            <h3 className="text-sm font-bold">Conditions et délais</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Durée estimée (jours)
                </label>
                <Input
                  type="number"
                  value={formData.durationDays || ""}
                  onChange={(e) =>
                    updateFormData({
                      durationDays: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="365"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Délai de livraison
                </label>
                <Input
                  value={formData.timeline || ""}
                  onChange={(e) => updateFormData({ timeline: e.target.value })}
                  placeholder="1 mois"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">
                Conditions de paiement
              </label>
              <Textarea
                value={
                  formData.paymentTerms
                    ? `Acompte: ${
                        formData.paymentTerms.deposit || 0
                      }% | Solde: ${formData.paymentTerms.final || 0}%`
                    : ""
                }
                placeholder="Acompte: 100%"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="pt-4">
          <p className="text-sm">
            Nous vous prions d&apos;agréer, Madame, Monsieur, nos salutations
            les meilleures.
          </p>
          <p className="text-sm font-bold mt-2">{organization.name}</p>
        </div>

        {/* Pied de page */}
        <div className="border-t pt-4 text-center text-xs text-muted-foreground space-y-1">
          <p className="italic">Document généré via Publio</p>
          <p>
            Cette offre est indicative et facilitera votre mise en relation. Une
            fois le marché validé, vous êtes en contact direct avec le
            prestataire.
          </p>
        </div>
      </div>
    </div>
  );
}
