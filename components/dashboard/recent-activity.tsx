import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type TenderWithUnread = {
  id: string;
  title: string;
  status: string;
  totalOffers: number;
  unreadOffers: number;
  deadline: Date;
  createdAt: Date;
};

export function RecentActivity({
  tendersWithUnread,
}: {
  tendersWithUnread: TenderWithUnread[];
}) {
  // Filtrer seulement les tenders avec des offres non lues
  const tendersWithNewOffers = tendersWithUnread.filter(
    (t) => t.unreadOffers > 0
  );

  if (tendersWithNewOffers.length === 0) {
    return null;
  }

  const totalUnread = tendersWithNewOffers.reduce(
    (sum, t) => sum + t.unreadOffers,
    0
  );

  return (
    <HandDrawnCard className="border-artisan-yellow border-2">
      <HandDrawnCardHeader>
        <div className="flex items-center justify-between">
          <HandDrawnCardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-artisan-yellow" />
            Activité récente
          </HandDrawnCardTitle>
          <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold">
            {totalUnread} nouvelle{totalUnread > 1 ? "s" : ""} offre
            {totalUnread > 1 ? "s" : ""}
          </Badge>
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="space-y-3">
          {tendersWithNewOffers.map((tender) => (
            <Link
              key={tender.id}
              href={`/dashboard/tenders/${tender.id}`}
              className="block p-4 rounded-lg border-2 border-gray-200 hover:border-artisan-yellow hover:bg-artisan-yellow/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <h3 className="font-semibold text-sm truncate group-hover:text-artisan-yellow transition-colors">
                      {tender.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(tender.deadline), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      {tender.totalOffers} offre
                      {tender.totalOffers > 1 ? "s" : ""} au total
                    </span>
                  </div>
                </div>
                <Badge
                  variant="default"
                  className="bg-deep-green text-white font-bold shrink-0"
                >
                  {tender.unreadOffers} nouvelle
                  {tender.unreadOffers > 1 ? "s" : ""}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
