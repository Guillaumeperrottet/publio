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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateOrganization } from "./actions";
import { Upload, Loader2 } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  canton: z.string().optional(),
  phone: z.string().optional(),
  siret: z.string().optional(),
  taxId: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationSettingsFormProps {
  organization: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    canton: string | null;
    phone: string | null;
    siret: string | null;
    taxId: string | null;
  };
  canEdit: boolean;
}

export default function OrganizationSettingsForm({
  organization,
  canEdit,
}: OrganizationSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(
    organization.logo
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description || "",
      logo: organization.logo || "",
      website: organization.website || "",
      address: organization.address || "",
      city: organization.city || "",
      canton: organization.canton || "",
      phone: organization.phone || "",
      siret: organization.siret || "",
      taxId: organization.taxId || "",
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Le logo ne doit pas dépasser 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image");
      return;
    }

    try {
      setIsUploadingLogo(true);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, folder: "logos" }),
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const { url } = await response.json();
          setValue("logo", url);
          setPreviewLogo(url);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Erreur lors de l'upload"
          );
        } finally {
          setIsUploadingLogo(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = async (data: OrganizationFormData) => {
    if (!canEdit) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      await updateOrganization(organization.id, {
        name: data.name,
        description: data.description,
        logo: data.logo,
        website: data.website,
        address: data.address,
        city: data.city,
        canton: data.canton,
        phone: data.phone,
        siret: data.siret,
        taxId: data.taxId,
      });

      setSuccess(true);
      router.refresh();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const organizationInitials = organization.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 rounded-lg">
          <AvatarImage src={previewLogo || undefined} alt={organization.name} />
          <AvatarFallback className="bg-artisan-yellow text-white text-2xl rounded-lg">
            {organizationInitials}
          </AvatarFallback>
        </Avatar>
        {canEdit && (
          <div className="flex-1">
            <Label htmlFor="logo" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-deep-green hover:text-artisan-yellow transition-colors">
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Changer le logo
                  </>
                )}
              </div>
            </Label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo || !canEdit}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou GIF (max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l&apos;organisation *</Label>
        <Input
          id="name"
          {...register("name")}
          disabled={isSubmitting || !canEdit}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Type (lecture seule) */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Input
          value={
            organization.type === "COMMUNE"
              ? "Commune"
              : organization.type === "ENTREPRISE"
              ? "Entreprise"
              : "Privé"
          }
          disabled
          className="bg-gray-50"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={3}
          disabled={isSubmitting || !canEdit}
          placeholder="Décrivez votre organisation..."
        />
      </div>

      {/* Site web */}
      <div className="space-y-2">
        <Label htmlFor="website">Site web</Label>
        <Input
          id="website"
          type="url"
          {...register("website")}
          placeholder="https://example.com"
          disabled={isSubmitting || !canEdit}
        />
        {errors.website && (
          <p className="text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      {/* Coordonnées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            {...register("address")}
            disabled={isSubmitting || !canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            {...register("city")}
            disabled={isSubmitting || !canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="canton">Canton</Label>
          <Input
            id="canton"
            {...register("canton")}
            placeholder="VD, GE, FR..."
            disabled={isSubmitting || !canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+41 21 123 45 67"
            disabled={isSubmitting || !canEdit}
          />
        </div>
      </div>

      {/* Informations administratives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input
            id="siret"
            {...register("siret")}
            disabled={isSubmitting || !canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">N° TVA</Label>
          <Input
            id="taxId"
            {...register("taxId")}
            placeholder="CHE-123.456.789"
            disabled={isSubmitting || !canEdit}
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">
            ✓ Organisation mise à jour avec succès
          </p>
        </div>
      )}

      {/* Bouton */}
      {canEdit && (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingLogo}
            className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
