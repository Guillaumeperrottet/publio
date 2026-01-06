"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileDown,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TenderTemplateProfessional } from "./tender-template-professional";
import { generateTenderPDF, type TenderData } from "@/lib/pdf/tender-generator";
import {
  saveDraftTender,
  publishTenderWithPayment,
  updateDraftTenderComplete,
} from "@/features/tenders/payment-actions";
import { toast } from "sonner";
import { toastError, handleError } from "@/lib/utils/toast-messages";

const SIMPLE_STEPS = [
  {
    number: 1,
    title: "Votre Projet",
    description: "Décrivez votre besoin",
  },
  {
    number: 2,
    title: "Localisation & Budget",
    description: "Où et combien",
  },
  {
    number: 3,
    title: "Révision & Publication",
    description: "Vérification finale",
  },
];

const CANTONS_SUISSES = [
  { value: "AG", label: "Argovie (AG)" },
  { value: "AI", label: "Appenzell Rhodes-Intérieures (AI)" },
  { value: "AR", label: "Appenzell Rhodes-Extérieures (AR)" },
  { value: "BE", label: "Berne (BE)" },
  { value: "BL", label: "Bâle-Campagne (BL)" },
  { value: "BS", label: "Bâle-Ville (BS)" },
  { value: "FR", label: "Fribourg (FR)" },
  { value: "GE", label: "Genève (GE)" },
  { value: "GL", label: "Glaris (GL)" },
  { value: "GR", label: "Grisons (GR)" },
  { value: "JU", label: "Jura (JU)" },
  { value: "LU", label: "Lucerne (LU)" },
  { value: "NE", label: "Neuchâtel (NE)" },
  { value: "NW", label: "Nidwald (NW)" },
  { value: "OW", label: "Obwald (OW)" },
  { value: "SG", label: "Saint-Gall (SG)" },
  { value: "SH", label: "Schaffhouse (SH)" },
  { value: "SO", label: "Soleure (SO)" },
  { value: "SZ", label: "Schwytz (SZ)" },
  { value: "TG", label: "Thurgovie (TG)" },
  { value: "TI", label: "Tessin (TI)" },
  { value: "UR", label: "Uri (UR)" },
  { value: "VD", label: "Vaud (VD)" },
  { value: "VS", label: "Valais (VS)" },
  { value: "ZG", label: "Zoug (ZG)" },
  { value: "ZH", label: "Zurich (ZH)" },
];

interface SimpleTenderStepperProps {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
    address?: string | null;
    city?: string | null;
    canton?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
  existingTender?: {
    id: string;
    title: string;
    description: string;
    currentSituation: string | null;
    budget: number | null;
    showBudget: boolean;
    deadline: Date;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    canton: string | null;
    mode: string;
    visibility: string;
    images?: Array<{ url: string; name: string; type: "image" }>;
    pdfs?: Array<{ url: string; name: string; type: "pdf" }>;
  };
}

export function SimpleTenderStepper({
  organizationId,
  organization,
  existingTender,
}: SimpleTenderStepperProps) {
  const router = useRouter();
  const isEditMode = !!existingTender;
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(isEditMode ? 3 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ url: string; name: string; type: "image" }>
  >(existingTender?.images || []);
  const [uploadedPdfs, setUploadedPdfs] = useState<
    Array<{ url: string; name: string; type: "pdf" }>
  >(existingTender?.pdfs || []);

  // État du formulaire simplifié (seulement les champs essentiels)
  const [formData, setFormData] = useState({
    // Étape 1 : Informations essentielles
    title: existingTender?.title || "",
    description: existingTender?.description || "",
    currentSituation: existingTender?.currentSituation || "",

    // Étape 2 : Localisation & Budget
    address: existingTender?.address || "",
    city: existingTender?.city || "",
    postalCode: existingTender?.postalCode || "",
    canton: existingTender?.canton || "",
    budget: existingTender?.budget?.toString() || "",
    showBudget: existingTender?.showBudget ?? true,
    deadline: existingTender?.deadline
      ? new Date(existingTender.deadline).toISOString().slice(0, 16)
      : "",

    // Paramètres (pré-remplis pour mode simple)
    mode: existingTender?.mode || "CLASSIC",
    visibility: existingTender?.visibility || "PUBLIC",
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title.length >= 15 && formData.description.length >= 100
        );
      case 2:
        return (
          formData.address &&
          formData.postalCode &&
          formData.city &&
          formData.canton &&
          formData.deadline
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const goToStep = (stepNumber: number) => {
    // Permet de naviguer uniquement vers les étapes déjà visitées
    if (stepNumber <= maxStepReached && stepNumber >= 1 && stepNumber <= 3) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImage(true);

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} n'est pas une image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 5MB`);
          continue;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file: base64, folder: "tenders" }),
            });

            if (!response.ok) throw new Error("Upload failed");

            const { url } = await response.json();
            setUploadedImages((prev) => [
              ...prev,
              { url, name: file.name, type: "image" },
            ]);
            toast.success(`${file.name} uploadé`);
          } catch {
            toast.error(`Erreur upload ${file.name}`);
          }
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingPdf(true);

      for (const file of Array.from(files)) {
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} n'est pas un PDF`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 10MB`);
          continue;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file: base64, folder: "tenders" }),
            });

            if (!response.ok) throw new Error("Upload failed");

            const { url } = await response.json();
            setUploadedPdfs((prev) => [
              ...prev,
              { url, name: file.name, type: "pdf" },
            ]);
            toast.success(`${file.name} uploadé`);
          } catch {
            toast.error(`Erreur upload ${file.name}`);
          }
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removePdf = (index: number) => {
    setUploadedPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!formData.title) {
      toast.error("Le titre est requis pour sauvegarder un brouillon");
      return;
    }

    try {
      setIsSavingDraft(true);

      const draftData = {
        ...formData,
        organizationId,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline
          ? new Date(formData.deadline)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        country: "Suisse",
        hasLots: false,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        pdfs: uploadedPdfs.length > 0 ? uploadedPdfs : undefined,
        isSimpleMode: true,
        // Champs requis par l'API mais avec valeurs par défaut
        selectionPriorities: ["QUALITY_PRICE"],
        procedure: "OPEN",
        allowPartialOffers: true,
      };

      if (isEditMode && existingTender) {
        const updateData = {
          ...draftData,
          id: existingTender.id,
        };
        const result = await updateDraftTenderComplete(updateData);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Brouillon mis à jour");
      } else {
        const result = await saveDraftTender(draftData);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Brouillon sauvegardé");
      }

      router.push("/dashboard/tenders");
      router.refresh(); // Force le refresh de la page pour récupérer les nouveaux tenders
    } catch (error) {
      handleError(error, "saveDraft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfData: TenderData = {
        title: formData.title,
        summary: "",
        description: formData.description,
        currentSituation: formData.currentSituation || undefined,
        organization: {
          name: organization.name,
          logo: organization.logo,
          address: organization.address,
          city: organization.city,
          canton: organization.canton,
          phone: organization.phone,
          email: organization.email,
          website: organization.website,
        },
        cfcCodes: [],
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        showBudget: formData.showBudget,
        currency: "CHF",
        constraints: [],
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        canton: formData.canton,
        country: "Suisse",
        deadline: formData.deadline
          ? new Date(formData.deadline)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(),
        selectionPriorities: ["QUALITY_PRICE"],
        participationConditions: [],
        requiredDocuments: [],
        requiresReferences: false,
        requiresInsurance: false,
        minExperience: "",
        mode: formData.mode as "CLASSIC" | "ANONYMOUS",
        visibility: formData.visibility as "PUBLIC" | "PRIVATE",
        procedure: "OPEN",
        allowPartialOffers: true,
      };

      await generateTenderPDF(pdfData);
      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      handleError(error, "downloadPDF");
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    try {
      setIsSubmitting(true);

      let tenderId: string;

      if (isEditMode && existingTender) {
        // Mode édition : mettre à jour le brouillon existant
        const updateData = {
          ...formData,
          id: existingTender.id,
          organizationId,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          deadline: formData.deadline
            ? new Date(formData.deadline)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          country: "Suisse",
          hasLots: false,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          pdfs: uploadedPdfs.length > 0 ? uploadedPdfs : undefined,
          isSimpleMode: true,
          selectionPriorities: ["QUALITY_PRICE"],
          procedure: "OPEN",
          allowPartialOffers: true,
        };

        const updateResult = await updateDraftTenderComplete(updateData);

        if (updateResult.error) {
          toastError.generic(updateResult.error);
          return;
        }

        tenderId = existingTender.id;
      } else {
        // Mode création : créer un nouveau brouillon
        const draftData = {
          ...formData,
          organizationId,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          deadline: formData.deadline
            ? new Date(formData.deadline)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          country: "Suisse",
          hasLots: false,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          pdfs: uploadedPdfs.length > 0 ? uploadedPdfs : undefined,
          isSimpleMode: true,
          selectionPriorities: ["QUALITY_PRICE"],
          procedure: "OPEN",
          allowPartialOffers: true,
        };

        const createResult = await saveDraftTender(draftData);

        if (createResult.error) {
          toastError.generic(createResult.error);
          return;
        }

        if (!createResult.tenderId) {
          toastError.generic("Erreur lors de la création du brouillon");
          return;
        }

        tenderId = createResult.tenderId;
      }

      // Puis publier avec paiement
      if (tenderId) {
        const result = await publishTenderWithPayment(tenderId);
        if (result.url) {
          // Rediriger vers Stripe pour paiement
          window.location.href = result.url;
        }
      }
    } catch (error) {
      handleError(error, "publishTender");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-white">
      {/* Progress Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {SIMPLE_STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <button
                    onClick={() => goToStep(step.number)}
                    disabled={step.number > maxStepReached}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      currentStep === step.number
                        ? "bg-artisan-yellow text-matte-black scale-110"
                        : currentStep > step.number
                        ? "bg-green-500 text-white hover:scale-105"
                        : step.number <= maxStepReached
                        ? "bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed",
                      step.number <= maxStepReached && "cursor-pointer"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <div className="ml-3 hidden sm:block">
                    <div className="text-sm font-bold">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>

                {index < SIMPLE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4 transition-all",
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          {/* ÉTAPE 1 : Votre Projet */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Décrivez votre projet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Soyez clair et précis pour attirer les bons professionnels
                </p>
              </div>

              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Titre du projet *
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Minimum 15 caractères
                </p>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Ex: Rénovation complète de cuisine 15m²"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length} / 15 caractères minimum
                </p>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Description détaillée *
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Plus vous êtes précis, meilleures seront les offres (minimum
                  100 caractères)
                </p>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData({ description: e.target.value })
                  }
                  rows={12}
                  placeholder="Décrivez votre projet en détail :&#10;- Type de travaux souhaités&#10;- Matériaux spécifiques&#10;- Contraintes particulières&#10;- Délais souhaités&#10;- Budget approximatif"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length} / 100 caractères minimum
                </p>
              </div>

              <div className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50">
                <Label
                  htmlFor="currentSituation"
                  className="text-base font-semibold"
                >
                  Situation actuelle (recommandé)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Décrivez l&apos;état existant pour éviter les surprises
                </p>
                <Textarea
                  id="currentSituation"
                  value={formData.currentSituation}
                  onChange={(e) =>
                    updateFormData({ currentSituation: e.target.value })
                  }
                  rows={4}
                  placeholder="Ex: Cuisine actuelle de 1995, meubles fatigués, plomberie à refaire..."
                  className="text-base"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Localisation & Budget */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Localisation et budget
                </h2>
                <p className="text-sm text-muted-foreground">
                  Où se situe le projet et quel est votre budget
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      updateFormData({ address: e.target.value })
                    }
                    placeholder="Rue et numéro"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      updateFormData({ postalCode: e.target.value })
                    }
                    placeholder="Ex: 1003"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="Ex: Lausanne"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="canton">Canton *</Label>
                  <select
                    id="canton"
                    value={formData.canton}
                    onChange={(e) => updateFormData({ canton: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Sélectionnez un canton</option>
                    {CANTONS_SUISSES.map((canton) => (
                      <option key={canton.value} value={canton.value}>
                        {canton.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget indicatif (CHF)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Optionnel mais aide à recevoir des offres adaptées
                    </p>
                    <Input
                      id="budget"
                      type="number"
                      step="1000"
                      value={formData.budget}
                      onChange={(e) =>
                        updateFormData({ budget: e.target.value })
                      }
                      placeholder="Ex: 25000"
                    />
                    {formData.budget && (
                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={formData.showBudget}
                          onChange={(e) =>
                            updateFormData({ showBudget: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Afficher publiquement</span>
                      </label>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deadline">
                      Date limite de soumission *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Quand souhaitez-vous recevoir les offres ?
                    </p>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        updateFormData({ deadline: e.target.value })
                      }
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-5 bg-purple-50">
                <Label className="text-base font-semibold">
                  Mode de publication
                </Label>
                <div className="mt-3 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="CLASSIC"
                      checked={formData.mode === "CLASSIC"}
                      onChange={(e) => updateFormData({ mode: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold">Mode Classique</div>
                      <div className="text-sm text-muted-foreground">
                        Votre identité est visible dès la publication
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="ANONYMOUS"
                      checked={formData.mode === "ANONYMOUS"}
                      onChange={(e) => updateFormData({ mode: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold">Mode Anonyme</div>
                      <div className="text-sm text-muted-foreground">
                        Votre identité reste masquée jusqu&apos;à la deadline
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section Upload Images */}
              <div className="border-t pt-6 mt-6">
                <Label className="text-base font-semibold mb-3 block">
                  Images du projet (optionnel)
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez des photos pour illustrer votre projet (max 5MB par
                  image)
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingImage
                      ? "Upload en cours..."
                      : "Ajouter des images"}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={img.url}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {img.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Upload Documents */}
              <div className="border-t pt-6 mt-6">
                <Label className="text-base font-semibold mb-3 block">
                  Documents (optionnel)
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez des plans, devis ou autres documents PDF (max 10MB par
                  fichier)
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="pdf-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {isUploadingPdf
                      ? "Upload en cours..."
                      : "Ajouter des documents"}
                  </label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handlePdfUpload}
                    disabled={isUploadingPdf}
                    className="hidden"
                  />
                </div>

                {uploadedPdfs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedPdfs.map((pdf, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {pdf.name}
                            </p>
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Voir le document
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => removePdf(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Révision & Publication */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Vérification finale
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Relisez votre appel d&apos;offres avant publication
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="gap-2"
                  disabled={!formData.title || !formData.description}
                >
                  <FileDown className="w-4 h-4" />
                  Télécharger PDF
                </Button>
              </div>

              {/* Résumé des informations clés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📍</span>
                    <h3 className="font-semibold">Localisation</h3>
                  </div>
                  <p className="text-sm">
                    {formData.city || "Non spécifié"},{" "}
                    {formData.canton
                      ? CANTONS_SUISSES.find((c) => c.value === formData.canton)
                          ?.label
                      : "Non spécifié"}
                  </p>
                  {formData.address && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.address}
                    </p>
                  )}
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💰</span>
                    <h3 className="font-semibold">Budget</h3>
                  </div>
                  <p className="text-sm">
                    {formData.budget
                      ? `CHF ${parseFloat(formData.budget).toLocaleString(
                          "fr-CH"
                        )}`
                      : "Non spécifié"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.showBudget ? "Visible publiquement" : "Masqué"}
                  </p>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⏰</span>
                    <h3 className="font-semibold">Deadline</h3>
                  </div>
                  <p className="text-sm">
                    {formData.deadline
                      ? new Date(formData.deadline).toLocaleDateString(
                          "fr-CH",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Non spécifié (30 jours par défaut)"}
                  </p>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔒</span>
                    <h3 className="font-semibold">Mode de publication</h3>
                  </div>
                  <p className="text-sm">
                    {formData.mode === "CLASSIC"
                      ? "Classique (identité visible)"
                      : "Anonyme (identité masquée)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.visibility === "PUBLIC" ? "Public" : "Privé"}
                  </p>
                </div>
              </div>

              {/* Fichiers joints */}
              {(uploadedImages.length > 0 || uploadedPdfs.length > 0) && (
                <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📎</span>
                    <h3 className="font-semibold">Fichiers joints</h3>
                  </div>
                  <div className="flex gap-4 text-sm">
                    {uploadedImages.length > 0 && (
                      <span className="flex items-center gap-1">
                        🖼️ {uploadedImages.length} image
                        {uploadedImages.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {uploadedPdfs.length > 0 && (
                      <span className="flex items-center gap-1">
                        📄 {uploadedPdfs.length} document
                        {uploadedPdfs.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Preview du PDF */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Aperçu du document
                </h3>
                <TenderTemplateProfessional
                  formData={formData}
                  organization={organization}
                />
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <div className="font-bold mb-2">💡 Avant de publier</div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Vérifiez que toutes les informations sont correctes</li>
                  <li>
                    La publication coûte <strong>CHF 10.–</strong>
                  </li>
                  <li>
                    Vous recevrez les offres par email et dans votre dashboard
                  </li>
                  <li>
                    Votre appel d&apos;offres sera visible publiquement sur
                    Publio
                  </li>
                </ul>
              </div>
            </div>
          )}
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
            {currentStep < 3 ? (
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
