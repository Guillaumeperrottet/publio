"use client";

import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { TrendingUp, TrendingDown } from "lucide-react";

type ActivityData = {
  date: string;
  tenders: number;
  offers: number;
};

type ActivityChartProps = {
  data: ActivityData[];
};

export function ActivityChart({ data }: ActivityChartProps) {
  if (data.length === 0) {
    return null;
  }

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.tenders, d.offers)),
    1
  );

  // Calculer la tendance
  const recentTotal = data
    .slice(-3)
    .reduce((sum, d) => sum + d.tenders + d.offers, 0);
  const oldTotal = data
    .slice(0, 3)
    .reduce((sum, d) => sum + d.tenders + d.offers, 0);
  const trend = recentTotal >= oldTotal ? "up" : "down";
  const trendPercent =
    oldTotal > 0 ? Math.round(((recentTotal - oldTotal) / oldTotal) * 100) : 0;

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <div className="flex items-center justify-between">
          <HandDrawnCardTitle>Activité des 7 derniers jours</HandDrawnCardTitle>
          {trendPercent !== 0 && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trend === "up" ? "text-deep-green" : "text-red-500"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(trendPercent)}%
            </div>
          )}
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((item, index) => {
            const tenderHeight = (item.tenders / maxValue) * 100;
            const offerHeight = (item.offers / maxValue) * 100;
            const date = new Date(item.date);
            const dayName = date.toLocaleDateString("fr-FR", {
              weekday: "short",
            });

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full flex items-end justify-center gap-1 h-24">
                  {/* Barre tenders */}
                  {item.tenders > 0 && (
                    <div
                      className="w-2 bg-artisan-yellow rounded-t-sm transition-all hover:opacity-80 relative group"
                      style={{ height: `${tenderHeight}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-matte-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.tenders} appel{item.tenders > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                  {/* Barre offers */}
                  {item.offers > 0 && (
                    <div
                      className="w-2 bg-deep-green rounded-t-sm transition-all hover:opacity-80 relative group"
                      style={{ height: `${offerHeight}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-matte-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.offers} offre{item.offers > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                  {item.tenders === 0 && item.offers === 0 && (
                    <div className="w-2 h-1 bg-gray-200 rounded"></div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-artisan-yellow rounded"></div>
            <span className="text-xs text-muted-foreground">
              Appels d&apos;offres
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-deep-green rounded"></div>
            <span className="text-xs text-muted-foreground">Offres</span>
          </div>
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
