"use client";

import { useEffect } from "react";
import { markOfferAsViewed } from "@/features/offers/actions";

/**
 * Composant qui marque automatiquement les offres comme vues
 * Utilisé dans la page de détail d'un tender
 */
export function MarkOffersViewed({ offerIds }: { offerIds: string[] }) {
  useEffect(() => {
    // Marquer toutes les offres comme vues après un court délai
    const timer = setTimeout(async () => {
      try {
        await Promise.all(
          offerIds.map((offerId) => markOfferAsViewed(offerId))
        );
      } catch (error) {
        console.error("Error marking offers as viewed:", error);
      }
    }, 1000); // Délai de 1 seconde pour s'assurer que l'utilisateur consulte vraiment

    return () => clearTimeout(timer);
  }, [offerIds]);

  return null; // Ce composant ne rend rien
}
