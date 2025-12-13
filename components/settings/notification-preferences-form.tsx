"use client";

import { useState } from "react";
import { NotificationPreferences } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateNotificationPreferences } from "@/features/notifications/preferences-actions";
import { Bell, Mail, Smartphone, Clock } from "lucide-react";

const notificationTypes = [
  {
    value: "COMMENT_ADDED",
    label: "Commentaires sur offres",
    description: "Nouveau commentaire ajouté sur une offre",
  },
  {
    value: "OFFER_RECEIVED",
    label: "Offres reçues",
    description: "Nouvelle offre reçue sur vos appels d'offres",
  },
  {
    value: "OFFER_WITHDRAWN",
    label: "Offres retirées",
    description: "Une offre a été retirée",
  },
  {
    value: "OFFER_SHORTLISTED",
    label: "Offres présélectionnées",
    description: "Votre offre a été mise à l'étude",
  },
  {
    value: "OFFER_REJECTED",
    label: "Offres rejetées",
    description: "Votre offre a été rejetée",
  },
  {
    value: "TENDER_AWARDED",
    label: "Marchés attribués",
    description: "Un marché vous a été attribué",
  },
  {
    value: "TENDER_MATCH",
    label: "Nouveaux appels d'offres",
    description: "Appel d'offres correspondant à vos recherches",
  },
  {
    value: "VEILLE_MATCH",
    label: "Publications de veille",
    description: "Nouvelles publications correspondant à vos critères",
  },
  {
    value: "TENDER_CLOSING_SOON",
    label: "Dates limites",
    description: "Appel d'offres se clôturant bientôt",
  },
];

const emailFrequencies = [
  {
    value: "INSTANT",
    label: "Instantané",
    description:
      "Recevoir un email immédiatement pour chaque notification d'information",
  },
  {
    value: "DAILY_DIGEST",
    label: "Résumé quotidien",
    description:
      "Un seul email par jour regroupant toutes les notifications d'information",
  },
  {
    value: "WEEKLY_DIGEST",
    label: "Résumé hebdomadaire",
    description:
      "Un seul email par semaine avec toutes les notifications d'information",
  },
  {
    value: "DISABLED",
    label: "Désactivé",
    description:
      "Ne recevoir aucun email de notification (les emails essentiels sont toujours envoyés)",
  },
];

interface NotificationPreferencesFormProps {
  initialPreferences: NotificationPreferences;
}

export function NotificationPreferencesForm({
  initialPreferences,
}: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] = useState(initialPreferences);

  const updatePreference = (update: Partial<NotificationPreferences>) => {
    const newPrefs = { ...preferences, ...update };
    setPreferences(newPrefs);
    // Auto-save immediately with the complete new preferences
    setTimeout(async () => {
      try {
        const result = await updateNotificationPreferences({
          inAppEnabled: newPrefs.inAppEnabled,
          emailEnabled: newPrefs.emailEnabled,
          pushEnabled: newPrefs.pushEnabled,
          enabledTypes: newPrefs.enabledTypes,
          emailFrequency: newPrefs.emailFrequency,
          digestTime: newPrefs.digestTime,
          digestDay: newPrefs.digestDay,
        });

        if (result.success) {
          toast.success("Préférences enregistrées");
        } else {
          toast.error(result.error || "Erreur lors de la sauvegarde");
        }
      } catch (error) {
        console.error("Error saving preferences:", error);
        toast.error("Erreur lors de la sauvegarde");
      }
    }, 0);
  };

  const toggleNotificationType = (type: string) => {
    let newTypes: string[];

    if (preferences.enabledTypes.length === 0) {
      // Currently all enabled (empty array)
      // User wants to disable one, so enable all others explicitly
      newTypes = notificationTypes
        .map((t) => t.value)
        .filter((t) => t !== type);
    } else {
      // Some types are explicitly enabled
      if (preferences.enabledTypes.includes(type)) {
        // Remove type
        newTypes = preferences.enabledTypes.filter((t) => t !== type);
      } else {
        // Add type
        newTypes = [...preferences.enabledTypes, type];
        // Check if all types are now enabled
        if (newTypes.length === notificationTypes.length) {
          // All enabled = empty array
          newTypes = [];
        }
      }
    }

    updatePreference({ enabledTypes: newTypes });
  };

  const toggleAllTypes = (enabled: boolean) => {
    if (enabled) {
      // Enable all types - empty array means all enabled
      updatePreference({ enabledTypes: [] });
    } else {
      // Disable all - put all types in array then remove them
      updatePreference({
        enabledTypes: notificationTypes.map((t) => t.value),
      });
    }
  };

  // Empty array means all types are enabled
  const allTypesEnabled = preferences.enabledTypes.length === 0;

  return (
    <div className="space-y-8">
      {/* Canaux de notification */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Canaux de notification
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez comment vous souhaitez recevoir les notifications
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inApp" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications in-app
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications dans l&apos;application (temps réel)
              </p>
            </div>
            <Switch
              id="inApp"
              checked={preferences.inAppEnabled}
              onCheckedChange={(checked) =>
                updatePreference({ inAppEnabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Notifications push mobile
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications sur mobile (à venir)
              </p>
            </div>
            <Switch
              id="push"
              checked={preferences.pushEnabled}
              onCheckedChange={(checked) =>
                updatePreference({ pushEnabled: checked })
              }
              disabled
            />
          </div>
        </div>
      </div>

      {/* Types de notifications */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Types de notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez les types de notifications que vous souhaitez recevoir
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Checkbox
              id="all-types"
              checked={allTypesEnabled}
              onCheckedChange={toggleAllTypes}
            />
            <Label
              htmlFor="all-types"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Toutes les notifications
            </Label>
          </div>

          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const isEnabled =
                allTypesEnabled ||
                preferences.enabledTypes.includes(type.value);

              return (
                <div key={type.value} className="flex items-start space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={isEnabled}
                    onCheckedChange={() => toggleNotificationType(type.value)}
                    disabled={allTypesEnabled}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={type.value}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        allTypesEnabled ? "opacity-50" : ""
                      }`}
                    >
                      {type.label}
                    </Label>
                    <p
                      className={`text-sm text-muted-foreground ${
                        allTypesEnabled ? "opacity-50" : ""
                      }`}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emails de notification (option avancée) */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Emails de notification (optionnel)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Par défaut, seuls les emails transactionnels essentiels sont envoyés
            (confirmation d&apos;offre, marché attribué, factures). Vous pouvez
            activer ici des emails supplémentaires pour les notifications.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Activer les emails de notification
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails en plus des notifications in-app
              </p>
            </div>
            <Switch
              id="email"
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) =>
                updatePreference({ emailEnabled: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Fréquence des emails */}
      {preferences.emailEnabled && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Fréquence des emails de notification
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Les notifications apparaissent toujours en temps réel dans
              l&apos;application. Ici vous choisissez si vous voulez aussi des
              emails et à quelle fréquence.
            </p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-900">
                ℹ️ <strong>Important :</strong> Les emails transactionnels
                essentiels (confirmation d&apos;offre soumise, marché attribué,
                factures) sont toujours envoyés immédiatement, peu importe ce
                paramètre. Ce réglage concerne uniquement les emails
                d&apos;information (nouveaux commentaires, nouvelles offres
                reçues, résultats de veille, etc.)
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="emailFrequency">Fréquence</Label>
              <Select
                value={preferences.emailFrequency}
                onValueChange={(value) =>
                  updatePreference({ emailFrequency: value })
                }
              >
                <SelectTrigger id="emailFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emailFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div className="flex flex-col">
                        <span>{freq.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {freq.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {preferences.emailFrequency === "DAILY_DIGEST" && (
              <div className="space-y-2">
                <Label htmlFor="digestTime">Heure d&apos;envoi du résumé</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Vous recevrez un seul email quotidien regroupant toutes les
                  notifications de la journée
                </p>
                <Select
                  value={preferences.digestTime}
                  onValueChange={(value) =>
                    updatePreference({ digestTime: value })
                  }
                >
                  <SelectTrigger id="digestTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {preferences.emailFrequency === "WEEKLY_DIGEST" && (
              <div className="space-y-2">
                <Label htmlFor="digestDay">Jour d&apos;envoi du résumé</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Vous recevrez un seul email hebdomadaire avec toutes les
                  notifications de la semaine
                </p>
                <Select
                  value={preferences.digestDay.toString()}
                  onValueChange={(value) =>
                    updatePreference({ digestDay: parseInt(value) })
                  }
                >
                  <SelectTrigger id="digestDay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Lundi</SelectItem>
                    <SelectItem value="2">Mardi</SelectItem>
                    <SelectItem value="3">Mercredi</SelectItem>
                    <SelectItem value="4">Jeudi</SelectItem>
                    <SelectItem value="5">Vendredi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Types de notifications */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Types de notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez les types de notifications que vous souhaitez recevoir
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Checkbox
              id="all-types"
              checked={allTypesEnabled}
              onCheckedChange={toggleAllTypes}
            />
            <Label
              htmlFor="all-types"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Toutes les notifications
            </Label>
          </div>

          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const isEnabled =
                allTypesEnabled ||
                preferences.enabledTypes.includes(type.value);

              return (
                <div key={type.value} className="flex items-start space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={isEnabled}
                    onCheckedChange={() => toggleNotificationType(type.value)}
                    disabled={allTypesEnabled}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={type.value}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        allTypesEnabled ? "opacity-50" : ""
                      }`}
                    >
                      {type.label}
                    </Label>
                    <p
                      className={`text-sm text-muted-foreground ${
                        allTypesEnabled ? "opacity-50" : ""
                      }`}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
