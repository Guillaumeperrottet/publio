"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Mail, Calendar, Shield } from "lucide-react";
import { toggleSuperAdmin } from "@/features/admin/actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  createdAt: Date;
  memberships: Array<{
    role: string;
    organization: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    sessions: number;
    notifications: number;
  };
};

interface UsersListClientProps {
  initialUsers: User[];
}

export function UsersListClient({ initialUsers }: UsersListClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string | null;
    isSuperAdmin: boolean;
  } | null>(null);
  const router = useRouter();

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSuperAdmin = async () => {
    if (!selectedUser) return;

    try {
      setLoading(selectedUser.id);
      const result = await toggleSuperAdmin(selectedUser.id);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, isSuperAdmin: result.isSuperAdmin }
            : u
        )
      );

      // Son de succès
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore les erreurs si le son ne peut pas être joué
      });

      toast.success(
        result.isSuperAdmin ? "Super admin accordé" : "Super admin révoqué",
        {
          description: result.isSuperAdmin
            ? "L'utilisateur a maintenant accès au panneau super admin"
            : "L'utilisateur n'a plus accès au panneau super admin",
          duration: 4000,
        }
      );
      setConfirmOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Échec de la mise à jour", {
        description:
          "Une erreur s'est produite lors de la modification des privilèges",
        duration: 4000,
      });
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const openConfirmDialog = (user: {
    id: string;
    name: string | null;
    isSuperAdmin: boolean;
  }) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search users by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="bg-white border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name || "No name"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </div>
                    {user.isSuperAdmin && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        SUPER ADMIN
                      </Badge>
                    )}
                  </div>

                  {/* Organizations */}
                  {user.memberships.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {user.memberships.map((membership) => (
                        <Badge
                          key={membership.organization.id}
                          variant="outline"
                          className="border-gray-300 text-gray-700 bg-gray-50"
                        >
                          {membership.organization.name} ({membership.role})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div>{user._count.sessions} sessions</div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant={user.isSuperAdmin ? "destructive" : "default"}
                    size="sm"
                    onClick={() =>
                      openConfirmDialog({
                        id: user.id,
                        name: user.name,
                        isSuperAdmin: user.isSuperAdmin,
                      })
                    }
                    disabled={loading === user.id}
                    className={
                      user.isSuperAdmin
                        ? "whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
                        : "whitespace-nowrap"
                    }
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {loading === user.id
                      ? "..."
                      : user.isSuperAdmin
                      ? "Revoke Admin"
                      : "Make Admin"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {selectedUser?.isSuperAdmin
                ? "Révoquer les privilèges super admin ?"
                : "Accorder les privilèges super admin ?"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedUser?.isSuperAdmin
                ? `${
                    selectedUser.name || "Cet utilisateur"
                  } perdra l'accès au panneau d'administration et toutes les fonctionnalités super admin.`
                : `${
                    selectedUser?.name || "Cet utilisateur"
                  } aura un accès complet au panneau d'administration avec tous les privilèges super admin.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmOpen(false);
                setSelectedUser(null);
              }}
              disabled={loading !== null}
            >
              Annuler
            </Button>
            <Button
              variant={selectedUser?.isSuperAdmin ? "destructive" : "default"}
              onClick={handleToggleSuperAdmin}
              disabled={loading !== null}
              className={
                !selectedUser?.isSuperAdmin
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {loading !== null
                ? "..."
                : selectedUser?.isSuperAdmin
                ? "Révoquer"
                : "Accorder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
