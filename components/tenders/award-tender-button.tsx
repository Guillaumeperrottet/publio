"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, Loader2 } from "lucide-react";
import { awardTender } from "@/features/tenders/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AwardTenderButtonProps {
  tenderId: string;
  offerId: string;
  organizationName: string;
  price: number;
  currency: string;
  tenderStatus?: string;
}

export function AwardTenderButton({
  tenderId,
  offerId,
  organizationName,
  price,
  currency,
  tenderStatus = "PUBLISHED",
}: AwardTenderButtonProps) {
  const router = useRouter();
  const [isAwarding, setIsAwarding] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleAward = async () => {
    setIsAwarding(true);
    try {
      const result = await awardTender(tenderId, offerId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Marché attribué avec succès");
      router.refresh();
      setShowDialog(false);
    } catch (error) {
      console.error("Error awarding tender:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsAwarding(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={isAwarding}
        size="sm"
        className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black"
      >
        <Award className="w-4 h-4 mr-2" />
        Attribuer le marché
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-artisan-yellow" />
              Attribuer le marché ?
            </DialogTitle>
            <DialogDescription>
              Vous allez attribuer le marché à{" "}
              <strong>{organizationName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-artisan-yellow/10 p-4 rounded-lg border-2 border-artisan-yellow">
              <p className="text-sm font-semibold mb-2 text-matte-black">
                Offre gagnante :
              </p>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Soumissionnaire :</strong> {organizationName}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Montant :</strong>{" "}
                  {new Intl.NumberFormat("fr-CH", {
                    style: "currency",
                    currency: currency,
                  }).format(price)}
                </p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-semibold mb-2">
                ⚠️ Action définitive
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • Toutes les autres offres seront automatiquement rejetées
                </li>
                <li>• Le marché sera marqué comme attribué</li>
                {tenderStatus === "PUBLISHED" && (
                  <li>
                    • L&apos;appel d&apos;offres sera automatiquement clôturé
                  </li>
                )}
                <li>• Les soumissionnaires seront notifiés</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isAwarding}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAward}
              disabled={isAwarding}
              className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black"
            >
              {isAwarding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Attribution...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Confirmer l&apos;attribution
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
