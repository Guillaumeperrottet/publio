"use client";

import { toast } from "sonner";

import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Button } from "@/components/ui/button";
import { MapPin, Euro, FileText, Eye, Download, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RevealIdentitiesButton } from "@/components/tenders/reveal-identities-button";
import { CloseTenderButton } from "@/components/tenders/close-tender-button";

const marketTypeLabels: Record<string, string> = {
  CONSTRUCTION: "Construction",
  ENGINEERING: "Ingénierie",
  ARCHITECTURE: "Architecture",
  IT_SERVICES: "Services IT",
  CONSULTING: "Conseil",
  SUPPLIES: "Fournitures",
  MAINTENANCE: "Maintenance",
  OTHER: "Autre",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CLOSED: "Clôturé",
  AWARDED: "Attribué",
  CANCELLED: "Annulé",
};

interface TenderActionsPanelProps {
  tender: {
    id: string;
    title: string;
    status: string;
    marketType: string;
    budget: number | null;
    currency: string;
    deadline: Date;
    city: string | null;
    canton: string | null;
  };
  offersCount: number;
  canRevealIdentities: boolean;
  canCloseTender: boolean;
  isExpired: boolean;
}

export function TenderActionsPanel({
  tender,
  offersCount,
  canRevealIdentities,
  canCloseTender,
  isExpired,
}: TenderActionsPanelProps) {
  const deadline = new Date(tender.deadline);

  return (
    <div className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-24 border-2 border-matte-black rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-sand-light border-b-2 border-matte-black">
          <h3 className="font-semibold text-lg">Actions rapides</h3>
          <p className="text-xs text-muted-foreground mt-1">{tender.title}</p>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-4">
          {/* Statut actuel */}
          <div className="p-3 border-2 border-gray-200 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Statut actuel</p>
            <HandDrawnBadge>
              {statusLabels[tender.status] || tender.status}
            </HandDrawnBadge>
          </div>

          {/* Statistiques rapides */}
          <div className="p-3 border-2 border-artisan-yellow/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Offres reçues</p>
            <p className="font-semibold text-2xl text-artisan-yellow">
              {offersCount}
            </p>
          </div>

          {/* Échéance */}
          <div className="p-3 border-2 border-gray-200 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Échéance</p>
            <p className="font-medium text-sm">
              {format(deadline, "dd MMMM yyyy", { locale: fr })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              à {format(deadline, "HH:mm", { locale: fr })}
            </p>
            {isExpired && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                ⚠️ Échéance dépassée
              </p>
            )}
          </div>

          {/* Actions principales */}
          <div className="space-y-2 pt-2">
            {/* Mode anonyme - Révéler identités */}
            {canRevealIdentities && (
              <RevealIdentitiesButton tenderId={tender.id} />
            )}

            {/* Clôturer */}
            {canCloseTender && (
              <CloseTenderButton
                tenderId={tender.id}
                offersCount={offersCount}
              />
            )}

            {/* Voir page publique */}
            <Link
              href={`/tenders/${tender.id}`}
              target="_blank"
              className="block"
            >
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Page publique
              </Button>
            </Link>

            {/* Éditer (si brouillon) */}
            {tender.status === "DRAFT" && (
              <Link
                href={`/dashboard/tenders/${tender.id}/edit`}
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Éditer le brouillon
                </Button>
              </Link>
            )}

            {/* Exporter en PDF */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // TODO: Implémenter l'export PDF
                toast.error("Export PDF à venir");
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter en PDF
            </Button>
          </div>

          {/* Info complémentaire */}
          <div className="pt-4 border-t-2 border-gray-200">
            <p className="text-xs text-muted-foreground space-y-1">
              {tender.city && tender.canton && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tender.city}, {tender.canton}
                </span>
              )}
              {tender.budget && (
                <span className="flex items-center gap-1 mt-1">
                  <Euro className="w-3 h-3" />
                  {new Intl.NumberFormat("fr-CH", {
                    style: "currency",
                    currency: tender.currency,
                    maximumFractionDigits: 0,
                  }).format(tender.budget)}
                </span>
              )}
              <span className="flex items-center gap-1 mt-1">
                <FileText className="w-3 h-3" />
                {marketTypeLabels[tender.marketType]}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
