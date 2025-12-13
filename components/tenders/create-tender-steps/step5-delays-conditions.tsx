"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagSelector } from "@/components/ui/tag-selector";
import { FileText, Calendar, ShieldCheck } from "lucide-react";
import {
  PARTICIPATION_CONDITIONS_SUGGESTIONS,
  REQUIRED_DOCUMENTS_SUGGESTIONS,
  CONTRACTUAL_TERMS_SUGGESTIONS,
  EXPERIENCE_SUGGESTIONS,
} from "@/lib/constants/participation-suggestions";

interface TenderStep5Props {
  formData: {
    deadline: string; // Deadline de soumission (Step 2)
    questionDeadline: string;
    participationConditions: string[];
    requiredDocuments: string[];
    requiresReferences: boolean;
    requiresInsurance: boolean;
    minExperience: string;
    contractualTerms: string[];
  };
  updateFormData: (data: Partial<TenderStep5Props["formData"]>) => void;
}

export function TenderStep5({ formData, updateFormData }: TenderStep5Props) {
  // Calculer la date max pour les questions (1 jour avant la deadline de soumission minimum)
  const getMaxQuestionDate = () => {
    if (!formData.deadline) return undefined;
    const submissionDeadline = new Date(formData.deadline);
    // Retirer 1 jour pour laisser du temps aux réponses
    submissionDeadline.setDate(submissionDeadline.getDate() - 1);
    return submissionDeadline.toISOString().slice(0, 16);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            Délais et conditions de participation
          </h2>
          <p className="text-sm text-muted-foreground">
            Définissez les conditions et documents requis pour participer
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Deadline for questions */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-artisan-yellow" />
            <h3 className="font-semibold">Délai pour les questions</h3>
          </div>
          <Label htmlFor="questionDeadline">
            Date limite pour poser des questions (optionnel)
          </Label>
          <Input
            id="questionDeadline"
            type="datetime-local"
            value={formData.questionDeadline}
            onChange={(e) =>
              updateFormData({ questionDeadline: e.target.value })
            }
            max={getMaxQuestionDate()}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Les soumissionnaires pourront poser des questions jusqu&apos;à cette
            date (au moins 1 jour avant la deadline de soumission)
          </p>
          {formData.questionDeadline &&
            formData.deadline &&
            new Date(formData.questionDeadline) >=
              new Date(formData.deadline) && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ⚠️ La date limite des questions doit être avant la deadline de
                soumission
              </p>
            )}
        </div>

        {/* Participation conditions */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-artisan-yellow" />
            <h3 className="font-semibold">Conditions de participation</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="participationConditions">
                Conditions générales (optionnel)
              </Label>
              <TagSelector
                value={formData.participationConditions}
                onChange={(tags) =>
                  updateFormData({ participationConditions: tags })
                }
                suggestions={PARTICIPATION_CONDITIONS_SUGGESTIONS}
                placeholder="Sélectionnez ou ajoutez des conditions..."
                allowCustom={true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ex: Autorisation d&apos;exploitation valide, inscription au
                registre du commerce...
              </p>
            </div>

            <div>
              <Label htmlFor="minExperience">
                Expérience minimale requise (optionnel)
              </Label>
              <TagSelector
                value={formData.minExperience ? [formData.minExperience] : []}
                onChange={(tags) =>
                  updateFormData({ minExperience: tags[0] || "" })
                }
                suggestions={EXPERIENCE_SUGGESTIONS}
                placeholder="Sélectionnez l'expérience requise..."
                maxTags={1}
                allowCustom={true}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresReferences}
                  onChange={(e) =>
                    updateFormData({ requiresReferences: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Références requises</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresInsurance}
                  onChange={(e) =>
                    updateFormData({ requiresInsurance: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Assurance RC obligatoire</span>
              </label>
            </div>
          </div>
        </div>

        {/* Required documents */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Documents requis</h3>
          <Label htmlFor="requiredDocuments">
            Liste des documents à fournir avec l&apos;offre (optionnel)
          </Label>
          <TagSelector
            value={formData.requiredDocuments}
            onChange={(tags) => updateFormData({ requiredDocuments: tags })}
            suggestions={REQUIRED_DOCUMENTS_SUGGESTIONS}
            placeholder="Sélectionnez ou ajoutez des documents..."
            allowCustom={true}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ex: Extrait du registre du commerce, Attestation AVS/AI, Références
            de projets similaires...
          </p>
        </div>

        {/* Contractual terms */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Conditions contractuelles</h3>
          <Label htmlFor="contractualTerms">
            Termes et conditions du contrat (optionnel)
          </Label>
          <TagSelector
            value={formData.contractualTerms}
            onChange={(tags) => updateFormData({ contractualTerms: tags })}
            suggestions={CONTRACTUAL_TERMS_SUGGESTIONS}
            placeholder="Sélectionnez ou ajoutez des conditions..."
            allowCustom={true}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ex: Modalités de paiement, garanties, pénalités de retard...
          </p>
        </div>
      </div>
    </div>
  );
}
