"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EyeOff, Loader2 } from "lucide-react";
import { revealTenderIdentity } from "@/features/tenders/actions";
import { useRouter } from "next/navigation";

export function RevealIdentitiesButton({ tenderId }: { tenderId: string }) {
  const router = useRouter();
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir révéler votre identité ? Cette action est irréversible et tous les soumissionnaires verront qui vous êtes."
      )
    ) {
      return;
    }

    setIsRevealing(true);
    try {
      const result = await revealTenderIdentity(tenderId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Identité révélée avec succès");
      // Rafraîchir la page pour voir l'identité révélée
      router.refresh();
    } catch (error) {
      console.error("Error revealing identity:", error);
      toast.error("Une erreur est survenue");
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
      className="bg-artisan-yellow/10 hover:bg-artisan-yellow/20 border-artisan-yellow"
    >
      {isRevealing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Révélation...
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4 mr-2" />
          Révéler mon identité
        </>
      )}
    </Button>
  );
}
