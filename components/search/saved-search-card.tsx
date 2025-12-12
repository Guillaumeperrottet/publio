"use client";

import { toast } from "sonner";

import { useState } from "react";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteSavedSearch,
  toggleSearchAlerts,
} from "@/features/search/actions";
import { useRouter } from "next/navigation";
import { Trash2, Bell, BellOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import { SavedSearch } from "@prisma/client";

interface SavedSearchCardProps {
  search: SavedSearch;
}

export function SavedSearchCard({ search }: SavedSearchCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recherche ?")) {
      return;
    }

    setLoading(true);
    const result = await deleteSavedSearch(search.id);

    if (result.success) {
      toast.success("Recherche supprimée");
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const handleToggleAlerts = async () => {
    setLoading(true);
    const result = await toggleSearchAlerts(search.id, !search.alertsEnabled);

    if (result.success) {
      toast.success(
        !search.alertsEnabled ? "Alertes activées" : "Alertes désactivées"
      );
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la modification");
    }
    setLoading(false);
  };

  // Construire l'URL de recherche
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    const criteria = search.criteria as Record<string, string>;

    Object.entries(criteria).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    return `/tenders?${params.toString()}`;
  };

  // Formater les critères pour l'affichage
  const formatCriteria = () => {
    const criteria = search.criteria as {
      search?: string;
      canton?: string;
      city?: string;
      marketType?: string;
      budgetMin?: number;
      budgetMax?: number;
      mode?: string;
      procedure?: string;
      selectionPriority?: string;
      deadlineFrom?: string;
      deadlineTo?: string;
      surfaceMin?: number;
      surfaceMax?: number;
      isRenewable?: boolean;
      cfcCodes?: string[];
    };

    const parts: string[] = [];

    if (criteria.search) parts.push(`"${criteria.search}"`);
    if (criteria.canton) parts.push(`Canton: ${criteria.canton}`);
    if (criteria.city) parts.push(`Ville: ${criteria.city}`);

    if (criteria.cfcCodes && criteria.cfcCodes.length > 0) {
      parts.push(`CFC: ${criteria.cfcCodes.join(", ")}`);
    }

    if (criteria.marketType) {
      const typeLabels: Record<string, string> = {
        WORKS: "Travaux",
        SUPPLIES: "Fournitures",
        SERVICES: "Services",
      };
      parts.push(
        `Type: ${typeLabels[criteria.marketType] || criteria.marketType}`
      );
    }
    if (criteria.procedure) {
      const procLabels: Record<string, string> = {
        OPEN: "Ouverte",
        SELECTIVE: "Sélective",
        INVITATION: "Sur invitation",
        NEGOTIATED: "Négociée",
      };
      parts.push(
        `Proc: ${procLabels[criteria.procedure] || criteria.procedure}`
      );
    }
    if (criteria.mode) {
      const modeLabels: Record<string, string> = {
        ANONYMOUS: "Anonyme",
        PUBLIC: "Public",
      };
      parts.push(`${modeLabels[criteria.mode] || criteria.mode}`);
    }
    if (criteria.budgetMin && criteria.budgetMax) {
      parts.push(
        `CHF ${criteria.budgetMin.toLocaleString()}-${criteria.budgetMax.toLocaleString()}`
      );
    } else if (criteria.budgetMin) {
      parts.push(`Min: CHF ${criteria.budgetMin.toLocaleString()}`);
    } else if (criteria.budgetMax) {
      parts.push(`Max: CHF ${criteria.budgetMax.toLocaleString()}`);
    }
    if (criteria.surfaceMin || criteria.surfaceMax) {
      if (criteria.surfaceMin && criteria.surfaceMax) {
        parts.push(`${criteria.surfaceMin}-${criteria.surfaceMax}m²`);
      } else if (criteria.surfaceMin) {
        parts.push(`≥${criteria.surfaceMin}m²`);
      }
    }
    if (criteria.isRenewable !== undefined) {
      parts.push(criteria.isRenewable ? "♻️ Reconductible" : "Ponctuel");
    }

    return parts.length > 0 ? parts.join(" • ") : "Tous les appels d'offres";
  };

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <div className="flex items-start justify-between">
          <HandDrawnCardTitle className="text-lg">
            {search.name}
          </HandDrawnCardTitle>
          <Badge
            variant={search.alertsEnabled ? "default" : "outline"}
            className={
              search.alertsEnabled ? "bg-artisan-yellow text-matte-black" : ""
            }
          >
            {search.alertsEnabled ? (
              <>
                <Bell className="w-3 h-3 mr-1" />
                Alertes ON
              </>
            ) : (
              <>
                <BellOff className="w-3 h-3 mr-1" />
                Alertes OFF
              </>
            )}
          </Badge>
        </div>
      </HandDrawnCardHeader>

      <HandDrawnCardContent>
        <p className="text-sm text-muted-foreground mb-4">{formatCriteria()}</p>

        <div className="flex gap-2">
          <Link href={buildSearchUrl()} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir les résultats
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAlerts}
            disabled={loading}
          >
            {search.alertsEnabled ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Créée le{" "}
          {new Date(search.createdAt).toLocaleDateString("fr-CH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
