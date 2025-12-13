import { UniversalHeader } from "./universal-header";
import { MobileNavBar } from "./mobile-nav-bar";
import { PublioFooter } from "./footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout pour les pages publiques
 * Utilise le header universel qui s'adapte automatiquement
 */
export default async function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header universel */}
      <UniversalHeader />

      {/* Contenu - padding conditionnel (si navbar visible) */}
      <main>{children}</main>

      {/* Footer professionnel */}
      <PublioFooter />

      {/* Bottom Navigation Mobile */}
      <MobileNavBar isAuthenticated={false} />
    </div>
  );
}
