"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSavedSearch } from "@/features/search/actions";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

interface SaveSearchButtonProps {
  filters: Record<string, unknown>;
  variant?: "default" | "outline";
}

export function SaveSearchButton({
  filters,
  variant = "outline",
}: SaveSearchButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);

    // Nettoyer les filtres - supprimer les valeurs undefined/null/empty
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log("Saving filters:", cleanFilters); // Debug

    const result = await createSavedSearch({
      name: name.trim(),
      criteria: cleanFilters as any,
      alertsEnabled,
    });

    setLoading(false);

    if (result.success) {
      setOpen(false);
      setName("");
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de la sauvegarde");
    }
  };

  return (
    <>
      <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
        <Bookmark className="w-4 h-4 mr-2" />
        Sauvegarder cette recherche
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder cette recherche</DialogTitle>
            <DialogDescription>
              Donnez un nom à cette recherche pour la retrouver facilement et
              activer les alertes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Nom de la recherche</Label>
              <Input
                id="search-name"
                placeholder="Ex: Appels d'offres Vaud - Construction"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="alerts"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-artisan-yellow focus:ring-artisan-yellow"
              />
              <Label htmlFor="alerts" className="cursor-pointer">
                M&apos;alerter par email quand de nouveaux appels d&apos;offres
                correspondent
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || loading}>
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
