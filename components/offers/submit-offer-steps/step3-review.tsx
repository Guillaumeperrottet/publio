"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { OfferFormData } from "../submit-offer-stepper";

interface Step3ReviewProps {
  formData: OfferFormData;
  tender: {
    title: string;
    currency: string;
  };
  organization: {
    name: string;
  };
  onDownloadPreview: () => void;
}

export function Step3Review({
  formData,
  tender,
  organization,
  onDownloadPreview,
}: Step3ReviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: tender.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const checklist = [
    {
      label: "Numéro d'offre renseigné",
      checked: !!formData.offerNumber,
    },
    {
      label: "Résumé du projet (min. 50 caractères)",
      checked: formData.projectSummary.length >= 50,
    },
    {
      label: "Au moins une ligne tarifaire",
      checked: formData.lineItems.length > 0,
    },
    {
      label: "Prix total calculé",
      checked: formData.price > 0,
    },
    {
      label: "Informations de contact complètes",
      checked: !!(formData.contactPerson && formData.contactEmail),
    },
  ];

  const allValid = checklist.every((item) => item.checked);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-3">Révision finale</h3>
        <p className="text-muted-foreground text-lg">
          Vérifiez que toutes les informations sont correctes avant de soumettre
          votre offre
        </p>
      </div>

      {/* Checklist de validation */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Checklist de validation</h4>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2
                  className={`w-5 h-5 ${
                    item.checked ? "text-deep-green" : "text-gray-300"
                  }`}
                />
                <span
                  className={item.checked ? "text-foreground" : "text-gray-400"}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {!allValid && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ Certains éléments requis sont manquants. Veuillez retourner aux
              étapes précédentes pour les compléter.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé de l'offre */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Résumé de l&apos;offre</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Organisation</p>
              <p className="font-medium">{organization.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Appel d&apos;offres</p>
              <p className="font-medium">{tender.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground">N° d&apos;offre</p>
              <p className="font-medium">
                {formData.offerNumber || "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Validité</p>
              <p className="font-medium">
                {formData.usesTenderDeadline
                  ? "Deadline de l'appel d'offre"
                  : `${formData.validityDays} jours`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Interlocuteur</p>
              <p className="font-medium">
                {formData.contactPerson || "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email de contact</p>
              <p className="font-medium">
                {formData.contactEmail || "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Lignes tarifaires</p>
              <p className="font-medium">{formData.lineItems.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rabais appliqué</p>
              <p className="font-medium">
                {formData.discount ? `${formData.discount}%` : "Aucun"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total HT</p>
              <p className="font-medium">
                {formatCurrency(formData.totalHT || 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">TVA ({formData.tvaRate}%)</p>
              <p className="font-medium">
                {formatCurrency(formData.totalTVA || 0)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Montant total TTC</p>
              <p className="font-bold text-2xl text-deep-green">
                {formatCurrency(formData.price)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Documents joints</p>
              <p className="font-medium">{formData.documents?.length || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Délai de livraison</p>
              <p className="font-medium">{formData.timeline || "Non défini"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents joints */}
      {formData.documents && formData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents joints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.documents.map((doc, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {doc.mimeType.startsWith("image/") ? (
                    <div className="mb-3 relative w-full h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="mb-3 flex items-center justify-center h-40 bg-gray-100 rounded">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <p className="font-medium text-sm truncate" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Voir le document →
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview PDF */}
      <Card className="bg-linear-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold">Aperçu PDF de l&apos;offre</h4>
                <p className="text-sm text-muted-foreground">
                  Téléchargez le PDF pour voir le rendu final
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={onDownloadPreview}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger l&apos;aperçu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Avertissement final */}
      <div className="bg-gray-50 border rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-semibold mb-2">⚠️ Attention</p>
        <p>
          Une fois l&apos;offre soumise, vous ne pourrez plus la modifier. Le
          client recevra une notification et pourra consulter votre offre. Vous
          serez informé de l&apos;évolution du processus par email.
        </p>
      </div>
    </div>
  );
}
