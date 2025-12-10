"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  acceptInvitation,
  declineInvitation,
} from "@/features/organizations/actions";
import { Loader2, Check, X } from "lucide-react";

interface AcceptInvitationFormProps {
  token: string;
}

export default function AcceptInvitationForm({
  token,
}: AcceptInvitationFormProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      setError(null);

      await acceptInvitation(token);

      // Rediriger vers le dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir refuser cette invitation ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      setIsDeclining(true);
      setError(null);

      await declineInvitation(token);

      // Rediriger vers le dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleAccept}
          disabled={isAccepting || isDeclining}
          className="flex-1 bg-artisan-yellow hover:bg-artisan-yellow/90 text-white"
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Acceptation...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Accepter l&apos;invitation
            </>
          )}
        </Button>

        <Button
          onClick={handleDecline}
          disabled={isAccepting || isDeclining}
          variant="outline"
          className="flex-1"
        >
          {isDeclining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refus...
            </>
          ) : (
            <>
              <X className="mr-2 h-4 w-4" />
              Refuser
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        En acceptant, vous rejoindrez cette organisation et aurez accès à ses
        ressources selon votre rôle.
      </p>
    </div>
  );
}
