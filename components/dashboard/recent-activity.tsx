import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText, Clock, Search as SearchIcon } from "lucide-react";
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

type SavedSearchWithMatches = {
  id: string;
  name: string;
  newMatches: number;
};

type VeilleUpdate = {
  id: string;
  canton: string;
  newPublications: number;
};

export function RecentActivity({
  tendersWithUnread,
  savedSearches = [],
  veilleUpdates = [],
}: {
  tendersWithUnread: TenderWithUnread[];
  savedSearches?: SavedSearchWithMatches[];
  veilleUpdates?: VeilleUpdate[];
}) {
  // Filtrer seulement les tenders avec des offres non lues
  const tendersWithNewOffers = tendersWithUnread.filter(
    (t) => t.unreadOffers > 0
  );

  const totalUnread = tendersWithNewOffers.reduce(
    (sum, t) => sum + t.unreadOffers,
    0
  );

  const totalSearchMatches = savedSearches.reduce(
    (sum, s) => sum + s.newMatches,
    0
  );

  const totalVeille = veilleUpdates.reduce(
    (sum, v) => sum + v.newPublications,
    0
  );

  const hasActivity =
    tendersWithNewOffers.length > 0 ||
    savedSearches.length > 0 ||
    veilleUpdates.length > 0;

  if (!hasActivity) {
    return null;
  }

  return (
    <HandDrawnCard className="border-artisan-yellow border-2">
      <HandDrawnCardHeader>
        <div className="flex items-center justify-between">
          <HandDrawnCardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-artisan-yellow" />
            Activité récente
          </HandDrawnCardTitle>
          <div className="flex gap-2">
            {totalUnread > 0 && (
              <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold">
                {totalUnread} offre{totalUnread > 1 ? "s" : ""}
              </Badge>
            )}
            {totalSearchMatches > 0 && (
              <Badge className="bg-deep-green text-white font-bold">
                {totalSearchMatches} match{totalSearchMatches > 1 ? "es" : ""}
              </Badge>
            )}
            {totalVeille > 0 && (
              <Badge className="bg-olive-soft text-white font-bold">
                {totalVeille} veille
              </Badge>
            )}
          </div>
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="space-y-3">
          {/* Nouvelles offres reçues */}
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

          {/* Nouveaux matches de recherches sauvegardées */}
          {savedSearches.map((search) => (
            <Link
              key={search.id}
              href={`/dashboard/saved-searches`}
              className="block p-4 rounded-lg border-2 border-gray-200 hover:border-deep-green hover:bg-deep-green/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SearchIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <h3 className="font-semibold text-sm truncate group-hover:text-deep-green transition-colors">
                      {search.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Votre recherche sauvegardée a de nouveaux résultats
                  </p>
                </div>
                <Badge className="bg-artisan-yellow text-matte-black font-bold shrink-0 border-2 border-matte-black">
                  {search.newMatches} nouveau{search.newMatches > 1 ? "x" : ""}
                </Badge>
              </div>
            </Link>
          ))}

          {/* Mises à jour veille */}
          {veilleUpdates.map((veille) => (
            <Link
              key={veille.id}
              href={`/dashboard/veille`}
              className="block p-4 rounded-lg border-2 border-gray-200 hover:border-olive-soft hover:bg-olive-soft/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
                    <h3 className="font-semibold text-sm group-hover:text-olive-soft transition-colors">
                      Veille {veille.canton}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nouvelles publications détectées
                  </p>
                </div>
                <Badge className="bg-olive-soft text-white font-bold shrink-0">
                  {veille.newPublications}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
