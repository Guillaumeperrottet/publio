import { getUsers } from "@/features/admin/actions";
import { UsersListClient } from "@/components/admin/users-list-client";
import { Users as UsersIcon } from "lucide-react";

export default async function UsersPage() {
  const { users } = await getUsers({ limit: 100 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <UsersIcon className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Users Management</h1>
          <p className="text-gray-400 mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Users List */}
      <UsersListClient initialUsers={users} />
    </div>
  );
}
