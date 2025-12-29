"use client";

import { OfferFormData } from "../offers/submit-offer-stepper";
import {
  FileText,
  Euro,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface OfferPreviewProps {
  formData: OfferFormData;
  organization: {
    name: string;
  };
  tender: {
    title: string;
    currency: string;
  };
}

export function OfferPreview({
  formData,
  organization,
  tender,
}: OfferPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: tender.currency,
    }).format(amount);
  };

  const totalTTC =
    formData.priceType === "DETAILED"
      ? (formData.totalHT || 0) + (formData.totalTVA || 0)
      : formData.price;

  return (
    <div className="sticky top-4 bg-white rounded-lg border-2 border-artisan-yellow/30 shadow-lg overflow-hidden">
      {/* En-tête style PDF */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Publio</h3>
            <p className="text-xs opacity-90">Plateforme de mise en relation</p>
            <p className="text-xs opacity-75 italic">Document indicatif</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">{organization.name}</div>
          </div>
        </div>
      </div>

      {/* Corps de l'aperçu */}
      <div className="p-6 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Informations de base */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">
              {formData.offerNumber || "OFF-XXXX"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Validité : {formData.validityDays} jours
          </div>
        </div>

        {/* Titre du projet */}
        <div className="border-t pt-3">
          <h4 className="font-bold text-sm mb-2">Offre: {tender.title}</h4>
        </div>

        {/* Résumé du projet */}
        {formData.projectSummary && (
          <div className="bg-blue-50 rounded p-3 border border-blue-100">
            <h5 className="text-xs font-semibold text-blue-900 mb-1">
              Résumé du projet
            </h5>
            <p className="text-xs text-blue-800 line-clamp-3">
              {formData.projectSummary}
            </p>
          </div>
        )}

        {/* Prestations incluses */}
        {formData.inclusions.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Prestations incluses ({formData.inclusions.length})
            </h5>
            <ul className="space-y-0.5">
              {formData.inclusions.slice(0, 3).map((inc, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1"
                >
                  <span className="text-green-600 mt-0.5">•</span>
                  <span className="line-clamp-1">{inc.description}</span>
                </li>
              ))}
              {formData.inclusions.length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  + {formData.inclusions.length - 3} autres...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Prestations exclues */}
        {formData.exclusions.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-semibold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Non inclus ({formData.exclusions.length})
            </h5>
            <ul className="space-y-0.5">
              {formData.exclusions.slice(0, 2).map((exc, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1"
                >
                  <span className="text-red-600 mt-0.5">•</span>
                  <span className="line-clamp-1">{exc.description}</span>
                </li>
              ))}
              {formData.exclusions.length > 2 && (
                <li className="text-xs text-muted-foreground italic">
                  + {formData.exclusions.length - 2} autres...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Matériaux */}
        {formData.materials.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-semibold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-purple-600" />
              Matériaux ({formData.materials.length})
            </h5>
            <ul className="space-y-0.5">
              {formData.materials.slice(0, 2).map((mat, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1"
                >
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span className="line-clamp-1">
                    {mat.name} {mat.brand && `- ${mat.brand}`}
                  </span>
                </li>
              ))}
              {formData.materials.length > 2 && (
                <li className="text-xs text-muted-foreground italic">
                  + {formData.materials.length - 2} autres...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Prix */}
        <div className="bg-artisan-yellow/10 rounded p-3 border border-artisan-yellow/30">
          <h5 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
            <Euro className="w-3.5 h-3.5 text-artisan-yellow" />
            Prix de l&apos;offre
          </h5>

          {formData.priceType === "DETAILED" &&
          formData.lineItems.length > 0 ? (
            <div className="space-y-1">
              {formData.lineItems.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground line-clamp-1 flex-1">
                    {item.description}
                  </span>
                  <span className="font-semibold ml-2">
                    {formatCurrency(item.priceHT * (item.quantity || 1))}
                  </span>
                </div>
              ))}
              {formData.lineItems.length > 3 && (
                <div className="text-xs text-muted-foreground italic">
                  + {formData.lineItems.length - 3} lignes...
                </div>
              )}
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Total HT</span>
                  <span>{formatCurrency(formData.totalHT || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>TVA {formData.tvaRate}%</span>
                  <span>{formatCurrency(formData.totalTVA || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>Total TTC</span>
                  <span className="text-deep-green">
                    {formatCurrency(totalTTC)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl font-bold text-deep-green">
                {formData.price > 0 ? formatCurrency(formData.price) : "---"}
              </div>
              <div className="text-xs text-muted-foreground">
                Prix forfaitaire TTC
              </div>
            </div>
          )}
        </div>

        {/* Délais */}
        {(formData.durationDays || formData.timeline) && (
          <div className="space-y-1">
            <h5 className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Délais
            </h5>
            {formData.durationDays && (
              <p className="text-xs text-muted-foreground">
                Durée : {formData.durationDays} jours
              </p>
            )}
            {formData.timeline && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {formData.timeline}
              </p>
            )}
          </div>
        )}

        {/* Conditions de paiement */}
        {formData.paymentTerms && (
          <div className="text-xs">
            <h5 className="font-semibold mb-1">Paiement</h5>
            <div className="text-muted-foreground space-y-0.5">
              {formData.paymentTerms.deposit && (
                <div>Acompte : {formData.paymentTerms.deposit}%</div>
              )}
              {formData.paymentTerms.final && (
                <div>Solde : {formData.paymentTerms.final}%</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="border-t bg-gray-50 p-3 text-center">
        <p className="text-[10px] text-muted-foreground italic">
          Aperçu de votre offre Publio
        </p>
      </div>
    </div>
  );
}
