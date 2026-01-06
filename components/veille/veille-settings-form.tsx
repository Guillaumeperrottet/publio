"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CantonSelector } from "@/components/veille/canton-selector";
import { upsertVeilleSubscription } from "@/features/veille/actions";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import type { Canton, PublicationType } from "@/features/veille/types";
import { PUBLICATION_TYPE_LABELS } from "@/features/veille/types";

interface VeilleSettingsFormProps {
  organizationId: string;
  maxCantons: number;
  initialData?: {
    cantons: Canton[];
    emailNotifications: boolean;
    appNotifications: boolean;
    alertFrequency?: string;
    alertTypes?: string[];
    alertKeywords?: string[];
    alertCommunes?: string[];
  };
}

export function VeilleSettingsForm({
  organizationId,
  maxCantons,
  initialData,
}: VeilleSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCantons, setSelectedCantons] = useState<Canton[]>(
    initialData?.cantons || []
  );
  const [emailNotifications, setEmailNotifications] = useState(
    initialData?.emailNotifications ?? true
  );
  const [appNotifications, setAppNotifications] = useState(
    initialData?.appNotifications ?? true
  );

  // Configuration alertes
  const [alertFrequency, setAlertFrequency] = useState(
    initialData?.alertFrequency || "DAILY"
  );
  const [alertTypes, setAlertTypes] = useState<string[]>(
    initialData?.alertTypes || []
  );
  const [alertKeywords, setAlertKeywords] = useState<string[]>(
    initialData?.alertKeywords || []
  );
  const [alertCommunes, setAlertCommunes] = useState<string[]>(
    initialData?.alertCommunes || []
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [communeInput, setCommuneInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCantons.length === 0) {
      toast.error("Veuillez sélectionner au moins un canton");
      return;
    }

    // Validation de la limite de cantons
    if (maxCantons > 0 && selectedCantons.length > maxCantons) {
      toast.error(
        `Votre plan est limité à ${maxCantons} canton${
          maxCantons > 1 ? "s" : ""
        }`,
        {
          description:
            maxCantons === 1
              ? "Vous pouvez changer de canton, mais pas en surveiller plusieurs. Passez à Unlimited pour plus de cantons."
              : "Passez à un plan supérieur pour surveiller plus de cantons.",
          action: {
            label: "Voir les plans",
            onClick: () => router.push("/dashboard/billing"),
          },
        }
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await upsertVeilleSubscription(organizationId, {
        cantons: selectedCantons,
        emailNotifications,
        appNotifications,
        alertFrequency,
        alertTypes,
        alertKeywords,
        alertCommunes,
      });

      if (result.success) {
        toast.success("Paramètres de veille enregistrés");

        // Déclencher le scraping immédiat si nécessaire
        if (result.shouldTriggerScrape && result.cantons) {
          toast.loading("Récupération des publications en cours...", {
            id: "scraping",
          });

          try {
            const scrapeResponse = await fetch("/api/veille/trigger-scrape", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                organizationId,
                cantons: result.cantons,
              }),
            });

            const scrapeData = await scrapeResponse.json();

            if (scrapeResponse.ok) {
              toast.success(
                `${scrapeData.total} publication(s) trouvée(s) (${scrapeData.created} nouvelles)`,
                { id: "scraping" }
              );
            } else {
              toast.error("Erreur lors de la récupération des publications", {
                id: "scraping",
              });
            }
          } catch (error) {
            console.error("Error triggering scrape:", error);
            toast.dismiss("scraping");
          }
        }

        router.push("/dashboard/veille");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving veille settings:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <HandDrawnCard className="mb-6">
        <HandDrawnCardHeader>
          <HandDrawnCardTitle>Veille des publications</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <div>
            <Label htmlFor="cantons">
              Cantons à surveiller (max {maxCantons})
            </Label>
            <div className="mt-2">
              <CantonSelector
                value={selectedCantons}
                onChange={setSelectedCantons}
                maxCantons={maxCantons}
                placeholder="Sélectionnez des cantons..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label htmlFor="email-notifications" className="text-sm">
                Email
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label htmlFor="app-notifications" className="text-sm">
                Badge
              </Label>
              <Switch
                id="app-notifications"
                checked={appNotifications}
                onCheckedChange={setAppNotifications}
                disabled={isLoading}
              />
            </div>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {emailNotifications && (
        <HandDrawnCard className="mb-6">
          <HandDrawnCardHeader>
            <HandDrawnCardTitle>Filtres des alertes</HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent className="space-y-4">
            {/* Fréquence */}
            <div>
              <Label className="text-sm">Fréquence</Label>
              <Select
                value={alertFrequency}
                onValueChange={setAlertFrequency}
                disabled={isLoading}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTANT">Instantané</SelectItem>
                  <SelectItem value="DAILY">Quotidien (8h)</SelectItem>
                  <SelectItem value="WEEKLY">Hebdo (lundi 8h)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Types de publications */}
            <div>
              <Label className="text-sm">Types (optionnel)</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !alertTypes.includes(value)) {
                    setAlertTypes([...alertTypes, value]);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PUBLICATION_TYPE_LABELS)
                    .filter(([key]) => !alertTypes.includes(key))
                    .map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {alertTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {alertTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {PUBLICATION_TYPE_LABELS[type as PublicationType]}
                      <button
                        type="button"
                        onClick={() =>
                          setAlertTypes(alertTypes.filter((t) => t !== type))
                        }
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Mots-clés */}
            <div>
              <Label className="text-sm">Mots-clés (optionnel)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="Ex: rénovation"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (
                        keywordInput.trim() &&
                        !alertKeywords.includes(keywordInput.trim())
                      ) {
                        setAlertKeywords([
                          ...alertKeywords,
                          keywordInput.trim(),
                        ]);
                        setKeywordInput("");
                      }
                    }
                  }}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      keywordInput.trim() &&
                      !alertKeywords.includes(keywordInput.trim())
                    ) {
                      setAlertKeywords([...alertKeywords, keywordInput.trim()]);
                      setKeywordInput("");
                    }
                  }}
                  disabled={isLoading || !keywordInput.trim()}
                >
                  +
                </Button>
              </div>
              {alertKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {alertKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="text-xs"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() =>
                          setAlertKeywords(
                            alertKeywords.filter((k) => k !== keyword)
                          )
                        }
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Communes */}
            <div>
              <Label className="text-sm">Communes (optionnel)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="Ex: Fribourg"
                  value={communeInput}
                  onChange={(e) => setCommuneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (
                        communeInput.trim() &&
                        !alertCommunes.includes(communeInput.trim())
                      ) {
                        setAlertCommunes([
                          ...alertCommunes,
                          communeInput.trim(),
                        ]);
                        setCommuneInput("");
                      }
                    }
                  }}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      communeInput.trim() &&
                      !alertCommunes.includes(communeInput.trim())
                    ) {
                      setAlertCommunes([...alertCommunes, communeInput.trim()]);
                      setCommuneInput("");
                    }
                  }}
                  disabled={isLoading || !communeInput.trim()}
                >
                  +
                </Button>
              </div>
              {alertCommunes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {alertCommunes.map((commune) => (
                    <Badge
                      key={commune}
                      variant="secondary"
                      className="text-xs"
                    >
                      {commune}
                      <button
                        type="button"
                        onClick={() =>
                          setAlertCommunes(
                            alertCommunes.filter((c) => c !== commune)
                          )
                        }
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading || selectedCantons.length === 0}
          className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
