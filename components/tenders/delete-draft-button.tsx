"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { deleteDraftTender } from "@/features/tenders/actions";

interface DeleteDraftButtonProps {
  tenderId: string;
  tenderTitle: string;
}

export function DeleteDraftButton({
  tenderId,
  tenderTitle,
}: DeleteDraftButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDraftTender(tenderId);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Erreur lors de la suppression du brouillon");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le brouillon ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement le brouillon
              &quot;{tenderTitle}&quot; ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
