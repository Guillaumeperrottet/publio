"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDraftOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDraftOfferButtonProps {
  offerId: string;
  tenderTitle: string;
  variant?: "default" | "menuItem";
}

export function DeleteDraftOfferButton({
  offerId,
  tenderTitle,
  variant = "default",
}: DeleteDraftOfferButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDraftOffer(offerId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Brouillon supprimé avec succès");
      router.refresh();
      setShowDialog(false);
    } catch (error) {
      console.error("Error deleting draft offer:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsDeleting(false);
    }
  };

  const TriggerButton =
    variant === "menuItem" ? (
      <button
        onClick={() => setShowDialog(true)}
        disabled={isDeleting}
        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer
      </button>
    ) : (
      <Button
        onClick={() => setShowDialog(true)}
        disabled={isDeleting}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer
      </Button>
    );

  return (
    <>
      {TriggerButton}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce brouillon ?</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de supprimer votre brouillon d&apos;offre
              pour <strong>{tenderTitle}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              ⚠️ Cette action est irréversible. Toutes les données saisies dans
              ce brouillon seront perdues.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
