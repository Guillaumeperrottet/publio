"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gavel,
  Info,
  Target,
  DollarSign,
  Clock,
  Award,
  Leaf,
  Eye,
} from "lucide-react";

interface TenderStep6Props {
  formData: {
    isSimpleMode: boolean;
    hasLots: boolean;
    allowPartialOffers: boolean;
    visibility: string;
    selectionPriorities: string[];
  };
  updateFormData: (data: Partial<TenderStep6Props["formData"]>) => void;
}

export function TenderStep6({ formData, updateFormData }: TenderStep6Props) {
  const handlePriorityToggle = (priority: string) => {
    const current = formData.selectionPriorities || [];
    if (current.includes(priority)) {
      // Retirer
      updateFormData({
        selectionPriorities: current.filter((p) => p !== priority),
      });
    } else {
      // Ajouter si moins de 3
      if (current.length < 3) {
        updateFormData({ selectionPriorities: [...current, priority] });
      }
    }
  };

  const isPrioritySelected = (priority: string) => {
    return (formData.selectionPriorities || []).includes(priority);
  };

  const canAddMore = (formData.selectionPriorities || []).length < 3;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <Gavel className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Paramètres de publication</h2>
          <p className="text-sm text-muted-foreground">
            Visibilité et priorités de sélection
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* NOUVEAU : Priorité de sélection */}
        <div className="border-2 border-artisan-yellow/30 rounded-lg p-5 bg-artisan-yellow/5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-artisan-yellow" />
            <Label className="text-base font-semibold">
              Qu&apos;est-ce qui compte le plus pour vous ? *
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez jusqu&apos;à 3 critères de sélection pour orienter les
            offres
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {(formData.selectionPriorities || []).length} / 3 sélectionné
            {(formData.selectionPriorities || []).length > 1 ? "s" : ""}
          </p>

          <div className="space-y-2">
            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-artisan-yellow"
              style={{
                borderColor: isPrioritySelected("LOWEST_PRICE")
                  ? "var(--artisan-yellow)"
                  : "transparent",
                backgroundColor: isPrioritySelected("LOWEST_PRICE")
                  ? "rgb(254 249 195 / 0.3)"
                  : "",
                opacity:
                  !canAddMore && !isPrioritySelected("LOWEST_PRICE") ? 0.5 : 1,
                cursor:
                  !canAddMore && !isPrioritySelected("LOWEST_PRICE")
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <input
                type="checkbox"
                name="selectionPriorities"
                value="LOWEST_PRICE"
                checked={isPrioritySelected("LOWEST_PRICE")}
                onChange={() => handlePriorityToggle("LOWEST_PRICE")}
                disabled={!canAddMore && !isPrioritySelected("LOWEST_PRICE")}
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Prix le plus bas
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Le prix est votre critère principal de décision
                </div>
              </div>
            </label>

            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-artisan-yellow"
              style={{
                borderColor: isPrioritySelected("QUALITY_PRICE")
                  ? "var(--artisan-yellow)"
                  : "transparent",
                backgroundColor: isPrioritySelected("QUALITY_PRICE")
                  ? "rgb(254 249 195 / 0.3)"
                  : "",
                opacity:
                  !canAddMore && !isPrioritySelected("QUALITY_PRICE") ? 0.5 : 1,
                cursor:
                  !canAddMore && !isPrioritySelected("QUALITY_PRICE")
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <input
                type="checkbox"
                name="selectionPriorities"
                value="QUALITY_PRICE"
                checked={isPrioritySelected("QUALITY_PRICE")}
                onChange={() => handlePriorityToggle("QUALITY_PRICE")}
                disabled={!canAddMore && !isPrioritySelected("QUALITY_PRICE")}
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Meilleur rapport qualité/prix (Recommandé)
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Vous cherchez le meilleur équilibre entre prix et qualité
                </div>
              </div>
            </label>

            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-artisan-yellow"
              style={{
                borderColor: isPrioritySelected("FASTEST_DELIVERY")
                  ? "var(--artisan-yellow)"
                  : "transparent",
                backgroundColor: isPrioritySelected("FASTEST_DELIVERY")
                  ? "rgb(254 249 195 / 0.3)"
                  : "",
                opacity:
                  !canAddMore && !isPrioritySelected("FASTEST_DELIVERY")
                    ? 0.5
                    : 1,
                cursor:
                  !canAddMore && !isPrioritySelected("FASTEST_DELIVERY")
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <input
                type="checkbox"
                name="selectionPriorities"
                value="FASTEST_DELIVERY"
                checked={isPrioritySelected("FASTEST_DELIVERY")}
                onChange={() => handlePriorityToggle("FASTEST_DELIVERY")}
                disabled={
                  !canAddMore && !isPrioritySelected("FASTEST_DELIVERY")
                }
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Délais les plus rapides
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  La rapidité d&apos;exécution est prioritaire
                </div>
              </div>
            </label>

            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-artisan-yellow"
              style={{
                borderColor: isPrioritySelected("BEST_REFERENCES")
                  ? "var(--artisan-yellow)"
                  : "transparent",
                backgroundColor: isPrioritySelected("BEST_REFERENCES")
                  ? "rgb(254 249 195 / 0.3)"
                  : "",
                opacity:
                  !canAddMore && !isPrioritySelected("BEST_REFERENCES")
                    ? 0.5
                    : 1,
                cursor:
                  !canAddMore && !isPrioritySelected("BEST_REFERENCES")
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <input
                type="checkbox"
                name="selectionPriorities"
                value="BEST_REFERENCES"
                checked={isPrioritySelected("BEST_REFERENCES")}
                onChange={() => handlePriorityToggle("BEST_REFERENCES")}
                disabled={!canAddMore && !isPrioritySelected("BEST_REFERENCES")}
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Entreprise avec bonnes références
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Expérience et réputation comptent le plus
                </div>
              </div>
            </label>

            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-green-500"
              style={{
                borderColor: isPrioritySelected("ECO_FRIENDLY")
                  ? "rgb(34 197 94)"
                  : "transparent",
                backgroundColor: isPrioritySelected("ECO_FRIENDLY")
                  ? "rgb(240 253 244)"
                  : "",
                opacity:
                  !canAddMore && !isPrioritySelected("ECO_FRIENDLY") ? 0.5 : 1,
                cursor:
                  !canAddMore && !isPrioritySelected("ECO_FRIENDLY")
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <input
                type="checkbox"
                name="selectionPriorities"
                value="ECO_FRIENDLY"
                checked={isPrioritySelected("ECO_FRIENDLY")}
                onChange={() => handlePriorityToggle("ECO_FRIENDLY")}
                disabled={!canAddMore && !isPrioritySelected("ECO_FRIENDLY")}
                className="w-5 h-5 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  Matériaux écologiques/durables
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  L&apos;éco-responsabilité est un critère majeur
                </div>
              </div>
            </label>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            💡 Ceci aide les professionnels à ajuster leur offre selon vos
            attentes
          </p>
        </div>

        {/* Offres partielles - Uniquement si des lots existent */}
        {!formData.isSimpleMode && formData.hasLots && (
          <div className="border rounded-lg p-4">
            <Label className="text-base font-semibold mb-2 block">
              Offres partielles
            </Label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.allowPartialOffers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData({ allowPartialOffers: e.target.checked })
                }
                className="w-4 h-4 mt-1"
              />
              <div>
                <span className="text-sm font-medium block">
                  Autoriser les offres partielles (par lot)
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Les soumissionnaires pourront répondre uniquement pour
                  certains lots
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Visibilité */}
        <div className="border rounded-lg p-4">
          <Label className="text-base font-semibold mb-2 block">
            Visibilité de l&apos;appel d&apos;offres *
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Qui peut voir votre appel d&apos;offres ?
          </p>
          <div className="space-y-2">
            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-artisan-yellow"
              style={{
                borderColor:
                  formData.visibility === "PUBLIC"
                    ? "var(--artisan-yellow)"
                    : "#e5e7eb",
                backgroundColor:
                  formData.visibility === "PUBLIC"
                    ? "rgb(254 249 195 / 0.3)"
                    : "",
              }}
            >
              <input
                type="radio"
                name="visibility"
                value="PUBLIC"
                checked={formData.visibility === "PUBLIC"}
                onChange={(e) => updateFormData({ visibility: e.target.value })}
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <div className="font-semibold">Public (Recommandé)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tous les professionnels peuvent voir et soumissionner
                </div>
              </div>
            </label>
            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-white hover:border-artisan-yellow"
              style={{
                borderColor:
                  formData.visibility === "PRIVATE"
                    ? "var(--artisan-yellow)"
                    : "#e5e7eb",
                backgroundColor:
                  formData.visibility === "PRIVATE"
                    ? "rgb(254 249 195 / 0.3)"
                    : "",
              }}
            >
              <input
                type="radio"
                name="visibility"
                value="PRIVATE"
                checked={formData.visibility === "PRIVATE"}
                onChange={(e) => updateFormData({ visibility: e.target.value })}
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <div className="font-semibold">Privé</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Uniquement les entreprises que vous invitez par email
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
