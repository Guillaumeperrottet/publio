"use client";

import Link from "next/link";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Euro,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WithdrawOfferButton } from "@/components/offers/withdraw-offer-button";

const statusLabels: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: string;
  }
> = {
  DRAFT: {
    label: "Brouillon",
    icon: Clock,
    variant: "secondary",
  },
  SUBMITTED: {
    label: "Soumise",
    icon: CheckCircle,
    variant: "success",
  },
  WITHDRAWN: {
    label: "Retirée",
    icon: XCircle,
    variant: "error",
  },
  ACCEPTED: {
    label: "Acceptée",
    icon: CheckCircle,
    variant: "success",
  },
  REJECTED: {
    label: "Rejetée",
    icon: XCircle,
    variant: "error",
  },
};

interface OffersListProps {
  offers: Array<{
    id: string;
    price: number;
    currency: string;
    status: string;
    submittedAt: Date | null;
    createdAt: Date;
    paymentStatus: string;
    tender: {
      id: string;
      title: string;
      deadline: Date;
      organization: {
        id: string;
        name: string;
        type: string;
      };
    };
  }>;
}

export function OffersList({ offers }: OffersListProps) {
  if (offers.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucune offre déposée</h3>
          <p className="text-muted-foreground mb-6">
            Vous n&apos;avez pas encore soumis d&apos;offre.
          </p>
          <Link href="/tenders">
            <Button>Parcourir les appels d&apos;offres</Button>
          </Link>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {offers.map((offer) => {
        const statusInfo = statusLabels[offer.status] || statusLabels.DRAFT;
        const StatusIcon = statusInfo.icon;

        return (
          <HandDrawnCard key={offer.id}>
            <HandDrawnCardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Contenu principal */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <Link href={`/tenders/${offer.tender.id}`}>
                        <h3 className="text-xl font-semibold hover:text-artisan-yellow transition-colors mb-2">
                          {offer.tender.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <HandDrawnBadge>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </HandDrawnBadge>
                        {offer.paymentStatus === "PAID" && (
                          <HandDrawnBadge>Payée</HandDrawnBadge>
                        )}
                        {offer.paymentStatus === "PENDING" && (
                          <HandDrawnBadge>Paiement en attente</HandDrawnBadge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{offer.tender.organization.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Euro className="w-4 h-4" />
                      <span className="font-semibold">
                        {new Intl.NumberFormat("fr-CH", {
                          style: "currency",
                          currency: offer.currency,
                        }).format(offer.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {offer.submittedAt
                          ? `Soumise le ${format(
                              new Date(offer.submittedAt),
                              "dd MMM yyyy",
                              { locale: fr }
                            )}`
                          : "Non soumise"}
                      </span>
                    </div>
                  </div>

                  {/* Date limite du tender */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-muted-foreground">
                      Date limite de l&apos;appel d&apos;offres :{" "}
                      {format(
                        new Date(offer.tender.deadline),
                        "dd MMMM yyyy 'à' HH:mm",
                        { locale: fr }
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2">
                  {offer.status === "SUBMITTED" && (
                    <WithdrawOfferButton
                      offerId={offer.id}
                      tenderTitle={offer.tender.title}
                      tenderDeadline={offer.tender.deadline}
                    />
                  )}
                  <Link href={`/tenders/${offer.tender.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir l&apos;appel d&apos;offre
                    </Button>
                  </Link>
                </div>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        );
      })}
    </div>
  );
}
