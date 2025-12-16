import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import { getRecentTendersWithLogs } from "@/features/equity-log/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "En cours",
  CLOSED: "Clôturé",
  AWARDED: "Attribué",
  CANCELLED: "Annulé",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-green-100 text-green-800",
  CLOSED: "bg-orange-100 text-orange-800",
  AWARDED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function EquityLogsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Récupérer les organisations de l'utilisateur (OWNER/ADMIN seulement)
  const memberships = await getUserOrganizations();

  if (!memberships || memberships.length === 0) {
    return notFound();
  }

  // Filtrer uniquement les organisations où l'utilisateur est OWNER ou ADMIN
  const adminMemberships = memberships.filter(
    (membership: { role: string }) =>
      membership.role === "OWNER" || membership.role === "ADMIN"
  );

  if (adminMemberships.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous devez être propriétaire ou administrateur d&apos;une
              organisation pour accéder aux journaux d&apos;équité.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Récupérer les tenders avec logs pour toutes les organisations admin
  const tendersWithLogs = await Promise.all(
    adminMemberships.map(
      async (membership: { organization: { id: string } }) => {
        const result = await getRecentTendersWithLogs(
          membership.organization.id,
          10
        );
        return result.tenders || [];
      }
    )
  );

  const allTenders = tendersWithLogs.flat().sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Journaux d&apos;équité récents
        </h1>
        <p className="text-muted-foreground mt-2">
          Accès rapide aux journaux de traçabilité de vos appels d&apos;offres
        </p>
      </div>

      {allTenders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun journal disponible
            </h3>
            <p className="text-sm text-muted-foreground">
              Les journaux d&apos;équité apparaîtront ici dès que des actions
              seront enregistrées sur vos appels d&apos;offres.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allTenders.map((tender) => (
            <Card key={tender.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{tender.title}</h3>
                      <Badge
                        variant="outline"
                        className={statusColors[tender.status]}
                      >
                        {statusLabels[tender.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {tender._count.equityLogs}{" "}
                        {tender._count.equityLogs === 1 ? "entrée" : "entrées"}
                      </span>
                      <span>
                        Modifié{" "}
                        {formatDistanceToNow(new Date(tender.updatedAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  <Link href={`/dashboard/tenders/${tender.id}/equity-log`}>
                    <Button variant="outline" size="sm">
                      Voir le journal
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            À propos des journaux d&apos;équité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            📜 Les journaux d&apos;équité enregistrent automatiquement toutes
            les actions importantes pour garantir la traçabilité des processus
            d&apos;appels d&apos;offres.
          </p>
          <p>
            🔐 Cette fonctionnalité est accessible uniquement aux propriétaires
            et administrateurs des organisations.
          </p>
          <p>
            🔍 Cliquez sur un appel d&apos;offres pour consulter son journal
            détaillé avec l&apos;historique complet des actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
