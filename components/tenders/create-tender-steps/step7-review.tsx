"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Briefcase,
  Package,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  CFC_CATEGORIES,
  type CFCCategory,
  getCFCByCode,
} from "@/lib/constants/cfc-codes";

interface TenderStep7Props {
  formData: {
    // Step 1
    title: string;
    summary: string;
    description: string;
    currentSituation: string;

    // Step 2
    cfcCategory?: CFCCategory;
    cfcCodes: string[];
    budget: string;
    showBudget: boolean;
    surfaceM2: string;
    volumeM3: string;
    constraints: string[];
    contractDuration: string;
    contractStartDate: string;
    isRenewable: boolean;
    deadline: string;

    // Step 3
    address: string;
    city: string;
    canton: string;
    country: string;
    location: string;

    // Step 4 - Media
    images: Array<{ url: string; name: string; type: "image" }>;
    pdfs: Array<{ url: string; name: string; type: "pdf" }>;

    // Step 5
    hasLots: boolean;
    lots: Array<{
      number: number;
      title: string;
      description: string;
      budget: string;
    }>;
    criteria: Array<{ name: string; description: string; weight: number }>;

    // Step 6
    questionDeadline: string;
    participationConditions: string[];
    requiredDocuments: string[];
    requiresReferences: boolean;
    requiresInsurance: boolean;
    minExperience: string;
    contractualTerms: string[];

    // Step 7
    procedure: string;
    allowPartialOffers: boolean;
    visibility: string;
    mode: string;
    selectionPriorities: string[];
  };
}

const MARKET_TYPE_LABELS: Record<string, string> = {
  CONSTRUCTION: "Construction",
  ENGINEERING: "Ingénierie",
  ARCHITECTURE: "Architecture",
  IT_SERVICES: "Services IT",
  CONSULTING: "Conseil",
  SERVICES: "Services généraux",
  SUPPLIES: "Fournitures",
  MAINTENANCE: "Maintenance",
  OTHER: "Autre",
};

const PROCEDURE_LABELS: Record<string, string> = {
  OPEN: "Procédure ouverte",
  SELECTIVE: "Procédure sélective",
  PRIVATE: "Procédure de gré à gré",
};

const SELECTION_PRIORITY_LABELS: Record<string, string> = {
  LOWEST_PRICE: "Prix le plus bas",
  QUALITY_PRICE: "Meilleur rapport qualité/prix",
  FASTEST_DELIVERY: "Délais les plus rapides",
  BEST_REFERENCES: "Entreprise avec bonnes références",
  ECO_FRIENDLY: "Matériaux écologiques/durables",
};

export function TenderStep7({ formData }: TenderStep7Props) {
  const totalCriteriaWeight = formData.criteria.reduce(
    (sum, c) => sum + c.weight,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Vérification finale</h2>
          <p className="text-sm text-muted-foreground">
            Relisez les informations avant de procéder au paiement
          </p>
        </div>
      </div>

      {/* Informations de base */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-artisan-yellow" />
          Informations générales
        </h3>
        <div className="space-y-2">
          <div>
            <div className="text-sm text-muted-foreground">Titre</div>
            <div className="font-medium">{formData.title}</div>
          </div>
          {formData.summary && (
            <div>
              <div className="text-sm text-muted-foreground">Résumé</div>
              <div className="text-sm">{formData.summary}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-muted-foreground">Description</div>
            <div className="text-sm line-clamp-3">{formData.description}</div>
          </div>
          {formData.currentSituation && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-muted-foreground font-medium">
                💡 Situation actuelle
              </div>
              <div className="text-sm mt-1">{formData.currentSituation}</div>
            </div>
          )}
        </div>
      </div>

      {/* Détails du marché */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-artisan-yellow" />
          Détails du marché
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {formData.cfcCategory && (
            <div>
              <div className="text-sm text-muted-foreground">
                Catégorie de travaux
              </div>
              <Badge variant="outline" className="gap-1">
                <span>{CFC_CATEGORIES[formData.cfcCategory].icon}</span>
                {CFC_CATEGORIES[formData.cfcCategory].label}
              </Badge>
            </div>
          )}
          {formData.cfcCodes && formData.cfcCodes.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Codes CFC sélectionnés
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cfcCodes.map((code) => {
                  const cfcInfo = getCFCByCode(code);
                  return (
                    <Badge key={code} variant="outline" className="text-sm">
                      {code} - {cfcInfo?.label || "Code inconnu"}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          {formData.budget && formData.showBudget && (
            <div>
              <div className="text-sm text-muted-foreground">Budget</div>
              <div className="font-medium">
                CHF {parseFloat(formData.budget).toLocaleString()}
              </div>
            </div>
          )}
          {(formData.surfaceM2 || formData.volumeM3) && (
            <div>
              <div className="text-sm text-muted-foreground">Quantités</div>
              <div className="text-sm">
                {formData.surfaceM2 && (
                  <div>Surface : {formData.surfaceM2} m²</div>
                )}
                {formData.volumeM3 && (
                  <div>Volume : {formData.volumeM3} m³</div>
                )}
              </div>
            </div>
          )}
          <div>
            <div className="text-sm text-muted-foreground">Deadline</div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(formData.deadline).toLocaleString("fr-CH")}
              </span>
            </div>
          </div>
        </div>

        {/* Contraintes */}
        {formData.constraints && formData.constraints.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm font-medium text-orange-900 mb-2">
              Contraintes identifiées :
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.constraints.map((constraint) => (
                <Badge
                  key={constraint}
                  variant="outline"
                  className="bg-white border-orange-300 text-orange-900"
                >
                  {constraint}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sélection prioritaire */}
      {formData.selectionPriorities &&
        formData.selectionPriorities.length > 0 && (
          <div className="border-2 border-artisan-yellow rounded-lg p-5 bg-artisan-yellow/5">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-artisan-yellow" />
              Critères prioritaires de sélection
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.selectionPriorities.map((priority) => (
                <Badge key={priority} className="text-base px-4 py-2">
                  {SELECTION_PRIORITY_LABELS[priority]}
                </Badge>
              ))}
            </div>
          </div>
        )}

      {/* Photos et Documents */}
      {((formData.images && formData.images.length > 0) ||
        (formData.pdfs && formData.pdfs.length > 0)) && (
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-artisan-yellow" />
            Photos et documents
          </h3>

          {/* Images */}
          {formData.images && formData.images.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-2">
                {formData.images.length} photo
                {formData.images.length > 1 ? "s" : ""}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-xs"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDFs */}
          {formData.pdfs && formData.pdfs.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                {formData.pdfs.length} document
                {formData.pdfs.length > 1 ? "s" : ""} PDF
              </div>
              <div className="space-y-2">
                {formData.pdfs.map((pdf, index) => (
                  <a
                    key={index}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm truncate flex-1">{pdf.name}</span>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Localisation */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-artisan-yellow" />
          Localisation
        </h3>
        <div className="space-y-1">
          {formData.address && (
            <div className="text-sm">{formData.address}</div>
          )}
          <div className="text-sm font-medium">
            {formData.city}, {formData.canton}
          </div>
          {formData.country && (
            <div className="text-sm text-muted-foreground">
              {formData.country}
            </div>
          )}
          {formData.location && (
            <div className="text-sm italic">{formData.location}</div>
          )}
        </div>
      </div>

      {/* Lots et critères */}
      {(formData.lots.length > 0 || formData.criteria.length > 0) && (
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-artisan-yellow" />
            Lots et critères
          </h3>

          {formData.lots.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">
                Lots ({formData.lots.length})
              </div>
              <div className="space-y-2">
                {formData.lots.map((lot) => (
                  <div
                    key={lot.number}
                    className="text-sm p-2 bg-gray-50 rounded"
                  >
                    <div className="font-medium">
                      Lot {lot.number}: {lot.title}
                    </div>
                    {lot.budget && (
                      <div className="text-muted-foreground text-xs">
                        Budget: CHF {parseFloat(lot.budget).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.criteria.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">
                Critères d&apos;évaluation
                {totalCriteriaWeight === 100 && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    ✓ 100%
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {formData.criteria.map((criteria) => (
                  <div
                    key={criteria.name}
                    className="text-sm flex justify-between p-2 bg-gray-50 rounded"
                  >
                    <span>{criteria.name}</span>
                    <span className="font-medium">{criteria.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conditions de participation */}
      {(formData.participationConditions || formData.requiredDocuments) && (
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg mb-3">
            Conditions de participation
          </h3>

          {formData.participationConditions && (
            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">
                Conditions générales
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {formData.participationConditions}
              </div>
            </div>
          )}

          {formData.requiredDocuments && (
            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">Documents requis</div>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {formData.requiredDocuments}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {formData.requiresReferences && (
              <Badge variant="outline">Références requises</Badge>
            )}
            {formData.requiresInsurance && (
              <Badge variant="outline">Assurance RC obligatoire</Badge>
            )}
            {formData.minExperience && (
              <Badge variant="outline">
                Expérience: {formData.minExperience}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Paramètres */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-lg mb-3">
          Paramètres de publication
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Procédure</div>
            <Badge>{PROCEDURE_LABELS[formData.procedure]}</Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Visibilité</div>
            <Badge variant="outline">
              {formData.visibility === "PUBLIC" ? "Public" : "Privé"}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Mode de soumission
            </div>
            <Badge variant="outline">
              {formData.mode === "ANONYMOUS" ? "Anonyme" : "Transparent"}
            </Badge>
          </div>
          {formData.allowPartialOffers && (
            <div>
              <Badge className="bg-purple-100 text-purple-800">
                Offres partielles autorisées
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Avertissement de paiement */}
      <div className="bg-artisan-yellow/10 border border-artisan-yellow rounded-lg p-4">
        <h4 className="font-semibold mb-2">Étape suivante: Paiement</h4>
        <p className="text-sm text-muted-foreground">
          En cliquant sur &quot;Procéder au paiement&quot;, vous serez redirigé
          vers Stripe pour payer les frais de publication de{" "}
          <strong>CHF 10.–</strong>. Votre appel d&apos;offres sera publié dès
          la confirmation du paiement.
        </p>
      </div>
    </div>
  );
}
