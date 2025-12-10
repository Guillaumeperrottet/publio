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
        {!formData.isSimpleMode && (
          <div>
            <Label htmlFor="address" className="text-base font-semibold">
              Adresse complète
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Adresse précise du projet (optionnel)
            </p>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="Ex: Rue du Rhône 50"
              className="text-base"
            />
          </div>
        )}

        <div>
          <Label htmlFor="city" className="text-base font-semibold">
            Commune / Ville *
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Lieu principal du projet
          </p>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="Ex: Lausanne"
            className="text-base"
            required
          />
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

        {!formData.isSimpleMode && (
          <div>
            <Label htmlFor="country" className="text-base font-semibold">
              Pays
            </Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => updateFormData({ country: e.target.value })}
              placeholder="Suisse"
              className="text-base"
            />
          </div>
        )}

        <div>
          <Label htmlFor="location" className="text-base font-semibold">
            Indication complémentaire
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Optionnel - précisions sur le lieu
          </p>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            placeholder="Ex: Quartier de la gare"
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
}
