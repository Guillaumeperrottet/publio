import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getUnreadOffersCount } from "@/features/offers/actions";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { MobileMenu } from "./mobile-menu";
import {
  FileText,
  Plus,
  LayoutDashboard,
  Send,
  Bookmark,
  Bell,
  Zap,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Header universel adaptatif (style AutoScout24)
 * S'adapte automatiquement selon l'état d'authentification
 */
export async function UniversalHeader() {
  const session = await getSession();
  const isAuthenticated = !!session;

  let user: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
  let organization:
    | Awaited<ReturnType<typeof getUserOrganizations>>[0]["organization"]
    | null = null;
  let unreadCount = 0;
  let userRole: "OWNER" | "ADMIN" | "EDITOR" | "MEMBER" | null = null;

  if (isAuthenticated) {
    user = await getCurrentUser();
    const memberships = await getUserOrganizations();
    const currentMembership = memberships[0];
    organization = currentMembership?.organization;

    if (currentMembership && organization) {
      // Le rôle vient du membership, pas de l'organization
      // Convertir VIEWER en MEMBER pour compatibilité avec UserMenu
      const role = currentMembership?.role;
      userRole = role === "VIEWER" ? "MEMBER" : role || null;

      unreadCount = await getUnreadOffersCount(organization.id);
    }
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Menu hamburger mobile */}
          <MobileMenu
            isAuthenticated={isAuthenticated}
            user={
              user
                ? {
                    name: user.name || "Utilisateur",
                    email: user.email || "",
                    image: user.image || undefined,
                  }
                : undefined
            }
            organization={
              organization
                ? {
                    name: organization.name,
                    logo: organization.logo || undefined,
                  }
                : null
            }
            unreadCount={unreadCount}
            userRole={userRole}
          />

          {/* Logo + Navigation gauche */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Image
                src="/logo/logo_accueil.png"
                alt="Publio"
                width={120}
                height={48}
                className="h-6 w-auto transition-transform group-hover:scale-105"
                priority
              />
            </Link>

            {/* Navigation principale */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-matte-black hover:bg-sand-light/50 rounded-lg transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Tableau de bord
                  </Link>

                  {/* Dropdown Appels d'offres */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-matte-black hover:bg-sand-light/50 rounded-lg transition-all relative">
                      <FileText className="w-4 h-4" />
                      Appels d&apos;offres
                      {unreadCount > 0 && (
                        <Badge className="ml-1 h-5 min-w-5 px-1 bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/tenders"
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <Search className="w-4 h-4 text-deep-green" />
                          <div>
                            <p className="font-medium text-sm">
                              Tous les appels d&apos;offres
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Parcourir les projets
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/tenders"
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              Mes appels d&apos;offres
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Mes publications
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/saved-tenders"
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <Bookmark className="w-4 h-4 text-artisan-yellow" />
                          <div>
                            <p className="font-medium text-sm">
                              Appels d&apos;offres sauvegardés
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Mes sauvegardes
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link
                    href="/dashboard/offers"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-matte-black hover:bg-sand-light/50 rounded-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Mes offres
                  </Link>

                  <Link
                    href="/dashboard/saved-searches"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-matte-black hover:bg-sand-light/50 rounded-lg transition-all"
                  >
                    <Bookmark className="w-4 h-4" />
                    Recherches
                  </Link>

                  {/* Séparateur */}
                  <div className="h-6 w-px bg-gray-300 mx-2" />

                  <Link
                    href="/dashboard/veille"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-matte-black hover:bg-sand-light/50 rounded-lg transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    Veille
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Menu actions rapides */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-2 border-matte-black hover:bg-artisan-yellow/10"
                    >
                      <Zap className="w-4 h-4" />
                      Actions rapides
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/tenders/new"
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-artisan-yellow/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-artisan-yellow" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Créer un appel d&apos;offre
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Publier un nouvel appel
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/tenders"
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-deep-green/20 flex items-center justify-center">
                          <Send className="w-4 h-4 text-deep-green" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Déposer une offre
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Parcourir les appels
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/saved-searches"
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-olive-soft/20 flex items-center justify-center">
                          <Bookmark className="w-4 h-4 text-olive-soft" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Gérer mes alertes
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recherches sauvegardées
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bouton créer appel d'offre */}
                <Link href="/dashboard/tenders/new" className="hidden md:block">
                  <Button
                    size="sm"
                    className="gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une annonce
                  </Button>
                </Link>

                {/* Cloche de notifications */}
                <NotificationBell />

                {/* Menu utilisateur - masqué sur mobile car dans le drawer */}
                <div className="hidden md:block">
                  <UserMenu
                    user={{
                      name: user?.name || "Utilisateur",
                      email: user?.email || "",
                      image: user?.image || undefined,
                    }}
                    organization={organization}
                    userRole={userRole}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Bouton créer (principal pour non-connectés) */}
                <Link href="/auth/signup" className="hidden md:block">
                  <Button
                    size="sm"
                    className="gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une annonce
                  </Button>
                </Link>

                {/* Connexion (discret) */}
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Connexion
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
