"use client";

import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Megaphone, FileText, TrendingUp } from "lucide-react";

interface UsageStatsCardProps {
  tenderCount: number;
  offerCount: number;
  totalSpent: number;
}

export function UsageStatsCard({
  tenderCount,
  offerCount,
  totalSpent,
}: UsageStatsCardProps) {
  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle>Utilisation</HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Appels d'offres publiés */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-artisan-yellow/20 mb-2">
              <Megaphone className="w-5 h-5 text-artisan-yellow" />
            </div>
            <p className="text-2xl font-bold text-matte-black mb-0.5">
              {tenderCount}
            </p>
            <p className="text-xs text-muted-foreground">
              Appels d&apos;offres publiés
            </p>
          </div>

          {/* Offres déposées */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-matte-black mb-0.5">
              {offerCount}
            </p>
            <p className="text-xs text-muted-foreground">Offres déposées</p>
          </div>

          {/* Total dépensé */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-matte-black mb-0.5">
              CHF {totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Total dépensé</p>
          </div>
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
