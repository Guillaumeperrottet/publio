import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
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
import OrganizationSettingsForm from "@/features/organizations/organization-settings-form";

export default async function OrganizationSettingsPage() {
  await getCurrentUser();
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  // Prendre la première organisation (on ajoutera le sélecteur plus tard)
  const currentMembership = memberships[0];
  const organization = currentMembership.organization;
  const userRole = currentMembership.role;

  // Vérifier que l'utilisateur a les droits de modification
  const canEdit = ["OWNER", "ADMIN"].includes(userRole);

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-4xl mx-auto relative">
        {/* Élément décoratif */}
        <div className="absolute top-4 right-8 opacity-20">
          <HandDrawnStar className="w-16 h-16 text-olive-soft" />
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">
            <span className="font-handdrawn text-6xl">
              <HandDrawnHighlight variant="olive">
                Paramètres
              </HandDrawnHighlight>
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez les informations de{" "}
            <span className="font-handdrawn text-xl text-deep-green">
              votre organisation
            </span>
          </p>
        </div>

        {!canEdit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ℹ️ Vous n&apos;avez pas les droits pour modifier ces paramètres.
              Contactez un administrateur.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Informations générales */}
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="font-handdrawn text-3xl">
                Informations générales
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                Nom, type et description de votre organisation
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <OrganizationSettingsForm
                organization={organization}
                canEdit={canEdit}
              />
            </HandDrawnCardContent>
          </HandDrawnCard>

          {/* Informations de contact */}
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle className="font-handdrawn text-3xl">
                Coordonnées
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                Adresse, téléphone et site web
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Adresse :</span>{" "}
                  {organization.address || "Non renseignée"}
                </div>
                <div>
                  <span className="font-medium">Ville :</span>{" "}
                  {organization.city || "Non renseignée"}
                </div>
                <div>
                  <span className="font-medium">Canton :</span>{" "}
                  {organization.canton || "Non renseigné"}
                </div>
                <div>
                  <span className="font-medium">Téléphone :</span>{" "}
                  {organization.phone || "Non renseigné"}
                </div>
                <div>
                  <span className="font-medium">Site web :</span>{" "}
                  {organization.website ? (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-artisan-yellow hover:underline"
                    >
                      {organization.website}
                    </a>
                  ) : (
                    "Non renseigné"
                  )}
                </div>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>

          {/* Informations administratives */}
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle>
                Informations administratives
              </HandDrawnCardTitle>
              <HandDrawnCardDescription>
                SIRET, TVA et autres informations légales
              </HandDrawnCardDescription>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">SIRET :</span>{" "}
                  {organization.siret || "Non renseigné"}
                </div>
                <div>
                  <span className="font-medium">N° TVA :</span>{" "}
                  {organization.taxId || "Non renseigné"}
                </div>
                <div>
                  <span className="font-medium">Pays :</span>{" "}
                  {organization.country}
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
                  <span className="text-muted-foreground">Créée le</span>
                  <span className="font-medium">
                    {new Date(organization.createdAt).toLocaleDateString(
                      "fr-CH"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Dernière modification
                  </span>
                  <span className="font-medium">
                    {new Date(organization.updatedAt).toLocaleDateString(
                      "fr-CH"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span
                    className={`font-medium ${
                      organization.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {organization.isActive ? "✓ Active" : "✗ Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{organization.id}</span>
                </div>
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    </ProtectedLayout>
  );
}
