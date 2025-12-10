import { getCurrentUser } from "@/lib/auth/session";
import { getUserProfile } from "@/features/users/actions";
import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
  HandDrawnCardDescription,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { HandDrawnStar } from "@/components/ui/hand-drawn-elements";
import ProfileForm from "@/features/users/profile-form";

export default async function ProfilePage() {
  await getCurrentUser();
  const profile = await getUserProfile();

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-4xl mx-auto relative">
        {/* Élément décoratif */}
        <div className="absolute top-4 right-8 opacity-20">
          <HandDrawnStar className="w-16 h-16 text-deep-green" />
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">
            <span className="font-handdrawn text-6xl">
              <HandDrawnHighlight variant="green">
                Mon profil
              </HandDrawnHighlight>
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="space-y-6">
          {/* Informations du profil */}
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="font-handdrawn text-3xl">
                Informations personnelles
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                Modifiez votre nom et votre photo de profil
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <ProfileForm profile={profile} />
            </HandDrawnCardContent>
          </HandDrawnCard>

          {/* Sécurité */}
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="font-handdrawn text-3xl">
                Sécurité
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                Gérez votre mot de passe et la sécurité de votre compte
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.emailVerified
                      ? "✓ Email vérifié"
                      : "⚠ Email non vérifié"}
                  </p>
                </div>

                {/* TODO: Ajouter formulaire changement de mot de passe */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    La modification du mot de passe sera disponible
                    prochainement.
                  </p>
                </div>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>

          {/* Informations du compte */}
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle>Informations du compte</HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compte créé le</span>
                  <span className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString("fr-CH")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID utilisateur</span>
                  <span className="font-mono text-xs">{profile.id}</span>
                </div>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    </ProtectedLayout>
  );
}
