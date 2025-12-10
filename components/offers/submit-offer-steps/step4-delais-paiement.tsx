"use client";

import { OfferFormData } from "../submit-offer-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Clock, CreditCard, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OfferStep4Props {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
  tender: {
    title: string;
    currency: string;
  };
}

export function OfferStep4({
  formData,
  updateFormData,
  tender,
}: OfferStep4Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/20 rounded-full flex items-center justify-center">
          <Clock className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Délais, paiement & garanties</h2>
          <p className="text-sm text-muted-foreground">
            Planning et conditions de votre offre
          </p>
        </div>
      </div>

      {/* Délais et planning */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Planning d&apos;exécution
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <div>
            <Label htmlFor="startDate">Date de début possible</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ""}
              onChange={(e) => updateFormData({ startDate: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              À partir de quand pouvez-vous commencer les travaux ?
            </p>
          </div>

          <div>
            <Label htmlFor="durationDays">
              Durée estimée des travaux (en jours) *
            </Label>
            <Input
              id="durationDays"
              type="number"
              placeholder="Ex: 45"
              value={formData.durationDays || ""}
              onChange={(e) =>
                updateFormData({
                  durationDays: parseInt(e.target.value) || undefined,
                })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nombre de jours ouvrables nécessaires pour réaliser le projet
            </p>
          </div>

          <div>
            <Label htmlFor="timeline">
              Délai d&apos;exécution (description textuelle)
            </Label>
            <Input
              id="timeline"
              placeholder="Ex: 6 mois à partir de la signature du contrat"
              value={formData.timeline || ""}
              onChange={(e) => updateFormData({ timeline: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="constraints">
              Contraintes et dépendances (optionnel)
            </Label>
            <Textarea
              id="constraints"
              rows={3}
              placeholder="Ex: Dépendant de la météo, délai d'approvisionnement de 3 semaines pour certains matériaux..."
              value={formData.constraints || ""}
              onChange={(e) => updateFormData({ constraints: e.target.value })}
            />
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Conditions de paiement */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Conditions de paiement
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définissez vos conditions de paiement (répartition en %)
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deposit">Acompte à la commande (%)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                max="100"
                placeholder="Ex: 30"
                value={formData.paymentTerms?.deposit || ""}
                onChange={(e) =>
                  updateFormData({
                    paymentTerms: {
                      ...formData.paymentTerms,
                      deposit: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="intermediate">Paiement intermédiaire (%)</Label>
              <Input
                id="intermediate"
                type="number"
                min="0"
                max="100"
                placeholder="Ex: 40"
                value={formData.paymentTerms?.intermediate || ""}
                onChange={(e) =>
                  updateFormData({
                    paymentTerms: {
                      ...formData.paymentTerms,
                      intermediate: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="final">Solde à réception (%)</Label>
              <Input
                id="final"
                type="number"
                min="0"
                max="100"
                placeholder="Ex: 30"
                value={formData.paymentTerms?.final || ""}
                onChange={(e) =>
                  updateFormData({
                    paymentTerms: {
                      ...formData.paymentTerms,
                      final: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="netDays">Délai de paiement (jours)</Label>
              <Input
                id="netDays"
                type="number"
                placeholder="Ex: 30"
                value={formData.paymentTerms?.netDays || ""}
                onChange={(e) =>
                  updateFormData({
                    paymentTerms: {
                      ...formData.paymentTerms,
                      netDays: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Vérification du total */}
          {formData.paymentTerms?.deposit ||
          formData.paymentTerms?.intermediate ||
          formData.paymentTerms?.final ? (
            <div className="bg-sand-light/30 border rounded p-3">
              <div className="text-sm">
                Total répartition :{" "}
                <span
                  className={`font-semibold ${
                    (formData.paymentTerms?.deposit || 0) +
                      (formData.paymentTerms?.intermediate || 0) +
                      (formData.paymentTerms?.final || 0) ===
                    100
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {(formData.paymentTerms?.deposit || 0) +
                    (formData.paymentTerms?.intermediate || 0) +
                    (formData.paymentTerms?.final || 0)}
                  %
                </span>
                {(formData.paymentTerms?.deposit || 0) +
                  (formData.paymentTerms?.intermediate || 0) +
                  (formData.paymentTerms?.final || 0) !==
                  100 && (
                  <span className="text-orange-600 ml-2">
                    (doit faire 100%)
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            💡 Exemple classique suisse : 30% acompte, 40% en cours de chantier,
            30% à réception
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Garanties et assurances */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Garanties & Assurances
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warrantyYears">Garantie travaux (années)</Label>
              <Input
                id="warrantyYears"
                type="number"
                min="0"
                placeholder="Ex: 2 ou 5"
                value={formData.warrantyYears || ""}
                onChange={(e) =>
                  updateFormData({
                    warrantyYears: parseInt(e.target.value) || undefined,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Durée de garantie offerte sur vos travaux
              </p>
            </div>

            <div>
              <Label htmlFor="insuranceAmount">
                RC professionnelle ({tender.currency})
              </Label>
              <Input
                id="insuranceAmount"
                type="number"
                placeholder="Ex: 5000000"
                value={formData.insuranceAmount || ""}
                onChange={(e) =>
                  updateFormData({
                    insuranceAmount: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Montant de votre assurance RC pro
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="manufacturerWarranty">
              Garantie fabricant sur matériel
            </Label>
            <Textarea
              id="manufacturerWarranty"
              rows={2}
              placeholder="Ex: 10 ans sur la robinetterie, 5 ans sur les sanitaires..."
              value={formData.manufacturerWarranty || ""}
              onChange={(e) =>
                updateFormData({ manufacturerWarranty: e.target.value })
              }
            />
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      <Separator />

      {/* Références */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            🏆 Vos références
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div>
            <Label htmlFor="references">
              Projets similaires réalisés (optionnel)
            </Label>
            <Textarea
              id="references"
              rows={4}
              placeholder="Listez vos références pertinentes : projet, client (si autorisé), année, montant..."
              value={formData.references || ""}
              onChange={(e) => updateFormData({ references: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mettez en avant votre expérience sur des projets similaires
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    </div>
  );
}
