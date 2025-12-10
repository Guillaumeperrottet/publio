"use client";

import { useState, useEffect } from "react";
import { OfferStep1 } from "./submit-offer-steps/step1-info";
import { OfferStep2 } from "./submit-offer-steps/step2-prestations";
import { OfferStep3 } from "./submit-offer-steps/step3-prix";
import { OfferStep4 } from "./submit-offer-steps/step4-delais-paiement";
import { OfferStep5 } from "./submit-offer-steps/step5-review";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { saveDraftOffer } from "@/features/offers/actions";

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
  projectSummary: string;

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
  };
  organization: {
    id: string;
    name: string;
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
  { number: 1, title: "Informations", subtitle: "Référence & validité" },
  { number: 2, title: "Prestations", subtitle: "Ce qui est inclus/exclu" },
  { number: 3, title: "Prix", subtitle: "Décomposition tarifaire" },
  { number: 4, title: "Délais & Paiement", subtitle: "Planning & conditions" },
  { number: 5, title: "Révision", subtitle: "Vérification finale" },
];

export function SubmitOfferStepper({
  tender,
  organization,
  existingOffer,
}: SubmitOfferStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState<OfferFormData>({
    offerNumber: existingOffer?.offerNumber || "",
    validityDays: existingOffer?.validityDays || 60,
    projectSummary: existingOffer?.projectSummary || "",
    inclusions: [],
    exclusions: [],
    materials: [],
    description: "",
    methodology: "",
    priceType: "GLOBAL",
    price: 0,
    totalHT: undefined,
    totalTVA: undefined,
    tvaRate: 7.7,
    lineItems: [],
    timeline: "",
    startDate: undefined,
    durationDays: undefined,
    constraints: "",
    paymentTerms: undefined,
    warrantyYears: undefined,
    insuranceAmount: undefined,
    manufacturerWarranty: "",
    references: "",
    documents: [],
  });

  // Auto-save brouillon toutes les 30 secondes
  useEffect(() => {
    const handleSaveDraft = async () => {
      setIsSaving(true);
      try {
        await saveDraftOffer({
          offerId: existingOffer?.id,
          tenderId: tender.id,
          organizationId: organization.id,
          formData,
        });
        setLastSaved(new Date());
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
  }, [formData, existingOffer?.id, tender.id, organization.id]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraftOffer({
        offerId: existingOffer?.id,
        tenderId: tender.id,
        organizationId: organization.id,
        formData,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving draft:", error);
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
        return (
          formData.inclusions.length > 0 && formData.description.length >= 50
        );
      case 3:
        if (formData.priceType === "GLOBAL") {
          return formData.price > 0;
        } else {
          return (
            formData.lineItems.length > 0 &&
            formData.totalHT &&
            formData.totalHT > 0
          );
        }
      case 4:
        return formData.durationDays && formData.durationDays > 0;
      case 5:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-8">
      {/* Indicateur d'étapes */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Numéro de l'étape */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold transition-all ${
                    currentStep === step.number
                      ? "bg-artisan-yellow border-artisan-yellow text-matte-black shadow-lg scale-110"
                      : currentStep > step.number
                      ? "bg-deep-green border-deep-green text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step.number}
                </div>

                {/* Titre et sous-titre */}
                <div className="mt-2 text-center hidden md:block">
                  <div
                    className={`text-sm font-semibold ${
                      currentStep === step.number
                        ? "text-artisan-yellow"
                        : currentStep > step.number
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
                    currentStep > step.number ? "bg-deep-green" : "bg-gray-300"
                  }`}
                  style={{ transform: "translateY(-50%)" }}
                />
              )}
            </div>
          ))}
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          Sauvegarder maintenant
        </Button>
      </div>

      {/* Contenu de l'étape */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <OfferStep1
            formData={formData}
            updateFormData={updateFormData}
            tender={tender}
          />
        )}
        {currentStep === 2 && (
          <OfferStep2
            formData={formData}
            updateFormData={updateFormData}
            tender={tender}
          />
        )}
        {currentStep === 3 && (
          <OfferStep3
            formData={formData}
            updateFormData={updateFormData}
            tender={tender}
          />
        )}
        {currentStep === 4 && (
          <OfferStep4
            formData={formData}
            updateFormData={updateFormData}
            tender={tender}
          />
        )}
        {currentStep === 5 && (
          <OfferStep5
            formData={formData}
            updateFormData={updateFormData}
            tender={tender}
            organization={organization}
            onBack={previousStep}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="text-sm text-muted-foreground">
            Étape {currentStep} sur {STEPS.length}
          </div>

          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="bg-artisan-yellow hover:bg-artisan-yellow/90"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
