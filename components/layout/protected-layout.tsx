import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { OrganizationProvider } from "@/lib/contexts/organization-context";
import { UniversalHeader } from "./universal-header";
import { MobileNavBar } from "./mobile-nav-bar";
import { PusherProvider } from "@/components/providers/pusher-provider";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getUserNotifications } from "@/features/notifications/actions";
import { getUnreadOffersCount } from "@/features/offers/actions";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout pour les pages protégées
 * Header universel + vérification authentification
 */
export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await getSession();

  // Redirection côté serveur si non authentifié
  if (!session) {
    redirect("/auth/signin");
  }

  // Récupérer l'organisation courante
  const memberships = await getUserOrganizations();
  if (memberships.length === 0) {
    redirect("/onboarding");
  }
  const currentOrganization = memberships[0].organization;

  // Récupérer les notifications initiales
  const notifications = await getUserNotifications();

  // Récupérer le compte d'offres non lues
  const unreadCount = await getUnreadOffersCount(currentOrganization.id);

  return (
    <OrganizationProvider>
      <PusherProvider
        userId={session.user.id}
        organizationId={currentOrganization.id}
        initialNotifications={notifications}
      >
        <div className="min-h-screen bg-white">
          {/* Header universel */}
          <UniversalHeader />

          {/* Contenu principal avec padding pour bottom nav mobile */}
          <main className="pb-20 md:pb-0">{children}</main>

          {/* Bottom Navigation Mobile */}
          <MobileNavBar isAuthenticated={true} unreadCount={unreadCount} />
        </div>
      </PusherProvider>
    </OrganizationProvider>
  );
}
