"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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

  useEffect(() => {
    // Terminer la barre quand la route change
    NProgress.done();
  }, [pathname]);

  useEffect(() => {
    // Intercepter tous les clics sur les liens
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        const currentUrl = window.location.pathname + window.location.search;
        const targetUrl = url.pathname + url.search;

        // Démarrer la barre si c'est un lien interne différent de la page actuelle
        if (url.origin === window.location.origin && targetUrl !== currentUrl) {
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
