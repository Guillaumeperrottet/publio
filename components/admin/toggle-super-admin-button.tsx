"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";
import { toggleSuperAdmin } from "@/features/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ToggleSuperAdminButtonProps {
  userId: string;
  isSuperAdmin: boolean;
}

export function ToggleSuperAdminButton({
  userId,
  isSuperAdmin,
}: ToggleSuperAdminButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    try {
      setLoading(true);
      const result = await toggleSuperAdmin(userId);

      // Son de succès
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore les erreurs si le son ne peut pas être joué
      });

      toast.success(
        result.isSuperAdmin ? "Super admin accordé" : "Super admin révoqué",
        {
          description: result.isSuperAdmin
            ? "L'utilisateur a maintenant accès au panneau super admin"
            : "L'utilisateur n'a plus accès au panneau super admin",
          duration: 4000,
        }
      );
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Échec de la mise à jour", {
        description:
          "Une erreur s'est produite lors de la modification des privilèges",
        duration: 4000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={isSuperAdmin ? "destructive" : "default"}
        onClick={() => setOpen(true)}
        className={isSuperAdmin ? "bg-red-600 hover:bg-red-700 text-white" : ""}
      >
        <Shield className="w-4 h-4 mr-2" />
        {isSuperAdmin ? "Revoke Admin" : "Make Admin"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {isSuperAdmin
                ? "Révoquer les privilèges super admin ?"
                : "Accorder les privilèges super admin ?"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isSuperAdmin
                ? "Cet utilisateur perdra l'accès au panneau d'administration et toutes les fonctionnalités super admin."
                : "Cet utilisateur aura un accès complet au panneau d'administration avec tous les privilèges super admin."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant={isSuperAdmin ? "destructive" : "default"}
              onClick={handleToggle}
              disabled={loading}
              className={
                !isSuperAdmin
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : ""
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isSuperAdmin ? (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Révoquer
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Accorder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
