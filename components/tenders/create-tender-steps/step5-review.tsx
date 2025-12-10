"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Euro,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MARKET_TYPE_LABELS: Record<string, string> = {
  CONSTRUCTION: "Construction",
  ENGINEERING: "Ingénierie",
  ARCHITECTURE: "Architecture",
  IT_SERVICES: "Services IT",
  CONSULTING: "Conseil",
  SUPPLIES: "Fournitures",
  MAINTENANCE: "Maintenance",
  OTHER: "Autre",
};

interface TenderStep5Props {
  formData: {
    title: string;
    description: string;
    marketType: string;
    budget: string;
    deadline: string;
    location: string;
    city: string;
    canton: string;
    visibility: string;
    mode: string;
  };
}

export function TenderStep5({ formData }: TenderStep5Props) {
  const deadlineDate = formData.deadline ? new Date(formData.deadline) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Vérification finale</h2>
          <p className="text-sm text-muted-foreground">
            Relisez votre appel d&apos;offres avant publication
          </p>
        </div>
      </div>

      <div className="bg-sand-light/30 border-2 border-artisan-yellow rounded-lg p-6 space-y-4">
        {/* Titre */}
        <div>
          <h3 className="text-2xl font-bold text-matte-black mb-2">
            {formData.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge>{MARKET_TYPE_LABELS[formData.marketType]}</Badge>
            <Badge variant="outline">
              {formData.visibility === "PUBLIC" ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Privé
                </>
              )}
            </Badge>
            <Badge variant="outline">
              {formData.mode === "ANONYMOUS" ? "Anonyme" : "Classique"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            Description
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {formData.description}
          </p>
        </div>

        <Separator />

        {/* Détails en grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              Localisation
            </div>
            <p className="text-sm">
              {formData.city}, {formData.canton}
            </p>
            {formData.location && (
              <p className="text-xs text-muted-foreground">
                {formData.location}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              Date limite
            </div>
            <p className="text-sm">
              {deadlineDate
                ? format(deadlineDate, "dd MMMM yyyy 'à' HH:mm", { locale: fr })
                : "Non définie"}
            </p>
          </div>

          {formData.budget && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                <Euro className="w-4 h-4" />
                Budget indicatif
              </div>
              <p className="text-sm">
                {new Intl.NumberFormat("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                }).format(parseFloat(formData.budget))}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Une fois publié, votre appel d&apos;offres
          sera immédiatement visible{" "}
          {formData.visibility === "PUBLIC"
            ? "par tous les utilisateurs"
            : "par les personnes invitées"}
          . Les soumissionnaires pourront déposer leurs offres jusqu&apos;à la
          date limite.
        </p>
      </div>
    </div>
  );
}
