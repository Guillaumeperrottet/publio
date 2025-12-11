import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type VeillePublication = {
  id: string;
  title: string;
  commune: string;
  canton: string;
  type: string;
  publishedAt: Date;
  url: string;
};

type VeilleDashboardCardProps = {
  publications: VeillePublication[];
  cantonsCount: number;
};

const typeLabels: Record<string, string> = {
  MISE_ENQUETE: "Mise à l'enquête",
  AVIS_CONSTRUCTION: "Avis de construction",
  PERMIS_CONSTRUIRE: "Permis de construire",
  AUTORISATION: "Autorisation",
  DECISION: "Décision",
  PUBLICATION_OFFICIELLE: "Publication officielle",
  OTHER: "Autre",
};

export function VeilleDashboardCard({
  publications,
  cantonsCount,
}: VeilleDashboardCardProps) {
  // Prendre les 3 publications les plus récentes
  const recentPublications = publications.slice(0, 3);

  // Compter les nouvelles publications des dernières 24h
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newCount = publications.filter(
    (p) => new Date(p.publishedAt) >= yesterday
  ).length;

  if (cantonsCount === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle>Veille & Alertes</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="text-center py-6">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-matte-black mb-1">
              Aucune veille active
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Configurez votre veille pour ne rien manquer
            </p>
            <Link href="/dashboard/veille">
              <Button variant="outline" size="sm" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Configurer la veille
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
          <HandDrawnCardTitle>Veille Communale</HandDrawnCardTitle>
          {newCount > 0 && (
            <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold">
              {newCount} nouvelle{newCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {cantonsCount} canton{cantonsCount > 1 ? "s" : ""} surveillé
            {cantonsCount > 1 ? "s" : ""} • {publications.length} publication
            {publications.length > 1 ? "s" : ""}
          </p>
        </div>

        {recentPublications.length > 0 && (
          <div className="space-y-3 mb-4">
            {recentPublications.map((pub) => (
              <a
                key={pub.id}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border-2 border-gray-200 hover:border-olive-soft hover:bg-olive-soft/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-olive-soft transition-colors flex-1">
                    {pub.title}
                  </h4>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[pub.type] || pub.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {pub.commune}, {pub.canton}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(pub.publishedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        <Link href="/dashboard/veille">
          <Button variant="outline" size="sm" className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Voir ma veille
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
