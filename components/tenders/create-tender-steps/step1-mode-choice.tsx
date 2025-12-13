"use client";

import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Users,
} from "lucide-react";

interface TenderStep1ModeChoiceProps {
  formData: {
    mode: string;
  };
  updateFormData: (
    data: Partial<TenderStep1ModeChoiceProps["formData"]>
  ) => void;
}

export function TenderStep1ModeChoice({
  formData,
  updateFormData,
}: TenderStep1ModeChoiceProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mode de publication</h2>
          <p className="text-sm text-muted-foreground">
            Choisissez la visibilité de votre identité
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Sélectionnez le mode de publication *
        </Label>

        {/* Mode Classique */}
        <label
          className="flex items-start gap-4 cursor-pointer p-5 rounded-xl border-2 transition-all hover:bg-white hover:shadow-md"
          style={{
            borderColor:
              formData.mode === "CLASSIC" ? "var(--artisan-yellow)" : "#e5e7eb",
            backgroundColor:
              formData.mode === "CLASSIC" ? "rgb(254 249 195 / 0.2)" : "white",
          }}
        >
          <input
            type="radio"
            name="mode"
            value="CLASSIC"
            checked={formData.mode === "CLASSIC"}
            onChange={(e) => updateFormData({ mode: e.target.value })}
            className="w-5 h-5 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="font-bold text-lg">Mode Classique</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Votre organisation est visible dès le début. Les soumissionnaires
              connaissent votre identité lors du dépôt de leur offre.
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  Transparence totale dès la publication
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  Favorise la confiance et les relations directes
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  Idéal pour les organisations établies
                </span>
              </div>
            </div>
          </div>
        </label>

        {/* Mode Anonyme */}
        <label
          className="flex items-start gap-4 cursor-pointer p-5 rounded-xl border-2 transition-all hover:bg-white hover:shadow-md"
          style={{
            borderColor:
              formData.mode === "ANONYMOUS"
                ? "var(--artisan-yellow)"
                : "#e5e7eb",
            backgroundColor:
              formData.mode === "ANONYMOUS"
                ? "rgb(254 249 195 / 0.2)"
                : "white",
          }}
        >
          <input
            type="radio"
            name="mode"
            value="ANONYMOUS"
            checked={formData.mode === "ANONYMOUS"}
            onChange={(e) => updateFormData({ mode: e.target.value })}
            className="w-5 h-5 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-lg">Mode Anonyme</span>
              <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                Protection maximale
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Votre identité reste masquée jusqu&apos;à la clôture de
              l&apos;appel d&apos;offres. Les soumissionnaires ne connaissent
              pas l&apos;émetteur lors du dépôt.
            </p>

            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  Réduit les biais liés à la notoriété
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  Protège contre les pressions locales
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">
                  Idéal pour les petites communes et particuliers
                </span>
              </div>
            </div>

            {/* Message d'avertissement pour mode anonyme */}
            {formData.mode === "ANONYMOUS" && (
              <Alert className="border-orange-200 bg-orange-50 mt-4">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900 font-semibold">
                  Important : Préservez votre anonymat
                </AlertTitle>
                <AlertDescription className="text-orange-800 text-sm mt-2 space-y-2">
                  <p>
                    <strong>Pour garantir votre anonymat, évitez de :</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Mentionner le nom de votre organisation dans le titre ou
                      la description
                    </li>
                    <li>
                      Inclure des adresses précises ou des références qui
                      pourraient vous identifier
                    </li>
                    <li>
                      Uploader des documents contenant votre logo ou vos
                      coordonnées
                    </li>
                    <li>
                      Faire référence à des projets passés qui pourraient vous
                      reconnaître
                    </li>
                  </ul>
                  <p className="mt-3 font-medium">
                    ℹ️ Votre identité sera automatiquement révélée après la
                    clôture de l&apos;appel d&apos;offres.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </label>
      </div>

      {/* Info supplémentaire */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Dans tous les cas
            </p>
            <p className="text-sm text-gray-600">
              Les soumissionnaires déposent leurs offres de manière{" "}
              <strong>non anonyme</strong>. Vous aurez toujours accès à leur
              identité complète pour évaluer les offres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
