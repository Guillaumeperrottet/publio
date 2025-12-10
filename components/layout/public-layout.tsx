import { UniversalHeader } from "./universal-header";
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

      {/* Contenu */}
      <main>{children}</main>

      {/* Footer professionnel */}
      <PublioFooter />
    </div>
  );
}
