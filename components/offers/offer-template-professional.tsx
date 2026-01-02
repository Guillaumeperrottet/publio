"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { OfferFormData } from "./submit-offer-stepper";
import { updateOrganization } from "@/features/organizations/actions";
import { handleError, toastSuccess } from "@/lib/utils/toast-messages";
import { LineItemsWithCategories } from "./line-items-with-categories";
import { SignaturePad } from "./signature-pad";

interface OfferTemplateProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  tender: {
    title: string;
    currency: string;
    deadline: Date;
    organization: {
      name: string;
      address?: string | null;
      city?: string | null;
    };
  };
}

export function OfferTemplateProfessional({
  formData,
  updateFormData,
  organization,
  tender,
}: OfferTemplateProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(organization.logo || null);

  // Synchroniser l'état local avec formData
  const usesTenderDeadline = formData.usesTenderDeadline || false;
  const setUsesTenderDeadline = (value: boolean) => {
    updateFormData({ usesTenderDeadline: value });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: tender.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      handleError(new Error("Le logo ne doit pas dépasser 5MB"), "logoUpload");
      return;
    }

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      handleError(new Error("Veuillez sélectionner une image"), "logoUpload");
      return;
    }

    try {
      setIsUploadingLogo(true);

      // Convertir en base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;

          // Upload vers Cloudinary
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, folder: "logos" }),
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const { url } = await response.json();

          // Sauvegarder dans l'organisation
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

  const recalculateTotals = (items: OfferFormData["lineItems"]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.priceHT * (item.quantity || 1),
      0
    );

    // Appliquer le rabais si défini
    const discount = formData.discount || 0;
    const afterDiscount = subtotal * (1 - discount / 100);

    const totalHT = afterDiscount;
    const totalTVA = totalHT * (formData.tvaRate / 100);
    const totalTTC = totalHT + totalTVA;

    updateFormData({
      totalHT,
      totalTVA,
      price: totalTTC,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* En-tête avec logo */}
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

          <div className="text-right">
            <div className="font-bold text-lg">{organization.name}</div>
            <Input
              className="mt-2 text-xs h-7"
              placeholder="Rue Example 21"
              value={formData.organizationAddress || ""}
              onChange={(e) =>
                updateFormData({ organizationAddress: e.target.value })
              }
            />
            <Input
              className="mt-1 text-xs h-7"
              placeholder="CH-9999 Ville"
              value={formData.organizationCity || ""}
              onChange={(e) =>
                updateFormData({ organizationCity: e.target.value })
              }
            />
            <Input
              className="mt-1 text-xs h-7"
              placeholder="+41 33 999 99 99"
              value={formData.organizationPhone || ""}
              onChange={(e) =>
                updateFormData({ organizationPhone: e.target.value })
              }
            />
            <Input
              className="mt-1 text-xs h-7"
              placeholder="peter@musterfirma.ch"
              value={formData.organizationEmail || ""}
              onChange={(e) =>
                updateFormData({ organizationEmail: e.target.value })
              }
            />
            <Input
              className="mt-1 text-xs h-7"
              placeholder="www.societeexemple.ch"
              value={formData.organizationWebsite || ""}
              onChange={(e) =>
                updateFormData({ organizationWebsite: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Corps du document */}
      <div className="p-8 space-y-6">
        {/* Destinataire */}
        <div className="grid grid-cols-2 gap-8">
          <div className="text-sm text-gray-700">
            <div className="font-semibold">{tender.organization.name}</div>
            {tender.organization.address && (
              <div className="mt-1">{tender.organization.address}</div>
            )}
            {tender.organization.city && (
              <div className="mt-1">{tender.organization.city}</div>
            )}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-semibold">Offre n°:</span>
              <Input
                value={formData.offerNumber || ""}
                onChange={(e) =>
                  updateFormData({ offerNumber: e.target.value })
                }
                placeholder="OFF-2025-001"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-semibold">
                Date de l&apos;offre:
              </span>
              <div className="text-sm pt-2">
                {new Date().toLocaleDateString("fr-CH")}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-semibold">Interlocuteur:</span>
              <Input
                placeholder="Nom"
                className="text-sm"
                value={formData.contactPerson || ""}
                onChange={(e) =>
                  updateFormData({ contactPerson: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-semibold">E-mail:</span>
              <Input
                placeholder="email@example.ch"
                className="text-sm"
                value={formData.contactEmail || ""}
                onChange={(e) =>
                  updateFormData({ contactEmail: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-semibold">Téléphone:</span>
              <Input
                placeholder="+41..."
                className="text-sm"
                value={formData.contactPhone || ""}
                onChange={(e) =>
                  updateFormData({ contactPhone: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Titre de l'offre */}
        <div className="pt-4">
          <label className="text-sm font-bold">Offre:</label>
          <Input value={tender.title} disabled className="mt-1 font-semibold" />
        </div>

        {/* Introduction */}
        <div>
          <p className="text-sm mb-2">Monsieur, | Madame,</p>
          <Textarea
            value={formData.projectSummary}
            onChange={(e) => updateFormData({ projectSummary: e.target.value })}
            placeholder="Nous vous remercions pour votre demande d'offre du [date] relative à [décrire brièvement le contenu de la demande d'offre]. Nous avons le plaisir de vous transmettre notre offre suivante:"
            rows={3}
            className="text-sm"
          />
        </div>

        {/* Tableau des positions */}
        <div className="border-t-2 pt-6">
          <h3 className="font-bold mb-4">Décomposition tarifaire</h3>

          <LineItemsWithCategories
            lineItems={formData.lineItems}
            onLineItemsChange={(items) => {
              updateFormData({ lineItems: items });
              recalculateTotals(items);
            }}
            currency={tender.currency}
            tvaRate={formData.tvaRate}
          />

          {/* Totaux */}
          <div className="mt-6 space-y-2">
            {/* Somme intermédiaire */}
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-bold">Somme intermédiaire</span>
              <span className="font-bold">
                {formatCurrency(
                  formData.lineItems.reduce(
                    (sum, item) =>
                      sum +
                      (typeof item.quantity === "number"
                        ? item.priceHT * item.quantity
                        : 0),
                    0
                  )
                )}
              </span>
            </div>

            {/* Rabais */}
            <div className="flex justify-between items-center p-3">
              <div className="flex items-center gap-2">
                <span>Rabais</span>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.discount || 0}
                  onChange={(e) => {
                    updateFormData({
                      discount: parseFloat(e.target.value) || 0,
                    });
                    recalculateTotals(formData.lineItems);
                  }}
                  className="w-20 text-sm text-right"
                />
                <span>%</span>
              </div>
              <span>
                {formatCurrency(
                  (formData.lineItems.reduce(
                    (sum, item) =>
                      sum +
                      (typeof item.quantity === "number"
                        ? item.priceHT * item.quantity
                        : 0),
                    0
                  ) *
                    (formData.discount || 0)) /
                    100
                )}
              </span>
            </div>

            {/* Total HT */}
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="font-bold">Total hors TVA</span>
              <span className="font-bold">
                {formatCurrency(formData.totalHT || 0)}
              </span>
            </div>

            {/* TVA */}
            <div className="flex justify-between items-center p-3">
              <div className="flex items-center gap-2">
                <span>TVA</span>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.tvaRate}
                  onChange={(e) => {
                    updateFormData({
                      tvaRate: parseFloat(e.target.value) || 7.7,
                    });
                    recalculateTotals(formData.lineItems);
                  }}
                  className="w-20 text-sm text-right"
                />
                <span>%</span>
              </div>
              <span>{formatCurrency(formData.totalTVA || 0)}</span>
            </div>

            {/* Total TTC */}
            <div className="flex justify-between p-4 bg-artisan-yellow/20 border-2 border-artisan-yellow rounded">
              <span className="font-bold text-lg">Total TVA incluse</span>
              <span className="font-bold text-lg text-deep-green">
                {formatCurrency(formData.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Validité:</span>
            <div className="space-y-2 mt-1">
              {usesTenderDeadline ? (
                <div className="space-y-2">
                  <div className="text-sm p-2 bg-artisan-yellow/10 border border-artisan-yellow/30 rounded">
                    Valable jusqu&apos;à la date limite de l&apos;appel
                    d&apos;offre :{" "}
                    <span className="font-semibold">
                      {new Date(tender.deadline).toLocaleDateString("fr-CH")}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={() => {
                      setUsesTenderDeadline(false);
                      updateFormData({ validityDays: 30 });
                    }}
                  >
                    Modifier la validité
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.validityDays}
                      onChange={(e) => {
                        setUsesTenderDeadline(false);
                        updateFormData({
                          validityDays: parseInt(e.target.value) || 30,
                        });
                      }}
                      className="w-20"
                    />
                    <span>jours à compter de la date d&apos;émission</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    💡 Deadline de l&apos;appel d&apos;offre:{" "}
                    <span className="font-semibold">
                      {new Date(tender.deadline).toLocaleDateString("fr-CH")}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-6 text-xs"
                      onClick={() => {
                        const today = new Date();
                        const deadline = new Date(tender.deadline);
                        const diffTime = deadline.getTime() - today.getTime();
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );
                        updateFormData({
                          validityDays: diffDays > 0 ? diffDays : 30,
                        });
                        setUsesTenderDeadline(true);
                      }}
                    >
                      Utiliser cette date
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold">Délai de livraison:</span>
            <Input
              value={formData.timeline || ""}
              onChange={(e) => updateFormData({ timeline: e.target.value })}
              placeholder="à convenir"
              className="mt-1"
            />
          </div>
        </div>

        {/* Formule de politesse */}
        <div className="pt-4">
          <p className="text-sm">
            Nous vous prions d&apos;agréer, Madame, Monsieur, nos salutations
            les meilleures.
          </p>
          <p className="text-sm font-bold mt-2">{organization.name}</p>

          {/* Signature manuscrite */}
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">
              Signature
            </label>
            <SignaturePad
              value={formData.signature}
              onChange={(signature) => updateFormData({ signature })}
            />
          </div>

          <div className="mt-4 text-sm">
            <Input
              placeholder="Prénom Nom"
              className="w-64"
              value={formData.contactPerson || ""}
              onChange={(e) =>
                updateFormData({ contactPerson: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="bg-gray-100 p-6 text-xs text-gray-600 space-y-3">
        <div>
          <span className="font-semibold">Taxe sur la valeur ajoutée:</span>
          <Input
            placeholder="CHE-123.456.789 TVA (optionnel)"
            className="mt-1 text-xs"
          />
        </div>
        <div>
          <span className="font-semibold">Coordonnées bancaires:</span>
          <Input
            placeholder="Banque Exemple, CH-3030 Ville Exemple (optionnel)"
            className="mt-1 text-xs"
          />
          <Input
            placeholder="IBAN: CH99 0000 0000 0000 0000 9 (optionnel)"
            className="mt-1 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
