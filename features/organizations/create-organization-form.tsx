"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrganization } from "./actions";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { saveTender } from "@/features/tenders/saved-actions";
import { toast } from "sonner";

const organizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  type: z.enum(["COMMUNE", "ENTREPRISE", "PRIVE"], {
    message: "Veuillez sélectionner un type d'organisation",
  }),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  canton: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function CreateOrganizationForm({
  redirectUrl,
  action,
}: {
  redirectUrl?: string;
  action?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const selectedType = watch("type");

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const organization = await createOrganization({
        name: data.name,
        type: data.type,
        description: data.description,
        address: data.address,
        city: data.city,
        canton: data.canton,
      });

      console.log("Organization created:", organization);

      // Si action=save, sauvegarder le tender
      if (action === "save" && redirectUrl) {
        const tenderIdMatch = redirectUrl.match(/\/tenders\/([^/?]+)/);
        if (tenderIdMatch) {
          const tenderId = tenderIdMatch[1];
          try {
            await saveTender(tenderId);
            toast.success("Appel d'offres sauvegardé");
          } catch (err) {
            console.error("Error saving tender:", err);
            toast.error("Erreur lors de la sauvegarde");
          }
        }
      }

      // Forcer le refresh et rediriger vers la destination ou dashboard
      router.refresh();
      router.push(redirectUrl || "/dashboard");
    } catch (err) {
      console.error("Error creating organization:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type d'organisation */}
      <div className="space-y-2">
        <Label htmlFor="type">Type d&apos;organisation *</Label>
        <input type="hidden" {...register("type")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setValue("type", "COMMUNE")}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              selectedType === "COMMUNE"
                ? "border-artisan-yellow bg-artisan-yellow/10"
                : "border-gray-300 hover:border-artisan-yellow/50"
            }`}
          >
            <div className="text-2xl mb-2">🏛️</div>
            <div className="font-semibold">Commune</div>
            <div className="text-xs text-muted-foreground">
              Administration publique
            </div>
          </button>

          <button
            type="button"
            onClick={() => setValue("type", "ENTREPRISE")}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              selectedType === "ENTREPRISE"
                ? "border-artisan-yellow bg-artisan-yellow/10"
                : "border-gray-300 hover:border-artisan-yellow/50"
            }`}
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-semibold">Entreprise</div>
            <div className="text-xs text-muted-foreground">
              Bureau, architectes, ingénieurs
            </div>
          </button>

          <button
            type="button"
            onClick={() => setValue("type", "PRIVE")}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              selectedType === "PRIVE"
                ? "border-artisan-yellow bg-artisan-yellow/10"
                : "border-gray-300 hover:border-artisan-yellow/50"
            }`}
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Privé</div>
            <div className="text-xs text-muted-foreground">
              Indépendant, particulier
            </div>
          </button>
        </div>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Nom de l'organisation */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l&apos;organisation *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Ex: Commune de Lausanne, Bureau d'Ingénieurs SA..."
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Décrivez brièvement votre organisation..."
          rows={3}
        />
      </div>

      {/* Localisation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" {...register("city")} placeholder="Ex: Lausanne" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="canton">Canton</Label>
          <Input
            id="canton"
            {...register("canton")}
            placeholder="Ex: VD"
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Ex: Place de la Palud 2"
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Bouton de soumission */}
      <div className="flex items-center justify-between pt-4">
        <HandDrawnBadge variant="default">
          Vous serez propriétaire (OWNER)
        </HandDrawnBadge>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Création en cours..." : "Créer mon organisation"}
        </Button>
      </div>
    </form>
  );
}
