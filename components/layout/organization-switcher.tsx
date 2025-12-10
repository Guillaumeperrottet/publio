"use client";

import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useOrganization } from "@/lib/contexts/organization-context";
import { useRouter } from "next/navigation";

interface OrganizationMembership {
  organization: {
    id: string;
    name: string;
    type: string;
    logo: string | null;
  };
}

interface OrganizationSwitcherProps {
  memberships: OrganizationMembership[];
}

export default function OrganizationSwitcher({
  memberships,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const {
    currentOrganization,
    setCurrentOrganization,
    setAvailableOrganizations,
  } = useOrganization();

  // Initialiser les organisations disponibles
  useEffect(() => {
    const orgs = memberships.map((m) => m.organization);
    setAvailableOrganizations(orgs);
  }, [memberships, setAvailableOrganizations]);

  const handleSwitch = (org: OrganizationMembership["organization"]) => {
    setCurrentOrganization(org);
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "COMMUNE":
        return "Commune";
      case "ENTREPRISE":
        return "Entreprise";
      case "PRIVE":
        return "Privé";
      default:
        return type;
    }
  };

  // Si une seule organisation, ne pas afficher le sélecteur
  if (memberships.length <= 1) {
    return null;
  }

  const current = currentOrganization || memberships[0]?.organization;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-sand-light rounded-lg transition-colors">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={current?.logo || undefined} alt={current?.name} />
          <AvatarFallback className="bg-artisan-yellow/20 text-deep-green rounded-lg">
            {current ? (
              getInitials(current.name)
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold truncate">{current?.name}</p>
          <p className="text-xs text-muted-foreground">
            {current ? getTypeLabel(current.type) : "Organisation"}
          </p>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Changer d&apos;organisation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((membership) => {
          const org = membership.organization;
          const isSelected = current?.id === org.id;

          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org)}
              className="flex items-center gap-3"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={org.logo || undefined} alt={org.name} />
                <AvatarFallback className="bg-artisan-yellow/20 text-deep-green rounded-lg text-xs">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{org.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getTypeLabel(org.type)}
                </p>
              </div>
              {isSelected && <Check className="h-4 w-4 text-artisan-yellow" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
