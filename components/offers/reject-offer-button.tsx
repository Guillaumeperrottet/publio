"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";
import { rejectOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RejectOfferButtonProps {
  offerId: string;
  organizationName: string;
  price: number;
  currency: string;
}

export function RejectOfferButton({
  offerId,
  organizationName,
  price,
  currency,
}: RejectOfferButtonProps) {
  const router = useRouter();
  const [isRejecting, setIsRejecting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await rejectOffer(offerId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.refresh();
      setShowDialog(false);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={isRejecting}
        variant="outline"
        size="sm"
        className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Rejeter
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter cette offre ?</DialogTitle>
            <DialogDescription>
              Vous allez rejeter l&apos;offre de{" "}
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
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              ⚠️ Le soumissionnaire sera notifié par email que son offre
              n&apos;a pas été retenue.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isRejecting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              variant="destructive"
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
