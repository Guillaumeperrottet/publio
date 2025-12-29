"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { saveDraftOffer, submitOffer } from "@/features/offers/actions";
import { toastSuccess, handleError } from "@/lib/utils/toast-messages";
import { OfferTemplateProfessional } from "./offer-template-professional";
import { Step2Documents } from "./submit-offer-steps/step2-documents";
import { Step3Review } from "./submit-offer-steps/step3-review";

export interface OfferLineItem {
  position: number;
  description: string;
  quantity?: number;
  unit?: string;
  priceHT: number;
  tvaRate: number;
}

export interface OfferInclusion {
  position: number;
  description: string;
}

export interface OfferExclusion {
  position: number;
  description: string;
}

export interface OfferMaterial {
  position: number;
  name: string;
  brand?: string;
  model?: string;
  range?: string;
  manufacturerWarranty?: string;
}

export interface OfferFormData {
  // Étape 1
  offerNumber?: string;
  validityDays: number;
  usesTenderDeadline?: boolean; // Pour tracker si on utilise la deadline du tender
  projectSummary: string;

  // Contact et coordonnées
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationWebsite?: string;

  // Étape 2
  inclusions: OfferInclusion[];
  exclusions: OfferExclusion[];
  materials: OfferMaterial[];
  description: string;
  methodology?: string;

  // Étape 3
  priceType: "GLOBAL" | "DETAILED";
  price: number; // TTC
  totalHT?: number;
  totalTVA?: number;
  tvaRate: number;
  discount?: number; // Rabais en pourcentage
  lineItems: OfferLineItem[];

  // Étape 4
  timeline?: string;
  startDate?: string;
  durationDays?: number;
  constraints?: string;
  paymentTerms?: {
    deposit?: number;
    intermediate?: number;
    final?: number;
    netDays?: number;
  };
  warrantyYears?: number;
  insuranceAmount?: number;
  manufacturerWarranty?: string;
  references?: string;

  // Étape 5
  documents?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

interface SubmitOfferStepperProps {
  tender: {
    id: string;
    title: string;
    mode: string;
    currency: string;
    description: string;
    budget?: number;
    deadline: Date;
    organization: {
      name: string;
      address?: string | null;
      city?: string | null;
    };
  };
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  userId: string;
  existingOffer?: {
    id: string;
    offerNumber?: string | null;
    validityDays: number;
    projectSummary: string;
    [key: string]: unknown;
  };
}

const STEPS = [
  {
    number: 1,
    title: "Établissement de l'offre",
    subtitle: "Complétez tous les champs",
  },
  { number: 2, title: "Documents", subtitle: "Images, plans, certifications" },
  {
    number: 3,
    title: "Révision & Envoi",
    subtitle: "Vérification finale",
  },
];

export function SubmitOfferStepper({
  tender,
  organization,
  existingOffer,
}: SubmitOfferStepperProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftOfferId, setDraftOfferId] = useState<string | undefined>(
    existingOffer?.id
  );

  const [formData, setFormData] = useState<OfferFormData>({
    offerNumber: existingOffer?.offerNumber || "",
    validityDays: existingOffer?.validityDays || 60,
    usesTenderDeadline: (existingOffer?.usesTenderDeadline as boolean) || false,
    projectSummary: existingOffer?.projectSummary || "",
    contactPerson: (existingOffer?.contactPerson as string) || "",
    contactEmail: (existingOffer?.contactEmail as string) || "",
    contactPhone: (existingOffer?.contactPhone as string) || "",
    organizationAddress: (existingOffer?.organizationAddress as string) || "",
    organizationCity: (existingOffer?.organizationCity as string) || "",
    organizationPhone: (existingOffer?.organizationPhone as string) || "",
    organizationEmail: (existingOffer?.organizationEmail as string) || "",
    organizationWebsite: (existingOffer?.organizationWebsite as string) || "",
    inclusions: (existingOffer?.inclusions as OfferInclusion[]) || [],
    exclusions: (existingOffer?.exclusions as OfferExclusion[]) || [],
    materials: (existingOffer?.materials as OfferMaterial[]) || [],
    description: (existingOffer?.description as string) || "",
    methodology: (existingOffer?.methodology as string) || "",
    priceType: (existingOffer?.priceType as "GLOBAL" | "DETAILED") || "GLOBAL",
    price: (existingOffer?.price as number) || 0,
    totalHT: (existingOffer?.totalHT as number) || undefined,
    totalTVA: (existingOffer?.totalTVA as number) || undefined,
    tvaRate: (existingOffer?.tvaRate as number) || 7.7,
    discount: (existingOffer?.discount as number) || undefined,
    lineItems: (existingOffer?.lineItems as OfferLineItem[]) || [],
    timeline: (existingOffer?.timeline as string) || "",
    startDate: existingOffer?.startDate
      ? new Date(existingOffer.startDate as Date).toISOString().split("T")[0]
      : undefined,
    durationDays: (existingOffer?.durationDays as number) || undefined,
    constraints: (existingOffer?.constraints as string) || "",
    paymentTerms:
      (existingOffer?.paymentTerms as OfferFormData["paymentTerms"]) ||
      undefined,
    warrantyYears: (existingOffer?.warrantyYears as number) || undefined,
    insuranceAmount: (existingOffer?.insuranceAmount as number) || undefined,
    manufacturerWarranty: (existingOffer?.manufacturerWarranty as string) || "",
    references: (existingOffer?.references as string) || "",
    documents: (existingOffer?.documents as OfferFormData["documents"]) || [],
  });

  // Auto-save brouillon toutes les 30 secondes
  useEffect(() => {
    const handleSaveDraft = async () => {
      setIsSaving(true);
      try {
        const result = await saveDraftOffer({
          offerId: draftOfferId,
          tenderId: tender.id,
          organizationId: organization.id,
          formData,
        });

        if (result.error) {
          console.error("Error saving draft:", result.error);
        } else {
          setLastSaved(new Date());
          // Conserver l'ID du brouillon créé pour les futures sauvegardes
          if (result.offerId && !draftOfferId) {
            setDraftOfferId(result.offerId);
          }
        }
      } catch (error) {
        console.error("Error saving draft:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const interval = setInterval(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender.id, organization.id]); // Retirer formData et draftOfferId des deps

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const result = await saveDraftOffer({
        offerId: draftOfferId,
        tenderId: tender.id,
        organizationId: organization.id,
        formData,
      });

      if (result.error) {
        handleError(new Error(result.error), "saveDraftOffer");
      } else {
        setLastSaved(new Date());
        // Conserver l'ID du brouillon créé pour les futures sauvegardes
        if (result.offerId && !draftOfferId) {
          setDraftOfferId(result.offerId);
        }
        toastSuccess.saved();
      }
    } catch (error) {
      handleError(error, "saveDraftOffer");
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<OfferFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.projectSummary.length >= 50;
      case 2:
        // Étape 2 (documents) est optionnelle
        return true;
      case 3:
        // Étape 3 (révision) - vérifier que les données essentielles sont présentes
        return (
          formData.projectSummary.length >= 50 &&
          formData.lineItems.length > 0 &&
          formData.price > 0
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!draftOfferId) {
      handleError(
        new Error("Veuillez d'abord sauvegarder l'offre"),
        "submitOffer"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await submitOffer({
        tenderId: tender.id,
        organizationId: organization.id,
        formData,
      });

      if (result.error) {
        handleError(new Error(result.error), "submitOffer");
        return;
      }

      if (result.offerId) {
        // Rediriger vers la page de succès avec confettis
        router.push(
          `/tenders/${tender.id}/submit/success?offerId=${result.offerId}`
        );
      }
    } catch (error) {
      handleError(error, "submitOffer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPreview = async () => {
    if (!draftOfferId) {
      handleError(
        new Error("Veuillez d'abord sauvegarder l'offre"),
        "downloadPreview"
      );
      return;
    }
    try {
      // Download via API route instead
      window.open(`/api/offers/${draftOfferId}/pdf`, "_blank");
    } catch (error) {
      handleError(error, "downloadPreview");
    }
  };

  return (
    <div className="space-y-8">
      {/* Indicateur d'étapes */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Numéro de l'étape */}
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-artisan-yellow border-artisan-yellow text-matte-black shadow-lg scale-110"
                        : isCompleted
                        ? "bg-deep-green border-deep-green text-white hover:scale-105"
                        : "bg-white border-gray-300 text-gray-600 hover:border-artisan-yellow hover:text-artisan-yellow"
                    }`}
                  >
                    {step.number}
                  </button>

                  {/* Titre et sous-titre */}
                  <div className="mt-2 text-center hidden md:block">
                    <div
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? "text-artisan-yellow"
                          : isCompleted
                          ? "text-deep-green"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.subtitle}
                    </div>
                  </div>
                </div>

                {/* Ligne de connexion */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-all ${
                      currentStep > step.number
                        ? "bg-deep-green"
                        : "bg-gray-300"
                    }`}
                    style={{ transform: "translateY(-50%)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status de sauvegarde */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Save className="w-4 h-4" />
          {isSaving ? (
            <span>Sauvegarde en cours...</span>
          ) : lastSaved ? (
            <span>
              Dernière sauvegarde : {lastSaved.toLocaleTimeString("fr-CH")}
            </span>
          ) : (
            <span>Brouillon non sauvegardé</span>
          )}
        </div>
        <LoadingButton
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          loading={isSaving}
        >
          Sauvegarder maintenant
        </LoadingButton>
      </div>

      {/* Contenu de l'étape */}
      {currentStep === 1 ? (
        <div>
          <OfferTemplateProfessional
            formData={formData}
            updateFormData={updateFormData}
            organization={organization}
            tender={tender}
          />

          {/* Navigation pour étape 1 */}
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <div></div>
            <div className="flex gap-3">
              <LoadingButton
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                loading={isSaving}
              >
                Sauvegarder
              </LoadingButton>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-artisan-yellow hover:bg-artisan-yellow/90"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne formulaire (2/3) */}
          <div className="lg:col-span-2">
            {/* Contenu de l'étape */}
            <div className="min-h-[500px]">
              {currentStep === 2 && (
                <Step2Documents
                  documents={formData.documents || []}
                  onDocumentsChange={(docs) =>
                    updateFormData({ documents: docs })
                  }
                />
              )}
              {currentStep === 3 && (
                <Step3Review
                  formData={formData}
                  tender={tender}
                  organization={organization}
                  onDownloadPreview={handleDownloadPreview}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              <div className="flex gap-3">
                <LoadingButton
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                >
                  Enregistrer
                </LoadingButton>

                {currentStep < STEPS.length ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-artisan-yellow hover:bg-artisan-yellow/90"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <LoadingButton
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    loading={isSubmitting}
                    className="bg-deep-green hover:bg-deep-green/90 text-white font-bold text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Soumettre l&apos;offre
                  </LoadingButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
