"use client";

import { OfferFormData } from "../submit-offer-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { FileText, Calendar, Info } from "lucide-react";

interface OfferStep1Props {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
  tender: {
    id: string;
    title: string;
    description: string;
  };
}

export function OfferStep1({
  formData,
  updateFormData,
  tender,
}: OfferStep1Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/20 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Informations de l&apos;offre</h2>
          <p className="text-sm text-muted-foreground">
            Référence et validité de votre proposition
          </p>
        </div>
      </div>

      {/* Rappel du projet */}
      <HandDrawnCard className="border-artisan-yellow/30 bg-sand-light/30">
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Projet concerné
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{tender.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {tender.description}
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Référence interne */}
      <HandDrawnCard>
        <HandDrawnCardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="offerNumber">
              Numéro d&apos;offre / Référence interne (optionnel)
            </Label>
            <Input
              id="offerNumber"
              placeholder="Ex: OFF-2025-001 ou laissez vide pour génération auto"
              value={formData.offerNumber || ""}
              onChange={(e) => updateFormData({ offerNumber: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si laissé vide, un numéro sera généré automatiquement
            </p>
          </div>

          <div>
            <Label htmlFor="validityDays">
              <Calendar className="w-4 h-4 inline mr-1" />
              Validité de l&apos;offre
            </Label>
            <Select
              value={formData.validityDays.toString()}
              onValueChange={(value) =>
                updateFormData({ validityDays: parseInt(value) })
              }
            >
              <SelectTrigger id="validityDays">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours (recommandé)</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="120">120 jours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Durée pendant laquelle votre offre reste valable
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Résumé de compréhension du projet */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            💡 Votre compréhension du projet
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="projectSummary">
                Résumez en quelques lignes ce que vous avez compris du besoin *
              </Label>
              <span
                className={`text-xs ${
                  formData.projectSummary.length < 50
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {formData.projectSummary.length} / 50 minimum
              </span>
            </div>
            <Textarea
              id="projectSummary"
              rows={4}
              placeholder="Exemple : Rénovation complète d'une salle de bain de 6m², remplacement de la baignoire par une douche italienne, pose de carrelage mural et sol, installation de nouveaux sanitaires..."
              value={formData.projectSummary}
              onChange={(e) =>
                updateFormData({ projectSummary: e.target.value })
              }
              className={
                formData.projectSummary.length < 50
                  ? "border-orange-300 focus:border-orange-500"
                  : "border-green-300 focus:border-green-500"
              }
            />
            <p className="text-xs text-muted-foreground">
              Cette description montre au client que vous avez bien compris son
              besoin. Soyez précis et concis.
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Aide contextuelle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Conseil
        </h3>
        <p className="text-sm text-blue-800">
          Une bonne compréhension du projet rassure le client. Reprenez les
          éléments clés de l&apos;appel d&apos;offres et montrez que vous avez
          identifié les enjeux principaux.
        </p>
      </div>
    </div>
  );
}
