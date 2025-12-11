"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Gère l'affichage des confettis et nettoie l'URL après succès
 */
export function SuccessHandler() {
  const router = useRouter();

  useEffect(() => {
    // Nettoyer l'URL après 2 secondes (temps pour voir les confettis)
    const timer = setTimeout(() => {
      router.replace("/dashboard/billing");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
