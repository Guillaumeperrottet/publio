import ProtectedLayout from "@/components/layout/protected-layout";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import {
  getOrganizationVeilleSubscription,
  canActivateVeille,
} from "@/features/veille/actions";
import { VeilleSettingsForm } from "@/components/veille/veille-settings-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { UpgradeVeilleDialog } from "@/components/veille/upgrade-veille-dialog";
import { Badge } from "@/components/ui/badge";

export default async function VeilleSettingsPage() {
  await getCurrentUser();

  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;
  const userRole = currentMembership.role;

  // Vérifier que l'utilisateur a les droits de modifier la veille
  if (!["OWNER", "ADMIN", "EDITOR"].includes(userRole)) {
    redirect("/dashboard/veille");
  }

  // Vérifier les capacités
  const { canActivate, currentPlan, maxCantons } = await canActivateVeille(
    organization.id
  );

  if (!canActivate) {
    return (
      <ProtectedLayout>
        <div className="p-6 md:p-8 bg-white min-h-full">
          <div className="mb-8">
            <Link href="/dashboard/veille">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-matte-black mb-2">
              Paramètres de veille
            </h1>
          </div>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">
              Veille non disponible
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              La veille communale nécessite un abonnement. Passez à un plan
              supérieur pour activer cette fonctionnalité.
            </p>
            <UpgradeVeilleDialog
              currentPlan={currentPlan}
              organizationId={organization.id}
            />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // Récupérer les paramètres actuels
  const veilleSubscription = await getOrganizationVeilleSubscription(
    organization.id
  );

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full">
        <div className="mb-8">
          <Link href="/dashboard/veille">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-matte-black mb-2">
                Paramètres de veille
              </h1>
              <p className="text-muted-foreground">
                Configurez vos alertes pour les publications communales
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {currentPlan === "VEILLE_BASIC" && "Veille Basic"}
                {currentPlan === "VEILLE_UNLIMITED" && "Veille Premium"}
                {currentPlan === "FREE" && "Gratuit"}
              </Badge>
              <Link href="/dashboard/billing">
                <Button variant="outline" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gérer l'abonnement
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <VeilleSettingsForm
          organizationId={organization.id}
          maxCantons={maxCantons}
          initialData={
            veilleSubscription
              ? {
                  cantons: veilleSubscription.cantons as Array<
                    "VD" | "GE" | "VS" | "FR" | "NE" | "JU" | "BE" | "TI" | "GR"
                  >,
                  emailNotifications: veilleSubscription.emailNotifications,
                  appNotifications: veilleSubscription.appNotifications,
                  alertFrequency: veilleSubscription.alertFrequency,
                  alertTypes: veilleSubscription.alertTypes,
                  alertKeywords: veilleSubscription.alertKeywords,
                  alertCommunes: veilleSubscription.alertCommunes,
                }
              : undefined
          }
        />
      </div>
    </ProtectedLayout>
  );
}
