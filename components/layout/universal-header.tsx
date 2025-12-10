import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getUnreadOffersCount } from "@/features/offers/actions";
import { UserMenu } from "./user-menu";
import {
  FileText,
  Plus,
  LayoutDashboard,
  Send,
  Bookmark,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Header universel adaptatif (style AutoScout24)
 * S'adapte automatiquement selon l'état d'authentification
 */
export async function UniversalHeader() {
  const session = await getSession();
  const isAuthenticated = !!session;

  let user = null;
  let organization = null;
  let unreadCount = 0;

  if (isAuthenticated) {
    user = await getCurrentUser();
    const memberships = await getUserOrganizations();
    organization = memberships[0]?.organization;

    if (organization) {
      unreadCount = await getUnreadOffersCount(organization.id);
    }
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Navigation gauche */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo/logo_nobackground.png"
                alt="Publio"
                width={140}
                height={56}
                className="h-32 w-auto transition-transform group-hover:scale-105"
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

                  <Link
                    href="/dashboard/tenders"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-matte-black hover:bg-sand-light/50 rounded-lg transition-all relative"
                  >
                    <FileText className="w-4 h-4" />
                    Mes appels d&apos;offres
                    {unreadCount > 0 && (
                      <Badge className="ml-1 h-5 min-w-5 px-1 bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>

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

                {/* Menu utilisateur */}
                <UserMenu
                  user={{
                    name: user?.name || "Utilisateur",
                    email: user?.email || "",
                    image: user?.image || undefined,
                  }}
                  organization={organization}
                />
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
