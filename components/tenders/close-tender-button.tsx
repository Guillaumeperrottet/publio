"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { closeTender } from "@/features/tenders/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CloseTenderButtonProps {
  tenderId: string;
  offersCount: number;
}

export function CloseTenderButton({
  tenderId,
  offersCount,
}: CloseTenderButtonProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleClose = async () => {
    setIsClosing(true);
    try {
      const result = await closeTender(tenderId);

      if (result.error) {
        alert(result.error);
        return;
      }

      router.refresh();
      setShowDialog(false);
    } catch (error) {
      console.error("Error closing tender:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={isClosing}
        variant="outline"
        size="sm"
      >
        <Lock className="w-4 h-4 mr-2" />
        Clôturer l&apos;appel d&apos;offres
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clôturer cet appel d&apos;offres ?</DialogTitle>
            <DialogDescription>
              Vous allez clôturer cet appel d&apos;offres et empêcher toute
              nouvelle soumission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-sand-light p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Récapitulatif :</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • {offersCount} offre{offersCount > 1 ? "s" : ""} reçue
                  {offersCount > 1 ? "s" : ""}
                </li>
                <li>• Aucune nouvelle soumission ne sera acceptée</li>
                <li>• Vous pourrez ensuite attribuer le marché</li>
              </ul>
            </div>
            <div className="bg-artisan-yellow/10 p-4 rounded-lg border border-artisan-yellow/30">
              <p className="text-sm text-muted-foreground">
                💡 Vous pourrez toujours consulter les offres et attribuer le
                marché après la clôture.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isClosing}
            >
              Annuler
            </Button>
            <Button onClick={handleClose} disabled={isClosing}>
              {isClosing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clôture...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Confirmer la clôture
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
