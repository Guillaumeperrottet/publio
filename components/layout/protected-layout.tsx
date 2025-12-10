import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { OrganizationProvider } from "@/lib/contexts/organization-context";
import { UniversalHeader } from "./universal-header";

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

  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-white">
        {/* Header universel */}
        <UniversalHeader />

        {/* Contenu principal avec padding pour le header fixe */}
        <main className="pt-0">{children}</main>
      </div>
    </OrganizationProvider>
  );
}
