"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { TenderStep1 } from "./create-tender-steps/step1-basic-info";
import { TenderStep2 } from "./create-tender-steps/step2-details";
import { TenderStep3 } from "./create-tender-steps/step3-location";
import { TenderStep4 } from "./create-tender-steps/step4-lots-criteria";
import { TenderStep5 } from "./create-tender-steps/step5-delays-conditions";
import { TenderStep6 } from "./create-tender-steps/step6-parameters";
import { updateDraftTender } from "@/features/tenders/actions";
import { publishTenderWithPayment } from "@/features/tenders/payment-actions";
import { type CFCCategory } from "@/lib/constants/cfc-codes";

interface EditTenderFormProps {
  tender: {
    id: string;
    title: string;
    summary: string | null;
    description: string;
    currentSituation: string | null;
    marketType: string;
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
    canton: string | null;
    country: string;
    location: string | null;
    procedure: string;
    allowPartialOffers: boolean;
    visibility: string;
    mode: string;
    selectionPriority: string;
    questionDeadline: Date | null;
    participationConditions: string | null;
    requiredDocuments: string | null;
    requiresReferences: boolean;
    requiresInsurance: boolean;
    minExperience: number | null;
    contractualTerms: string | null;
    hasLots: boolean;
    lots: Array<{
      id: string;
      number: number;
      title: string;
      description: string;
      budget: number | null;
    }>;
    criteria: Array<{
      id: string;
      name: string;
      description: string | null;
      weight: number;
      order: number;
    }>;
  };
}

export function EditTenderForm({ tender }: EditTenderFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  const [formData, setFormData] = useState({
    title: tender.title,
    summary: tender.summary || "",
    description: tender.description,
    currentSituation: tender.currentSituation || "",
    cfcCategory: undefined as CFCCategory | undefined,
    cfcCodes: tender.cfcCodes || [],
    marketType: tender.marketType,
    budget: tender.budget ? tender.budget.toString() : "",
    showBudget: tender.showBudget,
    surfaceM2: tender.surfaceM2?.toString() || "",
    volumeM3: tender.volumeM3?.toString() || "",
    constraints: tender.constraints || [],
    isSimpleMode: false,
    contractDuration: tender.contractDuration?.toString() || "",
    contractStartDate: tender.contractStartDate
      ? new Date(tender.contractStartDate).toISOString().split("T")[0]
      : "",
    isRenewable: tender.isRenewable,
    deadline: new Date(tender.deadline).toISOString().slice(0, 16),
    address: tender.address || "",
    city: tender.city || "",
    canton: tender.canton || "",
    country: tender.country,
    location: tender.location || "",
    hasLots: tender.hasLots,
    lots: tender.lots.map((lot) => ({
      number: lot.number,
      title: lot.title,
      description: lot.description,
      budget: lot.budget ? lot.budget.toString() : "",
    })),
    criteria: tender.criteria.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      weight: c.weight,
    })),
    questionDeadline: tender.questionDeadline
      ? new Date(tender.questionDeadline).toISOString().slice(0, 16)
      : "",
    participationConditions: tender.participationConditions || "",
    requiredDocuments: tender.requiredDocuments || "",
    requiresReferences: tender.requiresReferences,
    requiresInsurance: tender.requiresInsurance,
    minExperience: tender.minExperience?.toString() || "",
    contractualTerms: tender.contractualTerms || "",
    procedure: tender.procedure,
    allowPartialOffers: tender.allowPartialOffers,
    visibility: tender.visibility,
    mode: tender.mode,
    selectionPriority: tender.selectionPriority,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Validation des champs obligatoires
  const validation = useMemo(() => {
    const errors: { section: number; field: string; message: string }[] = [];

    // Section 1 - Informations de base
    if (!formData.title?.trim()) {
      errors.push({ section: 1, field: "title", message: "Titre requis" });
    }
    if (!formData.description?.trim()) {
      errors.push({
        section: 1,
        field: "description",
        message: "Description requise",
      });
    }

    // Section 2 - Détails
    if (!formData.marketType) {
      errors.push({
        section: 2,
        field: "marketType",
        message: "Type de marché requis",
      });
    }
    if (!formData.deadline) {
      errors.push({
        section: 2,
        field: "deadline",
        message: "Date limite requise",
      });
    }

    // Section 3 - Localisation
    if (!formData.city?.trim()) {
      errors.push({ section: 3, field: "city", message: "Ville requise" });
    }
    if (!formData.canton) {
      errors.push({ section: 3, field: "canton", message: "Canton requis" });
    }

    // Section 4 - Lots & Critères (optionnels)
    if (formData.hasLots && formData.lots.length === 0) {
      errors.push({
        section: 4,
        field: "lots",
        message: "Au moins un lot requis si 'Diviser en lots' est activé",
      });
    }
    // Les critères sont optionnels - pas de validation obligatoire

    // Section 6 - Paramètres
    if (!formData.visibility) {
      errors.push({
        section: 6,
        field: "visibility",
        message: "Visibilité requise",
      });
    }
    if (!formData.mode) {
      errors.push({ section: 6, field: "mode", message: "Mode requis" });
    }

    const isValid = errors.length === 0;
    const sectionsWithErrors = [...new Set(errors.map((e) => e.section))];

    return { isValid, errors, sectionsWithErrors };
  }, [formData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDraftTender({
        id: tender.id,
        title: formData.title,
        summary: formData.summary || undefined,
        description: formData.description,
        marketType: formData.marketType,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        showBudget: formData.showBudget,
        contractDuration: formData.contractDuration || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        isRenewable: formData.isRenewable,
        deadline: new Date(formData.deadline),
        address: formData.address || undefined,
        city: formData.city || undefined,
        canton: formData.canton || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,
        hasLots: formData.hasLots,
        lots: formData.lots,
        criteria: formData.criteria.map((c, index) => ({
          ...c,
          order: index + 1,
        })),
        questionDeadline: formData.questionDeadline || undefined,
        participationConditions: formData.participationConditions || undefined,
        requiredDocuments: formData.requiredDocuments || undefined,
        requiresReferences: formData.requiresReferences,
        requiresInsurance: formData.requiresInsurance,
        minExperience: formData.minExperience || undefined,
        contractualTerms: formData.contractualTerms || undefined,
        procedure: formData.procedure || undefined,
        allowPartialOffers: formData.allowPartialOffers,
        visibility: formData.visibility,
        mode: formData.mode,
      });

      router.push(`/dashboard/tenders/${tender.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating tender:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la sauvegarde"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validation.isValid) {
      alert("Veuillez remplir tous les champs obligatoires avant de publier.");
      return;
    }

    setIsPublishing(true);
    try {
      // Sauvegarder d'abord
      await updateDraftTender({
        id: tender.id,
        title: formData.title,
        summary: formData.summary || undefined,
        description: formData.description,
        marketType: formData.marketType,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        showBudget: formData.showBudget,
        contractDuration: formData.contractDuration || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        isRenewable: formData.isRenewable,
        deadline: new Date(formData.deadline),
        address: formData.address || undefined,
        city: formData.city || undefined,
        canton: formData.canton || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,
        hasLots: formData.hasLots,
        lots: formData.lots,
        criteria: formData.criteria.map((c, index) => ({
          ...c,
          order: index + 1,
        })),
        questionDeadline: formData.questionDeadline || undefined,
        participationConditions: formData.participationConditions || undefined,
        requiredDocuments: formData.requiredDocuments || undefined,
        requiresReferences: formData.requiresReferences,
        requiresInsurance: formData.requiresInsurance,
        minExperience: formData.minExperience || undefined,
        contractualTerms: formData.contractualTerms || undefined,
        procedure: formData.procedure || undefined,
        allowPartialOffers: formData.allowPartialOffers,
        visibility: formData.visibility,
        mode: formData.mode,
      });

      // Puis créer la session de paiement pour publier
      const { url } = await publishTenderWithPayment(tender.id);
      window.location.href = url;
    } catch (error) {
      console.error("Error publishing tender:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la publication"
      );
      setIsPublishing(false);
    }
  };

  const sections = [
    { number: 1, title: "Informations", component: TenderStep1 },
    { number: 2, title: "Détails", component: TenderStep2 },
    { number: 3, title: "Localisation", component: TenderStep3 },
    { number: 4, title: "Lots & Critères", component: TenderStep4 },
    { number: 5, title: "Conditions", component: TenderStep5 },
    { number: 6, title: "Paramètres", component: TenderStep6 },
  ];

  // Toutes les sections sont visibles
  const visibleSections = sections;

  const CurrentSectionComponent =
    sections.find((s) => s.number === currentSection)?.component || TenderStep1;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/tenders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-matte-black transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux appels d&apos;offres
        </Link>
        <h1 className="text-3xl font-bold">Modifier le brouillon</h1>
        <p className="text-muted-foreground mt-2">
          Modifiez votre appel d&apos;offres avant de le publier
        </p>
      </div>

      {/* Validation status */}
      {!validation.isValid && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">
                Champs manquants pour publication ({validation.errors.length})
              </h3>
              <ul className="space-y-1 text-sm text-orange-800">
                {validation.errors.map((error, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => setCurrentSection(error.section)}
                      className="hover:underline text-left"
                    >
                      Section {error.section}: {error.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validation.isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-900">
              Tous les champs obligatoires sont remplis. Vous pouvez publier
              votre appel d&apos;offres !
            </p>
          </div>
        </div>
      )}

      {/* Navigation sections */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {visibleSections.map((section) => {
            const hasError = validation.sectionsWithErrors.includes(
              section.number
            );
            return (
              <Button
                key={section.number}
                variant={
                  currentSection === section.number ? "default" : "outline"
                }
                size="sm"
                onClick={() => setCurrentSection(section.number)}
                className={hasError ? "border-orange-500 text-orange-700" : ""}
              >
                {hasError && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                {section.number}. {section.title}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white border rounded-lg p-8 mb-6">
        <CurrentSectionComponent
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/tenders">
          <Button variant="outline">Annuler</Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || isPublishing}
            variant="outline"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>

          <Button
            onClick={handlePublish}
            disabled={!validation.isValid || isSaving || isPublishing}
            size="lg"
            className="bg-linear-to-r from-artisan-yellow to-amber-400 hover:from-artisan-yellow/90 hover:to-amber-400/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isPublishing ? "Redirection..." : "Publier (CHF 10)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
