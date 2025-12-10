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
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Euro,
  FileText,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  Download,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RevealIdentitiesButton } from "@/components/tenders/reveal-identities-button";
import { CloseTenderButton } from "@/components/tenders/close-tender-button";
import { OfferActionsButtons } from "@/components/offers/offer-actions-buttons";
import { AwardTenderButton } from "@/components/tenders/award-tender-button";

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

      <div className="p-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard/tenders"
            className="text-sm text-muted-foreground hover:text-matte-black transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à mes appels d&apos;offres
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
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
              <Link href={`/tenders/${tender.id}`} target="_blank">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir la page publique
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale : Offres */}
          <div className="lg:col-span-2 space-y-6">
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <div className="flex items-center justify-between">
                  <HandDrawnCardTitle className="font-handdrawn text-2xl">
                    📋 Offres reçues ({offers.length})
                  </HandDrawnCardTitle>
                  <div className="flex gap-2">
                    {canRevealIdentities && (
                      <RevealIdentitiesButton tenderId={tender.id} />
                    )}
                    {canCloseTender && (
                      <CloseTenderButton
                        tenderId={tender.id}
                        offersCount={offers.length}
                      />
                    )}
                  </div>
                </div>
              </HandDrawnCardHeader>
              <HandDrawnCardContent>
                {offers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">
                      Aucune offre reçue
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Les offres apparaîtront ici une fois soumises
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tender.mode === "ANONYMOUS" &&
                      !tender.identityRevealed && (
                        <div className="bg-artisan-yellow/10 p-4 rounded-lg flex items-start gap-3">
                          <EyeOff className="w-5 h-5 text-artisan-yellow mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-matte-black mb-1">
                              Mode anonyme activé
                            </p>
                            <p className="text-muted-foreground">
                              Les identités des soumissionnaires sont masquées
                              jusqu&apos;à la date limite. Vous pourrez les
                              révéler après le{" "}
                              {format(deadline, "dd MMMM yyyy", { locale: fr })}
                              .
                            </p>
                          </div>
                        </div>
                      )}

                    {offers.map((offer, index) => (
                      <div
                        key={offer.id}
                        className="p-4 border-2 border-matte-black rounded-lg bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {tender.identityRevealed
                                ? offer.organization.name
                                : offer.anonymousId || `Offre #${index + 1}`}
                            </h4>
                            {tender.identityRevealed && (
                              <p className="text-sm text-muted-foreground">
                                {offer.organization.city &&
                                offer.organization.canton
                                  ? `${offer.organization.city}, ${offer.organization.canton}`
                                  : ""}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-artisan-yellow font-handdrawn">
                              {new Intl.NumberFormat("fr-CH", {
                                style: "currency",
                                currency: offer.currency,
                              }).format(offer.price)}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold">Description :</span>
                            <p className="text-muted-foreground mt-1 line-clamp-2">
                              {offer.description}
                            </p>
                          </div>

                          {offer.methodology && (
                            <div>
                              <span className="font-semibold">
                                Méthodologie :
                              </span>
                              <p className="text-muted-foreground mt-1 line-clamp-2">
                                {offer.methodology}
                              </p>
                            </div>
                          )}

                          {offer.timeline && (
                            <div>
                              <span className="font-semibold">
                                Délai d&apos;exécution :
                              </span>
                              <p className="text-muted-foreground mt-1">
                                {offer.timeline}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-sand-light flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Soumis le{" "}
                            {format(
                              new Date(offer.submittedAt!),
                              "dd MMMM yyyy 'à' HH:mm",
                              { locale: fr }
                            )}
                          </div>
                          <div className="flex gap-2">
                            {tender.identityRevealed && (
                              <>
                                <OfferActionsButtons
                                  offerId={offer.id}
                                  offerStatus={offer.status}
                                  organizationName={offer.organization.name}
                                  price={offer.price}
                                  currency={offer.currency}
                                />
                                {offer.status === "ACCEPTED" &&
                                  canAwardTender && (
                                    <AwardTenderButton
                                      tenderId={tender.id}
                                      offerId={offer.id}
                                      organizationName={offer.organization.name}
                                      price={offer.price}
                                      currency={offer.currency}
                                    />
                                  )}
                              </>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/dashboard/tenders/${id}/offers/${offer.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir le détail
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </HandDrawnCardContent>
            </HandDrawnCard>
          </div>

          {/* Colonne latérale : Détails du tender */}
          <div className="lg:col-span-1 space-y-6">
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle className="font-handdrawn text-xl">
                  Détails du projet
                </HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent className="space-y-4">
                <div>
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Type de marché</div>
                      <div className="text-muted-foreground">
                        {marketTypeLabels[tender.marketType] ||
                          tender.marketType}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {tender.city && tender.canton && (
                  <>
                    <div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Localisation</div>
                          <div className="text-muted-foreground">
                            {tender.city}, {tender.canton}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Date limite</div>
                      <div className="text-muted-foreground">
                        {format(deadline, "dd MMMM yyyy 'à' HH:mm", {
                          locale: fr,
                        })}
                      </div>
                      {isExpired && (
                        <div className="text-red-500 text-xs mt-1">Expiré</div>
                      )}
                    </div>
                  </div>
                </div>

                {tender.budget && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-start gap-2 text-sm">
                        <Euro className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Budget indicatif</div>
                          <div className="text-muted-foreground">
                            {new Intl.NumberFormat("fr-CH", {
                              style: "currency",
                              currency: tender.currency,
                            }).format(tender.budget)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="text-sm">
                  <div className="font-medium mb-1">Description</div>
                  <p className="text-muted-foreground">{tender.description}</p>
                </div>
              </HandDrawnCardContent>
            </HandDrawnCard>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
