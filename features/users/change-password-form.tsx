"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/auth/client";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setIsSubmitting(true);

      // Utiliser l'API Better Auth pour changer le mot de passe
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false, // Ne pas révoquer les autres sessions
      });

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur lors du changement de mot de passe"
        );
      }

      toast.success("Mot de passe modifié avec succès");
      reset();
      router.refresh();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du changement de mot de passe"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Mot de passe actuel */}
      <div>
        <Label htmlFor="currentPassword" className="text-sm font-medium">
          Mot de passe actuel
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            {...register("currentPassword")}
            className="pl-10 pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* Nouveau mot de passe */}
      <div>
        <Label htmlFor="newPassword" className="text-sm font-medium">
          Nouveau mot de passe
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword")}
            className="pl-10 pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showNewPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.newPassword.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Minimum 8 caractères
        </p>
      </div>

      {/* Confirmer le mot de passe */}
      <div>
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmer le nouveau mot de passe
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className="pl-10 pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Bouton de soumission */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Modification en cours...
            </>
          ) : (
            "Changer le mot de passe"
          )}
        </Button>
      </div>

      {/* Avertissement sécurité */}
      <div className="p-3 bg-sand-light/50 rounded-lg border border-sand-light">
        <p className="text-xs text-muted-foreground">
          🔒 <strong>Sécurité :</strong> Choisissez un mot de passe unique et
          complexe. Évitez d&apos;utiliser des informations personnelles.
        </p>
      </div>
    </form>
  );
}
