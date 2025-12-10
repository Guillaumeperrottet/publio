"use client";

import { useState } from "react";
import { OfferFormData } from "../submit-offer-stepper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import {
  CheckCircle2,
  Euro,
  Clock,
  CreditCard,
  Shield,
  Upload,
  FileText,
  Loader2,
  Send,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { submitOffer } from "@/features/offers/actions";
import { useRouter } from "next/navigation";

interface OfferStep5Props {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
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
  onBack: () => void;
}

export function OfferStep5({
  formData,
  tender,
  organization,
  updateFormData,
  onBack,
}: OfferStep5Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validation
        if (file.type !== "application/pdf") {
          throw new Error(`${file.name}: Seuls les fichiers PDF sont acceptés`);
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name}: Le fichier ne doit pas dépasser 10MB`);
        }

        // Upload vers Cloudinary via API route
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`${file.name}: Erreur lors de l'upload`);
        }

        const data = await response.json();

        return {
          name: file.name,
          url: data.url,
          size: file.size,
          mimeType: file.type,
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      updateFormData({
        documents: [...(formData.documents || []), ...uploadedDocs],
      });
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
    const updated = formData.documents?.filter((_, i) => i !== index);
    updateFormData({ documents: updated });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitOffer({
        tenderId: tender.id,
        organizationId: organization.id,
        formData,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Rediriger vers la page de succès
      if (result.success) {
        router.push(`/dashboard/offers?success=true&offerId=${result.offerId}`);
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Vérification finale</h2>
          <p className="text-sm text-muted-foreground">
            Relisez votre offre avant soumission
          </p>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-sand-light/30 border-2 border-artisan-yellow rounded-lg p-6 space-y-6">
        {/* Informations générales */}
        <div>
          <h3 className="text-xl font-bold text-matte-black mb-3">
            {tender.title}
          </h3>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>
              <strong>Organisation :</strong> {organization.name}
            </p>
            {formData.offerNumber && (
              <p>
                <strong>Référence :</strong> {formData.offerNumber}
              </p>
            )}
            <p>
              <strong>Validité :</strong> {formData.validityDays} jours
            </p>
          </div>
        </div>

        <Separator />

        {/* Compréhension du projet */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            💡 Compréhension du projet
          </h4>
          <p className="text-sm text-muted-foreground">
            {formData.projectSummary}
          </p>
        </div>

        <Separator />

        {/* Prestations */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Prestations incluses ({formData.inclusions.length})
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {formData.inclusions.map((inc, i) => (
              <li key={i}>• {inc.description}</li>
            ))}
          </ul>
        </div>

        {formData.exclusions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                Prestations NON incluses ({formData.exclusions.length})
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {formData.exclusions.map((exc, i) => (
                  <li key={i}>• {exc.description}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {formData.materials.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">
                Matériaux proposés ({formData.materials.length})
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {formData.materials.map((mat, i) => (
                  <li key={i}>
                    • {mat.name}
                    {mat.brand && ` - ${mat.brand}`}
                    {mat.model && ` ${mat.model}`}
                    {mat.range && ` (${mat.range})`}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Separator />

        {/* Prix */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Prix de l&apos;offre
          </h4>
          {formData.priceType === "GLOBAL" ? (
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-deep-green">
                {new Intl.NumberFormat("fr-CH", {
                  style: "currency",
                  currency: tender.currency,
                }).format(formData.price)}
              </div>
              <div className="text-sm text-muted-foreground">
                Prix forfaitaire global TTC
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.lineItems.map((item, i) => (
                <div key={i} className="text-sm flex justify-between">
                  <span>{item.description}</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                    }).format(item.priceHT * (1 + item.tvaRate / 100))}
                  </span>
                </div>
              ))}
              <div className="bg-white rounded p-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Total HT</span>
                  <span>
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                    }).format(formData.totalHT || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total TVA</span>
                  <span>
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                    }).format(formData.totalTVA || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                  <span>Total TTC</span>
                  <span className="text-deep-green">
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                    }).format(formData.price)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Délais */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Planning
          </h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            {formData.startDate && (
              <p>
                <strong>Début possible :</strong>{" "}
                {new Date(formData.startDate).toLocaleDateString("fr-CH")}
              </p>
            )}
            {formData.durationDays && (
              <p>
                <strong>Durée :</strong> {formData.durationDays} jours
              </p>
            )}
            {formData.timeline && (
              <p>
                <strong>Délai :</strong> {formData.timeline}
              </p>
            )}
          </div>
        </div>

        {/* Conditions de paiement */}
        {formData.paymentTerms && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Conditions de paiement
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                {formData.paymentTerms.deposit && (
                  <p>• Acompte : {formData.paymentTerms.deposit}%</p>
                )}
                {formData.paymentTerms.intermediate && (
                  <p>
                    • Paiement intermédiaire :{" "}
                    {formData.paymentTerms.intermediate}%
                  </p>
                )}
                {formData.paymentTerms.final && (
                  <p>• Solde : {formData.paymentTerms.final}%</p>
                )}
                {formData.paymentTerms.netDays && (
                  <p>• Délai : Net {formData.paymentTerms.netDays} jours</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Garanties */}
        {(formData.warrantyYears || formData.insuranceAmount) && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Garanties
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                {formData.warrantyYears && (
                  <p>• Garantie travaux : {formData.warrantyYears} ans</p>
                )}
                {formData.insuranceAmount && (
                  <p>
                    • RC professionnelle :{" "}
                    {new Intl.NumberFormat("fr-CH", {
                      style: "currency",
                      currency: tender.currency,
                    }).format(formData.insuranceAmount)}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Documents complémentaires */}
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="font-handdrawn text-xl">
            📎 Documents complémentaires (optionnel)
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ajoutez des documents complémentaires : attestations,
              certifications, plans détaillés, etc.
            </p>

            <div>
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
                    PDF uniquement (max. 10MB par fichier)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
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

            {/* Liste des fichiers uploadés */}
            {formData.documents && formData.documents.length > 0 && (
              <div className="space-y-2">
                <Label>Fichiers ajoutés :</Label>
                {formData.documents.map((doc, index) => (
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

      {/* Soumission */}
      <HandDrawnCard>
        <HandDrawnCardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 text-artisan-yellow mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  En cliquant sur &quot;Soumettre mon offre&quot;, votre offre
                  sera enregistrée et envoyée à l&apos;organisation émettrice.
                </p>
                {tender.mode === "ANONYMOUS" && (
                  <p className="text-muted-foreground mt-2">
                    <strong>Mode anonyme :</strong> Votre identité sera masquée
                    jusqu&apos;à la date limite de l&apos;appel d&apos;offres.
                  </p>
                )}
                <p className="text-sm text-green-600 font-semibold mt-2">
                  ✓ Soumission GRATUITE - Aucun frais
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold"
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
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    </div>
  );
}
