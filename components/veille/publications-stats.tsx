"use client";

import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, FileText, Calendar } from "lucide-react";

interface Publication {
  id: string;
  commune: string;
  type: string;
  publishedAt: Date;
}

interface PublicationsStatsProps {
  publications: Publication[];
}

export function PublicationsStats({ publications }: PublicationsStatsProps) {
  // Publications des dernières 24h
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const recentCount = publications.filter(
    (p) => new Date(p.publishedAt) >= yesterday
  ).length;

  // Publications par commune
  const byCommune = publications.reduce((acc, pub) => {
    acc[pub.commune] = (acc[pub.commune] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCommunes = Object.entries(byCommune)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Publications des 7 derniers jours
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const weekCount = publications.filter(
    (p) => new Date(p.publishedAt) >= lastWeek
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Nouvelles publications */}
      <HandDrawnCard>
        <HandDrawnCardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Dernières 24h
              </p>
              <p className="text-2xl font-bold text-matte-black">
                {recentCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-artisan-yellow/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-artisan-yellow" />
            </div>
          </div>
          {recentCount > 0 && (
            <Badge
              variant="default"
              className="mt-3 bg-artisan-yellow text-matte-black"
            >
              Nouveau !
            </Badge>
          )}
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Total */}
      <HandDrawnCard>
        <HandDrawnCardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold text-matte-black">
                {publications.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-deep-green/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-deep-green" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Toutes les publications
          </p>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Cette semaine */}
      <HandDrawnCard>
        <HandDrawnCardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Cette semaine
              </p>
              <p className="text-2xl font-bold text-matte-black">{weekCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">7 derniers jours</p>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Top commune */}
      <HandDrawnCard>
        <HandDrawnCardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground mb-1">Plus active</p>
              {topCommunes.length > 0 ? (
                <>
                  <p className="text-2xl font-bold text-matte-black truncate">
                    {topCommunes[0][1]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {topCommunes[0][0]}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-matte-black">-</p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    </div>
  );
}
