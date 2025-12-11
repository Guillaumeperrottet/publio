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
import { Bookmark, Bell, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SaveSearchDialogProps {
  filters: Record<string, unknown>;
  isAuthenticated: boolean;
}

export function SaveSearchDialog({
  filters,
  isAuthenticated,
}: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);

    // Nettoyer les filtres
    const cleanFilters: Record<string, unknown> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value;
      }
    });

    const result = await createSavedSearch({
      name: name.trim(),
      criteria: cleanFilters as Record<string, string | number | boolean>,
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

  // Version pour utilisateur non connecté - Incitation à créer un compte
  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black shadow-md animate-pulse"
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Enregistrer cette recherche
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-artisan-yellow/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-artisan-yellow" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Enregistrez votre recherche !
              </DialogTitle>
              <DialogDescription className="text-center text-base pt-2">
                Créez un compte gratuit pour enregistrer vos recherches et
                recevoir des alertes
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              {/* Avantages */}
              <div className="bg-sand-light border-2 border-matte-black rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-artisan-yellow rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bookmark className="w-4 h-4 text-matte-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Sauvegardez vos recherches
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Retrouvez instantanément vos critères favoris
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-artisan-yellow rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-matte-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Alertes en temps réel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Soyez notifié dès qu&apos;un nouveau projet correspond
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-artisan-yellow rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-matte-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">100% gratuit</p>
                    <p className="text-xs text-muted-foreground">
                      Sans engagement, résiliable à tout moment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                asChild
                size="lg"
                className="w-full bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black"
              >
                <Link href="/auth/signup?callbackUrl=/tenders">
                  Créer mon compte gratuit
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                <Link href="/auth/signin?callbackUrl=/tenders">
                  J&apos;ai déjà un compte
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Version pour utilisateur connecté - Sauvegarde classique
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black"
      >
        <Bookmark className="w-4 h-4 mr-2" />
        Enregistrer cette recherche
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer cette recherche</DialogTitle>
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
                className="border-2 border-matte-black"
              />
            </div>

            <div className="flex items-start space-x-3 p-4 bg-sand-light border-2 border-matte-black rounded-lg">
              <input
                type="checkbox"
                id="alerts"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-2 border-matte-black text-artisan-yellow focus:ring-artisan-yellow"
              />
              <div>
                <Label
                  htmlFor="alerts"
                  className="cursor-pointer font-semibold"
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  Activer les alertes email
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Recevez une notification dès qu&apos;un nouveau projet
                  correspond à vos critères
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-2 border-matte-black"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || loading}
              className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
