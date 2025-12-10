import PublicLayout from "@/components/layout/public-layout";
import { getTenderById } from "@/features/tenders/actions";
import { notFound } from "next/navigation";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  Euro,
  FileText,
  Clock,
  EyeOff,
  ArrowLeft,
  Download,
  Ruler,
  Target,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { getSession } from "@/lib/auth/session";
import { SubmitOfferButton } from "@/components/tenders/submit-offer-button";
import { hasUserSubmittedOffer } from "@/features/offers/actions";

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

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(id);

  if (!tender) {
    notFound();
  }

  // Vérifier si l'utilisateur est connecté
  const session = await getSession();
  const isAuthenticated = !!session;

  // Vérifier si l'utilisateur a déjà soumis une offre
  const { hasSubmitted, offerId } = await hasUserSubmittedOffer(id);

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

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen relative overflow-hidden">
        {/* Formes grises décoratives */}
        <div className="absolute -right-32 top-20 w-[500px] h-[500px] bg-gray-100 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute -left-40 bottom-40 w-[600px] h-[600px] bg-gray-100 rounded-full opacity-25 pointer-events-none" />

        {/* Breadcrumb */}
        <div className="border-b border-gray-100 relative z-10">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-matte-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux appels d&apos;offres
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* En-tête */}
              <HandDrawnCard>
                <HandDrawnCardContent className="p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <HandDrawnBadge variant="default">
                      {marketTypeLabels[tender.marketType] || tender.marketType}
                    </HandDrawnBadge>
                    {isAnonymous && (
                      <Badge
                        variant="outline"
                        className="border-deep-green text-deep-green"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        Émetteur anonyme
                      </Badge>
                    )}
                    {isUrgent && (
                      <Badge variant="destructive" className="animate-pulse">
                        Urgent - {daysUntilDeadline} jour
                        {daysUntilDeadline > 1 ? "s" : ""} restant
                        {daysUntilDeadline > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge variant="secondary">Deadline passée</Badge>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold mb-4">{tender.title}</h1>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Publié{" "}
                        {formatDistanceToNow(new Date(tender.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>
                        {tender._count?.offers || 0} offre
                        {(tender._count?.offers || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </HandDrawnCardContent>
              </HandDrawnCard>

              {/* Description */}
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle>
                    Description du{" "}
                    <HandDrawnHighlight variant="yellow">
                      projet
                    </HandDrawnHighlight>
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {tender.description}
                  </p>
                </HandDrawnCardContent>
              </HandDrawnCard>

              {/* Résumé court */}
              {tender.summary && (
                <HandDrawnCard className="border-artisan-yellow">
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>Résumé</HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent>
                    <p className="text-muted-foreground font-medium">
                      {tender.summary}
                    </p>
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Situation actuelle */}
              {tender.currentSituation && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>État existant</HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {tender.currentSituation}
                    </p>
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Détails techniques */}
              {(tender.cfcCodes.length > 0 ||
                tender.surfaceM2 ||
                tender.volumeM3 ||
                tender.constraints.length > 0) && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>
                      <Ruler className="w-5 h-5 inline mr-2" />
                      Détails techniques
                    </HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent className="space-y-4">
                    {/* Codes CFC */}
                    {tender.cfcCodes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Codes CFC
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tender.cfcCodes.map((code) => (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="font-mono"
                            >
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Surface et volume */}
                    {(tender.surfaceM2 || tender.volumeM3) && (
                      <div className="grid grid-cols-2 gap-4">
                        {tender.surfaceM2 && (
                          <div className="p-4 bg-sand-light rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              Surface
                            </p>
                            <p className="text-2xl font-bold">
                              {tender.surfaceM2.toLocaleString("fr-CH")} m²
                            </p>
                          </div>
                        )}
                        {tender.volumeM3 && (
                          <div className="p-4 bg-sand-light rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              Volume
                            </p>
                            <p className="text-2xl font-bold">
                              {tender.volumeM3.toLocaleString("fr-CH")} m³
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contraintes */}
                    {tender.constraints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Contraintes du chantier
                        </h4>
                        <ul className="space-y-1">
                          {tender.constraints.map((constraint, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-artisan-yellow mt-0.5">
                                •
                              </span>
                              {constraint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Planning et durée */}
              {(tender.contractDuration ||
                tender.contractStartDate ||
                tender.isRenewable) && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>
                      <Calendar className="w-5 h-5 inline mr-2" />
                      Planning et durée
                    </HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent className="space-y-4">
                    {tender.contractDuration && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Durée du contrat
                        </p>
                        <p className="text-lg font-semibold">
                          {tender.contractDuration} jour
                          {tender.contractDuration > 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    {tender.contractStartDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Date de début souhaitée
                        </p>
                        <p className="text-lg font-semibold">
                          {format(
                            new Date(tender.contractStartDate),
                            "d MMMM yyyy",
                            {
                              locale: fr,
                            }
                          )}
                        </p>
                      </div>
                    )}
                    {tender.isRenewable && (
                      <div className="flex items-center gap-2 p-3 bg-deep-green/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-deep-green" />
                        <span className="text-sm font-medium text-deep-green">
                          Contrat reconductible
                        </span>
                      </div>
                    )}
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Critère de sélection */}
              <HandDrawnCard className="border-deep-green">
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle>
                    <Target className="w-5 h-5 inline mr-2" />
                    Critère de sélection prioritaire
                  </HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent>
                  <div className="flex items-center gap-3 p-4 bg-deep-green/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-deep-green" />
                    <div>
                      <p className="font-bold text-deep-green">
                        {selectionPriorityLabels[tender.selectionPriority]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ce critère est le plus important pour ce projet
                      </p>
                    </div>
                  </div>
                </HandDrawnCardContent>
              </HandDrawnCard>

              {/* Conditions de participation */}
              {(tender.participationConditions ||
                tender.requiredDocuments ||
                tender.requiresReferences ||
                tender.requiresInsurance ||
                tender.minExperience) && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>
                      <ShieldCheck className="w-5 h-5 inline mr-2" />
                      Conditions de participation
                    </HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent className="space-y-4">
                    {tender.participationConditions && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Conditions générales
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {tender.participationConditions}
                        </p>
                      </div>
                    )}

                    {tender.requiredDocuments && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Documents requis
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {tender.requiredDocuments}
                        </p>
                      </div>
                    )}

                    {/* Exigences */}
                    {(tender.requiresReferences ||
                      tender.requiresInsurance ||
                      tender.minExperience) && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Exigences
                        </h4>
                        <ul className="space-y-2">
                          {tender.requiresReferences && (
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-deep-green" />
                              Références professionnelles requises
                            </li>
                          )}
                          {tender.requiresInsurance && (
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-deep-green" />
                              Assurance responsabilité civile requise
                            </li>
                          )}
                          {tender.minExperience && (
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-deep-green" />
                              Expérience minimale : {tender.minExperience} an
                              {tender.minExperience > 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Conditions contractuelles */}
              {tender.contractualTerms && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>
                      Conditions contractuelles
                    </HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {tender.contractualTerms}
                    </p>
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Lots */}
              {tender.hasLots && tender.lots && tender.lots.length > 0 && (
                <HandDrawnCard className="border-artisan-yellow">
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>Lots du marché</HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent className="space-y-4">
                    {tender.lots.map((lot) => (
                      <div
                        key={lot.id}
                        className="p-4 bg-sand-light rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge className="bg-artisan-yellow text-black">
                            Lot {lot.number}
                          </Badge>
                          {lot.budget && (
                            <span className="text-sm font-semibold">
                              CHF {lot.budget.toLocaleString("fr-CH")}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold">{lot.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lot.description}
                        </p>
                      </div>
                    ))}
                    {tender.allowPartialOffers && (
                      <div className="flex items-center gap-2 p-3 bg-deep-green/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-deep-green" />
                        <span className="text-sm font-medium text-deep-green">
                          Offres partielles autorisées
                        </span>
                      </div>
                    )}
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Critères d'évaluation */}
              {tender.criteria && tender.criteria.length > 0 && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>
                      <Award className="w-5 h-5 inline mr-2" />
                      Critères d&apos;évaluation
                    </HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent className="space-y-3">
                    {tender.criteria.map((criteria) => (
                      <div
                        key={criteria.id}
                        className="p-4 bg-sand-light rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{criteria.name}</h4>
                          <Badge className="bg-artisan-yellow text-black">
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
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Documents */}
              {tender.documents && tender.documents.length > 0 && (
                <HandDrawnCard>
                  <HandDrawnCardHeader>
                    <HandDrawnCardTitle>
                      Documents & cahier des charges
                    </HandDrawnCardTitle>
                  </HandDrawnCardHeader>
                  <HandDrawnCardContent>
                    <div className="space-y-3">
                      {tender.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-sand-light rounded-lg hover:bg-artisan-yellow/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              <FileText className="w-5 h-5 text-artisan-yellow" />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-artisan-yellow transition-colors">
                                {doc.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-muted-foreground group-hover:text-artisan-yellow transition-colors" />
                        </a>
                      ))}
                    </div>
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Informations sur l'anonymisation */}
              {isAnonymous && !isOwner && (
                <HandDrawnCard className="border-deep-green">
                  <HandDrawnCardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="p-3 bg-deep-green/10 rounded-lg">
                        <EyeOff className="w-6 h-6 text-deep-green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-deep-green mb-2">
                          Appel d&apos;offres anonyme
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          L&apos;identité de l&apos;organisation émettrice est
                          masquée jusqu&apos;à la deadline pour garantir une
                          sélection équitable et éviter les conflits
                          d&apos;intérêts.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>✓ Organisation masquée</li>
                          <li>✓ Évaluation objective des offres</li>
                          <li>✓ Révélation automatique après la deadline</li>
                        </ul>
                      </div>
                    </div>
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Message si propriétaire */}
              {isOwner && (
                <HandDrawnCard className="border-gray-200">
                  <HandDrawnCardContent className="p-6 text-center">
                    <h3 className="text-lg font-bold mb-2">
                      Votre appel d&apos;offre
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vous ne pouvez pas soumettre une offre à votre propre
                      appel d&apos;offre.
                    </p>
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* CTA Principal */}
              {!isExpired && !isOwner && (
                <HandDrawnCard className="border-artisan-yellow border-2">
                  <HandDrawnCardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-4">
                      Intéressé par ce projet ?
                    </h3>
                    <SubmitOfferButton
                      tenderId={tender.id}
                      isAuthenticated={isAuthenticated}
                      hasSubmitted={hasSubmitted}
                      offerId={offerId}
                    />
                  </HandDrawnCardContent>
                </HandDrawnCard>
              )}

              {/* Informations clés */}
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle>Informations clés</HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent className="space-y-4">
                  {/* Organisation - masquée si anonyme et deadline non passée */}
                  {(!isAnonymous || isExpired || isOwner) && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">Organisation</span>
                        </div>
                        <p className="font-semibold ml-6">
                          {tender.organization.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs ml-6 mt-1"
                        >
                          {organizationTypeLabels[tender.organization.type]}
                        </Badge>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Message si organisation masquée */}
                  {isAnonymous && !isExpired && !isOwner && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">Organisation</span>
                        </div>
                        <div className="ml-6 flex items-center gap-2 text-muted-foreground">
                          <EyeOff className="w-4 h-4" />
                          <span className="text-sm italic">
                            Masquée jusqu'à la deadline
                          </span>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Localisation */}
                  {(tender.city || tender.canton) && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">Localisation</span>
                        </div>
                        <p className="ml-6">
                          {tender.city && tender.canton
                            ? `${tender.city}, ${tender.canton}`
                            : tender.city || tender.canton}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Budget */}
                  {tender.budget && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Euro className="w-4 h-4" />
                          <span className="font-medium">Budget indicatif</span>
                        </div>
                        <p className="ml-6 text-2xl font-bold text-artisan-yellow">
                          CHF {tender.budget.toLocaleString("fr-CH")}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Deadline */}
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Deadline</span>
                    </div>
                    <p
                      className={`ml-6 font-semibold ${
                        isUrgent ? "text-red-500" : ""
                      }`}
                    >
                      {format(deadline, "d MMMM yyyy", { locale: fr })}
                    </p>
                    <p className="ml-6 text-sm text-muted-foreground">
                      {format(deadline, "HH:mm", { locale: fr })}
                    </p>
                    {!isExpired && (
                      <p className="ml-6 text-sm text-muted-foreground mt-1">
                        {daysUntilDeadline > 0
                          ? `${daysUntilDeadline} jour${
                              daysUntilDeadline > 1 ? "s" : ""
                            } restant${daysUntilDeadline > 1 ? "s" : ""}`
                          : "Dernier jour"}
                      </p>
                    )}
                  </div>
                </HandDrawnCardContent>
              </HandDrawnCard>

              {/* Partage */}
              <HandDrawnCard>
                <HandDrawnCardHeader>
                  <HandDrawnCardTitle>Partager</HandDrawnCardTitle>
                </HandDrawnCardHeader>
                <HandDrawnCardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Partagez cet appel d&apos;offres avec votre réseau
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Copier le lien
                  </Button>
                </HandDrawnCardContent>
              </HandDrawnCard>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
