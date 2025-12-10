"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Loader2, Send, AlertCircle } from "lucide-react";
import { createOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const offerSchema = z.object({
  price: z.string().min(1, "Le prix est requis"),
  description: z
    .string()
    .min(50, "La description doit contenir au moins 50 caractères"),
  methodology: z
    .string()
    .min(100, "La méthodologie doit contenir au moins 100 caractères"),
  timeline: z
    .string()
    .min(10, "Le délai d'exécution doit contenir au moins 10 caractères"),
  references: z.string().optional(),
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.number(),
        mimeType: z.string(),
      })
    )
    .min(1, "Au moins un document PDF est requis"),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface SubmitOfferFormProps {
  tender: {
    id: string;
    title: string;
    mode: string;
    currency: string;
  };
  organization: {
    id: string;
    name: string;
  };
  userId: string;
}

export function SubmitOfferForm({
  tender,
  organization,
}: SubmitOfferFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{ name: string; url: string; size: number; mimeType: string }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      price: "",
      description: "",
      methodology: "",
      timeline: "",
      references: "",
      documents: [],
    },
  });

  // Observer les changements pour le compteur de caractères
  const description = watch("description");
  const methodology = watch("methodology");
  const timeline = watch("timeline");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const file = files[0];

      // Validation
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        throw new Error("Seuls les fichiers PDF sont acceptés");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Le fichier ne doit pas dépasser 10MB");
      }

      // Upload vers Cloudinary via API route
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      const data = await response.json();

      const newDocument = {
        name: file.name,
        url: data.url,
        size: file.size,
        mimeType: file.type,
      };

      const updatedDocuments = [...uploadedDocuments, newDocument];
      setUploadedDocuments(updatedDocuments);
      setValue("documents", updatedDocuments);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Erreur lors de l'upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = uploadedDocuments.filter((_, i) => i !== index);
    setUploadedDocuments(updatedDocuments);
    setValue("documents", updatedDocuments);
  };

  const onSubmit = async (data: OfferFormData) => {
    try {
      setIsSubmitting(true);

      const priceValue = parseFloat(data.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Le prix doit être un nombre valide");
      }

      const result = await createOffer({
        tenderId: tender.id,
        organizationId: organization.id,
        price: priceValue,
        description: data.description,
        methodology: data.methodology,
        timeline: data.timeline,
        references: data.references || null,
        documents: data.documents,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Rediriger vers la page de succès
      if (result.success) {
        router.push(`/dashboard/offers?success=true`);
      } else {
        throw new Error("Erreur lors de la soumission de l'offre");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la soumission de l'offre"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Prix */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            💰 Votre prix
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="space-y-2">
            <Label htmlFor="price">Prix total ({tender.currency})</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 125000.00"
                {...register("price")}
                className="text-lg font-semibold"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {tender.currency}
              </div>
            </div>
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Description */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            📝 Description de votre offre
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description">
                  Description générale (min. 50 caractères)
                </Label>
                <span
                  className={`text-xs ${
                    description.length < 50
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {description.length} / 50
                </span>
              </div>
              <Textarea
                id="description"
                rows={4}
                placeholder="Décrivez votre approche, vos atouts, votre compréhension du projet..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="methodology">
                  Méthodologie détaillée (min. 100 caractères)
                </Label>
                <span
                  className={`text-xs ${
                    methodology.length < 100
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {methodology.length} / 100
                </span>
              </div>
              <Textarea
                id="methodology"
                rows={6}
                placeholder="Expliquez en détail votre méthodologie, les étapes de réalisation, les ressources mobilisées..."
                {...register("methodology")}
              />
              {errors.methodology && (
                <p className="text-sm text-red-500">
                  {errors.methodology.message}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="timeline">Délai d&apos;exécution</Label>
                <span
                  className={`text-xs ${
                    timeline.length < 10 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {timeline.length} / 10
                </span>
              </div>
              <Input
                id="timeline"
                placeholder="Ex: 6 mois à partir de la signature du contrat"
                {...register("timeline")}
              />
              {errors.timeline && (
                <p className="text-sm text-red-500">
                  {errors.timeline.message}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="references">Références (optionnel)</Label>
              <Textarea
                id="references"
                rows={3}
                placeholder="Listez vos références pertinentes, projets similaires réalisés..."
                {...register("references")}
              />
              {errors.references && (
                <p className="text-sm text-red-500">
                  {errors.references.message}
                </p>
              )}
            </div>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Documents */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            📎 Documents
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documents">
                Téléchargez votre offre détaillée (PDF)
              </Label>
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-artisan-yellow hover:bg-sand-light/50 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <Loader2 className="w-10 h-10 text-artisan-yellow animate-spin" />
                    ) : (
                      <Upload className="w-10 h-10 text-muted-foreground" />
                    )}
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">
                        Cliquez pour télécharger
                      </span>{" "}
                      ou glissez-déposez
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF uniquement (max. 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {uploadError && (
                <div className="mt-2 flex items-start gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {errors.documents && (
                <p className="text-sm text-red-500 mt-2">
                  {errors.documents.message}
                </p>
              )}
            </div>

            {/* Liste des fichiers uploadés */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <Label>Fichiers téléchargés :</Label>
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-sand-light rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>

      {/* Récapitulatif et soumission */}
      <HandDrawnCard>
        <HandDrawnCardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 text-artisan-yellow mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  En cliquant sur &quot;Soumettre mon offre&quot;, votre offre
                  sera enregistrée et envoyée à l&apos;organisation.
                </p>
                {tender.mode === "ANONYMOUS" && (
                  <p className="text-muted-foreground mt-2">
                    <strong>Mode anonyme :</strong> Votre identité sera masquée
                    jusqu&apos;à la date limite de l&apos;appel d&apos;offre.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Soumettre mon offre
                </>
              )}
            </Button>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    </form>
  );
}
