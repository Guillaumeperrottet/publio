"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configuration de NProgress
NProgress.configure({
  showSpinner: true, // Afficher le spinner pour feedback visuel clair
  trickleSpeed: 150,
  minimum: 0.08,
  easing: "ease",
  speed: 400,
});

/**
 * Provider pour afficher une loading bar en haut de page
 * lors des navigations dans l'application
 */
export function ProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Terminer la barre quand la route change
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercepter tous les clics sur les liens
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        // Démarrer la barre si c'est un lien interne différent de la page actuelle
        if (
          url.origin === window.location.origin &&
          url.pathname !== pathname
        ) {
          NProgress.start();
        }
      }
    };

    // Écouter les clics
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return <>{children}</>;
}
