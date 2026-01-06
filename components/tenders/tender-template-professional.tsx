"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { updateOrganization } from "@/features/organizations/actions";
import { handleError, toastSuccess } from "@/lib/utils/toast-messages";

interface TenderFormData {
  title: string;
  summary?: string;
  description: string;
  currentSituation?: string;
  cfcCategory?: string;
  cfcCodes?: string[];
  budget?: string;
  showBudget?: boolean;
  surfaceM2?: string;
  volumeM3?: string;
  constraints?: string[];
  contractDuration?: string;
  contractStartDate?: string;
  deadline?: string;
  questionDeadline?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  canton?: string;
  country?: string;
  location?: string;
  selectionPriorities?: string[];
  participationConditions?: string[];
  requiredDocuments?: string[];
  requiresReferences?: boolean;
  requiresInsurance?: boolean;
  minExperience?: string;
  mode?: string;
  visibility?: string;
  procedure?: string;
  allowPartialOffers?: boolean;
}

interface TenderTemplateProps {
  formData: TenderFormData;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
    address?: string | null;
    city?: string | null;
    canton?: string | null;
    postalCode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
}

const PROCEDURE_LABELS: Record<string, string> = {
  OPEN: "Procédure ouverte",
  SELECTIVE: "Procédure sélective",
  PRIVATE: "Procédure de gré à gré",
};

const SELECTION_PRIORITY_LABELS: Record<string, string> = {
  LOWEST_PRICE: "Prix le plus bas",
  QUALITY_PRICE: "Meilleur rapport qualité/prix",
  FASTEST_DELIVERY: "Délais les plus rapides",
  BEST_REFERENCES: "Bonnes références",
  ECO_FRIENDLY: "Matériaux écologiques/durables",
};

const CFC_CATEGORY_LABELS: Record<string, string> = {
  BUILDING_SHELL: "🏗️ Gros œuvre et enveloppe",
  TECHNICAL_INSTALLATIONS: "⚙️ Installations techniques",
  INTERIOR_FINISHES: "🎨 Aménagements intérieurs",
  OUTDOOR_WORKS: "🌳 Aménagements extérieurs",
  SPECIALIZED_WORKS: "🔧 Travaux spécialisés",
};

export function TenderTemplateProfessional({
  formData,
  organization,
}: TenderTemplateProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(organization.logo || null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
    }).format(num);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      handleError(new Error("Le logo ne doit pas dépasser 5MB"), "logoUpload");
      return;
    }

    if (!file.type.startsWith("image/")) {
      handleError(new Error("Veuillez sélectionner une image"), "logoUpload");
      return;
    }

    try {
      setIsUploadingLogo(true);

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

          await updateOrganization(organization.id, { logo: url });

          setLogoUrl(url);
          toastSuccess.saved();
        } catch (err) {
          handleError(err, "logoUpload");
        } finally {
          setIsUploadingLogo(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      handleError(err, "logoUpload");
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateOrganization(organization.id, { logo: "" });
      setLogoUrl(null);
      toastSuccess.saved();
    } catch (err) {
      handleError(err, "removeLogo");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* En-tête avec logos */}
      <div className="bg-white p-8 border-b">
        <div className="flex justify-between items-start">
          {/* Logo uploadable */}
          <div className="relative group">
            {logoUrl ? (
              <div className="relative w-48 h-16 border-2 border-gray-200 rounded overflow-hidden">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="w-48 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-xs text-gray-400 cursor-pointer hover:border-artisan-yellow hover:text-artisan-yellow transition-colors">
                <Upload className="w-5 h-5 mb-1" />
                {isUploadingLogo ? "Upload..." : "Insérer votre logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
              </label>
            )}
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Image
                src="/logo/logo_nobackground.png"
                alt="Publio"
                width={120}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="font-bold text-lg">{organization.name}</div>
            <div className="text-xs text-muted-foreground">
              {organization.address && <div>{organization.address}</div>}
              {(organization.postalCode || organization.city) && (
                <div>
                  {organization.postalCode} {organization.city}
                  {organization.canton && `, ${organization.canton}`}
                </div>
              )}
              {organization.phone && <div>{organization.phone}</div>}
              {organization.email && (
                <div className="text-blue-600">{organization.email}</div>
              )}
              {organization.website && (
                <div className="text-blue-600">{organization.website}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Corps du document */}
      <div className="p-8 space-y-6">
        {/* Titre */}
        <div>
          <div className="text-sm font-bold text-blue-800 mb-2">
            APPEL D&apos;OFFRES
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {formData.title || "Titre de l'appel d'offres"}
          </h1>
          {formData.summary && (
            <p className="text-sm text-gray-600 italic">{formData.summary}</p>
          )}
        </div>

        {/* Informations clés */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date limite de soumission:
              </div>
              <div className="text-red-600 font-bold">
                {formData.deadline
                  ? formatDateTime(formData.deadline)
                  : "Non spécifié"}
              </div>
            </div>
            {formData.questionDeadline && (
              <div>
                <div className="font-bold">Date limite pour questions:</div>
                <div>{formatDateTime(formData.questionDeadline)}</div>
              </div>
            )}
            <div>
              <div className="font-bold">Procédure:</div>
              <div>
                {formData.procedure
                  ? PROCEDURE_LABELS[formData.procedure] || formData.procedure
                  : "Ouverte"}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            1. Description du projet
          </h2>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {formData.description || "Description du projet..."}
          </div>

          {formData.currentSituation && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="font-bold text-sm mb-2">Situation actuelle</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {formData.currentSituation}
              </div>
            </div>
          )}
        </div>

        {/* Détails techniques */}
        <div>
          <h2 className="text-lg font-bold text-blue-800 mb-3">
            2. Détails techniques
          </h2>
          <div className="space-y-2 text-sm">
            {formData.cfcCategory && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">
                  Catégorie de travaux:
                </span>
                <span>
                  {CFC_CATEGORY_LABELS[formData.cfcCategory] ||
                    formData.cfcCategory}
                </span>
              </div>
            )}
            {formData.cfcCodes && formData.cfcCodes.length > 0 && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">Codes CFC:</span>
                <div className="flex flex-wrap gap-1">
                  {formData.cfcCodes.map((code) => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {formData.budget && formData.showBudget && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">
                  Budget indicatif:
                </span>
                <span>{formatCurrency(formData.budget)}</span>
              </div>
            )}
            {formData.surfaceM2 && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">Surface:</span>
                <span>{formData.surfaceM2} m²</span>
              </div>
            )}
            {formData.volumeM3 && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">Volume:</span>
                <span>{formData.volumeM3} m³</span>
              </div>
            )}
            {formData.contractDuration && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">
                  Durée du contrat:
                </span>
                <span>{formData.contractDuration} jours</span>
              </div>
            )}
            {formData.contractStartDate && (
              <div className="flex gap-2">
                <span className="font-bold min-w-[200px]">
                  Date de début souhaitée:
                </span>
                <span>{formatDate(formData.contractStartDate)}</span>
              </div>
            )}
          </div>

          {formData.constraints && formData.constraints.length > 0 && (
            <div className="mt-4">
              <div className="font-bold text-sm mb-2">
                Contraintes du chantier
              </div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {formData.constraints.map((constraint, idx) => (
                  <li key={idx}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Localisation */}
        <div>
          <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            3. Localisation du projet
          </h2>
          <div className="text-sm space-y-1">
            {formData.address && <div>{formData.address}</div>}
            {(formData.postalCode || formData.city) && (
              <div>
                {formData.postalCode} {formData.city}
              </div>
            )}
            {formData.canton && <div>{formData.canton}</div>}
            {formData.country && <div>{formData.country}</div>}
            {formData.location && (
              <div className="italic text-gray-600 mt-2">
                Lieu d&apos;exécution: {formData.location}
              </div>
            )}
          </div>
        </div>

        {/* Critères de sélection */}
        {formData.selectionPriorities &&
          formData.selectionPriorities.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-blue-800 mb-3">
                4. Critères de sélection
              </h2>
              <p className="text-sm mb-2">
                Les offres seront évaluées selon les critères suivants (par
                ordre de priorité):
              </p>
              <ol className="list-decimal list-inside text-sm space-y-1">
                {formData.selectionPriorities.map((priority, idx) => (
                  <li key={idx}>
                    {SELECTION_PRIORITY_LABELS[priority] || priority}
                  </li>
                ))}
              </ol>
            </div>
          )}

        {/* Conditions de participation */}
        <div>
          <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            5. Conditions de participation
          </h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            {formData.requiresReferences && (
              <li>Références de projets similaires requises</li>
            )}
            {formData.requiresInsurance && (
              <li>
                Assurance responsabilité civile professionnelle obligatoire
              </li>
            )}
            {formData.minExperience && (
              <li>Expérience minimale: {formData.minExperience}</li>
            )}
            {formData.participationConditions &&
              formData.participationConditions.map((condition, idx) => (
                <li key={idx}>{condition}</li>
              ))}
            {!formData.requiresReferences &&
              !formData.requiresInsurance &&
              !formData.minExperience &&
              (!formData.participationConditions ||
                formData.participationConditions.length === 0) && (
                <li>Aucune condition spécifique</li>
              )}
          </ul>

          {formData.requiredDocuments &&
            formData.requiredDocuments.length > 0 && (
              <div className="mt-4">
                <div className="font-bold text-sm mb-2">Documents requis</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {formData.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Modalités de soumission */}
        <div>
          <h2 className="text-lg font-bold text-blue-800 mb-3">
            6. Modalités de soumission
          </h2>
          <div className="text-sm space-y-2">
            <p>
              Les offres doivent être soumises{" "}
              <span className="font-bold">
                exclusivement via la plateforme Publio
              </span>{" "}
              avant la date limite mentionnée ci-dessus.
            </p>
            <p>
              Mode de soumission:{" "}
              {formData.mode === "ANONYMOUS"
                ? "Anonyme (identité masquée jusqu'à la deadline)"
                : "Classique (identité visible)"}
            </p>
            {formData.allowPartialOffers && (
              <p className="text-green-600 font-bold">
                ✓ Offres partielles autorisées
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="bg-gray-50 p-6 border-t text-center">
        <div className="text-xs text-gray-500">
          Plateforme de mise en concurrence professionnelle
        </div>
        <div className="text-sm font-bold text-blue-600 mt-1">
          www.publio.ch
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Document généré le {new Date().toLocaleDateString("fr-CH")}
        </div>
      </div>
    </div>
  );
}
