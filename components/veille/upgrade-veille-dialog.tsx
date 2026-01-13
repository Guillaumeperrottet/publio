"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  maxCommunes: number | "unlimited";
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Gratuit",
    price: 0,
    maxCommunes: 0,
    features: [
      "Accès aux appels d'offres",
      "Recherches sauvegardées",
      "Support par email",
    ],
  },
  {
    id: "VEILLE_BASIC",
    name: "Veille Basic",
    price: 5,
    maxCommunes: 1,
    features: [
      "Tout du plan Gratuit",
      "Veille sur 1 canton",
      "Alertes email quotidiennes",
      "Dashboard publications",
    ],
    recommended: true,
  },
  {
    id: "VEILLE_UNLIMITED",
    name: "Veille Premium",
    price: 10,
    maxCommunes: "unlimited",
    features: [
      "Tout du plan Basic",
      "Cantons illimités",
      "Support prioritaire",
      "Demande de sites personnalisés",
    ],
  },
];

interface UpgradeVeilleDialogProps {
  currentPlan?: string;
  organizationId: string;
}

export function UpgradeVeilleDialog({
  currentPlan = "FREE",
  organizationId,
}: UpgradeVeilleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    try {
      setIsLoading(true);

      // Créer la checkout session Stripe
      const response = await fetch("/api/stripe/create-veille-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      toast.error(
        "Une erreur est survenue lors de la création de l'abonnement. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Activer la Veille
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1400px]! max-h-[95vh] overflow-y-auto p-10">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-bold">
            Activez la Veille Communale
          </DialogTitle>
          <DialogDescription className="text-base mt-3">
            Ne ratez plus jamais une mise à l&apos;enquête. Soyez alerté
            automatiquement des nouvelles publications dans vos communes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 my-10">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isFree = plan.id === "FREE";

            return (
              <div
                key={plan.id}
                className={`relative border rounded-xl p-10 flex flex-col ${
                  plan.recommended
                    ? "border-artisan-yellow border-2 shadow-xl bg-linear-to-br from-white to-artisan-yellow/5"
                    : "border-gray-200 bg-white"
                } ${isCurrentPlan ? "bg-sand-light" : ""}`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-artisan-yellow text-matte-black px-4 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Recommandé
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">CHF {plan.price}</span>
                    {!isFree && (
                      <span className="text-muted-foreground text-lg">
                        /mois
                      </span>
                    )}
                  </div>
                  {!isFree && (
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                      {plan.maxCommunes === "unlimited"
                        ? "Cantons illimités"
                        : `${plan.maxCommunes} canton`}
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-deep-green mt-0.5 shrink-0" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base"
                    disabled
                  >
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    variant={plan.recommended ? "default" : "outline"}
                    className={
                      plan.recommended
                        ? "w-full h-12 text-base bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90 font-semibold"
                        : "w-full h-12 text-base"
                    }
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading || isFree}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : isFree ? (
                      "Plan actuel"
                    ) : (
                      "Choisir ce plan"
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
