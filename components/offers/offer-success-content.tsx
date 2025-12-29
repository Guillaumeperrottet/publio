"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Mail,
  FileText,
  ArrowRight,
  Download,
  Bell,
  Eye,
  Home,
} from "lucide-react";
import confetti from "canvas-confetti";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";

interface OfferSuccessContentProps {
  offer: {
    id: string;
    offerNumber: string | null;
    price: number;
    currency: string;
    submittedAt: Date | null;
    organization: {
      id: string;
      name: string;
    };
    tender: {
      id: string;
      title: string;
      deadline: Date;
      mode: string;
      organization: {
        name: string;
        email: string | null;
      };
    };
  };
}

export function OfferSuccessContent({ offer }: OfferSuccessContentProps) {
  const router = useRouter();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      // Confettis plus discrets
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 20, spread: 360, ticks: 40, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setHasAnimated(true);
          return clearInterval(interval);
        }

        const particleCount = 25 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FFD93D", "#6BCF7E", "#2D3A2E", "#F0EDE3"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#FFD93D", "#6BCF7E", "#2D3A2E", "#F0EDE3"],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [hasAnimated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: offer.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-CH", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-deep-green/5 to-white py-8">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header avec animation */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-deep-green rounded-full mb-4 shadow-lg animate-in zoom-in duration-500 delay-150">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <HandDrawnHighlight variant="yellow">
              Félicitations ! 🎉
            </HandDrawnHighlight>
          </h1>
          <p className="text-lg text-muted-foreground mb-1">
            Votre offre a été soumise avec succès
          </p>
          <p className="text-sm text-muted-foreground">
            Offre n°{" "}
            <span className="font-bold text-deep-green">
              {offer.offerNumber}
            </span>
          </p>
        </div>

        {/* Carte de résumé */}
        <Card className="mb-6 border-2 border-deep-green/20 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                  Projet
                </h3>
                <p className="text-base font-bold">{offer.tender.title}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                  Montant de votre offre
                </h3>
                <p className="text-xl font-bold text-deep-green">
                  {formatCurrency(offer.price)}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                  Soumise par
                </h3>
                <p className="text-base font-semibold">
                  {offer.organization.name}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                  Date de soumission
                </h3>
                <p className="text-base font-semibold">
                  {formatDate(offer.submittedAt || new Date())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Étapes suivantes */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <h2 className="text-xl font-bold mb-4 text-center">
            Que se passe-t-il maintenant ?
          </h2>

          <div className="space-y-3">
            <Card className="border-l-4 border-l-artisan-yellow hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-artisan-yellow/20 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-artisan-yellow" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      1. Confirmation par email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Un email de confirmation vient d&apos;être envoyé avec les
                      détails de votre offre. Le donneur d&apos;ordre{" "}
                      <span className="font-semibold">
                        {offer.tender.organization.name}
                      </span>{" "}
                      a également été notifié.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-deep-green hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-deep-green/20 rounded-full flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5 text-deep-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      2. Évaluation de votre offre
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {offer.tender.mode === "ANONYMOUS" ? (
                        <>
                          En mode <strong>anonyme</strong>, votre identité reste
                          masquée jusqu&apos;à la date limite (
                          {formatDate(offer.tender.deadline)}). Le donneur
                          d&apos;ordre évalue toutes les offres de manière
                          impartiale.
                        </>
                      ) : (
                        <>
                          Le donneur d&apos;ordre va examiner votre offre et la
                          comparer avec les autres soumissions. Vous pouvez être
                          contacté pour des clarifications.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      3. Notification de décision
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Vous recevrez une notification dès qu&apos;une décision
                      sera prise. La date limite pour ce projet est le{" "}
                      <span className="font-semibold">
                        {formatDate(offer.tender.deadline)}
                      </span>
                      .
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-xs text-blue-900">
                        💡 <strong>Conseil :</strong> Restez disponible pour
                        répondre rapidement si le donneur d&apos;ordre vous
                        contacte avec des questions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
          <Button
            onClick={() => window.open(`/api/offers/${offer.id}/pdf`, "_blank")}
            variant="outline"
            className="w-full h-auto py-3 flex flex-col items-center gap-1.5 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le PDF</span>
          </Button>

          <Button
            onClick={() => router.push(`/tenders/${offer.tender.id}`)}
            variant="outline"
            className="w-full h-auto py-3 flex flex-col items-center gap-1.5 text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Voir l&apos;appel d&apos;offre</span>
          </Button>

          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full h-auto py-3 flex flex-col items-center gap-1.5 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Retour au tableau de bord</span>
          </Button>
        </div>

        {/* CTA principal */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
          <Button
            onClick={() => router.push("/dashboard/offers")}
            size="lg"
            className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold px-6 py-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Voir toutes mes offres
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Contact support */}
        <div className="mt-8 text-center text-xs text-muted-foreground animate-in fade-in duration-1000 delay-1000">
          <p>
            Une question ? Contactez-nous à{" "}
            <a
              href="mailto:support@publio.ch"
              className="text-deep-green hover:underline font-semibold"
            >
              support@publio.ch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
