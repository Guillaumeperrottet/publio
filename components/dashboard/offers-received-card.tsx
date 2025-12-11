import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Send, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type TenderWithOffers = {
  id: string;
  title: string;
  status: string;
  totalOffers: number;
  unreadOffers: number;
  deadline: Date;
  createdAt: Date;
};

type OffersReceivedCardProps = {
  tendersWithOffers: TenderWithOffers[];
};

export function OffersReceivedCard({
  tendersWithOffers,
}: OffersReceivedCardProps) {
  // Filtrer les tenders qui ont des offres
  const tendersWithActualOffers = tendersWithOffers.filter(
    (t) => t.totalOffers > 0
  );

  // Calculer le total d'offres et non lues
  const totalOffers = tendersWithOffers.reduce(
    (sum, t) => sum + t.totalOffers,
    0
  );
  const totalUnread = tendersWithOffers.reduce(
    (sum, t) => sum + t.unreadOffers,
    0
  );

  if (tendersWithActualOffers.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader className="pb-2">
          <HandDrawnCardTitle className="text-sm">
            Offres reçues
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent className="pt-2">
          <div className="text-center py-4">
            <Send className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs font-medium text-matte-black mb-0.5">
              Aucune offre reçue
            </p>
            <p className="text-[11px] text-muted-foreground">
              Vos offres apparaîtront ici
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  return (
    <HandDrawnCard
      className={totalUnread > 0 ? "border-artisan-yellow border-2" : ""}
    >
      <HandDrawnCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <HandDrawnCardTitle className="text-sm">
            Offres reçues
          </HandDrawnCardTitle>
          {totalUnread > 0 && (
            <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold text-xs">
              {totalUnread}
            </Badge>
          )}
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent className="pt-2">
        <div className="mb-2">
          <p className="text-xs text-muted-foreground">
            {totalOffers} offre{totalOffers > 1 ? "s" : ""} sur{" "}
            {tendersWithActualOffers.length} appel
            {tendersWithActualOffers.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-1.5">
          {tendersWithActualOffers.slice(0, 3).map((tender) => {
            const now = new Date();
            const isExpired = new Date(tender.deadline) < now;
            const hoursUntil =
              (new Date(tender.deadline).getTime() - now.getTime()) /
              (1000 * 60 * 60);
            const isUrgent = hoursUntil <= 48 && hoursUntil > 0;

            return (
              <Link
                key={tender.id}
                href={`/dashboard/tenders/${tender.id}`}
                className={`block p-2 rounded-lg border-2 transition-all group ${
                  isUrgent
                    ? "border-red-300 bg-red-50 hover:border-red-500"
                    : tender.unreadOffers > 0
                    ? "border-artisan-yellow bg-artisan-yellow/5 hover:border-artisan-yellow/70"
                    : "border-gray-200 hover:border-deep-green hover:bg-deep-green/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-xs truncate group-hover:text-deep-green transition-colors">
                        {tender.title}
                      </h3>
                      {isUrgent && (
                        <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {isExpired
                            ? "Expiré"
                            : formatDistanceToNow(new Date(tender.deadline), {
                                addSuffix: true,
                                locale: fr,
                              })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-deep-green text-white font-semibold text-[10px] px-1.5 py-0">
                        {tender.totalOffers} offre
                        {tender.totalOffers > 1 ? "s" : ""}
                      </Badge>
                      {tender.unreadOffers > 0 && (
                        <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold text-[10px] px-1.5 py-0">
                          {tender.unreadOffers} nouvelle
                          {tender.unreadOffers > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {tendersWithActualOffers.length > 5 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            + {tendersWithActualOffers.length - 5} autre
            {tendersWithActualOffers.length - 5 > 1 ? "s" : ""} appel
            {tendersWithActualOffers.length - 5 > 1 ? "s" : ""} avec offres
          </p>
        )}
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
