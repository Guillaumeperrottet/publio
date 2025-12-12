"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { saveTender, unsaveTender } from "@/features/tenders/saved-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface BookmarkTenderButtonProps {
  tenderId: string;
  isSaved: boolean;
  isAuthenticated?: boolean;
  className?: string;
}

export function BookmarkTenderButton({
  tenderId,
  isSaved: initialIsSaved,
  isAuthenticated = true,
  className,
}: BookmarkTenderButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    // Empêcher la propagation pour ne pas naviguer vers le tender
    e.preventDefault();
    e.stopPropagation();

    // Si non authentifié, rediriger vers la page d'inscription avec le tenderId
    if (!isAuthenticated) {
      router.push(`/auth/signup?redirect=/tenders/${tenderId}&action=save`);
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        const result = await unsaveTender(tenderId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        setIsSaved(false);
        toast.success("Appel d'offres retiré des sauvegardes");
      } else {
        const result = await saveTender(tenderId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        setIsSaved(true);
        toast.success("Appel d'offres sauvegardé");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "p-2 rounded-full transition-all duration-200",
        "hover:bg-artisan-yellow/20",
        "focus:outline-none focus:ring-2 focus:ring-artisan-yellow focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      title={isSaved ? "Retirer des sauvegardes" : "Sauvegarder"}
    >
      <Bookmark
        className={cn(
          "w-5 h-5 transition-all duration-200",
          isSaved
            ? "fill-artisan-yellow stroke-artisan-yellow"
            : "stroke-matte-black hover:stroke-artisan-yellow"
        )}
      />
    </button>
  );
}
