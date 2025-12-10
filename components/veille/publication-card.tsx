"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PUBLICATION_TYPE_LABELS,
  PUBLICATION_TYPE_ICONS,
  type PublicationType,
} from "@/features/veille/types";

interface PublicationCardProps {
  publication: {
    id: string;
    title: string;
    description?: string | null;
    url: string;
    commune: string;
    canton: string;
    type: string;
    publishedAt: Date;
    metadata?: {
      parcelle?: string;
      adresse?: string;
      superficie?: string;
      auteur?: string;
      pdfUrl?: string;
      source?: string;
      plateforme?: string;
      projectNumber?: string;
      procOfficeName?: string;
      projectType?: string;
      cantonId?: string;
    } | null;
  };
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const typeLabel =
    PUBLICATION_TYPE_LABELS[publication.type as PublicationType] ||
    "Publication";
  const typeIcon =
    PUBLICATION_TYPE_ICONS[publication.type as PublicationType] || "📄";

  const metadata = publication.metadata as {
    parcelle?: string;
    adresse?: string;
    superficie?: string;
    auteur?: string;
    pdfUrl?: string;
    source?: string;
    plateforme?: string;
    projectNumber?: string;
    procOfficeName?: string;
    projectType?: string;
    cantonId?: string;
  } | null;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-artisan-yellow transition-colors bg-white">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{typeIcon}</span>
            <Badge variant="outline" className="text-xs">
              {typeLabel}
            </Badge>
          </div>
          <h3 className="font-semibold text-matte-black mb-1 leading-tight">
            {publication.title}
          </h3>
        </div>
      </div>

      {publication.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {publication.description}
        </p>
      )}

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            {publication.commune} ({publication.canton})
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDistanceToNow(new Date(publication.publishedAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        </div>

        {metadata?.adresse && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Adresse:</span> {metadata.adresse}
          </div>
        )}

        {metadata?.superficie && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Surface:</span> {metadata.superficie}
          </div>
        )}

        {metadata?.parcelle && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Parcelle:</span> {metadata.parcelle}
          </div>
        )}

        {metadata?.procOfficeName && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Adjudicateur:</span>{" "}
            {metadata.procOfficeName}
          </div>
        )}

        {metadata?.projectNumber && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">N° projet:</span>{" "}
            {metadata.projectNumber}
          </div>
        )}

        {metadata?.source && (
          <Badge variant="outline" className="mt-2 text-xs">
            {metadata.source === "SIMAP" ? "🇨🇭 SIMAP" : metadata.source}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <a href={publication.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Voir l&apos;avis officiel
          </a>
        </Button>

        {metadata?.pdfUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={metadata.pdfUrl} target="_blank" rel="noopener noreferrer">
              PDF
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
