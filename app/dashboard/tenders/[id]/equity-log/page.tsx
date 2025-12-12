import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getTenderEquityLogs } from "@/features/equity-log/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { EquityLogAction } from "@prisma/client";
import { ExportPdfButton } from "@/components/equity-log/export-pdf-button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mapping des couleurs par type d'action - sobres et administratives
const ACTION_COLORS: Record<EquityLogAction, string> = {
  TENDER_CREATED: "bg-slate-100 text-slate-700 border-slate-300",
  TENDER_PUBLISHED: "bg-slate-100 text-slate-700 border-slate-300",
  TENDER_UPDATED: "bg-slate-100 text-slate-700 border-slate-300",
  TENDER_CLOSED: "bg-slate-100 text-slate-700 border-slate-300",
  TENDER_AWARDED: "bg-slate-100 text-slate-700 border-slate-300",
  TENDER_CANCELLED: "bg-slate-100 text-slate-700 border-slate-300",
  OFFER_RECEIVED: "bg-slate-100 text-slate-700 border-slate-300",
  OFFER_SHORTLISTED: "bg-slate-100 text-slate-700 border-slate-300",
  OFFER_REJECTED: "bg-slate-100 text-slate-700 border-slate-300",
  OFFER_AWARDED: "bg-slate-100 text-slate-700 border-slate-300",
  IDENTITY_REVEALED: "bg-slate-100 text-slate-700 border-slate-300",
  DEADLINE_EXTENDED: "bg-slate-100 text-slate-700 border-slate-300",
  INVITATION_SENT: "bg-slate-100 text-slate-700 border-slate-300",
};

// Mapping des labels par type d'action
const ACTION_LABELS: Record<EquityLogAction, string> = {
  TENDER_CREATED: "Créé",
  TENDER_PUBLISHED: "Publié",
  TENDER_UPDATED: "Modifié",
  TENDER_CLOSED: "Clôturé",
  TENDER_AWARDED: "Attribué",
  TENDER_CANCELLED: "Annulé",
  OFFER_RECEIVED: "Offre reçue",
  OFFER_SHORTLISTED: "Pré-sélectionnée",
  OFFER_REJECTED: "Rejetée",
  OFFER_AWARDED: "Retenue",
  IDENTITY_REVEALED: "Identité révélée",
  DEADLINE_EXTENDED: "Deadline prolongée",
  INVITATION_SENT: "Invitation envoyée",
};

export default async function EquityLogPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Await params in Next.js 15
  const { id } = await params;

  // Récupérer le tender
  const tender = await prisma.tender.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          members: {
            where: {
              userId: user.id,
              role: {
                in: ["OWNER", "ADMIN"],
              },
            },
          },
        },
      },
    },
  });

  if (!tender) {
    notFound();
  }

  // Vérifier que l'utilisateur est OWNER ou ADMIN
  if (!tender.organization.members.length) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous devez être propriétaire ou administrateur pour accéder au
              journal d&apos;équité.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Récupérer les logs
  const result = await getTenderEquityLogs(id);

  if (result.error || !result.logs) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              {result.error || "Impossible de charger les logs"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Journal d&apos;équité
          </h1>
          <p className="text-muted-foreground mt-2">
            Traçabilité complète des actions réalisées sur cet appel
            d&apos;offres
          </p>
        </div>
        {result.logs && result.logs.length > 0 && (
          <ExportPdfButton tenderId={id} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Historique complet
          </CardTitle>
          <CardDescription>
            Toutes les actions sont enregistrées de manière immuable pour
            garantir la transparence et l&apos;équité du processus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune action enregistrée pour le moment</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date & Heure</TableHead>
                    <TableHead className="w-[130px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[200px]">Acteur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.logs.map((log) => {
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(log.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(log.createdAt).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              ACTION_COLORS[log.action]
                            } text-xs font-mono`}
                          >
                            {ACTION_LABELS[log.action]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {log.user.name || "Utilisateur"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {log.user.email}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            À propos du journal d&apos;équité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            📜 Ce journal enregistre automatiquement toutes les actions
            importantes pour garantir la traçabilité du processus d&apos;appel
            d&apos;offres.
          </p>
          <p>
            🔒 Les entrées sont immuables et horodatées de manière sécurisée
            pour assurer l&apos;intégrité des données.
          </p>
          <p>
            👥 Seuls les propriétaires et administrateurs de l&apos;organisation
            peuvent consulter ce journal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
