"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { shortlistOffer } from "@/features/offers/actions";

interface ShortlistOfferButtonProps {
  offerId: string;
  organizationName: string;
}

export function ShortlistOfferButton({ offerId }: ShortlistOfferButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShortlist = async () => {
    setIsLoading(true);
    try {
      const result = await shortlistOffer(offerId);

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      console.log("Offre pré-sélectionnée avec succès:", result);

      // Jouer un son de notification agréable (do-mi-sol)
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioContext = new AudioContextClass();
        const playNote = (frequency: number, startTime: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = frequency;
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(0.3, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

          oscillator.start(startTime);
          oscillator.stop(startTime + 0.15);
        };

        const now = audioContext.currentTime;
        playNote(523.25, now); // Do
        playNote(659.25, now + 0.1); // Mi
        playNote(783.99, now + 0.2); // Sol
      } catch {
        // Ignorer les erreurs audio
      }

      // Attendre un peu avant de recharger pour laisser le temps à la DB de se mettre à jour
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Forcer le rechargement de la page avec cache bypass
      window.location.href = window.location.href;
    } catch (error) {
      console.error("Error shortlisting offer:", error);
      toast.error("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleShortlist}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="hover:bg-artisan-yellow/10 hover:border-artisan-yellow"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Marquage...
        </>
      ) : (
        <>
          <Star className="w-4 h-4 mr-2" />À étudier
        </>
      )}
    </Button>
  );
}
