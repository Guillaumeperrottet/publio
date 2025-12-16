import { Suspense } from "react";
import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserSavedSearches } from "@/features/search/actions";
import { SavedSearchCard } from "@/components/search/saved-search-card";
import { SkeletonHandDrawnCardList } from "@/components/ui/skeleton-card";
import { BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SavedSearch } from "@prisma/client";

async function SavedSearchesContent() {
  const searches = await getUserSavedSearches();

  return (
    <>
      <div className="p-6 md:p-8 bg-white min-h-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-matte-black">
              Mes recherches sauvegardées
            </h1>
            <Link href="/tenders">
              <Button variant="outline">
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Nouvelle recherche
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Gérez vos recherches sauvegardées et configurez vos alertes email.
          </p>
        </div>

        {searches.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkPlus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune recherche sauvegardée
            </h3>
            <p className="text-muted-foreground mb-6">
              Sauvegardez vos recherches favorites pour les retrouver rapidement
              et recevoir des alertes.
            </p>
            <Link href="/tenders">
              <Button>Parcourir les appels d&apos;offres</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searches.map((search: SavedSearch) => (
              <SavedSearchCard key={search.id} search={search} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SavedSearchesSkeleton() {
  return (
    <div className="p-6 md:p-8 bg-white min-h-full">
      <div className="mb-8">
        <div className="h-10 w-80 bg-sand-light/50 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-sand-light/50 rounded animate-pulse" />
      </div>
      <SkeletonHandDrawnCardList count={6} />
    </div>
  );
}

export default function SavedSearchesPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<SavedSearchesSkeleton />}>
        <SavedSearchesContent />
      </Suspense>
    </ProtectedLayout>
  );
}
