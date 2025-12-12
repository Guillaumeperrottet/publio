import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSavedTenders } from "@/features/tenders/saved-actions";
import { TenderCard } from "@/components/tenders/tender-card";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import ProtectedLayout from "@/components/layout/protected-layout";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";

export default async function SavedTendersPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const result = await getSavedTenders();

  if (result.error || !result.savedTenders) {
    return (
      <ProtectedLayout>
        <div className="p-6 md:p-8 bg-white min-h-full">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Erreur lors du chargement des appels d&apos;offres sauvegardés
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const savedTenders = result.savedTenders;

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <HandDrawnHighlight variant="yellow">
              Appels d&apos;offres sauvegardés
            </HandDrawnHighlight>
          </h1>
          <p className="text-muted-foreground">
            {savedTenders.length}{" "}
            {savedTenders.length === 1
              ? "appel d'offres sauvegardé"
              : "appels d'offres sauvegardés"}
          </p>
        </div>

        {/* Filtres rapides */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-matte-black hover:bg-artisan-yellow hover:text-matte-black"
          >
            Nouveaux
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-matte-black hover:bg-artisan-yellow hover:text-matte-black"
          >
            Urgent
          </Button>
        </div>

        {/* Liste des tenders */}
        {savedTenders.length === 0 ? (
          <div className="text-center py-12 bg-sand-light/30 rounded-lg border-2 border-dashed border-matte-black/20">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-matte-black mb-2">
              Aucun appel d&apos;offres sauvegardé
            </h3>
            <p className="text-muted-foreground mb-6">
              Explorez les appels d&apos;offres et cliquez sur l&apos;icône
              signet pour les sauvegarder
            </p>
            <Link
              href="/tenders"
              className="inline-block bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold py-2 px-6 rounded-lg border-2 border-matte-black transition-all"
            >
              Parcourir les appels d&apos;offres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTenders.map((tender) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                isSaved={true}
                isAuthenticated={true}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
