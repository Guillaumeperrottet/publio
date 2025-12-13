import ProtectedLayout from "@/components/layout/protected-layout";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import {
  getOrganizationVeilleSubscription,
  getOrganizationVeillePublications,
  canActivateVeille,
} from "@/features/veille/actions";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Bell, BellOff, Info } from "lucide-react";
import Link from "next/link";
import { UpgradeVeilleDialog } from "@/components/veille/upgrade-veille-dialog";
import { PublicationsListClient } from "@/components/veille/publications-list-client";

export default async function VeillePage() {
  await getCurrentUser();

  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;
  const userRole = currentMembership.role;

  // Vérifier si l'utilisateur peut modifier la veille
  const canManageVeille = ["OWNER", "ADMIN", "EDITOR"].includes(userRole);

  // Vérifier si l'organisation peut activer la veille
  const { canActivate, currentPlan, maxCantons } = await canActivateVeille(
    organization.id
  );

  // Récupérer l'abonnement veille (si existant)
  const veilleSubscription = await getOrganizationVeilleSubscription(
    organization.id
  );

  // Récupérer les publications (si abonnement actif)
  const publications = veilleSubscription
    ? await getOrganizationVeillePublications(organization.id)
    : [];

  const hasActiveSubscription =
    !!veilleSubscription && veilleSubscription.cantons.length > 0;

  // Compter les nouvelles publications (dernières 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newPublicationsCount = publications.filter(
    (p: { publishedAt: Date }) => new Date(p.publishedAt) >= yesterday
  ).length;

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-matte-black mb-2">
              🔔 Veille Communale
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez vos alertes et suivez les nouvelles publications
            </p>
          </div>

          {hasActiveSubscription && canManageVeille && (
            <Link href="/dashboard/veille/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </Link>
          )}
        </div>

        {/* Infos abonnement compactes */}
        {hasActiveSubscription && (
          <div className="mb-6 p-4 border rounded-lg bg-sand-light/30 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="bg-artisan-yellow text-matte-black"
                >
                  {currentPlan === "VEILLE_BASIC" && "Veille Basic"}
                  {currentPlan === "VEILLE_UNLIMITED" && "Veille Premium"}
                </Badge>
                {veilleSubscription.emailNotifications && (
                  <Badge variant="outline" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    Alertes actives
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {veilleSubscription.cantons.map((canton: string) => (
                  <Badge key={canton} variant="secondary" className="text-xs">
                    {canton}
                  </Badge>
                ))}
              </div>
            </div>

            <Link href="/dashboard/veille/sources">
              <Button variant="ghost" size="sm" className="shrink-0">
                <Info className="w-4 h-4 mr-2" />
                Sources
              </Button>
            </Link>
          </div>
        )}

        {/* Plan actuel pour utilisateurs sans abonnement */}
        {!hasActiveSubscription && (
          <HandDrawnCard className="mb-6">
            <HandDrawnCardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {currentPlan === "FREE" ? "Gratuit" : currentPlan}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {maxCantons === 0
                      ? "Veille non disponible sur le plan gratuit"
                      : `Jusqu'à ${maxCantons} canton${
                          maxCantons > 1 ? "s" : ""
                        }`}
                  </p>
                </div>

                {!canActivate ? (
                  <UpgradeVeilleDialog organizationId={organization.id} />
                ) : canManageVeille ? (
                  <Link href="/dashboard/veille/settings">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Configurer
                    </Button>
                  </Link>
                ) : null}
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        )}

        {/* Publications */}
        {hasActiveSubscription && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Publications
              {newPublicationsCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 bg-artisan-yellow text-matte-black"
                >
                  {newPublicationsCount} nouvelle
                  {newPublicationsCount > 1 ? "s" : ""}
                </Badge>
              )}
            </h2>

            {publications.length === 0 ? (
              <HandDrawnCard>
                <HandDrawnCardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Aucune publication trouvée pour vos communes.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Les nouvelles publications apparaîtront ici automatiquement.
                  </p>
                </HandDrawnCardContent>
              </HandDrawnCard>
            ) : (
              <PublicationsListClient
                cantons={veilleSubscription.cantons}
                publications={publications.map((pub) => ({
                  ...pub,
                  metadata: pub.metadata as any,
                }))}
              />
            )}
          </div>
        )}

        {/* Empty state si pas d'abonnement */}
        {!hasActiveSubscription && canActivate && (
          <HandDrawnCard>
            <HandDrawnCardContent className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">
                Activez votre veille communale
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sélectionnez les communes qui vous intéressent et recevez des
                alertes automatiques dès qu&apos;une nouvelle mise à
                l&apos;enquête est publiée.
              </p>
              {canManageVeille && (
                <Link href="/dashboard/veille/settings">
                  <Button
                    variant="default"
                    className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Commencer
                  </Button>
                </Link>
              )}
            </HandDrawnCardContent>
          </HandDrawnCard>
        )}
      </div>
    </ProtectedLayout>
  );
}
