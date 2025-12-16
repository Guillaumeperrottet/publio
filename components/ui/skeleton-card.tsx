import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";

/**
 * Skeleton pour les cartes de tenders/offres
 */
export function SkeletonCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-3">
          {/* Badge status */}
          <Skeleton className="h-6 w-24" />
          {/* Titre */}
          <Skeleton className="h-6 w-3/4" />
          {/* Organisation */}
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Description */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />

          {/* Infos (budget, deadline, etc.) */}
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>

          {/* Boutons */}
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour les cartes hand-drawn
 */
export function SkeletonHandDrawnCard() {
  return (
    <div className="border-2 border-matte-black rounded-lg p-6 bg-white">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Footer avec badges */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Liste de cartes skeleton
 */
export function SkeletonCardList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Liste de cartes hand-drawn skeleton
 */
export function SkeletonHandDrawnCardList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonHandDrawnCard key={i} />
      ))}
    </div>
  );
}
