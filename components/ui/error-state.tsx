import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHome?: boolean;
}

/**
 * Composant pour afficher un état d'erreur élégant
 * Utilisé pour les erreurs de chargement, 404, 500, etc.
 */
export function ErrorState({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Veuillez réessayer.",
  showRetry = true,
  onRetry,
  showHome = false,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>

      <h3 className="text-xl font-semibold text-matte-black mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>

      <div className="flex gap-3">
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        )}
        {showHome && (
          <Link href="/">
            <Button variant="default">
              <Home className="w-4 h-4 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Variante pour les erreurs de permission
 */
export function PermissionErrorState() {
  return (
    <ErrorState
      title="Accès refusé"
      message="Vous n'avez pas les permissions nécessaires pour accéder à cette page."
      showRetry={false}
      showHome={true}
    />
  );
}

/**
 * Variante pour les pages non trouvées
 */
export function NotFoundErrorState() {
  return (
    <ErrorState
      title="Page non trouvée"
      message="La page que vous recherchez n'existe pas ou a été déplacée."
      showRetry={false}
      showHome={true}
    />
  );
}
