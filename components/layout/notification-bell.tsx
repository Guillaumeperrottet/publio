"use client";

import { useState } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePusher } from "@/components/providers/pusher-provider";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = usePusher();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    // Marquer comme lue
    markAsRead(notification.id);

    // Extraire metadata de manière sécurisée
    const metadata = notification.metadata as
      | Record<string, unknown>
      | null
      | undefined;

    // Naviguer selon le type de notification
    if (notification.type === "TENDER_AWARDED") {
      // Pour les marchés attribués, rediriger vers la page de succès
      if (metadata?.tenderId) {
        router.push(`/dashboard/tenders/${metadata.tenderId}/awarded`);
        setIsOpen(false);
      }
    } else if (metadata?.tenderId && metadata?.offerId) {
      // Pour les autres notifications d'offre
      router.push(
        `/dashboard/tenders/${metadata.tenderId}/offers/${metadata.offerId}`
      );
      setIsOpen(false);
    } else if (metadata?.tenderId) {
      // Si on a juste un tenderId
      router.push(`/dashboard/tenders/${metadata.tenderId}`);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-sand-light transition-all hover:scale-110"
        >
          <Bell
            className={`w-5 h-5 ${
              unreadCount > 0 ? "text-artisan-yellow animate-pulse" : ""
            }`}
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-red-500 border-2 border-white animate-bounce"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] max-h-[500px] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-xs"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.slice(0, 20).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer flex flex-col items-start gap-1 ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full">
                  <p className="font-medium text-sm">{notification.title}</p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings/notifications"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Préférences de notification</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
