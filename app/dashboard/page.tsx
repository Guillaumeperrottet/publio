import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getOrganizationTenders } from "@/features/tenders/actions";
import {
  getOrganizationOffers,
  getTendersWithUnreadOffers,
} from "@/features/offers/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Send, Plus } from "lucide-react";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur a une organisation
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    // Pas d'organisation, rediriger vers l'onboarding
    redirect("/onboarding");
  }

  // Prendre la première organisation (on pourra ajouter un sélecteur plus tard)
  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  // Récupérer les statistiques
  const tenders = await getOrganizationTenders(organization.id);
  const offers = await getOrganizationOffers(organization.id);
  const tendersWithUnread = await getTendersWithUnreadOffers(organization.id);

  const activeTenders = tenders.filter((t) => t.status === "PUBLISHED").length;
  const submittedOffers = offers.filter((o) => o.status === "SUBMITTED").length;

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-matte-black mb-2">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">{organization.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="text-xl font-semibold">
                Mes appels d&apos;offres
              </HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-5xl font-bold text-artisan-yellow mb-2">
                {activeTenders}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Appels actifs
              </p>
              <Link href="/dashboard/tenders">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Gérer mes appels
                </Button>
              </Link>
            </HandDrawnCardContent>
          </HandDrawnCard>

          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="text-xl font-semibold">
                Mes offres
              </HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-5xl font-bold text-deep-green mb-2">
                {submittedOffers}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Offres déposées
              </p>
              <Link href="/dashboard/offers">
                <Button variant="outline" size="sm" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Voir mes offres
                </Button>
              </Link>
            </HandDrawnCardContent>
          </HandDrawnCard>

          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="text-xl font-semibold">
                Veille active
              </HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-5xl font-bold text-olive-soft mb-2">0</p>
              <p className="text-sm text-muted-foreground mb-4">
                Communes suivies
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Bientôt disponible
              </Button>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>

        {/* Activité récente */}
        {tendersWithUnread.length > 0 && (
          <div className="mb-8">
            <RecentActivity tendersWithUnread={tendersWithUnread} />
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HandDrawnCard>
            <HandDrawnCardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Créer un appel d&apos;offre
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Publiez un nouvel appel d&apos;offres et recevez des
                propositions de qualité
              </p>
              <Link href="/dashboard/tenders/new">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un appel d&apos;offre
                </Button>
              </Link>
            </HandDrawnCardContent>
          </HandDrawnCard>

          <HandDrawnCard>
            <HandDrawnCardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                Parcourir les appels d&apos;offres
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Découvrez les opportunités et soumettez vos offres
              </p>
              <Link href="/tenders">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Voir les appels d&apos;offres
                </Button>
              </Link>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    </ProtectedLayout>
  );
}
