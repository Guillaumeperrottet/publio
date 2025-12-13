/**
 * @deprecated Ce composant est deprecated. Utilisez le nouveau workflow avec :
 * - ShortlistOfferButton (pour pré-sélectionner)
 * - UnshortlistOfferButton (pour retirer de la liste)
 * - AwardTenderButton (pour attribuer le marché)
 */
"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { acceptOffer, rejectOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OfferActionsButtonsProps {
  offerId: string;
  offerStatus: string;
  organizationName: string;
  price: number;
  currency: string;
}

export function OfferActionsButtons({
  offerId,
  offerStatus,
  organizationName,
  price,
  currency,
}: OfferActionsButtonsProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Seules les offres SUBMITTED peuvent être acceptées/rejetées
  if (offerStatus !== "SUBMITTED") {
    return null;
  }

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const result = await acceptOffer(offerId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.refresh();
      setShowAcceptDialog(false);
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await rejectOffer(offerId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.refresh();
      setShowRejectDialog(false);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setShowAcceptDialog(true)}
          disabled={isAccepting || isRejecting}
          size="sm"
          className="bg-deep-green hover:bg-deep-green/90"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Accepter
        </Button>
        <Button
          onClick={() => setShowRejectDialog(true)}
          disabled={isAccepting || isRejecting}
          variant="outline"
          size="sm"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejeter
        </Button>
      </div>

      {/* Dialog Acceptation */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accepter cette offre ?</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d&apos;accepter l&apos;offre de{" "}
              <strong>{organizationName}</strong> pour un montant de{" "}
              <strong>
                {new Intl.NumberFormat("fr-CH", {
                  style: "currency",
                  currency: currency,
                }).format(price)}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="bg-artisan-yellow/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ℹ️ Cette action n&apos;attribue pas encore le marché. Vous pourrez
              finaliser l&apos;attribution plus tard.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={isAccepting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="bg-deep-green hover:bg-deep-green/90"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Acceptation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmer l&apos;acceptation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter cette offre ?</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter l&apos;offre de{" "}
              <strong>{organizationName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              ⚠️ Cette action est définitive. Le soumissionnaire sera notifié du
              rejet.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isRejecting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejet...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmer le rejet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
