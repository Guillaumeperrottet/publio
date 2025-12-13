"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationType } from "@prisma/client";
import { sendNotificationToUser } from "@/lib/pusher/server";
import { matchesSavedSearchCriteria } from "@/features/search/match-helpers";
import { shouldReceiveNotification } from "@/features/notifications/preferences-actions";

/**
 * Récupérer les notifications de l'utilisateur connecté
 */
export async function getUserNotifications(limit = 20) {
  const user = await getCurrentUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications;
}

/**
 * Récupérer le nombre de notifications non lues
 */
export async function getUnreadNotificationsCount() {
  const user = await getCurrentUser();

  const count = await prisma.notification.count({
    where: {
      userId: user.id,
      read: false,
    },
  });

  return count;
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string) {
  const user = await getCurrentUser();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== user.id) {
    return { error: "Notification introuvable" };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return { success: true };
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      read: false,
    },
    data: { read: true },
  });

  return { success: true };
}

/**
 * Créer une notification pour un utilisateur
 */
export async function createNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }
) {
  // Check if user wants to receive this notification in-app
  const shouldReceiveInApp = await shouldReceiveNotification(
    userId,
    data.type,
    "inApp"
  );

  if (!shouldReceiveInApp) {
    console.log(
      `User ${userId} has disabled ${data.type} notifications (in-app)`
    );
    return null;
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata ? (data.metadata as never) : undefined,
    },
  });

  // Envoyer via Pusher (real-time in-app)
  await sendNotificationToUser(userId, {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata as Record<string, unknown>,
    createdAt: notification.createdAt,
  });

  return notification;
}

/**
 * Créer des notifications pour tous les membres d'une organisation (sauf l'auteur)
 */
export async function createOrganizationNotification(
  organizationId: string,
  excludeUserId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }
) {
  // Récupérer tous les membres actifs de l'organisation (sauf l'auteur)
  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId,
      userId: { not: excludeUserId },
    },
    include: {
      user: true,
    },
  });

  // Créer une notification pour chaque membre
  const notifications = await Promise.all(
    members.map((member) => createNotification(member.userId, data))
  );

  return notifications;
}

/**
 * Check saved searches and notify users when a new tender matches their criteria
 */
export async function notifyMatchingSavedSearches(tenderId: string) {
  try {
    // Get the tender with organization
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: { organization: true },
    });

    if (!tender) {
      console.error("Tender not found:", tenderId);
      return;
    }

    // Get all saved searches with alerts enabled
    const savedSearches = await prisma.savedSearch.findMany({
      where: { alertsEnabled: true },
    });

    console.log(
      `Checking ${savedSearches.length} saved searches for tender ${tender.title}`
    );

    // Check each saved search
    for (const search of savedSearches) {
      try {
        const criteria = search.criteria as Record<string, unknown>;

        if (matchesSavedSearchCriteria(tender, criteria)) {
          // Create notification for user
          await createNotification(search.userId, {
            type: "TENDER_MATCH",
            title: "Nouvel appel d'offres",
            message: `${tender.title} correspond à votre recherche "${search.name}"`,
            metadata: {
              tenderId: tender.id,
              searchId: search.id,
              searchName: search.name,
              tenderTitle: tender.title,
              canton: tender.canton,
              city: tender.city,
            },
          });

          console.log(
            `✅ Notified user ${search.userId} for search "${search.name}"`
          );
        }
      } catch (error) {
        console.error(`Error processing search ${search.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in notifyMatchingSavedSearches:", error);
  }
}

/**
 * Check veille subscriptions and notify users when new publications match
 */
export async function notifyMatchingVeilleSubscriptions(publicationId: string) {
  try {
    // Get the publication
    const publication = await prisma.veillePublication.findUnique({
      where: { id: publicationId },
    });

    if (!publication) {
      console.error("Publication not found:", publicationId);
      return;
    }

    // Get all active veille subscriptions
    const subscriptions = await prisma.veilleSubscription.findMany({
      where: {
        appNotifications: true,
        cantons: { has: publication.canton },
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                role: { in: ["OWNER", "ADMIN", "EDITOR"] },
              },
            },
          },
        },
      },
    });

    console.log(
      `Checking ${subscriptions.length} veille subscriptions for publication ${publication.title}`
    );

    // Check each subscription
    for (const subscription of subscriptions) {
      try {
        // Check if keywords match (if specified)
        let keywordMatch = true;
        if (subscription.keywords.length > 0) {
          const titleLower = publication.title.toLowerCase();
          const descLower = (publication.description || "").toLowerCase();

          keywordMatch = subscription.keywords.some(
            (keyword) =>
              titleLower.includes(keyword.toLowerCase()) ||
              descLower.includes(keyword.toLowerCase())
          );
        }

        // Check if commune matches (if specified)
        let communeMatch = true;
        if (
          subscription.alertCommunes &&
          subscription.alertCommunes.length > 0
        ) {
          communeMatch = subscription.alertCommunes.includes(
            publication.commune
          );
        }

        if (keywordMatch && communeMatch) {
          // Notify all members of the organization
          for (const member of subscription.organization.members) {
            await createNotification(member.userId, {
              type: "VEILLE_MATCH",
              title: "Nouvelle publication de veille",
              message: `${publication.commune} (${
                publication.canton
              }) - ${publication.title.substring(0, 100)}`,
              metadata: {
                publicationId: publication.id,
                commune: publication.commune,
                canton: publication.canton,
                title: publication.title,
                url: publication.url,
              },
            });
          }

          console.log(
            `✅ Notified organization ${subscription.organizationId} for publication in ${publication.commune}`
          );
        }
      } catch (error) {
        console.error(
          `Error processing subscription ${subscription.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error in notifyMatchingVeilleSubscriptions:", error);
  }
}
