"use client";

import { OfferFormData, OfferLineItem } from "../submit-offer-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Plus, Trash2, Euro, Calculator } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OfferStep3Props {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
  tender: {
    currency: string;
    budget?: number;
  };
}

export function OfferStep3({
  formData,
  updateFormData,
  tender,
}: OfferStep3Props) {
  // Calcul automatique du total si prix détaillé
  const calculateTotals = () => {
    if (formData.priceType === "DETAILED" && formData.lineItems.length > 0) {
      let totalHT = 0;
      let totalTVA = 0;

      formData.lineItems.forEach((item) => {
        const ht = item.priceHT;
        const tva = (ht * item.tvaRate) / 100;
        totalHT += ht;
        totalTVA += tva;
      });

      const totalTTC = totalHT + totalTVA;

      updateFormData({
        totalHT,
        totalTVA,
        price: totalTTC,
      });
    }
  };

  // Gestion des lignes de prix
  const addLineItem = () => {
    const newItem: OfferLineItem = {
      position: formData.lineItems.length + 1,
      description: "",
      priceHT: 0,
      tvaRate: formData.tvaRate,
    };
    updateFormData({ lineItems: [...formData.lineItems, newItem] });
  };

  const updateLineItem = (index: number, updates: Partial<OfferLineItem>) => {
    const updated = formData.lineItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    updateFormData({ lineItems: updated });
    setTimeout(calculateTotals, 100);
  };

  const removeLineItem = (index: number) => {
    const updated = formData.lineItems
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, position: i + 1 }));
    updateFormData({ lineItems: updated });
    setTimeout(calculateTotals, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/20 rounded-full flex items-center justify-center">
          <Euro className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Prix et décomposition</h2>
          <p className="text-sm text-muted-foreground">
            Définissez le prix de votre offre
          </p>
        </div>
      </div>

      {/* Budget indicatif du tender */}
      {tender.budget && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Budget indicatif du projet :</strong>{" "}
            {new Intl.NumberFormat("fr-CH", {
              style: "currency",
              currency: tender.currency,
            }).format(tender.budget)}
          </p>
        </div>
      )}

      {/* Choix du type de prix */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            Type de tarification
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <RadioGroup
            value={formData.priceType}
            onValueChange={(value: "GLOBAL" | "DETAILED") =>
              updateFormData({ priceType: value })
            }
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-sand-light/20 cursor-pointer">
              <RadioGroupItem value="GLOBAL" id="global" />
              <Label htmlFor="global" className="flex-1 cursor-pointer">
                <div className="font-semibold">Prix forfaitaire global</div>
                <div className="text-sm text-muted-foreground">
                  Un prix TTC unique pour l&apos;ensemble du projet
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-sand-light/20 cursor-pointer">
              <RadioGroupItem value="DETAILED" id="detailed" />
              <Label htmlFor="detailed" className="flex-1 cursor-pointer">
                <div className="font-semibold">Prix détaillé par postes</div>
                <div className="text-sm text-muted-foreground">
                  Décomposition détaillée avec HT, TVA et total
                </div>
              </Label>
            </div>
          </RadioGroup>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Prix forfaitaire global */}
      {formData.priceType === "GLOBAL" && (
        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="font-handdrawn text-xl">
              💰 Prix total de l&apos;offre
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent className="space-y-4">
            <div>
              <Label htmlFor="price">
                Prix total TTC ({tender.currency}) *
              </Label>
              <div className="relative mt-2">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 125000.00"
                  value={formData.price || ""}
                  onChange={(e) =>
                    updateFormData({ price: parseFloat(e.target.value) || 0 })
                  }
                  className="text-lg font-semibold pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {tender.currency}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="tvaRate">Taux de TVA applicable</Label>
              <Select
                value={formData.tvaRate.toString()}
                onValueChange={(value) =>
                  updateFormData({ tvaRate: parseFloat(value) })
                }
              >
                <SelectTrigger id="tvaRate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7.7">7.7% (Taux normal)</SelectItem>
                  <SelectItem value="2.5">2.5% (Taux réduit)</SelectItem>
                  <SelectItem value="3.7">3.7% (Hébergement)</SelectItem>
                  <SelectItem value="0">0% (Exonéré)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.price > 0 && (
              <div className="bg-sand-light/30 border-2 border-artisan-yellow rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Prix TTC</span>
                  <span className="text-deep-green">
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                    }).format(formData.price)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <div className="flex justify-between">
                    <span>Prix HT estimé</span>
                    <span>
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: tender.currency,
                      }).format(formData.price / (1 + formData.tvaRate / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA ({formData.tvaRate}%)</span>
                    <span>
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: tender.currency,
                      }).format(
                        formData.price -
                          formData.price / (1 + formData.tvaRate / 100)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </HandDrawnCardContent>
        </HandDrawnCard>
      )}

      {/* Prix détaillé par postes */}
      {formData.priceType === "DETAILED" && (
        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Décomposition par postes
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Détaillez votre prix poste par poste pour plus de transparence
            </p>

            {/* Tableau des postes */}
            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-sand-light/20"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Description du poste *</Label>
                      <Input
                        placeholder="Ex: Dépose et évacuation"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, { description: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:text-red-700 mt-5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 15"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateLineItem(index, {
                            quantity: parseFloat(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unité</Label>
                      <Input
                        placeholder="Ex: m², h, pcs"
                        value={item.unit || ""}
                        onChange={(e) =>
                          updateLineItem(index, { unit: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">
                        Prix HT ({tender.currency}) *
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.priceHT || ""}
                        onChange={(e) =>
                          updateLineItem(index, {
                            priceHT: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Taux TVA (%)</Label>
                      <Select
                        value={item.tvaRate.toString()}
                        onValueChange={(value) =>
                          updateLineItem(index, {
                            tvaRate: parseFloat(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7.7">7.7%</SelectItem>
                          <SelectItem value="2.5">2.5%</SelectItem>
                          <SelectItem value="3.7">3.7%</SelectItem>
                          <SelectItem value="0">0%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {item.priceHT > 0 && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      Prix TTC poste :{" "}
                      <span className="font-semibold text-deep-green">
                        {new Intl.NumberFormat("fr-CH", {
                          style: "currency",
                          currency: tender.currency,
                        }).format(item.priceHT * (1 + item.tvaRate / 100))}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un poste
              </Button>

              {formData.lineItems.length === 0 && (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded">
                  ⚠️ Vous devez ajouter au moins un poste
                </p>
              )}
            </div>

            {/* Récapitulatif des totaux */}
            {formData.lineItems.length > 0 &&
              formData.totalHT &&
              formData.totalHT > 0 && (
                <div className="bg-sand-light/30 border-2 border-artisan-yellow rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total HT</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: tender.currency,
                      }).format(formData.totalHT)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total TVA</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: tender.currency,
                      }).format(formData.totalTVA || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total TTC</span>
                    <span className="text-deep-green">
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: tender.currency,
                      }).format(formData.price)}
                    </span>
                  </div>
                </div>
              )}
          </HandDrawnCardContent>
        </HandDrawnCard>
      )}
    </div>
  );
}
