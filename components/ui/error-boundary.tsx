"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary pour capturer les erreurs React
 * Affiche un message d'erreur élégant avec actions de récupération
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur (peut être envoyé à Sentry, LogSnag, etc.)
    console.error("Error Boundary caught:", error, errorInfo);

    // Callback optionnel pour logging externe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Afficher le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Afficher l'UI d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-sand-light">
          <HandDrawnCard className="max-w-lg w-full">
            <HandDrawnCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <HandDrawnCardTitle className="text-2xl">
                  Oups, une erreur est survenue
                </HandDrawnCardTitle>
              </div>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Une erreur inattendue s&apos;est produite. Ne vous inquiétez
                  pas, vos données sont en sécurité.
                </p>

                {/* Afficher le message d'erreur en dev */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-mono text-red-800 break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={this.handleReset}
                    variant="default"
                    className="gap-2 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </Button>

                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recharger la page
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Retour accueil
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                  Si le problème persiste, contactez le support à{" "}
                  <a
                    href="mailto:support@publio.ch"
                    className="text-artisan-yellow hover:underline"
                  >
                    support@publio.ch
                  </a>
                </p>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based alternative pour usage simple
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
