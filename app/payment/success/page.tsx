import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Home, Megaphone } from "lucide-react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  // Récupérer les détails de la session Stripe pour déterminer le type
  let paymentType: "tender" | "offer" = "offer";
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentType =
        session.metadata?.type === "tender_publication" ? "tender" : "offer";
    } catch (error) {
      console.error("Error retrieving session:", error);
    }
  }

  const isTender = paymentType === "tender";

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <HandDrawnCard>
          <HandDrawnCardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <HandDrawnHighlight variant="yellow">
                Paiement confirmé !
              </HandDrawnHighlight>
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              {isTender ? (
                <>
                  Votre appel d&apos;offres a été publié avec succès. Les
                  prestataires peuvent maintenant consulter votre annonce et
                  soumettre leurs offres.
                </>
              ) : (
                <>
                  Votre offre a été soumise avec succès. L&apos;émetteur de
                  l&apos;appel d&apos;offres va maintenant examiner votre
                  proposition.
                </>
              )}
            </p>

            <div className="bg-sand-light p-6 rounded-lg mb-8 text-left">
              <h3 className="font-semibold mb-3">Prochaines étapes :</h3>
              {isTender ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-artisan-yellow">•</span>
                    <span>
                      Vous recevrez un email de confirmation avec le lien vers
                      votre appel d&apos;offres
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-artisan-yellow">•</span>
                    <span>
                      Votre annonce est maintenant visible par les prestataires
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-artisan-yellow">•</span>
                    <span>
                      Vous serez notifié lorsque vous recevrez des offres
                    </span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-artisan-yellow">•</span>
                    <span>
                      Vous recevrez un email de confirmation avec les détails de
                      votre soumission
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-artisan-yellow">•</span>
                    <span>
                      Votre offre est maintenant visible par l&apos;émetteur
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-artisan-yellow">•</span>
                    <span>
                      Vous serez notifié de toute mise à jour concernant cet
                      appel d&apos;offres
                    </span>
                  </li>
                </ul>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isTender ? (
                <>
                  <Link href="/dashboard/tenders">
                    <Button size="lg">
                      <Megaphone className="w-5 h-5 mr-2" />
                      Mes appels d&apos;offres
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline">
                      <Home className="w-5 h-5 mr-2" />
                      Retour au dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/offers">
                    <Button size="lg">
                      <FileText className="w-5 h-5 mr-2" />
                      Voir mes offres
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline">
                      <Home className="w-5 h-5 mr-2" />
                      Retour au dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {sessionId && (
              <p className="text-xs text-muted-foreground mt-6">
                ID de session : {sessionId}
              </p>
            )}
          </HandDrawnCardContent>
        </HandDrawnCard>
      </div>
    </ProtectedLayout>
  );
}
