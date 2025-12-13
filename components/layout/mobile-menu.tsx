"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  FileText,
  LayoutDashboard,
  Send,
  Bookmark,
  Bell,
  Plus,
  Search,
  Settings,
  Users,
  CreditCard,
  LogOut,
  User,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileMenuProps {
  isAuthenticated: boolean;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  organization?: {
    name: string;
    logo?: string;
  } | null;
  unreadCount?: number;
  userRole?: "OWNER" | "ADMIN" | "EDITOR" | "MEMBER" | null;
}

/**
 * Menu hamburger mobile (drawer gauche)
 * Contient toute la navigation + actions utilisateur
 */
export function MobileMenu({
  isAuthenticated,
  user,
  organization,
  unreadCount = 0,
  userRole,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;
  const isActivePath = (path: string) => pathname?.startsWith(path);

  const canManageOrganization = userRole === "OWNER" || userRole === "ADMIN";

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto pb-20">
        <SheetHeader className="p-6 pb-4 text-left border-b">
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Avatar className="h-12 w-12 border-2 border-matte-black">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-artisan-yellow text-matte-black font-bold">
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-base truncate">
                    {user.name}
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    {organization?.name || user.email}
                  </p>
                </div>
              </>
            ) : (
              <SheetTitle>Menu</SheetTitle>
            )}
          </div>
        </SheetHeader>

        <div className="py-4">
          {isAuthenticated ? (
            <>
              {/* Dashboard */}
              <div className="px-3 mb-4">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive("/dashboard")
                      ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                      : "hover:bg-sand-light/50"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Tableau de bord</span>
                </Link>
              </div>

              <Separator className="my-2" />

              {/* Section Appels d'offres */}
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Appels d&apos;offres
                </p>
                <div className="space-y-1">
                  <Link
                    href="/tenders"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive("/tenders")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    <span>Tous les appels</span>
                  </Link>
                  <Link
                    href="/dashboard/tenders"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActivePath("/dashboard/tenders")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <div className="flex items-center justify-between flex-1">
                      <span>Mes appels d&apos;offres</span>
                      {unreadCount > 0 && (
                        <Badge className="ml-2 h-5 min-w-5 px-1.5 bg-artisan-yellow text-matte-black border border-matte-black font-bold text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/saved-tenders"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive("/dashboard/saved-tenders")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                    <span>Sauvegardés</span>
                  </Link>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Section Offres & Alertes */}
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Mes activités
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/offers"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActivePath("/dashboard/offers")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>Mes offres</span>
                  </Link>
                  <Link
                    href="/dashboard/saved-searches"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive("/dashboard/saved-searches")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                    <span>Recherches</span>
                  </Link>
                  <Link
                    href="/dashboard/veille"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActivePath("/dashboard/veille")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span>Veille communale</span>
                  </Link>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Actions rapides */}
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Actions rapides
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/tenders/new"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-artisan-yellow/20 hover:bg-artisan-yellow/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-artisan-yellow flex items-center justify-center">
                      <Plus className="w-5 h-5 text-matte-black" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Créer un appel d&apos;offre
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Publier une annonce
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Section Organisation & Paramètres */}
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Paramètres
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive("/dashboard/profile")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Mon profil</span>
                  </Link>

                  {canManageOrganization && (
                    <>
                      <Link
                        href="/dashboard/organization/settings"
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActivePath("/dashboard/organization")
                            ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                            : "hover:bg-sand-light/50"
                        }`}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Organisation</span>
                      </Link>
                      <Link
                        href="/dashboard/organization/members"
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive("/dashboard/organization/members")
                            ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                            : "hover:bg-sand-light/50"
                        }`}
                      >
                        <Users className="w-5 h-5" />
                        <span>Collaborateurs</span>
                      </Link>
                      <Link
                        href="/dashboard/billing"
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive("/dashboard/billing")
                            ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                            : "hover:bg-sand-light/50"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Facturation</span>
                      </Link>
                    </>
                  )}

                  <Link
                    href="/dashboard/settings/notifications"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActivePath("/dashboard/settings")
                        ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                        : "hover:bg-sand-light/50"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </Link>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Déconnexion */}
              <div className="px-3">
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Menu non-authentifié */}
              <div className="px-3 space-y-1">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive("/")
                      ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                      : "hover:bg-sand-light/50"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Accueil</span>
                </Link>
                <Link
                  href="/tenders"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive("/tenders")
                      ? "bg-artisan-yellow/20 text-artisan-yellow font-semibold"
                      : "hover:bg-sand-light/50"
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span>Voir les appels d&apos;offres</span>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* CTAs */}
              <div className="px-6 space-y-3">
                <Link href="/auth/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black">
                    <Plus className="w-4 h-4" />
                    Créer une annonce
                  </Button>
                </Link>
                <Link href="/auth/signin" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Connexion
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
