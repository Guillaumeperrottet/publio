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
  }, [pathname]);

  return <>{children}</>;
}
