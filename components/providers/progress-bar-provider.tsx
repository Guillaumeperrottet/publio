"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configuration de NProgress
NProgress.configure({
  showSpinner: false, // Pas de spinner, juste la barre
  trickleSpeed: 200,
  minimum: 0.08,
  easing: "ease",
  speed: 500,
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
    // Démarrer la barre au changement de route
    NProgress.start();

    // Terminer la barre quand la route est chargée
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return <>{children}</>;
}
