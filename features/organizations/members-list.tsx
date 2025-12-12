"use client";

import { toast } from "sonner";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Shield,
  ShieldCheck,
  Eye,
  Crown,
  Trash2,
} from "lucide-react";
import { updateMemberRole, removeMember } from "./actions";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
  };
}

interface MembersListProps {
  members: Member[];
  organizationId: string;
  currentUserId: string;
  canManage: boolean;
}

export default function MembersList({
  members,
  organizationId,
  currentUserId,
  canManage,
}: MembersListProps) {
  const router = useRouter();
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-4 w-4" />;
      case "ADMIN":
        return <ShieldCheck className="h-4 w-4" />;
      case "EDITOR":
        return <Shield className="h-4 w-4" />;
      case "VIEWER":
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "success";
      case "EDITOR":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      setLoadingMemberId(memberId);
      await updateMemberRole(
        organizationId,
        memberId,
        newRole as "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
      );
      toast.success("Rôle modifié avec succès");
      router.refresh();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erreur lors de la modification du rôle");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce membre ?")) {
      return;
    }

    try {
      setLoadingMemberId(memberId);
      await removeMember(organizationId, memberId);
      toast.success("Membre retiré avec succès");
      router.refresh();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Erreur lors de la suppression du membre");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.user.id === currentUserId;
        const isOwner = member.role === "OWNER";
        const canEdit = canManage && !isOwner && !isCurrentUser;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-sand-light/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback className="bg-artisan-yellow/20 text-deep-green">
                  {getInitials(member.user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">
                    {member.user.name || "Sans nom"}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (vous)
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {member.user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Membre depuis le{" "}
                  {new Date(member.joinedAt).toLocaleDateString("fr-CH")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <HandDrawnBadge
                  variant={
                    getRoleColor(member.role) as
                      | "default"
                      | "secondary"
                      | "success"
                      | "warning"
                      | "error"
                      | "outline"
                  }
                >
                  <span className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </span>
                </HandDrawnBadge>
              </div>
            </div>

            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingMemberId === member.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleChangeRole(member.id, "ADMIN")}
                    disabled={member.role === "ADMIN"}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Promouvoir Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleChangeRole(member.id, "EDITOR")}
                    disabled={member.role === "EDITOR"}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Définir comme Éditeur
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleChangeRole(member.id, "VIEWER")}
                    disabled={member.role === "VIEWER"}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Définir comme Lecteur
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleRemove(member.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Retirer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}
