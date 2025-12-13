import { Metadata } from "next";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { getNotificationPreferences } from "@/features/notifications/preferences-actions";
import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { HandDrawnStar } from "@/components/ui/hand-drawn-elements";

export const metadata: Metadata = {
  title: "Préférences de notifications - Publio",
  description: "Gérez vos préférences de notifications",
};

export default async function NotificationSettingsPage() {
  const preferences = await getNotificationPreferences();

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-4xl mx-auto relative">
        {/* Élément décoratif */}
        <div className="absolute top-4 right-8 opacity-20">
          <HandDrawnStar className="w-16 h-16 text-artisan-yellow" />
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">
            <span className="font-handdrawn text-6xl">
              <HandDrawnHighlight variant="yellow">
                Notifications
              </HandDrawnHighlight>
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Choisissez comment et quand vous souhaitez être notifié
          </p>
        </div>

        <HandDrawnCard>
          <HandDrawnCardContent className="pt-6">
            <NotificationPreferencesForm initialPreferences={preferences} />
          </HandDrawnCardContent>
        </HandDrawnCard>
      </div>
    </ProtectedLayout>
  );
}
