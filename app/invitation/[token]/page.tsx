import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getInvitationByToken } from "@/features/organizations/actions";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
  HandDrawnCardDescription,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Button } from "@/components/ui/button";
import AcceptInvitationForm from "@/features/organizations/accept-invitation-form";

interface InvitationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;

  // Récupérer l'invitation d'abord (avant de vérifier l'auth)
  let invitation;
  let error = null;

  try {
    invitation = await getInvitationByToken(token);
  } catch (err) {
    error = err instanceof Error ? err.message : "Invitation invalide";
  }

  // Si l'invitation est invalide, afficher l'erreur
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="text-red-600">
                Invitation invalide
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                {error || "Cette invitation n'existe pas ou a expiré"}
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
          </HandDrawnCard>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    // Pas connecté, afficher la page d'invitation avec options de connexion/inscription
    user = null;
  }

  // Si erreur, afficher le message
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="text-red-600">
                Invitation invalide
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                {error || "Cette invitation n'existe pas ou a expiré."}
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Raisons possibles :
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>L&apos;invitation a expiré (7 jours)</li>
                  <li>L&apos;invitation a déjà été utilisée</li>
                  <li>L&apos;invitation a été annulée</li>
                  <li>Le lien est incorrect</li>
                </ul>
                <div className="pt-4">
                  <a
                    href="/dashboard"
                    className="text-artisan-yellow hover:underline"
                  >
                    ← Retour au tableau de bord
                  </a>
                </div>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher la page publique d'invitation
  if (!user) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <HandDrawnHighlight variant="yellow">
                Vous êtes invité !
              </HandDrawnHighlight>
            </h1>
          </div>

          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle>
                {invitation.organization.name}
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                {invitation.inviter.name || invitation.inviter.email} vous
                invite à rejoindre cette organisation
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-6">
                {/* Informations de l'organisation */}
                <div className="p-4 bg-sand-light rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <HandDrawnBadge variant="default">
                      {invitation.organization.type === "COMMUNE"
                        ? "Commune"
                        : invitation.organization.type === "ENTREPRISE"
                        ? "Entreprise"
                        : "Privé"}
                    </HandDrawnBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Votre rôle
                    </span>
                    <HandDrawnBadge variant="warning">
                      {invitation.role}
                    </HandDrawnBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Email invité
                    </span>
                    <span className="text-sm font-medium">
                      {invitation.email}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Pour accepter cette invitation, vous devez :
                  </p>
                  <a
                    href={`/auth/signup?invitation=${token}`}
                    className="block w-full"
                  >
                    <Button className="w-full bg-artisan-yellow hover:bg-artisan-yellow/90 text-white">
                      Créer un compte
                    </Button>
                  </a>
                  <a
                    href={`/auth/signin?invitation=${token}`}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      J&apos;ai déjà un compte
                    </Button>
                  </a>
                </div>

                {/* Expiration */}
                <p className="text-xs text-center text-muted-foreground">
                  Cette invitation expire le{" "}
                  {new Date(invitation.expiresAt).toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    );
  }

  // Vérifier que l'email correspond
  if (user.email !== invitation.email) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="text-red-600">
                Email incompatible
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                Cette invitation a été envoyée à{" "}
                <strong>{invitation.email}</strong>
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Vous êtes actuellement connecté avec{" "}
                <strong>{user.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez vous déconnecter et vous connecter avec l&apos;adresse
                email correcte pour accepter cette invitation.
              </p>
              <div className="pt-4">
                <a
                  href="/auth/signout"
                  className="text-artisan-yellow hover:underline"
                >
                  Se déconnecter
                </a>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-light flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <HandDrawnHighlight variant="yellow">
              Invitation à rejoindre une organisation
            </HandDrawnHighlight>
          </h1>
        </div>

        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle>
              {invitation.organization.name}
            </HandDrawnCardTitle>
            <HandDrawnCardDescription>
              {invitation.inviter.name || invitation.inviter.email} vous invite
              à rejoindre cette organisation
            </HandDrawnCardDescription>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <div className="space-y-6">
              {/* Informations de l'organisation */}
              <div className="p-4 bg-sand-light rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <HandDrawnBadge variant="default">
                    {invitation.organization.type === "COMMUNE"
                      ? "Commune"
                      : invitation.organization.type === "ENTREPRISE"
                      ? "Entreprise"
                      : "Privé"}
                  </HandDrawnBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Votre rôle
                  </span>
                  <HandDrawnBadge variant="success">
                    {invitation.role}
                  </HandDrawnBadge>
                </div>
                {invitation.organization.description && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {invitation.organization.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Description du rôle */}
              <div className="text-sm">
                <p className="font-semibold mb-2">
                  Avec le rôle <strong>{invitation.role}</strong>, vous pourrez
                  :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {invitation.role === "OWNER" && (
                    <>
                      <li>Gérer tous les aspects de l&apos;organisation</li>
                      <li>Inviter et gérer les membres</li>
                      <li>Accéder à la facturation</li>
                    </>
                  )}
                  {invitation.role === "ADMIN" && (
                    <>
                      <li>Inviter et gérer les membres</li>
                      <li>Créer et gérer les appels d&apos;offres</li>
                      <li>Déposer des offres</li>
                    </>
                  )}
                  {invitation.role === "EDITOR" && (
                    <>
                      <li>Créer et modifier les appels d&apos;offres</li>
                      <li>Déposer des offres</li>
                      <li>Consulter les contenus</li>
                    </>
                  )}
                  {invitation.role === "VIEWER" && (
                    <>
                      <li>Consulter les appels d&apos;offres</li>
                      <li>Consulter les offres</li>
                      <li>Accès en lecture seule</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Formulaire d'acceptation */}
              <div className="pt-4 border-t">
                <AcceptInvitationForm token={token} />
              </div>

              {/* Expiration */}
              <p className="text-xs text-center text-muted-foreground">
                Cette invitation expire le{" "}
                {new Date(invitation.expiresAt).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>
      </div>
    </div>
  );
}
