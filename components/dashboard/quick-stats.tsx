import { FileText, Send, Search, TrendingUp } from "lucide-react";

type QuickStatsProps = {
  activeTenders: number;
  submittedOffers: number;
  savedSearches: number;
  newMatches?: number;
};

export function QuickStats({
  activeTenders,
  submittedOffers,
  savedSearches,
  newMatches = 0,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-linear-to-br from-artisan-yellow/10 to-artisan-yellow/5 border-2 border-artisan-yellow/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-artisan-yellow/20 rounded-lg">
            <FileText className="w-5 h-5 text-artisan-yellow" />
          </div>
          <div>
            <p className="text-2xl font-bold text-matte-black">
              {activeTenders}
            </p>
            <p className="text-xs text-muted-foreground">Appels actifs</p>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-deep-green/10 to-deep-green/5 border-2 border-deep-green/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-deep-green/20 rounded-lg">
            <Send className="w-5 h-5 text-deep-green" />
          </div>
          <div>
            <p className="text-2xl font-bold text-matte-black">
              {submittedOffers}
            </p>
            <p className="text-xs text-muted-foreground">Offres déposées</p>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-olive-soft/10 to-olive-soft/5 border-2 border-olive-soft/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-olive-soft/20 rounded-lg">
            <Search className="w-5 h-5 text-olive-soft" />
          </div>
          <div>
            <p className="text-2xl font-bold text-matte-black">
              {savedSearches}
            </p>
            <p className="text-xs text-muted-foreground">Recherches actives</p>
          </div>
        </div>
      </div>

      {newMatches > 0 && (
        <div className="bg-linear-to-br from-artisan-yellow/20 to-artisan-yellow/10 border-2 border-artisan-yellow rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-artisan-yellow rounded-lg">
              <TrendingUp className="w-5 h-5 text-matte-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-matte-black">
                {newMatches}
              </p>
              <p className="text-xs text-matte-black font-medium">
                Nouveaux matches
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
