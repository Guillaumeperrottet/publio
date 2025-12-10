"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Euro,
  FileText,
  Eye,
  Edit,
  FileEdit,
  CheckCircle2,
  Lock,
  Award,
  XCircle,
} from "lucide-react";
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
  { label: string; icon: any; className: string }
> = {
  DRAFT: {
    label: "Brouillon",
    icon: FileEdit,
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
  PUBLISHED: {
    label: "Publié",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-300",
  },
  CLOSED: {
    label: "Clôturé",
    icon: Lock,
    className: "bg-blue-100 text-blue-700 border-blue-300",
  },
  AWARDED: {
    label: "Attribué",
    icon: Award,
    className: "bg-purple-100 text-purple-700 border-purple-300",
  },
  CANCELLED: {
    label: "Annulé",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-300",
  },
};

interface TendersListProps {
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
    createdAt: Date;
    publishedAt: Date | null;
    _count?: {
      offers: number;
    };
  }>;
  organizationId: string;
}

export function TendersList({ tenders }: TendersListProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filtrer les tenders selon l'onglet actif
  const filteredTenders = tenders.filter((tender) => {
    if (activeTab === "all") return true;
    if (activeTab === "draft") return tender.status === "DRAFT";
    if (activeTab === "published") return tender.status === "PUBLISHED";
    if (activeTab === "closed")
      return ["CLOSED", "AWARDED", "CANCELLED"].includes(tender.status);
    return true;
  });

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
      <HandDrawnCard>
        <HandDrawnCardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Aucun appel d&apos;offre
          </h3>
          <p className="text-muted-foreground mb-6">
            Vous n&apos;avez pas encore créé d&apos;appel d&apos;offre.
          </p>
          <Link href="/dashboard/tenders/new">
            <Button>Créer mon premier appel d&apos;offre</Button>
          </Link>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Tous ({counts.all})</TabsTrigger>
          <TabsTrigger value="draft">Brouillons ({counts.draft})</TabsTrigger>
          <TabsTrigger value="published">
            Publiés ({counts.published})
          </TabsTrigger>
          <TabsTrigger value="closed">Clôturés ({counts.closed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTenders.length === 0 ? (
        <HandDrawnCard>
          <HandDrawnCardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Aucun appel d&apos;offre dans cette catégorie
            </p>
          </HandDrawnCardContent>
        </HandDrawnCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTenders.map((tender) => {
            const now = new Date();
            const deadline = new Date(tender.deadline);
            const isExpired = now > deadline;
            const daysUntilDeadline = Math.ceil(
              (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            const statusInfo = statusConfig[tender.status] || {
              label: tender.status,
              icon: FileText,
              className: "bg-gray-100 text-gray-700 border-gray-300",
            };

            const StatusIcon = statusInfo.icon;

            return (
              <HandDrawnCard key={tender.id}>
                <HandDrawnCardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Contenu principal */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <Link href={`/dashboard/tenders/${tender.id}`}>
                            <h3 className="text-xl font-semibold hover:text-artisan-yellow transition-colors mb-2">
                              {tender.title}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusInfo.label}
                            </span>
                            {tender.mode === "ANONYMOUS" && (
                              <HandDrawnBadge>Anonyme</HandDrawnBadge>
                            )}
                            {tender.visibility === "PRIVATE" && (
                              <HandDrawnBadge>Privé</HandDrawnBadge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informations */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>
                            {marketTypeLabels[tender.marketType] ||
                              tender.marketType}
                          </span>
                        </div>

                        {tender.city && tender.canton && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {tender.city}, {tender.canton}
                            </span>
                          </div>
                        )}

                        {tender.budget && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Euro className="w-4 h-4" />
                            <span>
                              {new Intl.NumberFormat("fr-CH", {
                                style: "currency",
                                currency: tender.currency,
                                maximumFractionDigits: 0,
                              }).format(tender.budget)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {isExpired
                              ? "Expiré"
                              : `${daysUntilDeadline}j restants`}
                          </span>
                        </div>
                      </div>

                      {/* Statistiques offres */}
                      {tender.status === "PUBLISHED" && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Link
                            href={`/dashboard/tenders/${tender.id}`}
                            className="flex items-center gap-2 hover:text-artisan-yellow transition-colors group"
                          >
                            <FileText className="w-4 h-4 text-artisan-yellow group-hover:scale-110 transition-transform" />
                            <span className="font-semibold">
                              {tender._count?.offers || 0} offre(s) reçue(s)
                            </span>
                            <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Link href={`/dashboard/tenders/${tender.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                      </Link>
                      {tender.status === "DRAFT" && (
                        <>
                          <Link href={`/dashboard/tenders/${tender.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Éditer
                            </Button>
                          </Link>
                          <DeleteDraftButton
                            tenderId={tender.id}
                            tenderTitle={tender.title}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </HandDrawnCardContent>
              </HandDrawnCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
