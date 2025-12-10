"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMember } from "./actions";
import { UserPlus, Loader2 } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"], {
    message: "Veuillez sélectionner un rôle",
  }),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberFormProps {
  organizationId: string;
}

export default function InviteMemberForm({
  organizationId,
}: InviteMemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: InviteFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setInvitationCode(null);
      setInvitationUrl(null);

      const result = await inviteMember({
        organizationId,
        email: data.email,
        role: data.role,
      });

      setInvitationCode(result.invitationCode);
      setInvitationUrl(result.invitationUrl);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email du membre</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="membre@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Rôle */}
      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) =>
            setValue("role", value as "ADMIN" | "EDITOR" | "VIEWER")
          }
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">
                  Gestion complète
                </p>
              </div>
            </SelectItem>
            <SelectItem value="EDITOR">
              <div>
                <p className="font-medium">Éditeur</p>
                <p className="text-xs text-muted-foreground">
                  Création et modification
                </p>
              </div>
            </SelectItem>
            <SelectItem value="VIEWER">
              <div>
                <p className="font-medium">Lecteur</p>
                <p className="text-xs text-muted-foreground">Lecture seule</p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {invitationCode && invitationUrl && (
        <div className="p-4 bg-artisan-yellow/10 border-2 border-artisan-yellow rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-artisan-dark mb-2">
                ✓ Code d&apos;invitation généré
              </p>
              <div className="bg-white p-3 rounded border border-artisan-yellow/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Code à transmettre :
                </p>
                <p className="font-mono text-lg font-bold text-artisan-yellow">
                  {invitationCode}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Ou partagez ce lien :
            </p>
            <div className="bg-white p-2 rounded border border-artisan-yellow/30">
              <p className="text-xs font-mono break-all text-artisan-dark">
                {invitationUrl}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(invitationUrl);
              }}
            >
              Copier le lien
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Ce code expire dans 7 jours
          </p>
        </div>
      )}

      {/* Bouton */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-artisan-yellow hover:bg-artisan-yellow/90 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Générer un code d&apos;invitation
          </>
        )}
      </Button>

      {!invitationCode && (
        <p className="text-xs text-muted-foreground text-center">
          Un code unique sera généré pour inviter ce membre
        </p>
      )}
    </form>
  );
}
