"use client";

import { useState, useMemo } from "react";
import { PublicationCard } from "./publication-card";
import { PublicationsFilters } from "./publications-filters";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";

interface Publication {
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
  } | null;
}

interface PublicationsListClientProps {
  publications: Publication[];
  cantons: string[];
}

export function PublicationsListClient({
  publications,
}: PublicationsListClientProps) {
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Extraire toutes les communes uniques des publications
  const communes = useMemo(() => {
    return Array.from(new Set(publications.map((p) => p.commune))).sort();
  }, [publications]);

  // Extraire toutes les sources uniques des publications
  const sources = useMemo(() => {
    const sourcesSet = new Set<string>();
    publications.forEach((p) => {
      if (p.metadata?.source) {
        sourcesSet.add(p.metadata.source);
      }
    });
    return Array.from(sourcesSet).sort();
  }, [publications]);

  // Filtrer les publications
  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      // Filtre par commune
      if (selectedCommune && pub.commune !== selectedCommune) {
        return false;
      }

      // Filtre par type
      if (selectedType && pub.type !== selectedType) {
        return false;
      }

      // Filtre par source
      if (selectedSource && pub.metadata?.source !== selectedSource) {
        return false;
      }

      // Filtre par recherche textuelle
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          pub.title.toLowerCase().includes(query) ||
          pub.description?.toLowerCase().includes(query) ||
          pub.commune.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [
    publications,
    selectedCommune,
    selectedType,
    selectedSource,
    searchQuery,
  ]);

  // Trier par date (plus récent en premier)
  const sortedPublications = useMemo(() => {
    return [...filteredPublications].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [filteredPublications]);

  return (
    <div>
      {/* Filtres */}
      <PublicationsFilters
        communes={communes}
        selectedCommune={selectedCommune}
        onCommuneChange={setSelectedCommune}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sources={sources}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={publications.length}
        filteredCount={filteredPublications.length}
      />

      {/* Liste des publications */}
      {sortedPublications.length === 0 ? (
        <HandDrawnCard>
          <HandDrawnCardContent className="text-center py-12">
            <p className="text-muted-foreground mb-2">
              {publications.length === 0
                ? "Aucune publication trouvée"
                : "Aucune publication ne correspond à vos filtres"}
            </p>
            {publications.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            )}
          </HandDrawnCardContent>
        </HandDrawnCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPublications.map((publication) => (
            <PublicationCard key={publication.id} publication={publication} />
          ))}
        </div>
      )}
    </div>
  );
}
