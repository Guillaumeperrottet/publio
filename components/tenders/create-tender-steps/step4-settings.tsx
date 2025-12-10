"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Eye, EyeOff, Lock, Globe } from "lucide-react";

interface TenderStep4Props {
  formData: {
    visibility: string;
    mode: string;
  };
  updateFormData: (data: Partial<TenderStep4Props["formData"]>) => void;
}

export function TenderStep4({ formData, updateFormData }: TenderStep4Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-artisan-yellow/10 rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6 text-artisan-yellow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Paramètres de publication</h2>
          <p className="text-sm text-muted-foreground">
            Visibilité et mode de soumission
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Visibilité */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Visibilité de l&apos;appel d&apos;offres
          </Label>
          <RadioGroup
            value={formData.visibility}
            onValueChange={(value: string) =>
              updateFormData({ visibility: value })
            }
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-artisan-yellow transition-colors cursor-pointer">
              <RadioGroupItem value="PUBLIC" id="public" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="public" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Globe className="w-4 h-4" />
                    Public
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    Visible par tous. Recommandé pour maximiser les
                    candidatures.
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-artisan-yellow transition-colors cursor-pointer">
              <RadioGroupItem value="PRIVATE" id="private" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="private" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Lock className="w-4 h-4" />
                    Privé / Sur invitation
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    Uniquement accessible aux entreprises que vous invitez.
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Mode d'offres */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Mode de soumission des offres
          </Label>
          <RadioGroup
            value={formData.mode}
            onValueChange={(value: string) => updateFormData({ mode: value })}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-4 border-2 border-artisan-yellow bg-artisan-yellow/5 rounded-lg cursor-pointer">
              <RadioGroupItem
                value="ANONYMOUS"
                id="anonymous"
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="anonymous" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <EyeOff className="w-4 h-4" />
                    Anonyme (Recommandé)
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    Les identités des soumissionnaires sont masquées
                    jusqu&apos;à la date limite. Garantit équité et
                    transparence.
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-artisan-yellow transition-colors cursor-pointer">
              <RadioGroupItem value="CLASSIC" id="classic" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="classic" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Eye className="w-4 h-4" />
                    Classique
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    Les identités sont visibles dès la soumission.
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
