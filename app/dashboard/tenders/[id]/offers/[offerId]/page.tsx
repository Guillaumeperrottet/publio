import ProtectedLayout from "@/components/layout/protected-layout";
import { notFound, redirect } from "next/navigation";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getOfferDetail } from "@/features/offers/actions";
import { getTenderById } from "@/features/tenders/actions";
import { getCurrentUser } from "@/lib/auth/session";
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
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Euro,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Package,
  Shield,
  CreditCard,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ShortlistOfferButton } from "@/components/offers/shortlist-offer-button";
import { UnshortlistOfferButton } from "@/components/offers/unshortlist-offer-button";
import { RejectOfferButton } from "@/components/offers/reject-offer-button";
import { AwardTenderButton } from "@/components/tenders/award-tender-button";
import { OfferComments } from "@/components/offers/offer-comments";
import { OfferCommentsInline } from "@/components/offers/offer-comments-inline";

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string; offerId: string }>;
}) {
  const { id, offerId } = await params;

  const user = await getCurrentUser();
  const memberships = await getUserOrganizations();
  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const organization = memberships[0].organization;

  // Récupérer le tender et l'offre
  const tender = await getTenderById(id);
  if (!tender) {
    notFound();
  }

  // Vérifier que l'organisation est propriétaire du tender
  if (tender.organizationId !== organization.id) {
    redirect("/dashboard/tenders");
  }

  let offer;
  try {
    offer = await getOfferDetail(offerId);
  } catch (error) {
    console.error(error);
    notFound();
  }

  // Les offres montrent toujours l'identité du soumissionnaire
  // Seul l'émetteur du tender peut être anonyme
  const identityRevealed =
    tender.mode === "CLASSIC" ? true : tender.identityRevealed;

  const canAwardTender =
    (tender.status === "CLOSED" || tender.status === "PUBLISHED") &&
    offer.tenderId === tender.id;

  // Les actions sont disponibles tant que le tender n'est pas attribué ou annulé
  const canPerformActions =
    tender.status !== "AWARDED" && tender.status !== "CANCELLED";

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/dashboard/tenders/${id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-matte-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <HandDrawnHighlight variant="yellow">
                  {offer.offerNumber || `Offre #${offer.id.slice(-6)}`}
                </HandDrawnHighlight>
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{offer.organization.name}</span>
                </div>
                {offer.organization.city && (
                  <span>
                    {offer.organization.city}
                    {offer.organization.canton &&
                      `, ${offer.organization.canton}`}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-artisan-yellow font-handdrawn mb-1">
                {new Intl.NumberFormat("fr-CH", {
                  style: "currency",
                  currency: tender.currency,
                }).format(offer.price)}
              </div>
              <div className="text-sm text-muted-foreground">
                {offer.priceType === "GLOBAL"
                  ? "Prix forfaitaire"
                  : "Prix détaillé"}
              </div>
            </div>
          </div>

          {/* Actions sur l'offre */}
          {canPerformActions && (
            <div className="mt-6 p-4 bg-white border-2 border-matte-black rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {/* Commentaires internes */}
                <OfferComments
                  offerId={offer.id}
                  organizationName={offer.organization.name}
                  currentUserId={user.id}
                  commentsCount={offer._count?.comments || 0}
                />

                {/* Offre SUBMITTED : Pré-sélectionner ou Rejeter */}
                {offer.status === "SUBMITTED" && (
                  <>
                    <ShortlistOfferButton
                      offerId={offer.id}
                      organizationName={offer.organization.name}
                    />
                    <RejectOfferButton
                      offerId={offer.id}
                      organizationName={offer.organization.name}
                      price={offer.price}
                      currency={tender.currency}
                    />
                    {canAwardTender && (
                      <AwardTenderButton
                        tenderId={tender.id}
                        offerId={offer.id}
                        organizationName={offer.organization.name}
                        price={offer.price}
                        currency={tender.currency}
                      />
                    )}
                  </>
                )}

                {/* Offre SHORTLISTED : Retirer ou Rejeter */}
                {offer.status === "SHORTLISTED" && (
                  <>
                    <UnshortlistOfferButton offerId={offer.id} />
                    <RejectOfferButton
                      offerId={offer.id}
                      organizationName={offer.organization.name}
                      price={offer.price}
                      currency={tender.currency}
                    />
                    {canAwardTender && (
                      <AwardTenderButton
                        tenderId={tender.id}
                        offerId={offer.id}
                        organizationName={offer.organization.name}
                        price={offer.price}
                        currency={tender.currency}
                      />
                    )}
                  </>
                )}

                {/* Offre AWARDED : Statut final */}
                {offer.status === "AWARDED" && (
                  <div className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Marché attribué à cette offre
                  </div>
                )}

                {/* Offre REJECTED : Statut final */}
                {offer.status === "REJECTED" && (
                  <div className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Offre non retenue
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Informations générales
                </HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent className="space-y-4">
                {offer.validityDays && (
                  <div>
                    <span className="font-semibold text-sm">
                      Validité de l&apos;offre :
                    </span>
                    <p className="text-muted-foreground">
                      {offer.validityDays} jours à partir de la soumission
                    </p>
                  </div>
                )}

                {offer.projectSummary && (
                  <div>
                    <span className="font-semibold text-sm">
                      Compréhension du projet :
                    </span>
                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                      {offer.projectSummary}
                    </p>
                  </div>
                )}

                {offer.description && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-semibold text-sm">
                        Description de l&apos;offre :
                      </span>
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {offer.description}
                      </p>
                    </div>
                  </>
                )}

                {offer.methodology && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-semibold text-sm">
                        Méthodologie :
                      </span>
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {offer.methodology}
                      </p>
                    </div>
                  </>
                )}
              </HandDrawnCardContent>
            </HandDrawnCard>

            {/* Prestations */}
            {(offer.inclusions.length > 0 ||
              offer.exclusions.length > 0 ||
              offer.materials.length > 0) && (
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Prestations et matériaux
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent className="space-y-6">
                  {offer.inclusions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Prestations incluses
                      </h3>
                      <ul className="space-y-2">
                        {offer.inclusions.map((inclusion) => (
                          <li
                            key={inclusion.id}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="font-mono text-xs mt-0.5 text-muted-foreground/50">
                              {inclusion.position}.
                            </span>
                            <span>{inclusion.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {offer.exclusions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Prestations exclues
                        </h3>
                        <ul className="space-y-2">
                          {offer.exclusions.map((exclusion) => (
                            <li
                              key={exclusion.id}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="font-mono text-xs mt-0.5 text-muted-foreground/50">
                                {exclusion.position}.
                              </span>
                              <span>{exclusion.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {offer.materials.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          Matériaux et équipements
                        </h3>
                        <div className="space-y-3">
                          {offer.materials.map((material) => (
                            <div
                              key={material.id}
                              className="bg-sand-light/50 p-3 rounded-lg text-sm"
                            >
                              <div className="font-medium">{material.name}</div>
                              {(material.brand ||
                                material.model ||
                                material.range) && (
                                <div className="text-xs text-muted-foreground mt-1 space-x-2">
                                  {material.brand && (
                                    <span>Marque : {material.brand}</span>
                                  )}
                                  {material.model && (
                                    <span>• Modèle : {material.model}</span>
                                  )}
                                  {material.range && (
                                    <span>• Gamme : {material.range}</span>
                                  )}
                                </div>
                              )}
                              {material.manufacturerWarranty && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Garantie fabricant :{" "}
                                  {material.manufacturerWarranty}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </HandDrawnCardContent>
              </HandDrawnCard>
            )}

            {/* Détail des prix */}
            {offer.priceType === "DETAILED" && offer.lineItems.length > 0 && (
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                    <Euro className="w-6 h-6" />
                    Détail des prix
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-matte-black">
                          <th className="text-left py-2 px-2 font-semibold">
                            Pos.
                          </th>
                          <th className="text-left py-2 px-2 font-semibold">
                            Description
                          </th>
                          <th className="text-right py-2 px-2 font-semibold">
                            Quantité
                          </th>
                          <th className="text-right py-2 px-2 font-semibold">
                            Prix HT
                          </th>
                          <th className="text-right py-2 px-2 font-semibold">
                            TVA
                          </th>
                          <th className="text-right py-2 px-2 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {offer.lineItems.map((item) => {
                          const totalHT = item.priceHT * (item.quantity || 1);
                          const tva = totalHT * (item.tvaRate / 100);
                          const totalTTC = totalHT + tva;

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-sand-light"
                            >
                              <td className="py-2 px-2 text-muted-foreground">
                                {item.position}
                              </td>
                              <td className="py-2 px-2">{item.description}</td>
                              <td className="py-2 px-2 text-right text-muted-foreground">
                                {item.quantity
                                  ? `${item.quantity} ${item.unit || ""}`
                                  : "-"}
                              </td>
                              <td className="py-2 px-2 text-right">
                                {new Intl.NumberFormat("fr-CH", {
                                  style: "currency",
                                  currency: tender.currency,
                                }).format(item.priceHT)}
                              </td>
                              <td className="py-2 px-2 text-right text-muted-foreground">
                                {item.tvaRate}%
                              </td>
                              <td className="py-2 px-2 text-right font-medium">
                                {new Intl.NumberFormat("fr-CH", {
                                  style: "currency",
                                  currency: tender.currency,
                                }).format(totalTTC)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-matte-black font-semibold">
                          <td colSpan={5} className="py-3 px-2 text-right">
                            Total HT :
                          </td>
                          <td className="py-3 px-2 text-right">
                            {new Intl.NumberFormat("fr-CH", {
                              style: "currency",
                              currency: tender.currency,
                            }).format(offer.totalHT || 0)}
                          </td>
                        </tr>
                        <tr className="text-muted-foreground">
                          <td colSpan={5} className="py-1 px-2 text-right">
                            TVA ({offer.tvaRate}%) :
                          </td>
                          <td className="py-1 px-2 text-right">
                            {new Intl.NumberFormat("fr-CH", {
                              style: "currency",
                              currency: tender.currency,
                            }).format(offer.totalTVA || 0)}
                          </td>
                        </tr>
                        <tr className="border-t-2 border-artisan-yellow font-bold text-lg">
                          <td colSpan={5} className="py-3 px-2 text-right">
                            Total TTC :
                          </td>
                          <td className="py-3 px-2 text-right text-artisan-yellow">
                            {new Intl.NumberFormat("fr-CH", {
                              style: "currency",
                              currency: tender.currency,
                            }).format(offer.price)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </HandDrawnCardContent>
              </HandDrawnCard>
            )}

            {/* Délais et paiement */}
            {(offer.startDate ||
              offer.durationDays ||
              offer.timeline ||
              offer.paymentTerms) && (
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Délais et conditions de paiement
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent className="space-y-4">
                  {offer.startDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold text-sm">
                          Date de début souhaitée
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(offer.startDate), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {offer.durationDays && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold text-sm">
                          Durée des travaux
                        </div>
                        <div className="text-muted-foreground">
                          {offer.durationDays} jours
                        </div>
                      </div>
                    </div>
                  )}

                  {offer.timeline && (
                    <div>
                      <div className="font-semibold text-sm mb-1">
                        Détails du planning :
                      </div>
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {offer.timeline}
                      </p>
                    </div>
                  )}

                  {offer.paymentTerms &&
                    typeof offer.paymentTerms === "object" && (
                      <>
                        <Separator />
                        <div>
                          <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Échéancier de paiement
                          </div>
                          <div className="space-y-2 text-sm">
                            {(offer.paymentTerms as { deposit?: number })
                              .deposit && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Acompte à la commande
                                </span>
                                <span className="font-medium">
                                  {
                                    (offer.paymentTerms as { deposit: number })
                                      .deposit
                                  }
                                  %
                                </span>
                              </div>
                            )}
                            {(offer.paymentTerms as { intermediate?: number })
                              .intermediate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Paiement intermédiaire
                                </span>
                                <span className="font-medium">
                                  {
                                    (
                                      offer.paymentTerms as {
                                        intermediate: number;
                                      }
                                    ).intermediate
                                  }
                                  %
                                </span>
                              </div>
                            )}
                            {(offer.paymentTerms as { final?: number })
                              .final && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Solde à la réception
                                </span>
                                <span className="font-medium">
                                  {
                                    (offer.paymentTerms as { final: number })
                                      .final
                                  }
                                  %
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {offer.constraints && (
                    <>
                      <Separator />
                      <div>
                        <div className="font-semibold text-sm mb-1">
                          Contraintes particulières :
                        </div>
                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                          {offer.constraints}
                        </p>
                      </div>
                    </>
                  )}
                </HandDrawnCardContent>
              </HandDrawnCard>
            )}

            {/* Garanties et assurances */}
            {(offer.warrantyYears ||
              offer.insuranceAmount ||
              offer.manufacturerWarranty) && (
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Garanties et assurances
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent className="space-y-3">
                  {offer.warrantyYears && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Garantie décennale
                      </span>
                      <span className="font-medium">
                        {offer.warrantyYears} ans
                      </span>
                    </div>
                  )}

                  {offer.insuranceAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Montant d&apos;assurance RC
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("fr-CH", {
                          style: "currency",
                          currency: tender.currency,
                        }).format(offer.insuranceAmount)}
                      </span>
                    </div>
                  )}

                  {offer.manufacturerWarranty && (
                    <div>
                      <div className="font-semibold text-sm mb-1">
                        Garantie fabricant :
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {offer.manufacturerWarranty}
                      </p>
                    </div>
                  )}
                </HandDrawnCardContent>
              </HandDrawnCard>
            )}

            {/* Références */}
            {offer.references && (
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                    <Wrench className="w-6 h-6" />
                    Références et expériences
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {offer.references}
                  </p>
                </HandDrawnCardContent>
              </HandDrawnCard>
            )}

            {/* Documents */}
            {offer.documents && offer.documents.length > 0 && (
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle className="font-handdrawn text-2xl flex items-center gap-2">
                    <Download className="w-6 h-6" />
                    Documents joints
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent>
                  <div className="space-y-2">
                    {offer.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-sand-light/50 hover:bg-sand-light rounded-lg transition-colors"
                      >
                        <FileText className="w-5 h-5 text-artisan-yellow" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {doc.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </HandDrawnCardContent>
              </HandDrawnCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informations soumetteur */}
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle className="font-handdrawn text-xl">
                  Entreprise
                </HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent className="space-y-3">
                <div>
                  <div className="font-semibold">{offer.organization.name}</div>
                  {offer.organization.city && offer.organization.canton && (
                    <div className="text-sm text-muted-foreground">
                      {offer.organization.city}, {offer.organization.canton}
                    </div>
                  )}
                </div>

                {offer.organization.phone && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Téléphone
                      </div>
                      <a
                        href={`tel:${offer.organization.phone}`}
                        className="text-sm text-artisan-yellow hover:underline"
                      >
                        {offer.organization.phone}
                      </a>
                    </div>
                  </>
                )}

                {offer.organization.website && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Site web
                      </div>
                      <a
                        href={offer.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-artisan-yellow hover:underline"
                      >
                        Visiter le site
                      </a>
                    </div>
                  </>
                )}
              </HandDrawnCardContent>
            </HandDrawnCard>

            {/* Métadonnées */}
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle className="font-handdrawn text-xl">
                  Informations
                </HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Date de soumission
                  </div>
                  <div className="font-medium">
                    {offer.submittedAt
                      ? format(
                          new Date(offer.submittedAt),
                          "dd MMMM yyyy 'à' HH:mm",
                          { locale: fr }
                        )
                      : "Non soumis"}
                  </div>
                </div>

                {offer.validityDays && offer.submittedAt && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Valide jusqu&apos;au
                      </div>
                      <div className="font-medium">
                        {format(
                          new Date(
                            new Date(offer.submittedAt).getTime() +
                              offer.validityDays * 24 * 60 * 60 * 1000
                          ),
                          "dd MMMM yyyy",
                          { locale: fr }
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Statut
                  </div>
                  <HandDrawnBadge variant="success">
                    {offer.status === "SUBMITTED" ? "Soumise" : offer.status}
                  </HandDrawnBadge>
                </div>

                {offer.viewedAt && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Consultée le
                      </div>
                      <div className="font-medium">
                        {format(
                          new Date(offer.viewedAt),
                          "dd MMMM yyyy 'à' HH:mm",
                          { locale: fr }
                        )}
                      </div>
                    </div>
                  </>
                )}
              </HandDrawnCardContent>
            </HandDrawnCard>

            {/* Commentaires internes */}
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle className="font-handdrawn text-xl">
                  Discussion interne
                </HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent>
                <OfferCommentsInline
                  offerId={offer.id}
                  currentUserId={user.id}
                />
              </HandDrawnCardContent>
            </HandDrawnCard>

            {/* Actions */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/tenders/${id}`}>
                  Retour à la liste des offres
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
