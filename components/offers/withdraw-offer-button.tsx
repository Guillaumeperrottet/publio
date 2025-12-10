"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";
import { withdrawOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WithdrawOfferButtonProps {
  offerId: string;
  tenderTitle: string;
  tenderDeadline: Date;
}

export function WithdrawOfferButton({
  offerId,
  tenderTitle,
  tenderDeadline,
}: WithdrawOfferButtonProps) {
  const router = useRouter();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Vérifier si on peut encore retirer (avant deadline)
  const now = new Date();
  const canWithdraw = now < new Date(tenderDeadline);

  if (!canWithdraw) {
    return null;
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const result = await withdrawOffer(offerId);

      if (result.error) {
        alert(result.error);
        return;
      }

      router.refresh();
      setShowDialog(false);
    } catch (error) {
      console.error("Error withdrawing offer:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={isWithdrawing}
        variant="outline"
        size="sm"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Retirer mon offre
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer votre offre ?</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de retirer votre offre pour{" "}
              <strong>{tenderTitle}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-semibold mb-2">
              ⚠️ Action irréversible
            </p>
            <p className="text-sm text-red-700">
              Une fois retirée, vous ne pourrez plus soumettre de nouvelle offre
              pour cet appel d&apos;offres. Le donneur d&apos;ordre sera notifié
              du retrait.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isWithdrawing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              variant="destructive"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrait...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmer le retrait
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
