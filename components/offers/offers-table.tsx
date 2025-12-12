"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Euro,
  Eye,
  MoreHorizontal,
  Clock,
  FileText,
  Building2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Star,
  StickyNote,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ShortlistOfferButton } from "@/components/offers/shortlist-offer-button";
import { UnshortlistOfferButton } from "@/components/offers/unshortlist-offer-button";
import { RejectOfferButton } from "@/components/offers/reject-offer-button";
import { AwardTenderButton } from "@/components/tenders/award-tender-button";
import { OfferInternalNote } from "@/components/offers/offer-internal-note";

interface Offer {
  id: string;
  price: number;
  currency: string;
  description: string;
  methodology: string | null;
  timeline: string | null;
  submittedAt: Date | null;
  status: string;
  anonymousId: string | null;
  internalNote: string | null;
  organization: {
    name: string;
    city: string | null;
    canton: string | null;
  };
}

interface OffersTableProps {
  offers: Offer[];
  tenderId: string;
  tenderStatus: string;
  isAnonymous: boolean;
  identityRevealed: boolean;
  canAwardTender: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "Soumise", color: "bg-blue-100 text-blue-700" },
  SHORTLISTED: {
    label: "À étudier",
    color: "bg-artisan-yellow/20 text-yellow-800",
  },
  REJECTED: { label: "Non retenue", color: "bg-red-100 text-red-700" },
  AWARDED: { label: "Marché attribué", color: "bg-green-100 text-green-700" },
  WITHDRAWN: { label: "Retirée", color: "bg-gray-100 text-gray-700" },
  ACCEPTED: { label: "Acceptée", color: "bg-green-100 text-green-700" }, // Deprecated
};

export function OffersTable({
  offers,
  tenderId,
  isAnonymous,
  identityRevealed,
  canAwardTender,
}: OffersTableProps) {
  const [sortBy, setSortBy] = useState<"price" | "date">("price");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  // Compter les offres pré-sélectionnées
  const shortlistedCount = offers.filter(
    (offer) => offer.status === "SHORTLISTED"
  ).length;

  // Trier les offres : SHORTLISTED en haut, puis par prix ou date
  const sortedOffers = [...offers].sort((a, b) => {
    // D'abord, mettre les SHORTLISTED en haut
    if (a.status === "SHORTLISTED" && b.status !== "SHORTLISTED") return -1;
    if (a.status !== "SHORTLISTED" && b.status === "SHORTLISTED") return 1;

    // Ensuite, trier par prix ou date
    if (sortBy === "price") {
      return a.price - b.price;
    }
    return (
      new Date(b.submittedAt || 0).getTime() -
      new Date(a.submittedAt || 0).getTime()
    );
  });

  if (offers.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucune offre reçue</h3>
        <p className="text-muted-foreground">
          Les offres apparaîtront ici une fois soumises
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contrôles de tri */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {offers.length} offre{offers.length > 1 ? "s" : ""} reçue
            {offers.length > 1 ? "s" : ""}
          </p>
          {shortlistedCount > 0 && (
            <Badge className="bg-artisan-yellow text-matte-black flex items-center gap-1">
              <Star className="w-3 h-3 fill-matte-black" />
              {shortlistedCount} à étudier
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "price" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("price")}
          >
            <Euro className="w-4 h-4 mr-2" />
            Trier par prix
          </Button>
          <Button
            variant={sortBy === "date" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("date")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Trier par date
          </Button>
        </div>
      </div>

      {/* Layout avec table et panneau */}
      <div className="flex gap-6">
        {/* Table des offres */}
        <div className="flex-1">
          {/* Vue desktop - Table */}
          <div className="hidden md:block border-2 border-matte-black rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-sand-light border-b-2 border-matte-black font-semibold text-sm">
              <div className="col-span-4">Soumissionnaire</div>
              <div className="col-span-2">Prix</div>
              <div className="col-span-2">Délai</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Date</div>
            </div>

            {/* Lignes */}
            <div className="divide-y-2 divide-gray-200">
              {sortedOffers.map((offer, index) => {
                const isSelected = selectedOffer === offer.id;
                const showIdentity = !isAnonymous || identityRevealed;

                return (
                  <div key={offer.id}>
                    {/* Ligne principale */}
                    <div
                      onClick={() =>
                        setSelectedOffer(isSelected ? null : offer.id)
                      }
                      className={`grid grid-cols-12 gap-4 p-4 hover:bg-sand-light/30 cursor-pointer transition-colors ${
                        isSelected ? "bg-white" : ""
                      } ${
                        offer.status === "SHORTLISTED"
                          ? "bg-artisan-yellow/5 border-l-4 border-artisan-yellow"
                          : ""
                      }`}
                    >
                      {/* Soumissionnaire avec chevron */}
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        {offer.status === "SHORTLISTED" && (
                          <Star className="w-4 h-4 text-artisan-yellow shrink-0 fill-artisan-yellow" />
                        )}
                        {isSelected ? (
                          <ChevronUp className="w-4 h-4 text-artisan-yellow shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {showIdentity
                              ? offer.organization.name
                              : offer.anonymousId || `Offre #${index + 1}`}
                          </p>
                          {showIdentity &&
                            offer.organization.city &&
                            offer.organization.canton && (
                              <p className="text-xs text-muted-foreground truncate">
                                {offer.organization.city},{" "}
                                {offer.organization.canton}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="col-span-2 flex items-center">
                        <span className="font-semibold text-artisan-yellow">
                          {new Intl.NumberFormat("fr-CH", {
                            style: "currency",
                            currency: offer.currency,
                            maximumFractionDigits: 0,
                          }).format(offer.price)}
                        </span>
                      </div>

                      {/* Délai */}
                      <div className="col-span-2 flex items-center text-sm">
                        {offer.timeline ? (
                          <span className="truncate">{offer.timeline}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* Statut */}
                      <div className="col-span-2 flex items-center">
                        <Badge
                          className={`${
                            statusConfig[offer.status]?.color || ""
                          } text-xs`}
                        >
                          {statusConfig[offer.status]?.label || offer.status}
                        </Badge>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {offer.submittedAt
                            ? format(
                                new Date(offer.submittedAt),
                                "dd/MM/yyyy",
                                {
                                  locale: fr,
                                }
                              )
                            : "-"}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/tenders/${tenderId}/offers/${offer.id}`}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir le détail
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Détails expandable */}
                    {isSelected && (
                      <div className="p-6 bg-white border-t-2 border-gray-200">
                        {/* Note interne si présente */}
                        {offer.internalNote && (
                          <div className="mb-6 p-4 bg-deep-green/5 border-l-4 border-deep-green rounded-r">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-deep-green">
                              <StickyNote className="w-4 h-4" />
                              Note interne
                            </h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {offer.internalNote}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Description */}
                          {offer.description && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Description
                              </h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {offer.description}
                              </p>
                            </div>
                          )}

                          {/* Méthodologie */}
                          {offer.methodology && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Méthodologie
                              </h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {offer.methodology}
                              </p>
                            </div>
                          )}

                          {/* Délai détaillé */}
                          {offer.timeline && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Délai de réalisation
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {offer.timeline}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions sur l'offre */}
                        {identityRevealed && (
                          <div className="mt-6 pt-6 border-t-2 border-gray-200">
                            <h4 className="font-semibold mb-3 text-sm">
                              Actions
                            </h4>
                            <div
                              className="flex flex-wrap gap-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Note interne (toujours disponible) */}
                              <OfferInternalNote
                                offerId={offer.id}
                                initialNote={offer.internalNote}
                                organizationName={offer.organization.name}
                              />

                              {/* Offre SUBMITTED */}
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
                                    currency={offer.currency}
                                  />
                                  {canAwardTender && (
                                    <AwardTenderButton
                                      tenderId={tenderId}
                                      offerId={offer.id}
                                      organizationName={offer.organization.name}
                                      price={offer.price}
                                      currency={offer.currency}
                                    />
                                  )}
                                </>
                              )}

                              {/* Offre SHORTLISTED */}
                              {offer.status === "SHORTLISTED" && (
                                <>
                                  <UnshortlistOfferButton offerId={offer.id} />
                                  <RejectOfferButton
                                    offerId={offer.id}
                                    organizationName={offer.organization.name}
                                    price={offer.price}
                                    currency={offer.currency}
                                  />
                                  {canAwardTender && (
                                    <AwardTenderButton
                                      tenderId={tenderId}
                                      offerId={offer.id}
                                      organizationName={offer.organization.name}
                                      price={offer.price}
                                      currency={offer.currency}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Lien vers les détails */}
                        <Link
                          href={`/dashboard/tenders/${tenderId}/offers/${offer.id}`}
                          className="mt-4 text-sm text-artisan-yellow font-medium flex items-center gap-2 hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          Cliquer pour voir tous les détails
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vue mobile - Cartes */}
          <div className="md:hidden space-y-3">
            {sortedOffers.map((offer, index) => {
              const isSelected = selectedOffer === offer.id;
              const showIdentity = !isAnonymous || identityRevealed;

              return (
                <div key={offer.id}>
                  {/* Carte principale */}
                  <div
                    onClick={() =>
                      setSelectedOffer(isSelected ? null : offer.id)
                    }
                    className={`border-2 border-matte-black rounded-lg p-4 bg-white cursor-pointer ${
                      isSelected ? "border-artisan-yellow" : ""
                    }`}
                  >
                    {/* Header avec chevron */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {isSelected ? (
                          <ChevronUp className="w-5 h-5 text-artisan-yellow shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <Building2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate mb-1">
                            {showIdentity
                              ? offer.organization.name
                              : offer.anonymousId || `Offre #${index + 1}`}
                          </h3>
                          {showIdentity &&
                            offer.organization.city &&
                            offer.organization.canton && (
                              <p className="text-xs text-muted-foreground">
                                {offer.organization.city},{" "}
                                {offer.organization.canton}
                              </p>
                            )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/tenders/${tenderId}/offers/${offer.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir le détail
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Prix */}
                    <div className="text-2xl font-bold text-artisan-yellow mb-3">
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: offer.currency,
                      }).format(offer.price)}
                    </div>

                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        className={`${
                          statusConfig[offer.status]?.color || ""
                        } text-xs`}
                      >
                        {statusConfig[offer.status]?.label || offer.status}
                      </Badge>
                      {offer.timeline && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {offer.timeline}
                        </Badge>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      Soumis le{" "}
                      {offer.submittedAt
                        ? format(new Date(offer.submittedAt), "dd MMMM yyyy", {
                            locale: fr,
                          })
                        : "-"}
                    </div>
                  </div>

                  {/* Détails expandable mobile - cliquable pour navigation */}
                  {isSelected && (
                    <Link
                      href={`/dashboard/tenders/${tenderId}/offers/${offer.id}`}
                      className="mt-2 p-4 bg-white border-2 border-matte-black rounded-lg block hover:bg-sand-light/20 transition-colors"
                    >
                      <div className="space-y-4">
                        {/* Description */}
                        {offer.description && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4" />
                              Description
                            </h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {offer.description}
                            </p>
                          </div>
                        )}

                        {/* Méthodologie */}
                        {offer.methodology && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                              <Lightbulb className="w-4 h-4" />
                              Méthodologie
                            </h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {offer.methodology}
                            </p>
                          </div>
                        )}

                        {/* Timeline */}
                        {offer.timeline && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              Délai
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {offer.timeline}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-sm text-artisan-yellow font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Cliquer pour voir tous les détails
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
