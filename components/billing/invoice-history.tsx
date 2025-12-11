"use client";

import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  stripeInvoiceId: string | null;
  createdAt: Date;
  paidAt: Date | null;
}

interface InvoiceHistoryProps {
  invoices: Invoice[];
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    variant: "default" | "destructive" | "secondary";
  }
> = {
  PAID: {
    label: "Payée",
    icon: <CheckCircle2 className="w-3 h-3" />,
    variant: "default",
  },
  PENDING: {
    label: "En attente",
    icon: <Clock className="w-3 h-3" />,
    variant: "secondary",
  },
  FAILED: {
    label: "Échec",
    icon: <XCircle className="w-3 h-3" />,
    variant: "destructive",
  },
  REFUNDED: {
    label: "Remboursée",
    icon: <CheckCircle2 className="w-3 h-3" />,
    variant: "secondary",
  },
};

export function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
  const handleDownload = async (stripeInvoiceId: string | null) => {
    if (!stripeInvoiceId) {
      alert("PDF non disponible pour cette facture");
      return;
    }

    try {
      // Ouvrir le PDF Stripe dans un nouvel onglet
      const response = await fetch(`/api/stripe/invoice/${stripeInvoiceId}`);
      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Erreur lors du téléchargement de la facture");
    }
  };

  if (invoices.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle>Historique des factures</HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Vos factures apparaîtront ici une fois que vous aurez effectué des
              paiements (publication d&apos;appels d&apos;offres, abonnement
              veille, etc.)
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle>
          Historique des factures ({invoices.length})
        </HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status] || {
                  label: invoice.status,
                  icon: null,
                  variant: "secondary" as const,
                };

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs">
                      {invoice.number}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {invoice.description}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString("fr-CH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {invoice.currency.toUpperCase()}{" "}
                      {invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant} className="gap-1">
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.stripeInvoiceId && invoice.status === "PAID" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownload(invoice.stripeInvoiceId)
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Les factures sont conservées pendant 7 ans conformément à la
          législation suisse.
        </p>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
