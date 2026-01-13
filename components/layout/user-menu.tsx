"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Building2,
  Users,
  LogOut,
  ChevronDown,
  CreditCard,
  Shield,
  Bell,
  Loader2,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string;
    isSuperAdmin?: boolean;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
  userRole?: "OWNER" | "ADMIN" | "EDITOR" | "MEMBER" | "VIEWER" | null;
}

export function UserMenu({ user, organization, userRole }: UserMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handleBillingClick = (e: React.MouseEvent) => {
    const isOwnerOrAdmin = userRole === "OWNER" || userRole === "ADMIN";

    if (!isOwnerOrAdmin) {
      e.preventDefault();

      // Son d'erreur
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore les erreurs si le son ne peut pas être joué
      });

      toast.error("Accès refusé", {
        description:
          "Seuls les propriétaires et administrateurs peuvent accéder à la facturation.",
        duration: 4000,
      });
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isOwnerOrAdmin = userRole === "OWNER" || userRole === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-sand-light/50 rounded-full px-3 py-2 transition-colors outline-none">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="bg-artisan-yellow text-matte-black text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-matte-black">
            {user.name}
          </span>
          {organization && (
            <span className="text-xs text-muted-foreground">
              {organization.name}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Info utilisateur */}
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-artisan-yellow text-matte-black font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Gestion du compte */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Mon compte
        </DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild onClick={handleBillingClick}>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Facturation</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings/notifications"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Préférences de notification</span>
          </Link>
        </DropdownMenuItem>

        {/* Super Admin - uniquement pour les super admins */}
        {user.isSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2 cursor-pointer text-amber-600 font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Super Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Organisation */}
        {organization && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              Organisation
            </DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/organization/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>{organization.name}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/organization/members"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Membres de l&apos;équipe</span>
              </Link>
            </DropdownMenuItem>

            {/* Journaux d'équité - uniquement pour OWNER et ADMIN */}
            {isOwnerOrAdmin && (
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/equity-logs"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Journaux d&apos;équité</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
          </>
        )}

        {/* Déconnexion */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Déconnexion...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Déconnexion</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
