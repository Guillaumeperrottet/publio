import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Globe, Plus } from "lucide-react";
import Link from "next/link";

const DATA_SOURCES = [
  {
    canton: "🇨🇭 Suisse (national)",
    sources: [
      {
        name: "SIMAP - Plateforme fédérale des marchés publics",
        url: "https://www.simap.ch",
        description:
          "Plateforme officielle pour tous les appels d'offres publics de Suisse (>230'000 CHF). Scrapage 6x/jour (6h, 9h, 12h, 15h, 18h, 21h).",
        types: "Appels d'offres",
        status: "active",
        featured: true,
      },
    ],
  },
  {
    canton: "Fribourg (FR)",
    sources: [
      {
        name: "Feuille Officielle du canton de Fribourg",
        url: "https://www.fr.ch/fo",
        description:
          "Publication officielle hebdomadaire (PDF). Scrapage automatique chaque jeudi à 7h.",
        types: "Mises à l'enquête, permis de construire, oppositions",
        status: "active",
        featured: true,
      },
    ],
  },
  {
    canton: "Vaud (VD)",
    sources: [
      {
        name: "Feuille des Avis Officiels (FAO)",
        url: "https://www.vd.ch/fao",
        description:
          "Publication officielle cantonale (en cours d'intégration)",
        types: "Mises à l'enquête, permis, oppositions",
        status: "coming-soon",
      },
    ],
  },
  {
    canton: "Genève (GE)",
    sources: [
      {
        name: "Feuille d'Avis Officielle (FAO)",
        url: "https://ge.ch/fao",
        description:
          "Publication officielle cantonale (en cours d'intégration)",
        types: "Mises à l'enquête, permis, oppositions",
        status: "coming-soon",
      },
    ],
  },
  {
    canton: "Valais (VS)",
    sources: [
      {
        name: "Feuille Officielle du Valais",
        url: "https://www.vs.ch/feuille-officielle",
        description:
          "Publication officielle cantonale (en cours d'intégration)",
        types: "Mises à l'enquête, permis, oppositions",
        status: "coming-soon",
      },
    ],
  },
];

export default async function VeilleSourcesPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/veille">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-matte-black mb-2">
            Sources de données
          </h1>
          <p className="text-muted-foreground">
            Sites web officiels scrapés pour collecter les publications
            communales
          </p>
        </div>

        {/* Sources par canton */}
        <div className="space-y-6 mb-8">
          {DATA_SOURCES.map((cantonData) => (
            <HandDrawnCard key={cantonData.canton}>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle>{cantonData.canton}</HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent>
                <div className="space-y-4">
                  {cantonData.sources.map((source, index) => (
                    <div
                      key={index}
                      className={`flex items-start justify-between p-4 rounded-lg border ${
                        "featured" in source && source.featured
                          ? "bg-deep-green/5 border-deep-green"
                          : "bg-sand-light/30"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-deep-green" />
                          <h3 className="font-semibold">{source.name}</h3>
                          {source.status === "active" && (
                            <Badge
                              variant="default"
                              className="bg-deep-green text-white"
                            >
                              Actif
                            </Badge>
                          )}
                          {source.status === "coming-soon" && (
                            <Badge variant="secondary">Bientôt</Badge>
                          )}
                          {"featured" in source && source.featured && (
                            <Badge
                              variant="outline"
                              className="border-artisan-yellow text-artisan-yellow"
                            >
                              ⭐ Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {source.description}
                        </p>
                        {"types" in source && source.types && (
                          <p className="text-xs text-deep-green/70 mb-2">
                            📋 Types: {source.types}
                          </p>
                        )}
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-deep-green hover:underline inline-flex items-center gap-1"
                          >
                            Visiter le site
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </HandDrawnCardContent>
            </HandDrawnCard>
          ))}
        </div>

        {/* Suggérer une source */}
        <HandDrawnCard className="border-2 border-artisan-yellow bg-linear-to-br from-white to-artisan-yellow/5">
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Suggérer une source
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <p className="text-muted-foreground mb-4">
              Vous connaissez un site officiel qui publie des mises à
              l&apos;enquête, permis de construire ou autres publications
              communales ? Aidez-nous à enrichir notre base de données !
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  Informations à nous transmettre :
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Canton concerné</li>
                  <li>URL du site web officiel</li>
                  <li>
                    Type de publications (mises à l&apos;enquête, permis, etc.)
                  </li>
                  <li>Fréquence de mise à jour si connue</li>
                </ul>
              </div>
              <a
                href="mailto:contact@publio.ch?subject=Suggestion de source pour la veille communale"
                className="inline-block"
              >
                <Button className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90">
                  Envoyer une suggestion
                </Button>
              </a>
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Info technique */}
        <div className="mt-8 p-4 rounded-lg bg-sand-light/50 border">
          <h3 className="font-semibold mb-2 text-sm">ℹ️ Comment ça marche ?</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>SIMAP :</strong> Scrapage automatique 6 fois par jour (6h,
              9h, 12h, 15h, 18h, 21h) pour capturer les nouveaux appels d'offres
              dès leur publication.
            </p>
            <p>
              <strong>Feuilles officielles cantonales :</strong> Scrapage
              hebdomadaire (chaque jeudi à 7h) car ces publications sont mises à
              jour une fois par semaine.
            </p>
            <p>
              Les données sont filtrées selon vos préférences (cantons, types,
              mots-clés, communes) et vous recevez des alertes email selon la
              fréquence choisie (instantané, quotidien ou hebdomadaire).
            </p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
