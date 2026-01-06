"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Zap,
  Building2,
  Check,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  DollarSign,
} from "lucide-react";
import { CreateTenderStepper } from "./create-tender-stepper";
import { SimpleTenderStepper } from "./simple-tender-stepper";

interface TenderModeChoiceProps {
  organization: {
    id: string;
    name: string;
    logo?: string | null;
    address?: string | null;
    city?: string | null;
    canton?: string | null;
    postalCode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
}

export function TenderModeChoice({ organization }: TenderModeChoiceProps) {
  const [selectedMode, setSelectedMode] = useState<
    "simple" | "complete" | null
  >(null);

  // Si un mode est sélectionné, afficher le stepper correspondant
  if (selectedMode === "simple") {
    return (
      <SimpleTenderStepper
        organizationId={organization.id}
        organization={organization}
      />
    );
  }

  if (selectedMode === "complete") {
    return <CreateTenderStepper organizationId={organization.id} />;
  }

  // Sinon, afficher la page de choix
  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Créer un appel d&apos;offres
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez le mode de création qui correspond le mieux à vos besoins
          </p>
        </div>

        {/* Cartes de choix */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Mode Simple */}
          <Card className="relative overflow-hidden border-2 hover:border-artisan-yellow transition-all hover:shadow-xl cursor-pointer group">
            <div className="absolute top-4 right-4">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recommandé
              </div>
            </div>

            <div className="p-8">
              <div className="w-16 h-16 bg-artisan-yellow/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-artisan-yellow" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Mode Simple</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Idéal pour particuliers, PME et projets simples
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      Seulement 3 étapes
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Formulaire simplifié et rapide à remplir
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">5-10 minutes</div>
                    <div className="text-xs text-muted-foreground">
                      Publiez rapidement votre appel d&apos;offres
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      PDF professionnel
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Document généré automatiquement avec votre logo
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">CHF 10.–</div>
                    <div className="text-xs text-muted-foreground">
                      Prix unique pour la publication
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <div className="font-bold text-sm mb-1">Parfait pour :</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Particuliers (rénovation cuisine, toiture...)</li>
                  <li>• PME (travaux simples, peinture, électricité...)</li>
                  <li>• Architectes (recherche d&apos;artisans)</li>
                </ul>
              </div>

              <Button
                onClick={() => setSelectedMode("simple")}
                className="w-full gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold"
                size="lg"
              >
                Choisir le mode simple
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Mode Complet */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-all hover:shadow-xl cursor-pointer group">
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Mode Complet</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Pour communes, grandes entreprises et marchés publics
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      9 étapes détaillées
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Contrôle total sur tous les paramètres
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      Codes CFC et catégorisation
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Classification professionnelle des travaux
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      Lots et critères
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Divisez votre projet en plusieurs lots
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      Conditions détaillées
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Conditions de participation, documents requis
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded">
                <div className="font-bold text-sm mb-1">Parfait pour :</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Communes et administrations publiques</li>
                  <li>• Grandes entreprises (projets complexes)</li>
                  <li>• Marchés publics avec exigences spécifiques</li>
                </ul>
              </div>

              <Button
                onClick={() => setSelectedMode("complete")}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                size="lg"
              >
                Choisir le mode complet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Tableau comparatif */}
        <div className="bg-white rounded-lg border p-8">
          <h3 className="text-xl font-bold mb-6 text-center">
            Comparaison détaillée
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fonctionnalité</th>
                  <th className="text-center py-3 px-4">Mode Simple</th>
                  <th className="text-center py-3 px-4">Mode Complet</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4">Nombre d&apos;étapes</td>
                  <td className="text-center py-3 px-4 font-bold text-artisan-yellow">
                    3 étapes
                  </td>
                  <td className="text-center py-3 px-4">9 étapes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Temps de création</td>
                  <td className="text-center py-3 px-4 font-bold text-artisan-yellow">
                    5-10 min
                  </td>
                  <td className="text-center py-3 px-4">15-30 min</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Codes CFC obligatoires</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Gestion des lots</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Critères de sélection pondérés</td>
                  <td className="text-center py-3 px-4">Pré-définis</td>
                  <td className="text-center py-3 px-4">✅ Personnalisables</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Mode anonyme</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Génération PDF</td>
                  <td className="text-center py-3 px-4">✅ Automatique</td>
                  <td className="text-center py-3 px-4">✅ Automatique</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Prix</td>
                  <td className="text-center py-3 px-4 font-bold text-green-600">
                    CHF 10.–
                  </td>
                  <td className="text-center py-3 px-4 font-bold text-green-600">
                    CHF 10.–
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Note de bas de page */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 Vous pourrez toujours sauvegarder un brouillon et y revenir plus
            tard
          </p>
        </div>
      </div>
    </div>
  );
}
