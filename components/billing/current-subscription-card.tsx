"use client";

import { toast } from "sonner";

import { useState } from "react";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CurrentSubscriptionCardProps {
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  organizationId: string;
}

const PLAN_LABELS: Record<
  string,
  { name: string; price: string; color: string }
> = {
  FREE: {
    name: "Gratuit",
    price: "CHF 0",
    color: "bg-gray-100 text-gray-800",
  },
  VEILLE_BASIC: {
    name: "Veille Basic",
    price: "CHF 5/mois",
    color: "bg-blue-100 text-blue-800",
  },
  VEILLE_UNLIMITED: {
    name: "Veille Premium",
    price: "CHF 10/mois",
    color: "bg-artisan-yellow text-matte-black",
  },
};

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "destructive" | "outline" | "secondary";
  }
> = {
  active: { label: "Actif", variant: "default" },
  trialing: { label: "Période d'essai", variant: "secondary" },
  past_due: { label: "Paiement en retard", variant: "destructive" },
  canceled: { label: "Annulé", variant: "outline" },
  unpaid: { label: "Impayé", variant: "destructive" },
};

export function CurrentSubscriptionCard({
  plan,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  organizationId,
}: CurrentSubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.FREE;
  const statusInfo = STATUS_LABELS[status] || {
    label: status,
    variant: "outline" as const,
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);

      // Créer une session du portail client Stripe
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error(
        "Erreur lors de l'ouverture du portail de gestion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle>Abonnement actuel</HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="space-y-4">
          {/* Plan actuel */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className={planInfo.color}>
                  {plan === "VEILLE_UNLIMITED" && (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  {planInfo.name}
                </Badge>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              <p className="text-xl font-bold text-matte-black">
                {planInfo.price}
              </p>
            </div>
          </div>

          {/* Informations de renouvellement */}
          {currentPeriodEnd && plan !== "FREE" && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {cancelAtPeriodEnd
                      ? "Votre abonnement se termine le"
                      : "Prochain renouvellement le"}
                  </p>
                  <p className="font-medium text-sm">
                    {currentPeriodEnd.toLocaleDateString("fr-CH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {cancelAtPeriodEnd && (
                <div className="flex items-start gap-2 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-orange-900">
                      Abonnement en cours d&apos;annulation
                    </p>
                    <p className="text-orange-700">
                      Vous aurez accès à vos fonctionnalités jusqu&apos;à la fin
                      de la période en cours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t">
            {plan === "FREE" && (
              <Button
                variant="default"
                className="w-full bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90 h-10"
                onClick={() => (window.location.href = "/dashboard/veille")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Activer la Veille
              </Button>
            )}

            {plan !== "FREE" && (
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="default"
                className="w-full h-10 hover:scale-[1.02] transition-transform"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gérer l&apos;:abonnement
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Note pour le plan gratuit */}
          {plan === "FREE" && (
            <p className="text-xs text-muted-foreground text-center">
              Le plan gratuit vous permet d&apos;accéder aux appels
              d&apos;offres. Activez la veille communale pour être alerté des
              nouvelles publications.
            </p>
          )}
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
