import { Badge } from "@/components/ui/badge";
import { Eye, Lock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface IdentityRevealedBadgeProps {
  isAnonymous: boolean;
  identityRevealed: boolean;
  revealedAt: Date | null;
}

export function IdentityRevealedBadge({
  isAnonymous,
  identityRevealed,
  revealedAt,
}: IdentityRevealedBadgeProps) {
  if (!isAnonymous) {
    return null;
  }

  if (!identityRevealed) {
    return (
      <Badge className="bg-deep-green/10 text-deep-green border border-deep-green">
        <Lock className="w-3 h-3 mr-1" />
        Identité masquée
      </Badge>
    );
  }

  return (
    <Badge className="bg-artisan-yellow/20 text-yellow-800 border border-artisan-yellow">
      <Eye className="w-3 h-3 mr-1" />
      Identité révélée
      {revealedAt && (
        <span className="ml-1 text-xs">
          · {format(new Date(revealedAt), "dd/MM/yyyy", { locale: fr })}
        </span>
      )}
    </Badge>
  );
}
