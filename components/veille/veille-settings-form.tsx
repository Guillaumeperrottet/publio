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
import { CantonSelector } from "@/components/veille/canton-selector";
import { upsertVeilleSubscription } from "@/features/veille/actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { Canton } from "@/features/veille/types";

interface VeilleSettingsFormProps {
  organizationId: string;
  maxCantons: number;
  initialData?: {
    cantons: Canton[];
    emailNotifications: boolean;
    appNotifications: boolean;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCantons.length === 0) {
      toast.error("Veuillez sélectionner au moins un canton");
      return;
    }

    setIsLoading(true);

    try {
      const result = await upsertVeilleSubscription(organizationId, {
        cantons: selectedCantons,
        emailNotifications,
        appNotifications,
      });

      if (result.success) {
        toast.success("Paramètres de veille enregistrés");
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
          <HandDrawnCardTitle>Sélection des cantons</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <div>
            <Label htmlFor="cantons">
              Cantons à surveiller (maximum {maxCantons})
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

          <p className="text-sm text-muted-foreground">
            Vous serez alerté dès qu&apos;une nouvelle publication (appel
            d&apos;offres, mise à l&apos;enquête, permis de construire, etc.)
            sera publiée dans ces cantons.
          </p>
        </HandDrawnCardContent>
      </HandDrawnCard>

      <HandDrawnCard className="mb-6">
        <HandDrawnCardHeader>
          <HandDrawnCardTitle>Notifications</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Alertes par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un email quotidien avec les nouvelles publications
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-notifications">
                Notifications dans l&apos;application
              </Label>
              <p className="text-sm text-muted-foreground">
                Afficher un badge sur le menu avec le nombre de nouvelles
                publications
              </p>
            </div>
            <Switch
              id="app-notifications"
              checked={appNotifications}
              onCheckedChange={setAppNotifications}
              disabled={isLoading}
            />
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

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
