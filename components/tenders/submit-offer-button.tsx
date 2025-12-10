"use client";

import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function SubmitOfferButton({
  tenderId,
  isAuthenticated,
  hasSubmitted = false,
  offerId,
}: {
  tenderId: string;
  isAuthenticated: boolean;
  hasSubmitted?: boolean;
  offerId?: string;
}) {
  // Si l'utilisateur a déjà soumis, afficher un état "Offre soumise"
  if (hasSubmitted) {
    return (
      <div className="w-full px-6 py-4 bg-deep-green/10 border-2 border-deep-green rounded-lg flex items-center justify-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-deep-green" />
        <span className="font-bold text-deep-green">Offre déjà soumise</span>
      </div>
    );
  }

  const href = isAuthenticated
    ? `/tenders/${tenderId}/submit`
    : `/auth/signup?redirect=/tenders/${tenderId}/submit`;

  return (
    <Link href={href} className="block w-full">
      <Button
        size="lg"
        className="w-full text-lg px-8 py-6 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold shadow-lg border-2 border-matte-black transition-all hover:shadow-xl hover:scale-[1.02]"
      >
        <Send className="w-5 h-5 mr-2" />
        Soumettre une offre
      </Button>
    </Link>
  );
}
