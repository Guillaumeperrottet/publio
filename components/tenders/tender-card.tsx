import Link from "next/link";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Calendar,
  Euro,
  FileText,
  EyeOff,
} from "lucide-react";

type TenderCardProps = {
  tender: {
    id: string;
    title: string;
    description: string;
    budget?: number | null;
    deadline: Date;
    location?: string | null;
    city?: string | null;
    canton?: string | null;
    marketType: string;
    mode: string;
    createdAt: Date;
    organization: {
      name: string;
      type: string;
      city?: string | null;
      canton?: string | null;
    };
    _count: {
      offers: number;
    };
  };
};

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

const organizationTypeLabels: Record<string, string> = {
  COMMUNE: "Commune",
  ENTREPRISE: "Entreprise",
  PRIVE: "Privé",
};

export function TenderCard({ tender }: TenderCardProps) {
  const isAnonymous = tender.mode === "ANONYMOUS";
  const now = new Date().getTime();
  const deadline = new Date(tender.deadline).getTime();
  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isExpired = now > deadline;
  const isUrgent = daysUntilDeadline <= 7 && !isExpired;

  return (
    <Link href={`/tenders/${tender.id}`}>
      <HandDrawnCard className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <HandDrawnCardContent className="p-6">
          {/* Header avec badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-matte-black hover:text-artisan-yellow transition-colors">
                {tender.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <HandDrawnBadge variant="default">
                  {marketTypeLabels[tender.marketType] || tender.marketType}
                </HandDrawnBadge>
                {isAnonymous && (
                  <Badge
                    variant="outline"
                    className="border-deep-green text-deep-green"
                  >
                    <EyeOff className="w-3 h-3 mr-1" />
                    Offres anonymes
                  </Badge>
                )}
                {isUrgent && (
                  <Badge variant="destructive" className="animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {tender.description}
          </p>

          {/* Informations principales */}
          <div className="space-y-2 mb-4">
            {/* Organisation - masquée si anonyme et deadline non passée */}
            {(!isAnonymous || isExpired) && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-olive-soft" />
                <span className="font-medium">{tender.organization.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {organizationTypeLabels[tender.organization.type]}
                </Badge>
              </div>
            )}

            {/* Message si organisation masquée */}
            {isAnonymous && !isExpired && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <EyeOff className="w-3 h-3" />
                <span className="text-xs italic">Organisation masquée</span>
              </div>
            )}

            {/* Localisation */}
            {(tender.city || tender.canton) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {tender.city && tender.canton
                    ? `${tender.city}, ${tender.canton}`
                    : tender.city || tender.canton}
                </span>
              </div>
            )}

            {/* Budget */}
            {tender.budget && (
              <div className="flex items-center gap-2 text-sm">
                <Euro className="w-4 h-4 text-artisan-yellow" />
                <span className="font-semibold text-artisan-yellow">
                  CHF {tender.budget.toLocaleString("fr-CH")}
                </span>
                <span className="text-xs text-muted-foreground">indicatif</span>
              </div>
            )}

            {/* Deadline */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar
                className={`w-4 h-4 ${
                  isUrgent ? "text-red-500" : "text-olive-soft"
                }`}
              />
              <span className={isUrgent ? "text-red-500 font-semibold" : ""}>
                {daysUntilDeadline > 0
                  ? `${daysUntilDeadline} jour${
                      daysUntilDeadline > 1 ? "s" : ""
                    } restant${daysUntilDeadline > 1 ? "s" : ""}`
                  : "Deadline passée"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-sand-light">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span>
                {tender._count.offers} offre
                {tender._count.offers !== 1 ? "s" : ""}
              </span>
            </div>
            <Button size="sm" variant="default">
              Voir l&apos;offre →
            </Button>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    </Link>
  );
}
