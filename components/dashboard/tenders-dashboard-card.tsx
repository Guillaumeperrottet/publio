import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Clock, Send, Plus } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Tender = {
  id: string;
  title: string;
  status: string;
  deadline: Date;
  city: string | null;
  canton: string | null;
  _count?: {
    offers: number;
  };
};

type TendersDashboardCardProps = {
  tenders: Tender[];
  activeTenders: number;
  draftTenders: number;
  urgentCount: number;
};

export function TendersDashboardCard({
  tenders,
  activeTenders,
  draftTenders,
  urgentCount,
}: TendersDashboardCardProps) {
  // Prendre les 3 appels les plus récents (publiés ou urgents)
  const now = new Date();
  const recentTenders = tenders
    .filter((t) => t.status === "PUBLISHED")
    .sort((a, b) => {
      // Trier par urgence puis par deadline
      const aHours =
        (new Date(a.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      const bHours =
        (new Date(b.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      return aHours - bHours;
    })
    .slice(0, 3);

  if (tenders.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle>Mes appels d&apos;offres</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="text-center py-6">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-matte-black mb-1">
              Aucun appel d&apos;offre
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Créez votre premier appel d&apos;offre
            </p>
            <Link href="/dashboard/tenders/new">
              <Button size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Créer un appel
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
        <div className="flex items-center justify-between">
          <HandDrawnCardTitle>Mes appels d&apos;offres</HandDrawnCardTitle>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="font-bold">
              {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="mb-4 flex gap-2 flex-wrap">
          <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black">
            {activeTenders} actif{activeTenders > 1 ? "s" : ""}
          </Badge>
          {draftTenders > 0 && (
            <Badge variant="secondary">
              {draftTenders} brouillon{draftTenders > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {recentTenders.length > 0 && (
          <div className="space-y-3 mb-4">
            {recentTenders.map((tender) => {
              const isExpired = new Date(tender.deadline) < now;
              const hoursUntil =
                (new Date(tender.deadline).getTime() - now.getTime()) /
                (1000 * 60 * 60);
              const isUrgent = hoursUntil <= 48 && hoursUntil > 0;

              return (
                <Link
                  key={tender.id}
                  href={`/dashboard/tenders/${tender.id}`}
                  className={`block p-3 rounded-lg border-2 transition-all group ${
                    isUrgent
                      ? "border-red-300 bg-red-50 hover:border-red-500"
                      : "border-gray-200 hover:border-artisan-yellow hover:bg-artisan-yellow/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-artisan-yellow transition-colors flex-1">
                      {tender.title}
                    </h4>
                    {isUrgent && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {tender.city && tender.canton && (
                      <>
                        <span className="text-muted-foreground">
                          {tender.city}, {tender.canton}
                        </span>
                        <span className="text-muted-foreground">•</span>
                      </>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
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
                    {tender._count && tender._count.offers > 0 && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-artisan-yellow font-semibold">
                          <Send className="w-3 h-3" />
                          <span>
                            {tender._count.offers} offre
                            {tender._count.offers > 1 ? "s" : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link href="/dashboard/tenders">
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Voir mes appels
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
