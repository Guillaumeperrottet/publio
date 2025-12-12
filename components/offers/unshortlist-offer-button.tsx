"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarOff, Loader2 } from "lucide-react";
import { unshortlistOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";

interface UnshortlistOfferButtonProps {
  offerId: string;
}

export function UnshortlistOfferButton({
  offerId,
}: UnshortlistOfferButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUnshortlist = async () => {
    setIsLoading(true);
    try {
      const result = await unshortlistOffer(offerId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error unshortlisting offer:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUnshortlist}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-matte-black"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Retrait...
        </>
      ) : (
        <>
          <StarOff className="w-4 h-4 mr-2" />
          Retirer
        </>
      )}
    </Button>
  );
}
