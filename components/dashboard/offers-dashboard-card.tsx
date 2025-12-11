import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, ChevronRight, Clock, Search } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Offer = {
  id: string;
  status: string;
  price: number;
  currency: string;
  createdAt: Date;
  tender: {
    id: string;
    title: string;
    deadline: Date;
    organization: {
      name: string;
    };
  };
};

type OffersDashboardCardProps = {
  offers: Offer[];
  submittedOffers: number;
  draftOffers: number;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumise",
  SELECTED: "Sélectionnée",
  REJECTED: "Rejetée",
  WITHDRAWN: "Retirée",
};

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-deep-green text-white",
  SELECTED: "bg-artisan-yellow text-matte-black border-2 border-matte-black",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-700",
};

export function OffersDashboardCard({
  offers,
  submittedOffers,
  draftOffers,
}: OffersDashboardCardProps) {
  // Prendre les 3 offres les plus récentes
  const recentOffers = offers
    .filter((o) => o.status !== "DRAFT")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  if (offers.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle>Mes offres</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="text-center py-6">
            <Send className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-matte-black mb-1">
              Aucune offre déposée
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Parcourez les appels d&apos;offres disponibles
            </p>
            <Link href="/tenders">
              <Button variant="outline" size="sm" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Parcourir les appels
              </Button>
            </Link>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle>Mes offres</HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="mb-4 flex gap-2 flex-wrap">
          <Badge className="bg-deep-green text-white">
            {submittedOffers} soumise{submittedOffers > 1 ? "s" : ""}
          </Badge>
          {draftOffers > 0 && (
            <Badge variant="secondary">{draftOffers} en attente</Badge>
          )}
        </div>

        {recentOffers.length > 0 && (
          <div className="space-y-3 mb-4">
            {recentOffers.map((offer) => {
              const isExpired = new Date(offer.tender.deadline) < new Date();

              return (
                <Link
                  key={offer.id}
                  href={`/dashboard/offers`}
                  className="block p-3 rounded-lg border-2 border-gray-200 hover:border-deep-green hover:bg-deep-green/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-deep-green transition-colors flex-1">
                      {offer.tender.title}
                    </h4>
                    <Badge
                      className={`text-xs shrink-0 ${
                        statusColors[offer.status] || "bg-gray-100"
                      }`}
                    >
                      {statusLabels[offer.status] || offer.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-muted-foreground">
                      {offer.tender.organization.name}
                    </span>
                    {offer.price && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-semibold text-deep-green">
                          {new Intl.NumberFormat("fr-CH", {
                            style: "currency",
                            currency: offer.currency,
                            maximumFractionDigits: 0,
                          }).format(offer.price)}
                        </span>
                      </>
                    )}
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {isExpired
                          ? "Clôturé"
                          : formatDistanceToNow(
                              new Date(offer.tender.deadline),
                              {
                                addSuffix: true,
                                locale: fr,
                              }
                            )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link href="/dashboard/offers">
          <Button variant="outline" size="sm" className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Voir mes offres
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
