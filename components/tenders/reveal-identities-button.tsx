"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, Loader2 } from "lucide-react";
import { revealOfferIdentities } from "@/features/offers/actions";
import { useRouter } from "next/navigation";

export function RevealIdentitiesButton({ tenderId }: { tenderId: string }) {
  const router = useRouter();
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir révéler les identités ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setIsRevealing(true);
    try {
      const result = await revealOfferIdentities(tenderId);

      if (result.error) {
        alert(result.error);
        return;
      }

      // Rafraîchir la page pour voir les identités révélées
      router.refresh();
    } catch (error) {
      console.error("Error revealing identities:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <Button
      onClick={handleReveal}
      disabled={isRevealing}
      variant="outline"
      size="sm"
    >
      {isRevealing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Révélation...
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4 mr-2" />
          Révéler les identités
        </>
      )}
    </Button>
  );
}
