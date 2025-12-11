import ProtectedLayout from "@/components/layout/protected-layout";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";
import {
  getOrganizationSubscription,
  getOrganizationInvoices,
  getOrganizationPaymentStats,
  getOrganizationUsageStats,
} from "@/features/billing/actions";
import { CurrentSubscriptionCard } from "@/components/billing/current-subscription-card";
import { InvoiceHistory } from "@/components/billing/invoice-history";
import { UsageStatsCard } from "@/components/billing/usage-stats-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ConfettiBurst } from "@/components/ui/confetti";
import { SuccessHandler } from "@/components/billing/success-handler";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  await getCurrentUser();

  const params = await searchParams;
  const showSuccess = params.success === "true";

  // Vérifier que l'utilisateur a une organisation
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  // Vérifier les permissions (seuls OWNER et ADMIN peuvent voir la facturation)
  if (!["OWNER", "ADMIN"].includes(currentMembership.role)) {
    redirect("/dashboard");
  }

  // Récupérer les données en parallèle
  const [subscription, invoices, paymentStats, usageStats] = await Promise.all([
    getOrganizationSubscription(organization.id),
    getOrganizationInvoices(organization.id),
    getOrganizationPaymentStats(organization.id),
    getOrganizationUsageStats(organization.id),
  ]);

  return (
    <ProtectedLayout>
      {showSuccess && (
        <>
          <ConfettiBurst />
          <SuccessHandler />
        </>
      )}
      <div className="p-4 md:p-6 bg-white min-h-full">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <HandDrawnHighlight variant="yellow">
              Facturation & Abonnements
            </HandDrawnHighlight>
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez votre abonnement et consultez vos factures
          </p>
        </div>

        <div className="space-y-4">
          {/* Abonnement actuel */}
          {subscription && (
            <CurrentSubscriptionCard
              plan={subscription.plan}
              status={subscription.status}
              currentPeriodEnd={subscription.currentPeriodEnd}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
              organizationId={organization.id}
            />
          )}

          {/* Statistiques d'utilisation */}
          <UsageStatsCard
            tenderCount={usageStats.tenderCount}
            offerCount={usageStats.offerCount}
            totalSpent={paymentStats.totalSpent}
          />

          {/* Historique des factures */}
          <InvoiceHistory invoices={invoices} />
        </div>

        {/* Note de bas de page */}
        <div className="mt-6 p-3 bg-sand-light/30 rounded-lg border border-sand-light">
          <p className="text-xs text-muted-foreground text-center">
            💡 <strong>Besoin d&apos;aide ?</strong> Contactez-nous à{" "}
            <a
              href="mailto:support@publio.ch"
              className="text-artisan-yellow hover:underline"
            >
              support@publio.ch
            </a>{" "}
            pour toute question concernant votre facturation.
          </p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
