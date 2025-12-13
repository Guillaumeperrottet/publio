"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Get user's notification preferences (creates default if doesn't exist)
 */
export async function getNotificationPreferences() {
  const user = await getCurrentUser();

  let preferences = await prisma.notificationPreferences.findUnique({
    where: { userId: user.id },
  });

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await prisma.notificationPreferences.create({
      data: {
        userId: user.id,
        inAppEnabled: true,
        emailEnabled: false, // Désactivé par défaut
        pushEnabled: false,
        enabledTypes: [], // Empty = all types enabled
        emailFrequency: "DISABLED", // Emails de notification désactivés par défaut
        digestTime: "09:00",
        digestDay: 1,
      },
    });
  }

  return preferences;
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(data: {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  enabledTypes?: string[];
  emailFrequency?: string;
  digestTime?: string;
  digestDay?: number;
}) {
  try {
    const user = await getCurrentUser();

    // Ensure preferences exist
    await getNotificationPreferences();

    const updated = await prisma.notificationPreferences.update({
      where: { userId: user.id },
      data,
    });

    revalidatePath("/dashboard/settings/notifications");

    return { success: true, preferences: updated };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Check if a user should receive a notification based on their preferences
 */
export async function shouldReceiveNotification(
  userId: string,
  notificationType: string,
  channel: "inApp" | "email" | "push"
): Promise<boolean> {
  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // If no preferences, allow all (default behavior)
    if (!preferences) {
      return true;
    }

    // Check if channel is enabled
    if (channel === "inApp" && !preferences.inAppEnabled) return false;
    if (channel === "email" && !preferences.emailEnabled) return false;
    if (channel === "push" && !preferences.pushEnabled) return false;

    // Check if this notification type is enabled
    // Empty enabledTypes array means all types are enabled
    if (
      preferences.enabledTypes.length > 0 &&
      !preferences.enabledTypes.includes(notificationType)
    ) {
      return false;
    }

    // For email, check frequency setting
    if (channel === "email" && preferences.emailFrequency === "DISABLED") {
      return false;
    }

    // For email digests, we'll handle that separately in a cron job
    // Instant emails go through immediately
    if (
      channel === "email" &&
      preferences.emailFrequency !== "INSTANT" &&
      preferences.emailFrequency !== "DISABLED"
    ) {
      // This notification should be queued for digest, not sent immediately
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    // If error, allow notification (fail open)
    return true;
  }
}

/**
 * Get all notification types available
 */
export async function getAvailableNotificationTypes() {
  return [
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
}

/**
 * Get email frequency options
 */
export async function getEmailFrequencyOptions() {
  return [
    {
      value: "INSTANT",
      label: "Instantané",
      description: "Recevoir les emails immédiatement",
    },
    {
      value: "DAILY_DIGEST",
      label: "Résumé quotidien",
      description: "Un email par jour avec toutes les notifications",
    },
    {
      value: "WEEKLY_DIGEST",
      label: "Résumé hebdomadaire",
      description: "Un email par semaine",
    },
    {
      value: "DISABLED",
      label: "Désactivé",
      description: "Ne pas recevoir d'emails",
    },
  ];
}
