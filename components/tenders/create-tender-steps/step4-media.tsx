"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image, FileText, Upload, X, Loader2 } from "lucide-react";

interface TenderStep4Props {
  formData: {
    images: Array<{ url: string; name: string; type: "image" }>;
    pdfs: Array<{ url: string; name: string; type: "pdf" }>;
  };
  updateFormData: (data: Partial<TenderStep4Props["formData"]>) => void;
}

export function TenderStep4({ formData, updateFormData }: TenderStep4Props) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier la limite
    const currentCount = formData.images?.length || 0;
    const remainingSlots = 5 - currentCount;
    if (remainingSlots <= 0) {
      alert("Maximum 5 images autorisées");
      return;
    }

    setUploadingImages(true);

    try {
      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      const uploadPromises = filesToUpload.map(async (file) => {
        // Vérifier le type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} n'est pas une image`);
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} dépasse 5MB`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "publio/tenders/images");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur upload ${file.name}`);
        }

        const data = await response.json();
        return {
          url: data.url,
          name: file.name,
          type: "image" as const,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      updateFormData({
        images: [...(formData.images || []), ...uploadedFiles],
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload des images"
      );
    } finally {
      setUploadingImages(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier la limite
    const currentCount = formData.pdfs?.length || 0;
    const remainingSlots = 5 - currentCount;
    if (remainingSlots <= 0) {
      alert("Maximum 5 PDF autorisés");
      return;
    }

    setUploadingPdfs(true);

    try {
      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      const uploadPromises = filesToUpload.map(async (file) => {
        // Vérifier le type
        if (file.type !== "application/pdf") {
          throw new Error(`${file.name} n'est pas un PDF`);
        }

        // Vérifier la taille (max 10MB pour PDF)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} dépasse 10MB`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "publio/tenders/documents");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur upload ${file.name}`);
        }

        const data = await response.json();
        return {
          url: data.url,
          name: file.name,
          type: "pdf" as const,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      updateFormData({
        pdfs: [...(formData.pdfs || []), ...uploadedFiles],
      });
    } catch (error) {
      console.error("Error uploading PDFs:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload des PDF"
      );
    } finally {
      setUploadingPdfs(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    updateFormData({ images: newImages });
  };

  const removePdf = (index: number) => {
    const newPdfs = [...(formData.pdfs || [])];
    newPdfs.splice(index, 1);
    updateFormData({ pdfs: newPdfs });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <Image className="w-6 h-6 text-artisan-yellow" aria-label="Images" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Photos et documents</h2>
          <p className="text-sm text-muted-foreground">
            Ajoutez des visuels pour illustrer votre projet (optionnel)
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Images */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-base font-semibold">
                Photos du projet (optionnel)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.images?.length || 0} / 5 images • Max 5MB par image
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Photos du site, plans, schémas, état des lieux, exemples...
          </p>

          {/* Grid d'aperçu des images */}
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

          {/* Bouton upload images */}
          {(!formData.images || formData.images.length < 5) && (
            <div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={uploadingImages}
                className="w-full"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Ajouter des photos
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* PDFs */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-base font-semibold">
                Documents PDF (optionnel)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.pdfs?.length || 0} / 5 PDF • Max 10MB par document
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Cahier des charges, devis estimatif, spécifications techniques...
          </p>

          {/* Liste des PDFs */}
          {formData.pdfs && formData.pdfs.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.pdfs.map((pdf, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm truncate">{pdf.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePdf(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Bouton upload PDFs */}
          {(!formData.pdfs || formData.pdfs.length < 5) && (
            <div>
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf,application/pdf"
                multiple
                onChange={handlePdfUpload}
                disabled={uploadingPdfs}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("pdf-upload")?.click()}
                disabled={uploadingPdfs}
                className="w-full"
              >
                {uploadingPdfs ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Ajouter des documents PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
