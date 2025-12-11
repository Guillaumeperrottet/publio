import ProtectedLayout from "@/components/layout/protected-layout";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getOrganizationTenders } from "@/features/tenders/actions";
import {
  getOrganizationOffers,
  getTendersWithUnreadOffers,
} from "@/features/offers/actions";
import { getUserSavedSearches } from "@/features/search/actions";
import {
  getOrganizationVeilleSubscription,
  getOrganizationVeillePublications,
} from "@/features/veille/actions";
import { redirect } from "next/navigation";
import { DeadlinesTimeline } from "@/components/dashboard/deadlines-timeline";
import { SmartActions } from "@/components/dashboard/smart-actions";
import { OffersReceivedCard } from "@/components/dashboard/offers-received-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { VeilleDashboardCard } from "@/components/dashboard/veille-dashboard-card";
import { TendersDashboardCard } from "@/components/dashboard/tenders-dashboard-card";
import { OffersDashboardCard } from "@/components/dashboard/offers-dashboard-card";
import { subDays, format } from "date-fns";

type OfferForDashboard = {
  id: string;
  status: string;
  price: number;
  currency: string;
  createdAt: Date;
  tender: {
    id: string;
    title: string;
    deadline: Date;
    organization: {
      name: string;
    };
  };
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur a une organisation
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    // Pas d'organisation, rediriger vers l'onboarding
    redirect("/onboarding");
  }

  // Prendre la première organisation (on pourra ajouter un sélecteur plus tard)
  const currentMembership = memberships[0];
  const organization = currentMembership.organization;

  console.log("🔍 Dashboard Debug:");
  console.log("User ID:", user.id);
  console.log("Organization ID:", organization.id);
  console.log("Organization Name:", organization.name);
  console.log("Total memberships:", memberships.length);

  // Récupérer les données
  const tenders = await getOrganizationTenders(organization.id);
  const offers = await getOrganizationOffers(organization.id);
  const tendersWithUnread = await getTendersWithUnreadOffers(organization.id);
  const savedSearches = await getUserSavedSearches();
  const veilleSubscription = await getOrganizationVeilleSubscription(
    organization.id
  );
  const veillePublications = await getOrganizationVeillePublications(
    organization.id
  );

  console.log("📊 Data counts:");
  console.log("Total tenders:", tenders.length);
  console.log(
    "Tenders by status:",
    tenders.map((t) => ({ id: t.id, title: t.title, status: t.status }))
  );
  console.log("Total offers:", offers.length);
  console.log(
    "Offers by status:",
    offers.map((o) => ({ id: o.id, status: o.status }))
  );

  // Statistiques
  const activeTenders = tenders.filter((t) => t.status === "PUBLISHED").length;
  const draftTenders = tenders.filter((t) => t.status === "DRAFT").length;
  const submittedOffers = offers.filter((o) => o.status === "SUBMITTED").length;
  const draftOffers = offers.filter((o) => o.status === "DRAFT").length;
  const savedSearchesWithAlerts = savedSearches.filter(
    (s) => s.alertsEnabled
  ).length;

  // Calculer les échéances
  const now = new Date();
  const upcomingDeadlines = [
    ...tenders
      .filter((t) => t.status === "PUBLISHED" && new Date(t.deadline) > now)
      .map((t) => ({
        id: t.id,
        title: t.title,
        deadline: new Date(t.deadline),
        type: "tender" as const,
      })),
  ].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  // Échéances urgentes (< 48h)
  const urgentDeadlines = upcomingDeadlines.filter((d) => {
    const hours = (d.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hours <= 48;
  });

  // Taux moyen d'offres reçues
  const publishedTenders = tenders.filter((t) => t.status === "PUBLISHED");
  const totalOffersReceived = publishedTenders.reduce(
    (sum, t) => sum + (t._count?.offers || 0),
    0
  );
  const avgOffersPerTender =
    publishedTenders.length > 0
      ? Math.round(totalOffersReceived / publishedTenders.length)
      : 0;

  // Actions intelligentes basées sur le contexte
  const smartActions: Array<{
    title: string;
    description: string;
    href: string;
    buttonLabel: string;
    icon: "plus" | "search" | "file" | "bell";
    variant?: "default" | "outline";
  }> = [];

  // TODO: Implémenter des actions rapides contextuelles pertinentes

  // Générer les données d'activité des 7 derniers jours
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");

    // Compter les tenders créés ce jour
    const tendersCount = tenders.filter((t) => {
      const createdDate = format(new Date(t.createdAt), "yyyy-MM-dd");
      return createdDate === dateStr;
    }).length;

    // Compter les offres créées ce jour
    const offersCount = offers.filter((o) => {
      const createdDate = format(new Date(o.createdAt), "yyyy-MM-dd");
      return createdDate === dateStr;
    }).length;

    return {
      date: dateStr,
      tenders: tendersCount,
      offers: offersCount,
    };
  });

  // Générer les insights intelligents
  const insights = [];

  // Insight sur le taux de réponse
  if (publishedTenders.length >= 3 && avgOffersPerTender > 0) {
    if (avgOffersPerTender >= 8) {
      insights.push({
        title: "Excellent taux de participation !",
        description: `Vos appels d'offres reçoivent en moyenne ${avgOffersPerTender} offres. C'est très bon !`,
        type: "success" as const,
      });
    } else if (avgOffersPerTender < 3) {
      insights.push({
        title: "Taux de participation faible",
        description:
          "Essayez d'améliorer vos descriptions ou d'élargir votre visibilité",
        action: {
          label: "Voir mes appels",
          href: "/dashboard/tenders",
        },
        type: "warning" as const,
      });
    }
  }

  // Insight sur les brouillons
  if (draftTenders > 2) {
    insights.push({
      title: `${draftTenders} brouillons en attente`,
      description:
        "Finalisez vos appels d'offres pour commencer à recevoir des offres",
      action: {
        label: "Publier maintenant",
        href: "/dashboard/tenders",
      },
      type: "warning" as const,
    });
  }

  // Insight sur les recherches
  if (savedSearches.length > 0 && savedSearchesWithAlerts === 0) {
    insights.push({
      title: "Activez vos alertes",
      description:
        "Vous avez des recherches sauvegardées mais aucune alerte active",
      action: {
        label: "Activer les alertes",
        href: "/dashboard/saved-searches",
      },
      type: "info" as const,
    });
  }

  // Insight sur l'activité
  const recentActivity = activityData
    .slice(-3)
    .reduce((sum, d) => sum + d.tenders + d.offers, 0);
  if (recentActivity === 0 && publishedTenders.length > 0) {
    insights.push({
      title: "Activité en baisse",
      description: "Aucune nouvelle activité ces 3 derniers jours",
      type: "info" as const,
    });
  }

  // Générer les tâches du jour
  const todayTasks = [];

  // Tâches urgentes - deadlines < 24h
  const urgentTodayDeadlines = upcomingDeadlines.filter((d) => {
    const hours = (d.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hours <= 24 && hours > 0;
  });

  urgentTodayDeadlines.forEach((deadline) => {
    todayTasks.push({
      id: deadline.id,
      title: `Échéance imminente`,
      description: deadline.title,
      href: `/dashboard/tenders/${deadline.id}`,
      priority: "high" as const,
    });
  });

  // Tâches brouillons
  if (draftTenders > 0 && todayTasks.length < 3) {
    todayTasks.push({
      id: "draft-tenders",
      title: "Finaliser vos brouillons",
      description: `${draftTenders} appel${
        draftTenders > 1 ? "s" : ""
      } d'offres en attente`,
      href: "/dashboard/tenders",
      priority: "medium" as const,
    });
  }

  // Tâches offres non lues
  const unreadCount = tendersWithUnread.reduce(
    (sum, t) => sum + t.unreadOffers,
    0
  );
  if (unreadCount > 0 && todayTasks.length < 3) {
    todayTasks.push({
      id: "unread-offers",
      title: "Nouvelles offres à consulter",
      description: `${unreadCount} offre${unreadCount > 1 ? "s" : ""} non lue${
        unreadCount > 1 ? "s" : ""
      }`,
      href: "/dashboard/tenders",
      priority: "medium" as const,
    });
  }

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 bg-white min-h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-matte-black mb-1">
            Bienvenue, {user?.name?.split(" ")[0] || "utilisateur"} 👋
          </h1>
          <p className="text-muted-foreground">{organization.name}</p>
        </div>

        {/* Cartes en haut - 3 colonnes compactes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Tâches du jour */}
          {todayTasks.length > 0 && <TodayTasks tasks={todayTasks} />}

          {/* Offres reçues */}
          <OffersReceivedCard tendersWithOffers={tendersWithUnread} />

          {/* Échéances urgentes */}
          {upcomingDeadlines.length > 0 && (
            <DeadlinesTimeline deadlines={upcomingDeadlines} />
          )}
        </div>

        {/* Grid moderne - Layout asymétrique Google-style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Colonne gauche - Full width */}
          <div className="lg:col-span-3">
            {/* Appels d'offres, Offres et Veille - 3 cartes côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mes appels d'offres */}
              <TendersDashboardCard
                tenders={tenders}
                activeTenders={activeTenders}
                draftTenders={draftTenders}
                urgentCount={urgentDeadlines.length}
              />

              {/* Mes offres */}
              <OffersDashboardCard
                offers={offers as OfferForDashboard[]}
                submittedOffers={submittedOffers}
                draftOffers={draftOffers}
              />

              {/* Veille Communale */}
              <VeilleDashboardCard
                publications={veillePublications}
                cantonsCount={veilleSubscription?.cantons?.length || 0}
              />
            </div>
          </div>
        </div>

        {/* Insights en bas si disponibles */}
        {insights.length > 0 && (
          <div className="mb-6">
            <InsightsCard insights={insights} />
          </div>
        )}

        {/* Actions rapides intelligentes - Full width en bas */}
        <SmartActions actions={smartActions} />
      </div>
    </ProtectedLayout>
  );
}
