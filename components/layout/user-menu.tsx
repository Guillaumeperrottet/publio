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
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export function UserMenu({ user, organization }: UserMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Facturation</span>
          </Link>
        </DropdownMenuItem>

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

            <DropdownMenuSeparator />
          </>
        )}

        {/* Déconnexion */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{isLoading ? "Déconnexion..." : "Déconnexion"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
