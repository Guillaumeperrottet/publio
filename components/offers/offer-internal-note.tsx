"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StickyNote, Loader2, Save } from "lucide-react";
import { updateOfferInternalNote } from "@/features/offers/actions";

interface OfferInternalNoteProps {
  offerId: string;
  initialNote: string | null;
  organizationName: string;
}

export function OfferInternalNote({
  offerId,
  initialNote,
  organizationName,
}: OfferInternalNoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(initialNote || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateOfferInternalNote(
        offerId,
        note.trim() || null
      );

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      // Fermer la modale et recharger
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  const hasNote = initialNote && initialNote.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-sand-light">
          <StickyNote className="w-4 h-4 mr-2" />
          {hasNote ? "Modifier la note" : "Ajouter une note"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Note interne</DialogTitle>
          <DialogDescription>
            Ajoutez une note privée sur l&apos;offre de{" "}
            <span className="font-semibold">{organizationName}</span>. Cette
            note est uniquement visible par votre organisation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Très bon rapport qualité-prix, références solides, à contacter en priorité..."
            className="min-h-[150px]"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {note.length} caractères
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
