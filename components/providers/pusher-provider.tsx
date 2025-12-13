"use client";

import { createContext, useContext, useEffect, useState } from "react";
import PusherClient from "pusher-js";
import { toast } from "sonner";
import type { Prisma } from "@prisma/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | Prisma.JsonValue | null;
  createdAt: Date;
  read: boolean;
};

type PusherContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
};

const PusherContext = createContext<PusherContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function PusherProvider({
  children,
  userId,
  organizationId,
  initialNotifications = [],
}: {
  children: React.ReactNode;
  userId: string;
  organizationId: string;
  initialNotifications?: Notification[];
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Skip on server side
    if (typeof window === "undefined") return;

    // Initialiser Pusher
    const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // S'abonner au canal utilisateur
    const userChannel = pusherClient.subscribe(`user-${userId}`);

    // S'abonner au canal organisation
    const orgChannel = pusherClient.subscribe(`organization-${organizationId}`);

    // Écouter les notifications
    const handleNotification = (
      data: Notification & { excludeUserId?: string }
    ) => {
      // Filtrer si c'est une notification d'organisation et qu'on est l'auteur
      if (data.excludeUserId && data.excludeUserId === userId) {
        return;
      }

      // Ajouter la notification à la liste
      setNotifications((prev) => [data, ...prev]);

      // Extraire metadata de manière sécurisée
      const metadata = data.metadata as
        | Record<string, unknown>
        | null
        | undefined;

      // Afficher un toast
      toast(data.title, {
        description: data.message,
        action: metadata?.offerId
          ? {
              label: "Voir",
              onClick: () => {
                // Naviguer vers l'offre
                if (metadata?.tenderId && metadata?.offerId) {
                  window.location.href = `/dashboard/tenders/${metadata.tenderId}/offers/${metadata.offerId}`;
                }
              },
            }
          : undefined,
      });

      // Jouer un son (optionnel)
      if (typeof window !== "undefined") {
        try {
          const audio = new Audio("/sounds/notification.mp3");
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignorer les erreurs de lecture audio
          });
        } catch {
          // Ignorer les erreurs
        }
      }
    };

    userChannel.bind("notification", handleNotification);
    orgChannel.bind("notification", handleNotification);

    // Cleanup
    return () => {
      userChannel.unbind("notification", handleNotification);
      orgChannel.unbind("notification", handleNotification);
      pusherClient.unsubscribe(`user-${userId}`);
      pusherClient.unsubscribe(`organization-${organizationId}`);
      pusherClient.disconnect();
    };
  }, [userId, organizationId]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Appel API pour marquer comme lu en base
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Appel API pour marquer toutes comme lues
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <PusherContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </PusherContext.Provider>
  );
}

export function usePusher() {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error("usePusher must be used within PusherProvider");
  }
  return context;
}
