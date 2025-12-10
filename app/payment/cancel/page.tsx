import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default async function PaymentCancelPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <HandDrawnCard>
          <HandDrawnCardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <HandDrawnHighlight variant="yellow">
                Paiement annulé
              </HandDrawnHighlight>
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Votre paiement a été annulé et votre offre n&apos;a pas été
              soumise. Vous pouvez réessayer à tout moment.
            </p>

            <div className="bg-sand-light p-6 rounded-lg mb-8 text-left">
              <h3 className="font-semibold mb-3">Que s&apos;est-il passé ?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-artisan-yellow">•</span>
                  <span>Vous avez annulé le processus de paiement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-artisan-yellow">•</span>
                  <span>Aucun montant n&apos;a été débité de votre compte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-artisan-yellow">•</span>
                  <span>
                    Votre offre a été sauvegardée en brouillon et peut être
                    supprimée automatiquement
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tenders">
                <Button size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voir les appels d&apos;offres
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  <Home className="w-5 h-5 mr-2" />
                  Retour au dashboard
                </Button>
              </Link>
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>
      </div>
    </ProtectedLayout>
  );
}
