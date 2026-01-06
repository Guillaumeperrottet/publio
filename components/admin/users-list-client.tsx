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
  const router = useRouter();

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSuperAdmin = async (userId: string) => {
    try {
      setLoading(userId);
      const result = await toggleSuperAdmin(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isSuperAdmin: result.isSuperAdmin } : u
        )
      );

      toast.success(
        result.isSuperAdmin ? "Super admin granted" : "Super admin revoked"
      );
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    } finally {
      setLoading(null);
    }
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
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user.name || "No name"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </div>
                    {user.isSuperAdmin && (
                      <Badge className="bg-red-500 hover:bg-red-600">
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
                          className="border-gray-600 text-gray-300"
                        >
                          {membership.organization.name} ({membership.role})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
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
                    onClick={() => handleToggleSuperAdmin(user.id)}
                    disabled={loading === user.id}
                    className="whitespace-nowrap"
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
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
