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

export default function SignUpForm({ redirectUrl }: { redirectUrl?: string }) {
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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        // Détecter si l'email existe déjà
        const errorMessage = result.error.message || "";
        if (
          errorMessage.includes("Unique constraint") ||
          errorMessage.includes("already exists") ||
          errorMessage.toLowerCase().includes("duplicate")
        ) {
          setError(
            "Un compte existe déjà avec cet email. Veuillez vous connecter à la place."
          );
        } else {
          setError(
            result.error.message || "Erreur lors de la création du compte"
          );
        }
        setIsLoading(false);
        return;
      }

      // Redirection vers l'invitation si présente, sinon vers l'onboarding ou redirectUrl
      if (invitationToken) {
        router.push(`/invitation/${invitationToken}`);
      } else if (redirectUrl) {
        router.push(`/onboarding?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push("/onboarding");
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
            <HandDrawnHighlight variant="green">
              Créer un compte
            </HandDrawnHighlight>
          </span>
        </HandDrawnCardTitle>
        <HandDrawnCardDescription className="text-center">
          Rejoignez Publio et simplifiez vos appels d&apos;offres
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
            <Label htmlFor="name" className="font-handdrawn text-lg">
              Nom complet
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jean Dupont"
              required
              disabled={isLoading}
            />
          </div>

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
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Au moins 8 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-handdrawn text-lg">
              Confirmer le mot de passe
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Déjà un compte ?{" "}
          <Link
            href={
              invitationToken
                ? `/auth/signin?invitation=${invitationToken}`
                : redirectUrl
                ? `/auth/signin?redirect=${encodeURIComponent(redirectUrl)}`
                : "/auth/signin"
            }
            className="text-artisan-yellow hover:underline font-medium"
          >
            Se connecter
          </Link>
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
