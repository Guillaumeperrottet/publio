import Pusher from "pusher";

// Vérifier que les variables d'environnement sont définies
if (!process.env.PUSHER_APP_ID) {
  throw new Error("PUSHER_APP_ID is not defined");
}
if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
  throw new Error("NEXT_PUBLIC_PUSHER_KEY is not defined");
}
if (!process.env.PUSHER_SECRET) {
  throw new Error("PUSHER_SECRET is not defined");
}
if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error("NEXT_PUBLIC_PUSHER_CLUSTER is not defined");
}

// Instance Pusher serveur (singleton)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

/**
 * Envoyer une notification temps réel à un utilisateur spécifique
 */
export async function sendNotificationToUser(
  userId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }
) {
  try {
    await pusherServer.trigger(`user-${userId}`, "notification", notification);
    console.log(`[Pusher] Notification sent to user ${userId}`);
  } catch (error) {
    console.error("[Pusher] Error sending notification:", error);
    throw error;
  }
}

/**
 * Envoyer une notification à tous les membres d'une organisation (sauf l'auteur)
 */
export async function sendNotificationToOrganization(
  organizationId: string,
  excludeUserId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }
) {
  try {
    await pusherServer.trigger(
      `organization-${organizationId}`,
      "notification",
      {
        ...notification,
        excludeUserId, // Le client filtrera cette notification
      }
    );
    console.log(
      `[Pusher] Notification sent to organization ${organizationId} (excluding ${excludeUserId})`
    );
  } catch (error) {
    console.error("[Pusher] Error sending notification:", error);
    throw error;
  }
}

/**
 * Envoyer un événement de mise à jour en temps réel (ex: nouveau commentaire visible)
 */
export async function sendRealtimeUpdate(
  channel: string,
  event: string,
  data: Record<string, unknown>
) {
  try {
    await pusherServer.trigger(channel, event, data);
    console.log(`[Pusher] Realtime update sent to ${channel}:${event}`);
  } catch (error) {
    console.error("[Pusher] Error sending realtime update:", error);
    throw error;
  }
}
