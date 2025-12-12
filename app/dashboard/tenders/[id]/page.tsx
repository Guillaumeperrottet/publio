import ProtectedLayout from "@/components/layout/protected-layout";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect, notFound } from "next/navigation";
import { getTenderById } from "@/features/tenders/actions";
import { getTenderOffers } from "@/features/offers/actions";
import { MarkOffersViewed } from "@/components/offers/mark-offers-viewed";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Euro,
  FileText,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RevealIdentitiesButton } from "@/components/tenders/reveal-identities-button";
import { CloseTenderButton } from "@/components/tenders/close-tender-button";
import { OffersTable } from "@/components/offers/offers-table";

const marketTypeLabels: Record<string, string> = {
  CONSTRUCTION: "Construction",
  ENGINEERING: "Ingénierie",
  ARCHITECTURE: "Architecture",
  IT_SERVICES: "Services IT",
  CONSULTING: "Conseil",
  SUPPLIES: "Fournitures",
  MAINTENANCE: "Maintenance",
  OTHER: "Autre",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CLOSED: "Clôturé",
  AWARDED: "Attribué",
  CANCELLED: "Annulé",
};

export default async function TenderDetailDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  const tender = await getTenderById(id);

  if (!tender) {
    notFound();
  }

  // Vérifier que l'organisation est propriétaire du tender
  if (tender.organizationId !== organization.id) {
    redirect("/dashboard/tenders");
  }

  // Récupérer les offres
  const offers = await getTenderOffers(id);

  // Extraire les IDs des offres non lues
  const unreadOfferIds = offers
    .filter((offer) => !offer.viewedAt)
    .map((offer) => offer.id);

  const now = new Date();
  const deadline = new Date(tender.deadline);
  const isExpired = now > deadline;
  const canRevealIdentities =
    tender.mode === "ANONYMOUS" && isExpired && !tender.identityRevealed;
  const canCloseTender =
    isExpired && tender.status === "PUBLISHED" && offers.length > 0;
  const canAwardTender =
    (tender.status === "CLOSED" || tender.status === "PUBLISHED") &&
    offers.length > 0;

  return (
    <ProtectedLayout>
      {/* Composant invisible qui marque les offres comme lues */}
      {unreadOfferIds.length > 0 && (
        <MarkOffersViewed offerIds={unreadOfferIds} />
      )}

      <div className="p-6 md:p-8 bg-white min-h-full max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/dashboard/tenders"
            className="text-sm text-muted-foreground hover:text-matte-black transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à mes appels d&apos;offres
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <HandDrawnHighlight variant="yellow">
                  {tender.title}
                </HandDrawnHighlight>
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <HandDrawnBadge>
                  {statusLabels[tender.status] || tender.status}
                </HandDrawnBadge>
                {tender.mode === "ANONYMOUS" && (
                  <HandDrawnBadge>
                    {tender.identityRevealed ? "Identités révélées" : "Anonyme"}
                  </HandDrawnBadge>
                )}
                {tender.visibility === "PRIVATE" && (
                  <HandDrawnBadge>Privé</HandDrawnBadge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/tenders/${tender.id}/equity-log`}>
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Journal d&apos;équité
                </Button>
              </Link>
              {canRevealIdentities && (
                <RevealIdentitiesButton tenderId={tender.id} />
              )}
              {canCloseTender && (
                <CloseTenderButton
                  tenderId={tender.id}
                  offersCount={offers.length}
                />
              )}
              <Link href={`/tenders/${tender.id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Page publique
                </Button>
              </Link>
            </div>
          </div>

          {/* Informations essentielles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 bg-white rounded-lg border-2 border-gray-200">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  Type de marché
                </div>
                <div className="font-medium text-sm truncate">
                  {marketTypeLabels[tender.marketType] || tender.marketType}
                </div>
              </div>
            </div>

            {tender.city && tender.canton && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Localisation
                  </div>
                  <div className="font-medium text-sm truncate">
                    {tender.city}, {tender.canton}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Date limite</div>
                <div className="font-medium text-sm">
                  {format(deadline, "dd MMM yyyy", { locale: fr })}
                  {isExpired && (
                    <span className="text-red-500 text-xs ml-1">Expiré</span>
                  )}
                </div>
              </div>
            </div>

            {tender.budget && (
              <div className="flex items-start gap-2">
                <Euro className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Budget</div>
                  <div className="font-medium text-sm truncate">
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                      maximumFractionDigits: 0,
                    }).format(tender.budget)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {tender.description && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-200">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm leading-relaxed">{tender.description}</p>
            </div>
          )}

          {/* Alerte mode anonyme */}
          {tender.mode === "ANONYMOUS" && !tender.identityRevealed && (
            <div className="bg-white p-4 rounded-lg flex items-start gap-3 border-2 border-artisan-yellow/30">
              <EyeOff className="w-5 h-5 text-artisan-yellow mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-matte-black mb-1">
                  Mode anonyme activé
                </p>
                <p className="text-muted-foreground">
                  Les identités des soumissionnaires sont masquées jusqu&apos;à
                  la date limite. Vous pourrez les révéler après le{" "}
                  {format(deadline, "dd MMMM yyyy", { locale: fr })}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Table des offres */}
        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Offres reçues ({offers.length})
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <OffersTable
              offers={offers}
              tenderId={tender.id}
              tenderStatus={tender.status}
              isAnonymous={tender.mode === "ANONYMOUS"}
              identityRevealed={
                tender.mode === "CLASSIC" ? true : tender.identityRevealed
              }
              canAwardTender={canAwardTender}
            />
          </HandDrawnCardContent>
        </HandDrawnCard>
      </div>
    </ProtectedLayout>
  );
}
