import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar, Euro, EyeOff } from "lucide-react";

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
  const isNew =
    new Date().getTime() - new Date(tender.createdAt).getTime() <
    1 * 24 * 60 * 60 * 1000; // 1 jour

  return (
    <Link href={`/tenders/${tender.id}`}>
      <div className="bg-white border-2 border-matte-black rounded-lg p-5 hover:shadow-lg hover:border-artisan-yellow transition-all cursor-pointer h-full flex flex-col">
        {/* Header avec badges */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {isNew && (
              <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold">
                NOUVEAU
              </Badge>
            )}
            {isUrgent && (
              <Badge variant="destructive" className="font-bold">
                {daysUntilDeadline}j restants
              </Badge>
            )}
            {isAnonymous && (
              <Badge
                variant="outline"
                className="border-deep-green text-deep-green border-2"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Anonyme
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-matte-black hover:text-artisan-yellow transition-colors line-clamp-2">
            {tender.title}
          </h3>
        </div>

        {/* Key Info - Compact */}
        <div className="space-y-2 flex-1">
          {/* Organisation */}
          {(!isAnonymous || isExpired) && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-olive-soft shrink-0" />
              <span className="font-medium truncate">
                {tender.organization.name}
              </span>
            </div>
          )}

          {/* Localisation */}
          {(tender.city || tender.canton) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {tender.city && tender.canton
                  ? `${tender.city}, ${tender.canton}`
                  : tender.city || tender.canton}
              </span>
            </div>
          )}

          {/* Budget */}
          {tender.budget && (
            <div className="flex items-center gap-2 text-sm">
              <Euro className="w-4 h-4 text-artisan-yellow shrink-0" />
              <span className="font-semibold">
                CHF {tender.budget.toLocaleString("fr-CH")}
              </span>
            </div>
          )}

          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar
              className={`w-4 h-4 shrink-0 ${
                isUrgent ? "text-red-500" : "text-olive-soft"
              }`}
            />
            <span className={isUrgent ? "text-red-500 font-semibold" : ""}>
              {daysUntilDeadline > 0
                ? `Échéance: ${daysUntilDeadline}j`
                : "Deadline passée"}
            </span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            className="w-full bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black"
          >
            Voir le projet →
          </Button>
        </div>
      </div>
    </Link>
  );
}
