import { Suspense } from "react";
import PublicLayout from "@/components/layout/public-layout";
import { getTenderById } from "@/features/tenders/actions";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Clock,
  EyeOff,
  ArrowLeft,
  Download,
  Ruler,
  Target,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { getSession } from "@/lib/auth/session";
import { SubmitOfferButton } from "@/components/tenders/submit-offer-button";
import { hasUserSubmittedOffer } from "@/features/offers/actions";
import { ShareTenderButton } from "@/components/tenders/share-tender-button";

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

const organizationTypeLabels: Record<string, string> = {
  COMMUNE: "Commune",
  ENTREPRISE: "Entreprise",
  PRIVE: "Privé",
};

const selectionPriorityLabels: Record<string, string> = {
  LOWEST_PRICE: "Prix le plus bas",
  QUALITY_PRICE: "Meilleur rapport qualité-prix",
  FASTEST_DELIVERY: "Délai d'exécution le plus court",
  BEST_REFERENCES: "Meilleures références",
  ECO_FRIENDLY: "Respect de l'environnement",
};

async function TenderContent({ id }: { id: string }) {
  const tender = await getTenderById(id);

  if (!tender) {
    notFound();
  }

  // Vérifier si l'utilisateur est connecté
  const session = await getSession();
  const isAuthenticated = !!session;

  // Vérifier si l'utilisateur a déjà soumis une offre (seulement si connecté)
  let hasSubmitted = false;
  let offerId: string | undefined = undefined;

  if (isAuthenticated) {
    try {
      const offerCheck = await hasUserSubmittedOffer(id);
      hasSubmitted = offerCheck.hasSubmitted;
      offerId = offerCheck.offerId || undefined;
    } catch (error) {
      // Ignore l'erreur si non authentifié
      console.error("Error checking user offer:", error);
    }
  }

  // Vérifier si l'utilisateur fait partie de l'organisation du tender
  const isOwner = session?.user?.id
    ? tender.organization.members.some(
        (member: { userId: string }) => member.userId === session.user.id
      )
    : false;

  const isAnonymous = tender.mode === "ANONYMOUS";
  const now = new Date();
  const deadline = new Date(tender.deadline);
  const isExpired = now > deadline;
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDeadline <= 7 && !isExpired;

  // Simuler les vues basé sur l'ID du tender (stable)
  const viewCount = (parseInt(tender.id.slice(-4), 16) % 400) + 100;

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        {/* Breadcrumb - Style Amazon */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 py-3">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 text-sm text-deep-green hover:text-artisan-yellow transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux appels d&apos;offres
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Contenu principal - 8/12 */}
            <div className="lg:col-span-8">
              {/* Card principale fluide - Style Amazon */}
              <div className="bg-white rounded-lg shadow-sm">
                {/* Galerie de documents - Style Amazon product images */}
                {tender.documents && tender.documents.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-artisan-yellow" />
                      Documents & cahier des charges
                      <Badge className="bg-artisan-yellow text-matte-black border border-matte-black">
                        {tender.documents.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tender.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-artisan-yellow hover:bg-artisan-yellow/5 transition-all group"
                        >
                          <div className="p-3 bg-sand-light rounded-lg border border-gray-300 group-hover:bg-artisan-yellow transition-colors">
                            <FileText className="w-6 h-6 text-matte-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-artisan-yellow transition-colors">
                              {doc.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB · PDF
                            </p>
                          </div>
                          <Download className="w-5 h-5 text-muted-foreground group-hover:text-artisan-yellow transition-colors shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Header avec titre et badges */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-sand-light text-matte-black border border-gray-300 font-semibold">
                      {marketTypeLabels[tender.marketType] || tender.marketType}
                    </Badge>
                    {isAnonymous && (
                      <Badge className="bg-deep-green/10 text-deep-green border border-deep-green font-semibold">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Mode anonyme
                      </Badge>
                    )}
                    {isUrgent && (
                      <Badge className="bg-red-500 text-white border border-red-600 font-semibold">
                        <Flame className="w-3 h-3 mr-1" />
                        Urgent · {daysUntilDeadline}j
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge
                        variant="secondary"
                        className="border border-gray-300 font-semibold"
                      >
                        Deadline passée
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    {tender.title}
                  </h1>

                  {/* Social proof - Style Amazon */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{viewCount} vues</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {tender._count?.offers || 0} offre
                        {(tender._count?.offers || 0) !== 1 ? "s" : ""} soumise
                        {(tender._count?.offers || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        Publié{" "}
                        {formatDistanceToNow(new Date(tender.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Prix et deadline - Style prominent */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {tender.budget && (
                      <div className="p-4 bg-artisan-yellow/10 rounded-lg border border-artisan-yellow">
                        <p className="text-xs text-muted-foreground mb-1">
                          Budget indicatif
                        </p>
                        <p className="text-2xl font-bold text-artisan-yellow">
                          CHF {tender.budget.toLocaleString("fr-CH")}
                        </p>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-lg border ${
                        isUrgent
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        Deadline
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          isUrgent ? "text-red-600" : "text-matte-black"
                        }`}
                      >
                        {format(deadline, "d MMM yyyy", { locale: fr })}
                      </p>
                      {!isExpired && (
                        <p
                          className={`text-xs mt-1 font-semibold ${
                            isUrgent ? "text-red-600" : "text-muted-foreground"
                          }`}
                        >
                          {daysUntilDeadline > 0
                            ? `${daysUntilDeadline} jour${
                                daysUntilDeadline > 1 ? "s" : ""
                              } restant${daysUntilDeadline > 1 ? "s" : ""}`
                            : "Dernier jour"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold mb-4">
                    Description du projet
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {tender.description}
                    </p>
                  </div>

                  {/* Résumé court - Si présent */}
                  {tender.summary && (
                    <div className="mt-6 p-4 bg-artisan-yellow/10 border-l-4 border-artisan-yellow rounded-r-lg">
                      <h3 className="font-bold mb-2 text-sm text-matte-black">
                        📋 Résumé
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {tender.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* État existant */}
                {tender.currentSituation && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">État existant</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {tender.currentSituation}
                    </p>
                  </div>
                )}

                {/* Détails techniques - Style cards compactes */}
                {(tender.cfcCodes.length > 0 ||
                  tender.surfaceM2 ||
                  tender.volumeM3 ||
                  tender.constraints.length > 0) && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-artisan-yellow" />
                      Spécifications techniques
                    </h2>

                    <div className="space-y-4">
                      {/* Surface et volume - Grid compact */}
                      {(tender.surfaceM2 || tender.volumeM3) && (
                        <div className="grid grid-cols-2 gap-3">
                          {tender.surfaceM2 && (
                            <div className="p-4 bg-sand-light rounded-lg border border-gray-300">
                              <p className="text-xs text-muted-foreground mb-1">
                                Surface
                              </p>
                              <p className="text-xl font-bold">
                                {tender.surfaceM2.toLocaleString("fr-CH")} m²
                              </p>
                            </div>
                          )}
                          {tender.volumeM3 && (
                            <div className="p-4 bg-sand-light rounded-lg border border-gray-300">
                              <p className="text-xs text-muted-foreground mb-1">
                                Volume
                              </p>
                              <p className="text-xl font-bold">
                                {tender.volumeM3.toLocaleString("fr-CH")} m³
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Codes CFC */}
                      {tender.cfcCodes.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-sm">
                            Codes CFC requis
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {tender.cfcCodes.map((code) => (
                              <Badge
                                key={code}
                                variant="secondary"
                                className="font-mono border border-matte-black"
                              >
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contraintes */}
                      {tender.constraints.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-artisan-yellow" />
                            Contraintes du chantier
                          </h3>
                          <ul className="space-y-1.5">
                            {tender.constraints.map((constraint, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="text-artisan-yellow mt-0.5">
                                  •
                                </span>
                                <span className="text-muted-foreground">
                                  {constraint}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Planning - Compact */}
                {(tender.contractDuration ||
                  tender.contractStartDate ||
                  tender.isRenewable) && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-artisan-yellow" />
                      Planning & durée
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {tender.contractDuration && (
                        <div className="p-4 bg-sand-light rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Durée du contrat
                          </p>
                          <p className="text-lg font-bold">
                            {tender.contractDuration} jour
                            {tender.contractDuration > 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                      {tender.contractStartDate && (
                        <div className="p-4 bg-sand-light rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Début souhaité
                          </p>
                          <p className="text-lg font-bold">
                            {format(
                              new Date(tender.contractStartDate),
                              "d MMM yyyy",
                              { locale: fr }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {tender.isRenewable && (
                      <div className="mt-3 flex items-center gap-2 p-3 bg-deep-green/10 border border-deep-green rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                        <span className="text-sm font-semibold text-deep-green">
                          Contrat reconductible
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Photos et Documents */}
                {((tender.images && tender.images.length > 0) ||
                  (tender.pdfs && tender.pdfs.length > 0)) && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-artisan-yellow" />
                      Photos et documents du projet
                    </h2>

                    {/* Images */}
                    {tender.images && tender.images.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3 text-sm">
                          Photos ({tender.images.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {tender.images.map((img, index: number) => {
                            const image = img as { url: string; name: string };
                            return (
                              <a
                                key={index}
                                href={image.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-video overflow-hidden rounded-lg border border-gray-300 hover:border-artisan-yellow transition-colors"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white" />
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* PDFs */}
                    {tender.pdfs && tender.pdfs.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-sm">
                          Documents PDF ({tender.pdfs.length})
                        </h3>
                        <div className="space-y-2">
                          {tender.pdfs.map((pdf, index: number) => {
                            const document = pdf as {
                              url: string;
                              name: string;
                            };
                            return (
                              <a
                                key={index}
                                href={document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-sand-light rounded-lg border border-gray-300 hover:border-artisan-yellow hover:bg-artisan-yellow/5 transition-colors group"
                              >
                                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {document.name}
                                  </p>
                                </div>
                                <Download className="w-4 h-4 text-muted-foreground group-hover:text-artisan-yellow shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Critère de sélection - Mise en avant */}
                {tender.selectionPriorities &&
                  tender.selectionPriorities.length > 0 && (
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-artisan-yellow" />
                        Critères de sélection prioritaires
                      </h2>
                      <div className="space-y-3">
                        {tender.selectionPriorities.map(
                          (priority: string, index: number) => (
                            <div
                              key={priority}
                              className="flex items-center gap-4 p-4 bg-artisan-yellow/10 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-artisan-yellow rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-lg text-matte-black">
                                  {selectionPriorityLabels[priority]}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                        <p className="text-sm text-muted-foreground mt-3">
                          Ces critères sont les plus importants pour
                          l&apos;évaluation des offres
                        </p>
                      </div>
                    </div>
                  )}

                {/* Conditions de participation */}
                {(tender.participationConditions ||
                  tender.requiredDocuments ||
                  tender.requiresReferences ||
                  tender.requiresInsurance ||
                  tender.minExperience) && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-artisan-yellow" />
                      Conditions de participation
                    </h2>
                    <div className="space-y-4">
                      {tender.participationConditions && (
                        <div>
                          <h3 className="font-semibold mb-2 text-sm">
                            Conditions générales
                          </h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {tender.participationConditions}
                          </p>
                        </div>
                      )}

                      {tender.requiredDocuments && (
                        <div>
                          <h3 className="font-semibold mb-2 text-sm">
                            Documents requis
                          </h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {tender.requiredDocuments}
                          </p>
                        </div>
                      )}

                      {(tender.requiresReferences ||
                        tender.requiresInsurance ||
                        tender.minExperience) && (
                        <div>
                          <h3 className="font-semibold mb-2 text-sm">
                            Exigences
                          </h3>
                          <ul className="space-y-2">
                            {tender.requiresReferences && (
                              <li className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                                <span>
                                  Références professionnelles requises
                                </span>
                              </li>
                            )}
                            {tender.requiresInsurance && (
                              <li className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                                <span>
                                  Assurance responsabilité civile requise
                                </span>
                              </li>
                            )}
                            {tender.minExperience && (
                              <li className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                                <span>
                                  Expérience minimale : {tender.minExperience}
                                </span>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditions contractuelles */}
                {tender.contractualTerms && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">
                      Conditions contractuelles
                    </h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {tender.contractualTerms}
                    </p>
                  </div>
                )}

                {/* Lots */}
                {tender.hasLots && tender.lots && tender.lots.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Lots du marché</h2>
                    <div className="space-y-3">
                      {tender.lots.map((lot) => (
                        <div
                          key={lot.id}
                          className="p-4 bg-sand-light rounded-lg border border-gray-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-artisan-yellow text-matte-black border border-matte-black font-bold">
                              Lot {lot.number}
                            </Badge>
                            {lot.budget && (
                              <span className="text-lg font-bold">
                                CHF {lot.budget.toLocaleString("fr-CH")}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold mb-1">{lot.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {lot.description}
                          </p>
                        </div>
                      ))}
                      {tender.allowPartialOffers && (
                        <div className="flex items-center gap-2 p-3 bg-deep-green/10 border border-deep-green rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                          <span className="text-sm font-semibold text-deep-green">
                            Offres partielles autorisées
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Critères d'évaluation */}
                {tender.criteria && tender.criteria.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-artisan-yellow" />
                      Critères d&apos;évaluation
                    </h2>
                    <div className="space-y-3">
                      {tender.criteria.map((criteria) => (
                        <div
                          key={criteria.id}
                          className="p-4 bg-sand-light rounded-lg border border-gray-300"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold">{criteria.name}</h3>
                            <Badge className="bg-artisan-yellow text-matte-black border border-matte-black px-2 py-0.5">
                              {criteria.weight}%
                            </Badge>
                          </div>
                          {criteria.description && (
                            <p className="text-sm text-muted-foreground">
                              {criteria.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informations sur l'anonymisation */}
                {isAnonymous && !isOwner && (
                  <div className="p-6 bg-deep-green/5 rounded-b-lg">
                    <div className="flex gap-4">
                      <div className="p-3 bg-deep-green/10 rounded-lg shrink-0">
                        <EyeOff className="w-6 h-6 text-deep-green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-deep-green mb-2">
                          Appel d&apos;offres en mode anonyme
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          L&apos;identité de l&apos;organisation émettrice est
                          masquée jusqu&apos;à la deadline pour garantir une
                          sélection équitable et éviter les conflits
                          d&apos;intérêts.
                        </p>
                        <ul className="text-sm space-y-1.5">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-deep-green" />
                            <span>Organisation masquée</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-deep-green" />
                            <span>Évaluation objective des offres</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-deep-green" />
                            <span>Révélation automatique après deadline</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - STICKY - 4/12 */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-4">
                {/* CTA Principal - Toujours en haut et visible */}
                {!isExpired && !isOwner && (
                  <div className="bg-white p-6 rounded-lg border-2 border-artisan-yellow shadow-lg">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold mb-2">
                        Soumettre une offre
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {hasSubmitted
                          ? "Vous avez déjà soumis une offre"
                          : "Payez uniquement pour les projets qui vous intéressent"}
                      </p>
                    </div>

                    <SubmitOfferButton
                      tenderId={tender.id}
                      isAuthenticated={isAuthenticated}
                      hasSubmitted={hasSubmitted}
                      offerId={offerId}
                    />
                  </div>
                )}

                {/* Message si propriétaire */}
                {isOwner && (
                  <div className="bg-white p-6 rounded-lg border-2 border-matte-black">
                    <h3 className="font-bold mb-2 text-center">
                      Votre appel d&apos;offre
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Vous ne pouvez pas soumettre une offre à votre propre
                      appel d&apos;offre.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/tenders/${tender.id}`}>
                        Gérer cet appel d&apos;offre
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Message si expiré */}
                {isExpired && !isOwner && (
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-300">
                    <h3 className="font-bold mb-2 text-center text-muted-foreground">
                      Deadline passée
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Cet appel d&apos;offres n&apos;accepte plus de nouvelles
                      soumissions.
                    </p>
                  </div>
                )}

                {/* Informations clés */}
                <div className="bg-white p-6 rounded-lg border-2 border-matte-black">
                  <h3 className="font-bold mb-4">Informations</h3>
                  <div className="space-y-4">
                    {/* Organisation */}
                    {(!isAnonymous || isExpired || isOwner) && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Building2 className="w-4 h-4" />
                          <span>Organisation</span>
                        </div>
                        <p className="font-semibold">
                          {tender.organization.name}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {organizationTypeLabels[tender.organization.type]}
                        </Badge>
                      </div>
                    )}

                    {isAnonymous && !isExpired && !isOwner && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Building2 className="w-4 h-4" />
                          <span>Organisation</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <EyeOff className="w-4 h-4" />
                          <span className="italic">Masquée</span>
                        </div>
                      </div>
                    )}

                    <div className="h-px bg-gray-200" />

                    {/* Localisation */}
                    {(tender.city || tender.canton) && (
                      <>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <MapPin className="w-4 h-4" />
                            <span>Localisation</span>
                          </div>
                          <p className="font-semibold text-sm">
                            {tender.city && tender.canton
                              ? `${tender.city}, ${tender.canton}`
                              : tender.city || tender.canton}
                          </p>
                        </div>
                        <div className="h-px bg-gray-200" />
                      </>
                    )}

                    {/* Type de marché */}
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <FileText className="w-4 h-4" />
                        <span>Type de marché</span>
                      </div>
                      <p className="font-semibold text-sm">
                        {marketTypeLabels[tender.marketType] ||
                          tender.marketType}
                      </p>
                    </div>

                    <div className="h-px bg-gray-200" />

                    {/* Deadline */}
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline de soumission</span>
                      </div>
                      <p
                        className={`font-bold ${
                          isUrgent ? "text-red-500" : "text-matte-black"
                        }`}
                      >
                        {format(deadline, "d MMMM yyyy · HH:mm", {
                          locale: fr,
                        })}
                      </p>
                      {!isExpired && (
                        <p
                          className={`text-xs mt-1 ${
                            isUrgent
                              ? "text-red-500 font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {daysUntilDeadline > 0
                            ? `${daysUntilDeadline} jour${
                                daysUntilDeadline > 1 ? "s" : ""
                              } restant${daysUntilDeadline > 1 ? "s" : ""}`
                            : "Dernier jour !"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Partage */}
                <div className="bg-white p-4 rounded-lg border-2 border-matte-black">
                  <ShareTenderButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function TenderDetailSkeleton() {
  return (
    <>
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Title Skeleton */}
              <div className="space-y-3">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Badges Skeleton */}
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <Suspense fallback={<TenderDetailSkeleton />}>
          <TenderContent id={id} />
        </Suspense>
      </div>
    </PublicLayout>
  );
}
