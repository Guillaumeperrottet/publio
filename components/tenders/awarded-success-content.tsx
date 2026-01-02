"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import {
  Award,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Shield,
  ArrowRight,
  Building2,
} from "lucide-react";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";

interface AwardedSuccessContentProps {
  tender: {
    id: string;
    title: string;
    status: string;
  };
  winningOffer: {
    id: string;
    price: number;
    currency: string;
    organization: {
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      canton: string | null;
    };
  };
  emitterOrganization: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    canton: string | null;
  };
  isWinner?: boolean;
}

export function AwardedSuccessContent({
  tender,
  winningOffer,
  emitterOrganization,
  isWinner = false,
}: AwardedSuccessContentProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      // Confetti subtil
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#DEAE00", "#6BCF7E", "#1B4332"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#DEAE00", "#6BCF7E", "#1B4332"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
      setTimeout(() => setShowConfetti(false), 0);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-sand-light/30 to-artisan-yellow/10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec icône de succès */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-artisan-yellow rounded-full mb-4 shadow-lg">
            <Award className="w-10 h-10 text-matte-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <HandDrawnHighlight variant="yellow">
              {isWinner ? "Félicitations !" : "Marché attribué !"}
            </HandDrawnHighlight>
          </h1>
          <p className="text-lg text-muted-foreground">
            {isWinner
              ? "Votre offre a été retenue !"
              : "L'appel d'offres a été attribué avec succès"}
          </p>
        </div>

        {/* Récapitulatif de l'offre gagnante */}
        <HandDrawnCard className="mb-6">
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-artisan-yellow" />
              Offre gagnante
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent className="space-y-6">
            {/* Appel d'offres */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Appel d&apos;offres
              </p>
              <p className="text-xl font-semibold">{tender.title}</p>
            </div>

            {/* Organisation gagnante */}
            <div className="bg-artisan-yellow/10 p-4 rounded-lg border-2 border-artisan-yellow">
              <div className="flex items-start gap-3 mb-3">
                <Building2 className="w-5 h-5 text-artisan-yellow mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Prestataire retenu
                  </p>
                  <p className="text-2xl font-bold text-matte-black">
                    {winningOffer.organization.name}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-artisan-yellow/30">
                <p className="text-sm text-muted-foreground mb-1">
                  Montant attribué
                </p>
                <p className="text-3xl font-bold text-artisan-yellow">
                  {new Intl.NumberFormat("fr-CH", {
                    style: "currency",
                    currency: winningOffer.currency,
                  }).format(winningOffer.price)}
                </p>
              </div>
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Coordonnées du prestataire */}
        <HandDrawnCard className="mb-6">
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Coordonnées du prestataire
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vous pouvez maintenant contacter le prestataire pour finaliser les
              détails du projet.
            </p>
            <div className="space-y-3">
              {winningOffer.organization.email && (
                <div className="flex items-center gap-3 p-3 bg-sand-light/50 rounded-lg">
                  <Mail className="w-5 h-5 text-artisan-yellow shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${winningOffer.organization.email}`}
                      className="text-sm font-medium text-artisan-yellow hover:underline truncate block"
                    >
                      {winningOffer.organization.email}
                    </a>
                  </div>
                </div>
              )}
              {winningOffer.organization.phone && (
                <div className="flex items-center gap-3 p-3 bg-sand-light/50 rounded-lg">
                  <Phone className="w-5 h-5 text-artisan-yellow shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <a
                      href={`tel:${winningOffer.organization.phone}`}
                      className="text-sm font-medium text-artisan-yellow hover:underline"
                    >
                      {winningOffer.organization.phone}
                    </a>
                  </div>
                </div>
              )}
              {(winningOffer.organization.address ||
                winningOffer.organization.city ||
                winningOffer.organization.canton) && (
                <div className="flex items-center gap-3 p-3 bg-sand-light/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-artisan-yellow shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm font-medium">
                      {winningOffer.organization.address && (
                        <>{winningOffer.organization.address}</>
                      )}
                      {winningOffer.organization.address &&
                        (winningOffer.organization.city ||
                          winningOffer.organization.canton) && <br />}
                      {winningOffer.organization.city && (
                        <>{winningOffer.organization.city}</>
                      )}
                      {winningOffer.organization.city &&
                        winningOffer.organization.canton &&
                        ", "}
                      {winningOffer.organization.canton}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Prochaines étapes */}
        <HandDrawnCard className="mb-6">
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Prochaines étapes
            </HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-artisan-yellow/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-artisan-yellow">
                    1
                  </span>
                </div>
                <div>
                  <p className="font-medium mb-1">
                    Contactez le prestataire retenu
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Prenez contact pour discuter des détails du projet et
                    confirmer les modalités.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-artisan-yellow/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-artisan-yellow">
                    2
                  </span>
                </div>
                <div>
                  <p className="font-medium mb-1">
                    Établissez le calendrier de réalisation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Définissez ensemble les dates clés et le planning du projet.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-artisan-yellow/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-artisan-yellow">
                    3
                  </span>
                </div>
                <div>
                  <p className="font-medium mb-1">
                    Préparez les documents contractuels
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rédigez le contrat et rassemblez les documents
                    administratifs nécessaires.
                  </p>
                </div>
              </div>
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={
              isWinner
                ? `/dashboard/offers?tenderId=${tender.id}`
                : `/dashboard/tenders/${tender.id}/offers/${winningOffer.id}`
            }
          >
            <Button variant="outline" className="w-full" size="lg">
              <FileText className="w-4 h-4 mr-2" />
              {isWinner ? "Voir mon offre" : "Voir l'offre"}
            </Button>
          </Link>
          {!isWinner && (
            <Link href={`/dashboard/tenders/${tender.id}/equity-log`}>
              <Button variant="outline" className="w-full" size="lg">
                <Shield className="w-4 h-4 mr-2" />
                Journal d&apos;équité
              </Button>
            </Link>
          )}
          <Link href={isWinner ? "/dashboard/offers" : "/dashboard/tenders"}>
            <Button
              className="w-full bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black"
              size="lg"
            >
              {isWinner ? "Mes offres" : "Mes appels d'offres"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Info complémentaire */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            📧 Un email de confirmation a été envoyé à{" "}
            <strong>
              {isWinner
                ? winningOffer.organization.name
                : emitterOrganization.name}
            </strong>
            {!isWinner && (
              <>
                {" "}
                et à <strong>{winningOffer.organization.name}</strong>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
