"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Send, Bell, Plus, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MobileNavBarProps {
  isAuthenticated: boolean;
  unreadCount?: number;
}

/**
 * Bottom Navigation Bar pour mobile (style native app)
 * Affichée uniquement sur mobile (< md breakpoint)
 */
export function MobileNavBar({
  isAuthenticated,
  unreadCount = 0,
}: MobileNavBarProps) {
  const pathname = usePathname();

  // Déterminer si on doit afficher la navbar
  const shouldShowForAuth = isAuthenticated;
  const shouldShowForPublic =
    !isAuthenticated &&
    (pathname === "/" ||
      pathname === "/tenders" ||
      pathname?.startsWith("/tenders/"));

  const shouldShow = shouldShowForAuth || shouldShowForPublic;

  // Ajouter du padding au body quand la navbar est visible (uniquement mobile)
  useEffect(() => {
    const updatePadding = () => {
      if (shouldShow && window.innerWidth < 768) {
        document.documentElement.style.setProperty(
          "--mobile-nav-offset",
          "5rem"
        );
      } else {
        document.documentElement.style.setProperty(
          "--mobile-nav-offset",
          "0rem"
        );
      }
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    return () => {
      window.removeEventListener("resize", updatePadding);
      document.documentElement.style.setProperty("--mobile-nav-offset", "0rem");
    };
  }, [shouldShow, pathname]);

  // Ne pas afficher sur les pages d'auth, onboarding, et pages légales/statiques
  if (
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/legal") ||
    pathname?.startsWith("/invitation")
  ) {
    return null;
  }

  // Pour les non-authentifiés, afficher uniquement sur / et /tenders
  if (!shouldShow) {
    return null;
  }

  const navItems = isAuthenticated
    ? [
        {
          label: "Accueil",
          href: "/dashboard",
          icon: Home,
          active: pathname === "/dashboard",
        },
        {
          label: "Appels",
          href: "/tenders",
          icon: FileText,
          active: pathname?.startsWith("/tenders"),
        },
        {
          label: "Créer",
          href: "/dashboard/tenders/new",
          icon: Plus,
          active: pathname === "/dashboard/tenders/new",
          primary: true, // Bouton central mis en avant
        },
        {
          label: "Offres",
          href: "/dashboard/offers",
          icon: Send,
          active: pathname?.startsWith("/dashboard/offers"),
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          label: "Veille",
          href: "/dashboard/veille",
          icon: Bell,
          active: pathname?.startsWith("/dashboard/veille"),
        },
      ]
    : [
        {
          label: "Accueil",
          href: "/",
          icon: Home,
          active: pathname === "/",
        },
        {
          label: "Appels",
          href: "/tenders",
          icon: FileText,
          active: pathname?.startsWith("/tenders"),
        },
        {
          label: "Créer",
          href: "/auth/signup",
          icon: Plus,
          active: false,
          primary: true,
        },
        {
          label: "Connexion",
          href: "/auth/signin",
          icon: User,
          active: pathname?.startsWith("/auth"),
        },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-100 bg-white border-t-2 border-matte-black shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isPrimary = item.primary;

          if (isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center relative"
              >
                <div className="w-14 h-14 -mt-8 rounded-full bg-artisan-yellow border-3 border-matte-black shadow-lg flex items-center justify-center transition-transform active:scale-95">
                  <Icon
                    className="w-6 h-6 text-matte-black"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-[10px] font-medium text-matte-black mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                item.active
                  ? "text-artisan-yellow"
                  : "text-muted-foreground active:text-matte-black"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("w-5 h-5", item.active && "stroke-[2.5]")}
                />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 bg-artisan-yellow text-matte-black border border-matte-black font-bold text-[10px] flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium mt-1",
                  item.active && "font-bold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
