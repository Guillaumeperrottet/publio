"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface TenderStep1Props {
  formData: {
    title: string;
    summary: string;
    description: string;
    currentSituation: string;
  };
  updateFormData: (data: Partial<TenderStep1Props["formData"]>) => void;
}

export function TenderStep1({ formData, updateFormData }: TenderStep1Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Votre projet en quelques mots</h2>
          <p className="text-sm text-muted-foreground">
            Décrivez ce que vous cherchez à réaliser
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base font-semibold">
            Titre du projet *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Soyez précis pour attirer les bons professionnels (minimum 15
            caractères)
          </p>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Ex: Rénovation complète toiture villa 150m² - Lausanne"
            className="text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.title.length} / 15 caractères minimum
          </p>
        </div>

        <div>
          <Label htmlFor="summary" className="text-base font-semibold">
            Résumé du projet (optionnel)
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Un aperçu rapide qui apparaîtra dans les résultats de recherche
            (30-250 caractères)
          </p>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => updateFormData({ summary: e.target.value })}
            placeholder="Ex: Besoin d'un couvreur pour rénover toiture de 150m². Dépose ancienne couverture en éternit, isolation thermique renforcée, pose tuiles terre cuite. Charpente en bon état."
            rows={3}
            className="resize-none"
            minLength={30}
            maxLength={250}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.summary.length} / 250 caractères max.{" "}
            {formData.summary.length > 0 &&
              formData.summary.length < 30 &&
              "(minimum 30 recommandé)"}
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-semibold">
            Description complète du projet *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Détaillez votre projet pour recevoir des offres précises (minimum
            150 caractères)
          </p>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={10}
            placeholder="Décrivez votre projet en détail. Plus vous êtes précis, meilleures seront les offres !

Exemple pour une toiture :
- Type de bâtiment : Villa individuelle, 2 étages, construite en 1985
- Travaux souhaités : Rénovation complète toiture 150m²
- État actuel : Couverture en éternit à remplacer, charpente saine
- Travaux à réaliser : Dépose ancienne couverture, isolation 20cm laine de roche, pose tuiles terre cuite rouge
- Contraintes : Accès par rue étroite, voisinage proche
- Délai souhaité : Printemps 2026
- Autorisation : Permis de construire à obtenir"
            className="text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.description.length} / 150 caractères minimum
          </p>
        </div>

        {/* Situation actuelle */}
        <div className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50">
          <div>
            <Label
              htmlFor="currentSituation"
              className="text-base font-semibold"
            >
              Situation actuelle (optionnel mais recommandé)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Décrivez l&apos;état existant, les éventuels problèmes ou
              diagnostics connus
            </p>
            <Textarea
              id="currentSituation"
              value={formData.currentSituation}
              onChange={(e) =>
                updateFormData({ currentSituation: e.target.value })
              }
              rows={4}
              placeholder="Ex: La toiture a 40 ans, présence d'éternit à déposer selon normes. Charpente inspectée en 2024 : bon état général. Isolation actuelle 8cm insuffisante. Pas de traces d'infiltration côté pignon est."
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Plus vous donnez d&apos;infos sur l&apos;existant, moins il y
              aura de surprises au devis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
