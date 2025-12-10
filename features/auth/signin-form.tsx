"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardDescription,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInForm({ redirectUrl }: { redirectUrl?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le token d'invitation depuis l'URL
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const invitationToken = searchParams.get("invitation");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Redirection vers l'invitation si présente, sinon vers redirectUrl ou dashboard
      if (invitationToken) {
        router.push(`/invitation/${invitationToken}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  }

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle className="text-center">
          <span className="font-handdrawn text-4xl">
            <HandDrawnHighlight variant="yellow">Connexion</HandDrawnHighlight>
          </span>
        </HandDrawnCardTitle>
        <HandDrawnCardDescription className="text-center">
          Connectez-vous à votre compte Publio
        </HandDrawnCardDescription>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border-2 border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-handdrawn text-lg">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.ch"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-handdrawn text-lg">
              Mot de passe
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link
            href={
              invitationToken
                ? `/auth/signup?invitation=${invitationToken}`
                : redirectUrl
                ? `/auth/signup?redirect=${encodeURIComponent(redirectUrl)}`
                : "/auth/signup"
            }
            className="text-artisan-yellow hover:underline font-medium"
          >
            Créer un compte
          </Link>
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
