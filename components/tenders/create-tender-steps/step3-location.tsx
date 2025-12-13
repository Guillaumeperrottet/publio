"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

const CANTONS = [
  "AG",
  "AI",
  "AR",
  "BE",
  "BL",
  "BS",
  "FR",
  "GE",
  "GL",
  "GR",
  "JU",
  "LU",
  "NE",
  "NW",
  "OW",
  "SG",
  "SH",
  "SO",
  "SZ",
  "TG",
  "TI",
  "UR",
  "VD",
  "VS",
  "ZG",
  "ZH",
];

interface TenderStep3Props {
  formData: {
    isSimpleMode: boolean;
    location: string;
    city: string;
    postalCode: string;
    canton: string;
    address: string;
    country: string;
  };
  updateFormData: (data: Partial<TenderStep3Props["formData"]>) => void;
}

export function TenderStep3({ formData, updateFormData }: TenderStep3Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Localisation</h2>
          <p className="text-sm text-muted-foreground">
            Où se situe votre projet ?
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Adresse complète - maintenant toujours visible */}
        <div>
          <Label htmlFor="address" className="text-base font-semibold">
            Adresse du projet *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Rue et numéro où se situent les travaux
          </p>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="Ex: Rue du Rhône 50"
            className="text-base"
            required
          />
        </div>

        {/* NPA et Ville sur la même ligne */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="postalCode" className="text-base font-semibold">
              NPA *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">Code postal</p>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
              placeholder="1000"
              className="text-base"
              maxLength={4}
              pattern="[0-9]{4}"
              required
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="city" className="text-base font-semibold">
              Commune / Ville *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">Lieu du projet</p>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="Ex: Lausanne"
              className="text-base"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="canton" className="text-base font-semibold">
            Canton *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Sélectionnez le canton
          </p>
          <Select
            value={formData.canton}
            onValueChange={(value) => updateFormData({ canton: value })}
          >
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Sélectionner un canton" />
            </SelectTrigger>
            <SelectContent>
              {CANTONS.map((canton) => (
                <SelectItem key={canton} value={canton}>
                  {canton}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Indication complémentaire optionnelle */}
        <div>
          <Label htmlFor="location" className="text-base font-semibold">
            Indication complémentaire
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Optionnel - précisions sur le lieu ou l'accès
          </p>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            placeholder="Ex: Accès par l'arrière du bâtiment, Quartier de la gare"
            className="text-base"
          />
        </div>

        {/* Info sur l'anonymat si mode anonyme */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Conseil :</strong> Une localisation précise aide les
            professionnels à évaluer les coûts de déplacement et la faisabilité
            du projet.
          </p>
        </div>
      </div>
    </div>
  );
}
