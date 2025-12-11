"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Eye,
  MoreHorizontal,
  Clock,
  FileText,
  Building2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { OfferActionsButtons } from "@/components/offers/offer-actions-buttons";
import { AwardTenderButton } from "@/components/tenders/award-tender-button";

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
  PENDING: { label: "En attente", color: "bg-gray-100 text-gray-700" },
  ACCEPTED: { label: "Acceptée", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Refusée", color: "bg-red-100 text-red-700" },
  AWARDED: { label: "Attribuée", color: "bg-purple-100 text-purple-700" },
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

  // Trier les offres
  const sortedOffers = [...offers].sort((a, b) => {
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
        <p className="text-sm text-muted-foreground">
          {offers.length} offre{offers.length > 1 ? "s" : ""} reçue
          {offers.length > 1 ? "s" : ""}
        </p>
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
                      }`}
                    >
                      {/* Soumissionnaire avec chevron */}
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
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
                            {identityRevealed && (
                              <>
                                <DropdownMenuSeparator />
                                <div onClick={(e) => e.stopPropagation()}>
                                  <OfferActionsButtons
                                    offerId={offer.id}
                                    offerStatus={offer.status}
                                    organizationName={offer.organization.name}
                                    price={offer.price}
                                    currency={offer.currency}
                                  />
                                </div>
                                {offer.status === "ACCEPTED" &&
                                  canAwardTender && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <AwardTenderButton
                                        tenderId={tenderId}
                                        offerId={offer.id}
                                        organizationName={
                                          offer.organization.name
                                        }
                                        price={offer.price}
                                        currency={offer.currency}
                                      />
                                    </div>
                                  )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Détails expandable - cliquable pour navigation */}
                    {isSelected && (
                      <Link
                        href={`/dashboard/tenders/${tenderId}/offers/${offer.id}`}
                        className="block p-6 bg-white border-t-2 border-gray-200 hover:bg-sand-light/20 transition-colors"
                      >
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
