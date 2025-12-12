"use client";

import { toast } from "sonner";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TenderStep1 } from "./create-tender-steps/step1-basic-info";
import { TenderStep2 } from "./create-tender-steps/step2-details";
import { TenderStep3 } from "./create-tender-steps/step3-location";
import { TenderStep4 } from "./create-tender-steps/step4-lots-criteria";
import { TenderStep5 } from "./create-tender-steps/step5-delays-conditions";
import { TenderStep6 } from "./create-tender-steps/step6-parameters";
import { TenderStep7 } from "./create-tender-steps/step7-review";
import { createTenderWithPayment } from "@/features/tenders/payment-actions";
import { saveDraftTender } from "@/features/tenders/payment-actions";
import { type CFCCategory } from "@/lib/constants/cfc-codes";

const STEPS = [
  { number: 1, title: "Informations", description: "Titre et description" },
  { number: 2, title: "Détails", description: "Marché et budget" },
  { number: 3, title: "Localisation", description: "Lieu du projet" },
  { number: 4, title: "Lots & Critères", description: "Organisation" },
  { number: 5, title: "Conditions", description: "Participation" },
  { number: 6, title: "Paramètres", description: "Publication" },
  { number: 7, title: "Vérification", description: "Relecture" },
];

interface CreateTenderStepperProps {
  organizationId: string;
}

export function CreateTenderStepper({
  organizationId,
}: CreateTenderStepperProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    // Step 1
    title: "",
    summary: "",
    description: "",
    currentSituation: "",

    // Step 2
    cfcCategory: undefined as CFCCategory | undefined,
    cfcCodes: [] as string[],
    budget: "",
    showBudget: false,
    surfaceM2: "",
    volumeM3: "",
    contractDuration: "",
    contractStartDate: "",
    isRenewable: false,
    deadline: "",
    constraints: [] as string[],

    // Step 3
    address: "",
    city: "",
    canton: "",
    country: "Suisse",
    location: "",

    // Step 4 - Lots & Criteria
    hasLots: false,
    lots: [] as Array<{
      number: number;
      title: string;
      description: string;
      budget: string;
    }>,
    criteria: [] as Array<{
      id: string;
      name: string;
      description: string;
      weight: number;
    }>,

    // Step 5 - Delays & Conditions
    questionDeadline: "",
    participationConditions: "",
    requiredDocuments: "",
    requiresReferences: false,
    requiresInsurance: false,
    minExperience: "",
    contractualTerms: "",

    // Step 6 - Parameters
    procedure: "OPEN",
    allowPartialOffers: true,
    visibility: "PUBLIC",
    mode: "CLASSIC",
    selectionPriority: "QUALITY_PRICE",
    isSimpleMode: true,

    // Documents
    documents: [] as Array<{
      name: string;
      url: string;
      size: number;
      mimeType: string;
    }>,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title.length >= 15 && formData.description.length >= 150
        );
      case 2:
        return formData.cfcCategory && formData.deadline;
      case 3:
        return formData.city && formData.canton;
      case 4:
        // Lots optional, Criteria must total 100% if present
        if (formData.criteria.length > 0) {
          const total = formData.criteria.reduce((sum, c) => sum + c.weight, 0);
          return total === 100;
        }
        return true;
      case 5:
        return true; // Tous les champs sont optionnels
      case 6:
        return (
          formData.procedure &&
          formData.visibility &&
          formData.mode &&
          formData.selectionPriority
        );
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed() || currentStep >= 7) return;
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStep <= 1) return;
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createTenderWithPayment({
        organizationId,
        // Step 1
        title: formData.title,
        summary: formData.summary || undefined,
        description: formData.description,
        currentSituation: formData.currentSituation || undefined,

        // Step 2
        cfcCategory: formData.cfcCategory,
        cfcCodes: formData.cfcCodes.length > 0 ? formData.cfcCodes : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        showBudget: formData.showBudget,
        surfaceM2: formData.surfaceM2
          ? parseFloat(formData.surfaceM2)
          : undefined,
        volumeM3: formData.volumeM3 ? parseFloat(formData.volumeM3) : undefined,
        constraints:
          formData.constraints.length > 0 ? formData.constraints : undefined,
        contractDuration: formData.contractDuration || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        isRenewable: formData.isRenewable,
        deadline: new Date(formData.deadline),

        // Step 3
        address: formData.address || undefined,
        city: formData.city || undefined,
        canton: formData.canton || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,

        // Step 4 - Lots & Criteria
        hasLots: formData.hasLots,
        lots: formData.lots.length > 0 ? formData.lots : undefined,
        criteria:
          formData.criteria.length > 0
            ? formData.criteria.map((c, index) => ({
                ...c,
                order: index + 1,
              }))
            : undefined,

        // Step 5 - Delays & Conditions
        questionDeadline: formData.questionDeadline || undefined,
        participationConditions: formData.participationConditions || undefined,
        requiredDocuments: formData.requiredDocuments || undefined,
        requiresReferences: formData.requiresReferences,
        requiresInsurance: formData.requiresInsurance,
        minExperience: formData.minExperience || undefined,
        contractualTerms: formData.contractualTerms || undefined,

        // Step 6 - Parameters
        procedure: "OPEN", // Toujours en procédure ouverte pour PME/particuliers
        allowPartialOffers: formData.allowPartialOffers,
        visibility: formData.visibility,
        mode: formData.mode,
        selectionPriority: formData.selectionPriority,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Rediriger vers Stripe Checkout pour payer la publication
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("URL de paiement non disponible");
      }
    } catch (error) {
      console.error("Error creating tender:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de l'appel d'offres"
      );
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);

      const result = await saveDraftTender({
        organizationId,

        // Step 1
        title: formData.title,
        summary: formData.summary || undefined,
        description: formData.description,
        currentSituation: formData.currentSituation || undefined,

        // Step 2
        cfcCategory: formData.cfcCategory,
        cfcCodes: formData.cfcCodes.length > 0 ? formData.cfcCodes : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        showBudget: formData.showBudget,
        surfaceM2: formData.surfaceM2
          ? parseFloat(formData.surfaceM2)
          : undefined,
        volumeM3: formData.volumeM3 ? parseFloat(formData.volumeM3) : undefined,
        constraints:
          formData.constraints.length > 0 ? formData.constraints : undefined,
        contractDuration: formData.contractDuration || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        isRenewable: formData.isRenewable,
        deadline: formData.deadline ? new Date(formData.deadline) : new Date(),

        // Step 3
        address: formData.address || undefined,
        city: formData.city || undefined,
        canton: formData.canton || undefined,
        location: formData.location || undefined,
        country: formData.country || "CH",

        // Step 4
        hasLots: formData.hasLots,
        lots:
          formData.lots.length > 0
            ? formData.lots.map((lot) => ({
                number: lot.number,
                title: lot.title,
                description: lot.description,
                budget: lot.budget || undefined,
              }))
            : undefined,
        criteria:
          formData.criteria.length > 0
            ? formData.criteria.map((c, index) => ({
                name: c.name,
                description: c.description || "",
                weight: c.weight,
                order: index + 1,
              }))
            : undefined,

        // Step 5
        questionDeadline: formData.questionDeadline || undefined,
        participationConditions: formData.participationConditions || undefined,
        requiredDocuments: formData.requiredDocuments || undefined,
        requiresReferences: formData.requiresReferences,
        requiresInsurance: formData.requiresInsurance,
        minExperience: formData.minExperience || undefined,
        contractualTerms: formData.contractualTerms || undefined,

        // Step 6
        procedure: "OPEN",
        allowPartialOffers: formData.allowPartialOffers,
        visibility: formData.visibility,
        mode: formData.mode,
        selectionPriority: formData.selectionPriority,
        isSimpleMode: true,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Rediriger vers la page d'édition du brouillon
      router.push(`/dashboard/tenders/${result.tenderId}/edit`);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la sauvegarde du brouillon"
      );
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Stepper Header - Style AutoScout24 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all",
                      currentStep > step.number
                        ? "bg-green-500 border-green-500 text-white"
                        : currentStep === step.number
                        ? "bg-artisan-yellow border-artisan-yellow text-matte-black"
                        : "bg-white border-gray-300 text-gray-400"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <div
                      className={cn(
                        "text-xs font-semibold",
                        currentStep >= step.number
                          ? "text-matte-black"
                          : "text-gray-400"
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all",
                      currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          {currentStep === 1 && (
            <TenderStep1 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <TenderStep2 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <TenderStep3 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <TenderStep4 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <TenderStep5 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 6 && (
            <TenderStep6 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 7 && <TenderStep7 formData={formData} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </Button>

          <div className="flex gap-3">
            {currentStep < 7 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || !formData.title}
                  className="gap-2"
                >
                  {isSavingDraft ? "Sauvegarde..." : "Sauvegarder en brouillon"}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="gap-2"
                >
                  {isSavingDraft ? "Sauvegarde..." : "Sauvegarder en brouillon"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    "Création..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Procéder au paiement (CHF 10.–)
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/tenders")}
            className="text-sm text-muted-foreground"
          >
            Annuler et retourner au dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
