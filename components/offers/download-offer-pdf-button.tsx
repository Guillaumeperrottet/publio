"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DownloadOfferPdfButtonProps {
  offerId: string;
  offerNumber?: string | null;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadOfferPdfButton({
  offerId,
  offerNumber,
  variant = "outline",
  size = "sm",
  className,
}: DownloadOfferPdfButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/offers/${offerId}/pdf`);

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du PDF");
      }

      // Récupérer le blob du PDF
      const blob = await response.blob();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offre-${offerNumber || offerId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du téléchargement"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </>
      )}
    </Button>
  );
}
