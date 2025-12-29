"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  File,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { handleError, toastSuccess } from "@/lib/utils/toast-messages";

interface OfferDocument {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

interface Step2DocumentsProps {
  documents: OfferDocument[];
  onDocumentsChange: (documents: OfferDocument[]) => void;
}

export function Step2Documents({
  documents,
  onDocumentsChange,
}: Step2DocumentsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    const newDocuments: OfferDocument[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier la taille (max 10MB - limite Cloudinary plan gratuit)
        if (file.size > 10 * 1024 * 1024) {
          handleError(
            new Error(`${file.name} dépasse 10MB (limite Cloudinary)`),
            "fileUpload"
          );
          continue;
        }

        // Convertir en base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload vers Cloudinary
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "offer-documents" }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `Upload failed for ${file.name}`);
        }

        const { url } = await response.json();

        newDocuments.push({
          name: file.name,
          url,
          size: file.size,
          mimeType: file.type,
        });
      }

      if (newDocuments.length > 0) {
        onDocumentsChange([...documents, ...newDocuments]);
        toastSuccess.saved();
      }
    } catch (error) {
      handleError(error, "fileUpload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeDocument = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    onDocumentsChange(updated);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-8 h-8" />;
    if (mimeType === "application/pdf") return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Documents et pièces jointes
        </h3>
        <p className="text-sm text-muted-foreground">
          Ajoutez des images, plans, certifications, fiches techniques ou tout
          autre document pour enrichir votre offre.
        </p>
      </div>

      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? "border-artisan-yellow bg-artisan-yellow/10"
            : "border-gray-300 hover:border-artisan-yellow"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-artisan-yellow animate-spin" />
            <p className="text-lg font-semibold mb-2">Upload en cours...</p>
            <p className="text-sm text-muted-foreground">
              Veuillez patienter pendant l&apos;upload des fichiers
            </p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              ou cliquez pour sélectionner
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button type="button" asChild disabled={isUploading}>
                <span>Sélectionner des fichiers</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-4">
              Formats acceptés : Images (JPG, PNG), PDF, Word. Max 10 MB par
              fichier.
            </p>
          </>
        )}
      </div>

      {/* Liste des documents */}
      {documents.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">
            Documents ajoutés ({documents.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground">
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Aucun document ajouté. Les documents sont optionnels mais
            recommandés pour renforcer votre offre.
          </p>
        </div>
      )}
    </div>
  );
}
