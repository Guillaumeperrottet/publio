"use client";

import { toast } from "sonner";
import {
  toastSuccess,
  toastError,
  handleError,
} from "@/lib/utils/toast-messages";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TenderStep1ModeChoice } from "./create-tender-steps/step1-mode-choice";
import { TenderStep1 } from "./create-tender-steps/step1-basic-info";
import { TenderStep2 } from "./create-tender-steps/step2-details";
import { TenderStep3 } from "./create-tender-steps/step3-location";
import { TenderStep4 as TenderStep4Media } from "./create-tender-steps/step4-media";
import { TenderStep4 as TenderStep5Lots } from "./create-tender-steps/step4-lots-criteria";
import { TenderStep5 as TenderStep6Conditions } from "./create-tender-steps/step5-delays-conditions";
import { TenderStep6 as TenderStep7Parameters } from "./create-tender-steps/step6-parameters";
import { TenderStep7 as TenderStep8Review } from "./create-tender-steps/step7-review";
import {
  createTenderWithPayment,
  saveDraftTender,
  updateDraftTenderComplete,
  publishTenderWithPayment,
} from "@/features/tenders/payment-actions";
import { type CFCCategory } from "@/lib/constants/cfc-codes";

const STEPS = [
  { number: 1, title: "Mode", description: "Publication" },
  { number: 2, title: "Informations", description: "Titre et description" },
  { number: 3, title: "Détails", description: "Marché et budget" },
  { number: 4, title: "Localisation", description: "Lieu du projet" },
  { number: 5, title: "Photos", description: "Documents" },
  { number: 6, title: "Lots & Critères", description: "Organisation" },
  { number: 7, title: "Conditions", description: "Participation" },
  { number: 8, title: "Paramètres", description: "Visibilité" },
  { number: 9, title: "Vérification", description: "Relecture" },
];

interface CreateTenderStepperProps {
  organizationId: string;
  existingTender?: {
    id: string;
    title: string;
    summary: string | null;
    description: string;
    currentSituation: string | null;
    mode: string;
    cfcCodes: string[];
    budget: number | null;
    showBudget: boolean;
    surfaceM2: number | null;
    volumeM3: number | null;
    constraints: string[];
    contractDuration: number | null;
    contractStartDate: Date | null;
    isRenewable: boolean;
    deadline: Date;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    canton: string | null;
    country: string;
    location: string | null;
    images: Array<{ url: string; name: string; type: string }>;
    pdfs: Array<{ url: string; name: string; type: string }>;
    hasLots: boolean;
    lots: Array<{
      number: number;
      title: string;
      description: string;
      budget: number | null;
    }>;
    criteria: Array<{
      name: string;
      description: string | null;
      weight: number;
      order: number;
    }>;
    questionDeadline: Date | null;
    participationConditions: string[];
    requiredDocuments: string[];
    requiresReferences: boolean;
    requiresInsurance: boolean;
    minExperience: string | null;
    contractualTerms: string[];
    procedure: string;
    allowPartialOffers: boolean;
    visibility: string;
    selectionPriorities: string[];
  };
}

export function CreateTenderStepper({
  organizationId,
  existingTender,
}: CreateTenderStepperProps) {
  const router = useRouter();
  const isEditMode = !!existingTender;
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(isEditMode ? 9 : 1); // En mode édition, toutes les étapes sont accessibles
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // État du formulaire (pré-rempli si mode édition)
  const [formData, setFormData] = useState({
    // Step 1
    title: existingTender?.title || "",
    summary: existingTender?.summary || "",
    description: existingTender?.description || "",
    currentSituation: existingTender?.currentSituation || "",

    // Step 2
    cfcCategory: undefined as CFCCategory | undefined,
    cfcCodes: existingTender?.cfcCodes || ([] as string[]),
    budget: existingTender?.budget?.toString() || "",
    showBudget: existingTender?.showBudget || false,
    surfaceM2: existingTender?.surfaceM2?.toString() || "",
    volumeM3: existingTender?.volumeM3?.toString() || "",
    contractDuration: existingTender?.contractDuration?.toString() || "",
    contractStartDate: existingTender?.contractStartDate
      ? new Date(existingTender.contractStartDate).toISOString().split("T")[0]
      : "",
    isRenewable: existingTender?.isRenewable || false,
    deadline: existingTender?.deadline
      ? new Date(existingTender.deadline).toISOString().slice(0, 16)
      : "",
    constraints: existingTender?.constraints || ([] as string[]),

    // Step 3
    address: existingTender?.address || "",
    city: existingTender?.city || "",
    postalCode: existingTender?.postalCode || "",
    canton: existingTender?.canton || "",
    country: existingTender?.country || "Suisse",
    location: existingTender?.location || "",

    // Step 4 - Media
    images: (existingTender?.images || []) as Array<{
      url: string;
      name: string;
      type: "image";
    }>,
    pdfs: (existingTender?.pdfs || []) as Array<{
      url: string;
      name: string;
      type: "pdf";
    }>,

    // Step 5 - Lots & Criteria
    hasLots: existingTender?.hasLots || false,
    lots:
      existingTender?.lots?.map((lot) => ({
        number: lot.number,
        title: lot.title,
        description: lot.description,
        budget: lot.budget?.toString() || "",
      })) ||
      ([] as Array<{
        number: number;
        title: string;
        description: string;
        budget: string;
      }>),
    criteria:
      existingTender?.criteria?.map((c) => ({
        id: `${c.name}-${c.order}`,
        name: c.name,
        description: c.description || "",
        weight: c.weight,
      })) ||
      ([] as Array<{
        id: string;
        name: string;
        description: string;
        weight: number;
      }>),

    // Step 6 - Delays & Conditions
    questionDeadline: existingTender?.questionDeadline
      ? new Date(existingTender.questionDeadline).toISOString().slice(0, 16)
      : "",
    participationConditions:
      existingTender?.participationConditions || ([] as string[]),
    requiredDocuments: existingTender?.requiredDocuments || ([] as string[]),
    requiresReferences: existingTender?.requiresReferences || false,
    requiresInsurance: existingTender?.requiresInsurance || false,
    minExperience: existingTender?.minExperience || "",
    contractualTerms: existingTender?.contractualTerms || ([] as string[]),

    // Step 7 - Parameters
    procedure: existingTender?.procedure || "OPEN",
    allowPartialOffers: existingTender?.allowPartialOffers ?? true,
    visibility: existingTender?.visibility || "PUBLIC",
    mode: existingTender?.mode || "CLASSIC",
    selectionPriorities:
      existingTender?.selectionPriorities || (["QUALITY_PRICE"] as string[]),
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
        // Step 1: Mode choice - toujours OK
        return true;
      case 2:
        return (
          formData.title.length >= 15 && formData.description.length >= 150
        );
      case 3:
        return formData.cfcCategory && formData.deadline;
      case 4:
        return (
          formData.address &&
          formData.postalCode &&
          formData.city &&
          formData.canton
        );
      case 5:
        // Media is optional
        return true;
      case 6:
        // Lots optional, Criteria must total 100% if present
        if (formData.criteria.length > 0) {
          const total = formData.criteria.reduce((sum, c) => sum + c.weight, 0);
          return total === 100;
        }
        return true;
      case 7:
        return true; // Tous les champs sont optionnels
      case 8:
        return (
          formData.procedure &&
          formData.visibility &&
          formData.selectionPriorities &&
          formData.selectionPriorities.length > 0
        );
      case 9:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed() || currentStep >= 9) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    // Mettre à jour l'étape maximale atteinte
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStep <= 1) return;
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (stepNumber: number) => {
    // Permettre de cliquer sur toutes les étapes jusqu'à l'étape maximale atteinte
    if (stepNumber <= maxStepReached) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // En mode édition, on update puis on publie
      if (isEditMode && existingTender) {
        await updateDraftTenderComplete({
          id: existingTender.id,
          ...getFormDataForSubmission(),
        });

        const { url } = await publishTenderWithPayment(existingTender.id);
        window.location.href = url;
        return;
      }

      // Mode création normal
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
        postalCode: formData.postalCode || undefined,
        canton: formData.canton || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,

        // Step 4 - Media
        images: formData.images.length > 0 ? formData.images : undefined,
        pdfs: formData.pdfs.length > 0 ? formData.pdfs : undefined,

        // Step 5 - Lots & Criteria
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

        // Step 7 - Parameters
        procedure: "OPEN", // Toujours en procédure ouverte pour PME/particuliers
        allowPartialOffers: formData.allowPartialOffers,
        visibility: formData.visibility,
        mode: formData.mode,
        selectionPriorities: formData.selectionPriorities,
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
      handleError(error, "createTender");
      setIsSubmitting(false);
    }
  };

  const getFormDataForSubmission = () => ({
    title: formData.title,
    summary: formData.summary || undefined,
    description: formData.description,
    currentSituation: formData.currentSituation || undefined,
    cfcCategory: formData.cfcCategory,
    cfcCodes: formData.cfcCodes.length > 0 ? formData.cfcCodes : undefined,
    budget: formData.budget ? parseFloat(formData.budget) : undefined,
    showBudget: formData.showBudget,
    surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : undefined,
    volumeM3: formData.volumeM3 ? parseFloat(formData.volumeM3) : undefined,
    constraints:
      formData.constraints.length > 0 ? formData.constraints : undefined,
    contractDuration: formData.contractDuration || undefined,
    contractStartDate: formData.contractStartDate || undefined,
    isRenewable: formData.isRenewable,
    deadline: new Date(formData.deadline),
    address: formData.address || undefined,
    city: formData.city || undefined,
    postalCode: formData.postalCode || undefined,
    canton: formData.canton || undefined,
    location: formData.location || undefined,
    country: formData.country || "CH",
    images: formData.images.length > 0 ? formData.images : undefined,
    pdfs: formData.pdfs.length > 0 ? formData.pdfs : undefined,
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
    questionDeadline: formData.questionDeadline || undefined,
    participationConditions: formData.participationConditions || undefined,
    requiredDocuments: formData.requiredDocuments || undefined,
    requiresReferences: formData.requiresReferences,
    requiresInsurance: formData.requiresInsurance,
    minExperience: formData.minExperience || undefined,
    contractualTerms: formData.contractualTerms || undefined,
    procedure: "OPEN",
    allowPartialOffers: formData.allowPartialOffers,
    visibility: formData.visibility,
    mode: formData.mode,
    selectionPriorities: formData.selectionPriorities,
    isSimpleMode: true,
  });

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);

      // En mode édition, on update
      if (isEditMode && existingTender) {
        await updateDraftTenderComplete({
          id: existingTender.id,
          ...getFormDataForSubmission(),
        });

        toastSuccess.saved();
        router.refresh();
        setIsSavingDraft(false);
        return;
      }

      // Mode création normal
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
        postalCode: formData.postalCode || undefined,
        canton: formData.canton || undefined,
        location: formData.location || undefined,
        country: formData.country || "CH",

        // Step 4 - Media
        images: formData.images.length > 0 ? formData.images : undefined,
        pdfs: formData.pdfs.length > 0 ? formData.pdfs : undefined,

        // Step 5 - Lots
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

        // Step 6 - Conditions
        questionDeadline: formData.questionDeadline || undefined,
        participationConditions: formData.participationConditions || undefined,
        requiredDocuments: formData.requiredDocuments || undefined,
        requiresReferences: formData.requiresReferences,
        requiresInsurance: formData.requiresInsurance,
        minExperience: formData.minExperience || undefined,
        contractualTerms: formData.contractualTerms || undefined,

        // Step 7 - Parameters
        procedure: "OPEN",
        allowPartialOffers: formData.allowPartialOffers,
        visibility: formData.visibility,
        mode: formData.mode,
        selectionPriorities: formData.selectionPriorities,
        isSimpleMode: true,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Rediriger vers le dashboard des tenders avec toast de succès
      toastSuccess.saved();
      router.push("/dashboard/tenders");
    } catch (error) {
      handleError(error, "saveDraftTender");
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
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    disabled={step.number > maxStepReached}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all",
                      currentStep > step.number
                        ? "bg-green-500 border-green-500 text-white cursor-pointer hover:bg-green-600"
                        : currentStep === step.number
                        ? "bg-artisan-yellow border-artisan-yellow text-matte-black"
                        : step.number <= maxStepReached
                        ? "bg-white border-artisan-yellow text-artisan-yellow cursor-pointer hover:bg-artisan-yellow hover:text-matte-black"
                        : "bg-white border-gray-300 text-gray-400 cursor-not-allowed",
                      step.number < currentStep && "hover:scale-110"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <div className="mt-2 text-center hidden md:block">
                    <button
                      type="button"
                      onClick={() => handleStepClick(step.number)}
                      disabled={step.number > maxStepReached}
                      className={cn(
                        "text-xs font-semibold transition-colors",
                        step.number <= maxStepReached
                          ? "text-matte-black hover:text-artisan-yellow cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {step.title}
                    </button>
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
            <TenderStep1ModeChoice
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <TenderStep1 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <TenderStep2 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <TenderStep3 formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <TenderStep4Media
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 6 && (
            <TenderStep5Lots
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 7 && (
            <TenderStep6Conditions
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 8 && (
            <TenderStep7Parameters
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 9 && <TenderStep8Review formData={formData} />}
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
            {currentStep < 9 ? (
              <>
                <LoadingButton
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={!formData.title}
                  loading={isSavingDraft}
                  className="gap-2"
                >
                  Sauvegarder en brouillon
                </LoadingButton>
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
                <LoadingButton
                  variant="outline"
                  onClick={handleSaveDraft}
                  loading={isSavingDraft}
                  className="gap-2"
                >
                  Sauvegarder en brouillon
                </LoadingButton>
                <LoadingButton
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  loading={isSubmitting}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Procéder au paiement (CHF 10.–)
                </LoadingButton>
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
