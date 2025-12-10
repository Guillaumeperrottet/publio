"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile } from "./actions";
import { Upload, Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  image: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    profile.image
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
      image: profile.image || "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image");
      return;
    }

    try {
      setIsUploadingImage(true);
      setError(null);

      // Convertir en base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;

          // Upload vers Cloudinary via API route
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, folder: "avatars" }),
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const { url } = await response.json();
          setValue("image", url);
          setPreviewImage(url);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Erreur lors de l'upload"
          );
        } finally {
          setIsUploadingImage(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      await updateUserProfile({
        name: data.name,
        image: data.image,
      });

      setSuccess(true);
      router.refresh();

      // Cacher le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo de profil */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={previewImage || undefined}
            alt={profile.name || ""}
          />
          <AvatarFallback className="bg-artisan-yellow text-white text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Label htmlFor="image" className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-deep-green hover:text-artisan-yellow transition-colors">
              {isUploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Changer la photo de profil
                </>
              )}
            </div>
          </Label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploadingImage}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG ou GIF (max 5MB)
          </p>
        </div>
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-handdrawn text-lg">
          Nom complet
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email (lecture seule) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-muted-foreground">
          L&apos;email ne peut pas être modifié pour le moment
        </p>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">
            ✓ Profil mis à jour avec succès
          </p>
        </div>
      )}

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
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
    </form>
  );
}
