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
  Edit,
  MoreHorizontal,
  Search,
  X,
  MapPin,
  CheckCircle2,
  Clock,
  Award,
  XCircle,
  Lock,
  FileEdit,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DeleteDraftButton } from "@/components/tenders/delete-draft-button";

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
    icon: FileEdit,
    color: "bg-gray-100 text-gray-700",
  },
  PUBLISHED: {
    label: "Publié",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  CLOSED: {
    label: "Clôturé",
    icon: Lock,
    color: "bg-blue-100 text-blue-700",
  },
  AWARDED: {
    label: "Attribué",
    icon: Award,
    color: "bg-purple-100 text-purple-700",
  },
  CANCELLED: {
    label: "Annulé",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
};

interface TendersTableProps {
  tenders: Array<{
    id: string;
    title: string;
    status: string;
    visibility: string;
    mode: string;
    marketType: string;
    budget: number | null;
    currency: string;
    deadline: Date;
    city: string | null;
    canton: string | null;
    description: string | null;
    createdAt: Date;
    publishedAt: Date | null;
    _count?: {
      offers: number;
    };
  }>;
  organizationId: string;
}

export function TendersTable({ tenders }: TendersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTender, setSelectedTender] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtrer et rechercher
  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marketTypeLabels[tender.marketType]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "draft" && tender.status === "DRAFT") ||
      (statusFilter === "published" && tender.status === "PUBLISHED") ||
      (statusFilter === "closed" &&
        ["CLOSED", "AWARDED", "CANCELLED"].includes(tender.status));

    return matchesSearch && matchesStatus;
  });

  // Tender sélectionné pour le panneau de détails
  const selectedTenderData = tenders.find((t) => t.id === selectedTender);

  const getDeadlineStatus = (deadline: Date) => {
    const now = new Date();
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return { label: "Expiré", color: "text-red-600" };
    if (diffHours <= 48)
      return { label: "Urgent", color: "text-red-600 font-semibold" };
    if (diffHours <= 168) return { label: "Bientôt", color: "text-orange-600" };
    return { label: formatDistanceToNow(deadline, { locale: fr }), color: "" };
  };

  // Compter les tenders par statut
  const counts = {
    all: tenders.length,
    draft: tenders.filter((t) => t.status === "DRAFT").length,
    published: tenders.filter((t) => t.status === "PUBLISHED").length,
    closed: tenders.filter((t) =>
      ["CLOSED", "AWARDED", "CANCELLED"].includes(t.status)
    ).length,
  };

  if (tenders.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucun appel d&apos;offre</h3>
        <p className="text-muted-foreground mb-6">
          Vous n&apos;avez pas encore créé d&apos;appel d&apos;offre.
        </p>
        <Link href="/dashboard/tenders/new">
          <Button>Créer mon premier appel d&apos;offre</Button>
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
            placeholder="Rechercher un appel d'offre..."
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
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Tous ({counts.all})
          </Button>
          <Button
            variant={statusFilter === "draft" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("draft")}
          >
            Brouillons ({counts.draft})
          </Button>
          <Button
            variant={statusFilter === "published" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("published")}
          >
            Publiés ({counts.published})
          </Button>
          <Button
            variant={statusFilter === "closed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("closed")}
          >
            Clôturés ({counts.closed})
          </Button>
        </div>
      </div>

      {/* Layout avec liste et panneau de détails */}
      <div className="flex gap-6">
        {/* Liste des tenders */}
        <div className={selectedTender ? "flex-1" : "flex-1"}>
          {/* Vue desktop - Tableau */}
          <div className="hidden md:block border-2 border-matte-black rounded-lg overflow-hidden bg-white">
            {/* Header du tableau */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-sand-light border-b-2 border-matte-black font-semibold text-sm">
              <div className="col-span-5">Titre</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Échéance</div>
              <div className="col-span-2">Offres</div>
              <div className="col-span-1"></div>
            </div>

            {/* Lignes */}
            {filteredTenders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Aucun résultat trouvé
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {filteredTenders.map((tender) => {
                  const StatusIcon =
                    statusConfig[tender.status]?.icon || FileText;
                  const deadlineStatus = getDeadlineStatus(
                    new Date(tender.deadline)
                  );
                  const isSelected = selectedTender === tender.id;

                  return (
                    <div
                      key={tender.id}
                      onClick={() =>
                        setSelectedTender(isSelected ? null : tender.id)
                      }
                      className={`grid grid-cols-12 gap-4 p-4 hover:bg-sand-light/30 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-artisan-yellow/10 border-l-4 border-l-artisan-yellow"
                          : ""
                      }`}
                    >
                      {/* Titre */}
                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{tender.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {tender.city && tender.canton && (
                              <>
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {tender.city}, {tender.canton}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="col-span-2 flex items-center">
                        <Badge
                          className={`${
                            statusConfig[tender.status]?.color
                          } text-xs`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[tender.status]?.label}
                        </Badge>
                      </div>

                      {/* Échéance */}
                      <div className="col-span-2 flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={deadlineStatus.color}>
                          {deadlineStatus.label}
                        </span>
                      </div>

                      {/* Offres */}
                      <div className="col-span-2 flex items-center">
                        {tender.status === "PUBLISHED" && (
                          <Badge variant="outline" className="text-xs">
                            {tender._count?.offers || 0} offre
                            {(tender._count?.offers || 0) > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end">
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
                                href={`/dashboard/tenders/${tender.id}`}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les détails
                              </Link>
                            </DropdownMenuItem>
                            {tender.status === "DRAFT" && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/tenders/${tender.id}/edit`}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Éditer
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div onClick={(e) => e.stopPropagation()}>
                                  <DeleteDraftButton
                                    tenderId={tender.id}
                                    tenderTitle={tender.title}
                                  />
                                </div>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vue mobile - Cartes */}
          <div className="md:hidden space-y-3">
            {filteredTenders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredTenders.map((tender) => {
                const StatusIcon =
                  statusConfig[tender.status]?.icon || FileText;
                const deadlineStatus = getDeadlineStatus(
                  new Date(tender.deadline)
                );
                const isSelected = selectedTender === tender.id;

                return (
                  <div
                    key={tender.id}
                    onClick={() =>
                      setSelectedTender(isSelected ? null : tender.id)
                    }
                    className={`border-2 border-matte-black rounded-lg p-4 bg-white ${
                      isSelected
                        ? "border-artisan-yellow bg-artisan-yellow/5"
                        : ""
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-1">
                          {tender.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {tender.city && tender.canton && (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>
                                {tender.city}, {tender.canton}
                              </span>
                            </>
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
                              href={`/dashboard/tenders/${tender.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les détails
                            </Link>
                          </DropdownMenuItem>
                          {tender.status === "DRAFT" && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/tenders/${tender.id}/edit`}
                                  className="cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Éditer
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <div onClick={(e) => e.stopPropagation()}>
                                <DeleteDraftButton
                                  tenderId={tender.id}
                                  tenderTitle={tender.title}
                                />
                              </div>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        className={`${
                          statusConfig[tender.status]?.color
                        } text-xs`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[tender.status]?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {deadlineStatus.label}
                      </Badge>
                      {tender.status === "PUBLISHED" && (
                        <Badge variant="outline" className="text-xs">
                          {tender._count?.offers || 0} offre
                          {(tender._count?.offers || 0) > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{marketTypeLabels[tender.marketType]}</span>
                      {tender.budget && (
                        <span className="font-medium">
                          {new Intl.NumberFormat("fr-CH", {
                            style: "currency",
                            currency: tender.currency,
                            maximumFractionDigits: 0,
                          }).format(tender.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panneau de détails latéral - Desktop uniquement */}
        {selectedTenderData && (
          <div className="hidden md:block w-96 shrink-0">
            <div className="sticky top-24 border-2 border-matte-black rounded-lg bg-white overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-sand-light border-b-2 border-matte-black flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {selectedTenderData.title}
                  </h3>
                  <Badge
                    className={`${
                      statusConfig[selectedTenderData.status]?.color
                    } text-xs`}
                  >
                    {statusConfig[selectedTenderData.status]?.label}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTender(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Contenu */}
              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Type de marché */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Type de marché
                  </p>
                  <p className="font-medium">
                    {marketTypeLabels[selectedTenderData.marketType]}
                  </p>
                </div>

                {/* Localisation */}
                {selectedTenderData.city && selectedTenderData.canton && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Localisation
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedTenderData.city}, {selectedTenderData.canton}
                    </p>
                  </div>
                )}

                {/* Budget */}
                {selectedTenderData.budget && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="font-medium flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      {new Intl.NumberFormat("fr-CH", {
                        style: "currency",
                        currency: selectedTenderData.currency,
                        maximumFractionDigits: 0,
                      }).format(selectedTenderData.budget)}
                    </p>
                  </div>
                )}

                {/* Échéance */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Échéance</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedTenderData.deadline), "PPP", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(
                      new Date(selectedTenderData.deadline),
                      {
                        addSuffix: true,
                        locale: fr,
                      }
                    )}
                  </p>
                </div>

                {/* Description */}
                {selectedTenderData.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm leading-relaxed">
                      {selectedTenderData.description}
                    </p>
                  </div>
                )}

                {/* Offres reçues */}
                {selectedTenderData.status === "PUBLISHED" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Offres reçues
                    </p>
                    <p className="font-semibold text-lg text-artisan-yellow">
                      {selectedTenderData._count?.offers || 0} offre
                      {(selectedTenderData._count?.offers || 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  <Link
                    href={`/dashboard/tenders/${selectedTenderData.id}`}
                    className="block"
                  >
                    <Button className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir les détails complets
                    </Button>
                  </Link>
                  {selectedTenderData.status === "DRAFT" && (
                    <Link
                      href={`/dashboard/tenders/${selectedTenderData.id}/edit`}
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer le brouillon
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
