"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Euro,
  FileText,
  Eye,
  MoreHorizontal,
  Search,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  Building2,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { WithdrawOfferButton } from "@/components/offers/withdraw-offer-button";
import { DeleteDraftOfferButton } from "@/components/offers/delete-draft-offer-button";
import { DownloadOfferPdfButton } from "@/components/offers/download-offer-pdf-button";

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  DRAFT: {
    label: "Brouillon",
    icon: Clock,
    color: "bg-gray-100 text-gray-700",
  },
  SUBMITTED: {
    label: "Soumise",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  SHORTLISTED: {
    label: "À étudier",
    icon: Star,
    color: "bg-yellow-100 text-yellow-700",
  },
  WITHDRAWN: {
    label: "Retirée",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
  ACCEPTED: {
    label: "Acceptée",
    icon: Award,
    color: "bg-purple-100 text-purple-700",
  },
  REJECTED: {
    label: "Rejetée",
    icon: XCircle,
    color: "bg-orange-100 text-orange-700",
  },
  AWARDED: {
    label: "Marché attribué",
    icon: Trophy,
    color: "bg-green-100 text-green-700 font-bold",
  },
};

interface MyOffersTableProps {
  offers: Array<{
    id: string;
    price: number;
    currency: string;
    status: string;
    submittedAt: Date | null;
    createdAt: Date;
    paymentStatus: string;
    offerNumber?: string | null;
    tender: {
      id: string;
      title: string;
      deadline: Date;
      status: string;
      organization: {
        id: string;
        name: string;
        type: string;
      };
    };
  }>;
}

export function MyOffersTable({ offers }: MyOffersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtrer et rechercher
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.tender.organization.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      offer.price.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "submitted" && offer.status === "SUBMITTED") ||
      (statusFilter === "withdrawn" && offer.status === "WITHDRAWN") ||
      (statusFilter === "accepted" && offer.status === "ACCEPTED") ||
      (statusFilter === "rejected" && offer.status === "REJECTED");

    return matchesSearch && matchesStatus;
  });

  const getDeadlineStatus = (deadline: Date, offerStatus: string) => {
    const now = new Date();
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (offerStatus === "ACCEPTED")
      return { label: "Acceptée ✓", color: "text-green-600 font-semibold" };
    if (offerStatus === "REJECTED")
      return { label: "Rejetée", color: "text-orange-600" };
    if (offerStatus === "WITHDRAWN")
      return { label: "Retirée", color: "text-red-600" };

    // Si c'est un brouillon et que la deadline est passée
    if (offerStatus === "DRAFT" && diffHours < 0)
      return { label: "Expiré ⚠️", color: "text-red-600 font-semibold" };

    if (diffHours < 0)
      return { label: "En évaluation", color: "text-blue-600" };
    if (diffHours <= 48)
      return {
        label: "Deadline urgente!",
        color: "text-red-600 font-semibold",
      };
    if (diffHours <= 168)
      return { label: "Deadline proche", color: "text-orange-600" };
    return {
      label: formatDistanceToNow(deadline, { locale: fr, addSuffix: true }),
      color: "text-muted-foreground",
    };
  };

  // Compter les offres par statut
  const counts = {
    all: offers.length,
    submitted: offers.filter((o) => o.status === "SUBMITTED").length,
    withdrawn: offers.filter((o) => o.status === "WITHDRAWN").length,
    accepted: offers.filter((o) => o.status === "ACCEPTED").length,
    rejected: offers.filter((o) => o.status === "REJECTED").length,
  };

  if (offers.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucune offre déposée</h3>
        <p className="text-muted-foreground mb-6">
          Vous n&apos;avez pas encore soumis d&apos;offre.
        </p>
        <Link href="/tenders">
          <Button>Parcourir les appels d&apos;offres</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une offre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-matte-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres par statut */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Toutes ({counts.all})
          </Button>
          <Button
            variant={statusFilter === "submitted" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("submitted")}
          >
            Soumises ({counts.submitted})
          </Button>
          <Button
            variant={statusFilter === "accepted" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("accepted")}
          >
            Acceptées ({counts.accepted})
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
          >
            Rejetées ({counts.rejected})
          </Button>
          <Button
            variant={statusFilter === "withdrawn" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("withdrawn")}
          >
            Retirées ({counts.withdrawn})
          </Button>
        </div>
      </div>

      {/* Layout avec liste */}
      <div className="flex gap-6">
        {/* Liste des offres */}
        <div className="flex-1">
          {/* Vue desktop - Tableau */}
          <div className="hidden md:block border-2 border-matte-black rounded-lg overflow-hidden bg-white">
            {/* Header du tableau */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-sand-light border-b-2 border-matte-black font-semibold text-sm">
              <div className="col-span-4">Appel d&apos;offre</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Montant</div>
              <div className="col-span-2">Date de soumission</div>
              <div className="col-span-2">Deadline / État</div>
            </div>

            {/* Lignes */}
            {filteredOffers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Aucun résultat trouvé
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {filteredOffers.map((offer) => {
                  const StatusIcon =
                    statusConfig[offer.status]?.icon || FileText;
                  const deadlineStatus = getDeadlineStatus(
                    new Date(offer.tender.deadline),
                    offer.status
                  );
                  const isSelected = selectedOffer === offer.id;

                  return (
                    <div key={offer.id}>
                      {/* Ligne principale */}
                      <div
                        onClick={() =>
                          setSelectedOffer(isSelected ? null : offer.id)
                        }
                        className={`grid grid-cols-12 gap-4 p-4 hover:bg-sand-light/30 cursor-pointer transition-colors ${
                          isSelected ? "bg-sand-light/50" : ""
                        }`}
                      >
                        {/* Titre avec chevron */}
                        <div className="col-span-4 flex items-center gap-2 min-w-0">
                          {isSelected ? (
                            <ChevronUp className="w-4 h-4 text-artisan-yellow shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {offer.tender.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              <Building2 className="w-3 h-3 inline mr-1" />
                              {offer.tender.organization.name}
                            </p>
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="col-span-2 flex items-center">
                          <Badge
                            className={`${
                              statusConfig[offer.status]?.color
                            } text-xs`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[offer.status]?.label}
                          </Badge>
                        </div>

                        {/* Montant */}
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">
                              {new Intl.NumberFormat("fr-CH", {
                                style: "currency",
                                currency: offer.currency,
                              }).format(offer.price)}
                            </span>
                          </div>
                        </div>

                        {/* Date de soumission */}
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {offer.submittedAt
                                ? format(
                                    new Date(offer.submittedAt),
                                    "dd MMM yyyy",
                                    { locale: fr }
                                  )
                                : "Non soumise"}
                            </span>
                          </div>
                        </div>

                        {/* Deadline / État */}
                        <div className="col-span-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className={deadlineStatus.color}>
                              {deadlineStatus.label}
                            </span>
                          </div>

                          {/* Menu actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {offer.status === "DRAFT" ? (
                                isPast(new Date(offer.tender.deadline)) ? (
                                  <DropdownMenuItem disabled>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Modifier le brouillon (expiré)
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/tenders/${offer.tender.id}/submit?offerId=${offer.id}`}
                                      className="cursor-pointer"
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      Modifier le brouillon
                                    </Link>
                                  </DropdownMenuItem>
                                )
                              ) : null}
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/tenders/${offer.tender.id}`}
                                  className="cursor-pointer"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Voir l&apos;appel d&apos;offre
                                </Link>
                              </DropdownMenuItem>

                              {/* Télécharger PDF (seulement pour offres soumises) */}
                              {offer.status !== "DRAFT" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <DownloadOfferPdfButton
                                    offerId={offer.id}
                                    offerNumber={offer.offerNumber}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start p-0 h-auto font-normal"
                                  />
                                </DropdownMenuItem>
                              )}

                              {offer.status === "DRAFT" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DeleteDraftOfferButton
                                    offerId={offer.id}
                                    tenderTitle={offer.tender.title}
                                    variant="menuItem"
                                  />
                                </>
                              )}
                              {offer.status === "SUBMITTED" &&
                                !isPast(new Date(offer.tender.deadline)) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <WithdrawOfferButton
                                        offerId={offer.id}
                                        tenderTitle={offer.tender.title}
                                        tenderDeadline={offer.tender.deadline}
                                      />
                                    </div>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Panneau de détails (expandable) */}
                      {isSelected && (
                        <div className="bg-white border-t-2 border-gray-200 p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Informations de l'offre */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                                Détails de l&apos;offre
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Montant proposé :
                                  </span>
                                  <span className="font-semibold">
                                    {new Intl.NumberFormat("fr-CH", {
                                      style: "currency",
                                      currency: offer.currency,
                                    }).format(offer.price)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Date de création :
                                  </span>
                                  <span>
                                    {format(
                                      new Date(offer.createdAt),
                                      "dd MMMM yyyy 'à' HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                </div>
                                {offer.submittedAt && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Date de soumission :
                                    </span>
                                    <span>
                                      {format(
                                        new Date(offer.submittedAt),
                                        "dd MMMM yyyy 'à' HH:mm",
                                        { locale: fr }
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Informations de l'appel d'offre */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                                Appel d&apos;offre
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Organisation :
                                  </span>
                                  <span className="font-medium">
                                    {offer.tender.organization.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Type :
                                  </span>
                                  <span>
                                    {offer.tender.organization.type ===
                                    "COMMUNE"
                                      ? "Commune"
                                      : offer.tender.organization.type ===
                                        "ENTREPRISE"
                                      ? "Entreprise"
                                      : "Privé"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Date limite :
                                  </span>
                                  <span
                                    className={
                                      isPast(new Date(offer.tender.deadline))
                                        ? "text-red-600 font-semibold"
                                        : ""
                                    }
                                  >
                                    {format(
                                      new Date(offer.tender.deadline),
                                      "dd MMMM yyyy 'à' HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Statut :
                                  </span>
                                  <span>
                                    {offer.tender.status === "PUBLISHED" &&
                                      "Publié"}
                                    {offer.tender.status === "CLOSED" &&
                                      "Clôturé"}
                                    {offer.tender.status === "AWARDED" &&
                                      "Attribué"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions rapides */}
                          <div className="flex gap-2 pt-4 border-t">
                            {offer.status === "DRAFT" ? (
                              isPast(new Date(offer.tender.deadline)) ? (
                                <div className="flex-1">
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800 font-semibold">
                                      ⚠️ Brouillon expiré
                                    </p>
                                    <p className="text-xs text-red-700 mt-1">
                                      La date limite de cet appel d&apos;offres
                                      est dépassée. Ce brouillon ne peut plus
                                      être soumis.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <Link
                                  href={`/tenders/${offer.tender.id}/submit?offerId=${offer.id}`}
                                >
                                  <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Modifier le brouillon
                                  </Button>
                                </Link>
                              )
                            ) : null}
                            <Link href={`/tenders/${offer.tender.id}`}>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Voir l&apos;appel d&apos;offre
                              </Button>
                            </Link>

                            {/* Télécharger PDF - pour offres soumises */}
                            {offer.status !== "DRAFT" && (
                              <DownloadOfferPdfButton
                                offerId={offer.id}
                                offerNumber={offer.offerNumber}
                                variant="outline"
                                size="sm"
                              />
                            )}

                            {/* Retirer l'offre - si soumise et deadline pas passée */}
                            {offer.status === "SUBMITTED" &&
                              !isPast(new Date(offer.tender.deadline)) && (
                                <WithdrawOfferButton
                                  offerId={offer.id}
                                  tenderTitle={offer.tender.title}
                                  tenderDeadline={offer.tender.deadline}
                                />
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vue mobile - Cards */}
          <div className="md:hidden space-y-4">
            {filteredOffers.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Aucun résultat trouvé</p>
              </div>
            ) : (
              filteredOffers.map((offer) => {
                const StatusIcon = statusConfig[offer.status]?.icon || FileText;
                const deadlineStatus = getDeadlineStatus(
                  new Date(offer.tender.deadline),
                  offer.status
                );

                return (
                  <div
                    key={offer.id}
                    className="border-2 border-matte-black rounded-lg p-4 bg-white"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/tenders/${offer.tender.id}`}>
                          <h3 className="font-semibold truncate hover:text-artisan-yellow transition-colors">
                            {offer.tender.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {offer.tender.organization.name}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {offer.status === "DRAFT" ? (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/tenders/${offer.tender.id}/submit?offerId=${offer.id}`}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Modifier le brouillon
                              </Link>
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem asChild>
                            <Link href={`/tenders/${offer.tender.id}`}>
                              <FileText className="w-4 h-4 mr-2" />
                              Voir l&apos;appel d&apos;offre
                            </Link>
                          </DropdownMenuItem>
                          {offer.status === "DRAFT" && (
                            <>
                              <DropdownMenuSeparator />
                              <DeleteDraftOfferButton
                                offerId={offer.id}
                                tenderTitle={offer.tender.title}
                                variant="menuItem"
                              />
                            </>
                          )}
                          {offer.status === "SUBMITTED" &&
                            !isPast(new Date(offer.tender.deadline)) && (
                              <>
                                <DropdownMenuSeparator />
                                <WithdrawOfferButton
                                  offerId={offer.id}
                                  tenderTitle={offer.tender.title}
                                  tenderDeadline={offer.tender.deadline}
                                />
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={statusConfig[offer.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[offer.status]?.label}
                      </Badge>
                    </div>

                    {/* Infos */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Montant :</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("fr-CH", {
                            style: "currency",
                            currency: offer.currency,
                          }).format(offer.price)}
                        </span>
                      </div>
                      {offer.submittedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Soumise le :
                          </span>
                          <span>
                            {format(
                              new Date(offer.submittedAt),
                              "dd MMM yyyy",
                              {
                                locale: fr,
                              }
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">État :</span>
                        <span className={deadlineStatus.color}>
                          {deadlineStatus.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {offer.status === "DRAFT" && (
                      <div className="mt-4 pt-4 border-t">
                        <DeleteDraftOfferButton
                          offerId={offer.id}
                          tenderTitle={offer.tender.title}
                        />
                      </div>
                    )}
                    {offer.status === "SUBMITTED" &&
                      !isPast(new Date(offer.tender.deadline)) && (
                        <div className="mt-4 pt-4 border-t">
                          <WithdrawOfferButton
                            offerId={offer.id}
                            tenderTitle={offer.tender.title}
                            tenderDeadline={offer.tender.deadline}
                          />
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
