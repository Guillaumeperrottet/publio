import { getUserDetails } from "@/features/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Building2,
  Bell,
  Activity,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ToggleSuperAdminButton } from "@/components/admin/toggle-super-admin-button";

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getUserDetails(id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/users">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-lg bg-blue-500/10">
            <UserIcon className="w-10 h-10 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">
                {user.name || "No name"}
              </h1>
              {user.isSuperAdmin && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white">
                  SUPER ADMIN
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <ToggleSuperAdminButton
            userId={user.id}
            isSuperAdmin={user.isSuperAdmin}
          />
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="text-gray-900 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Organizations</p>
                <p className="text-gray-900 font-semibold">
                  {user.memberships.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-gray-900 font-semibold">
                  {user.sessions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations */}
      {user.memberships.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.memberships.map((membership) => (
                <Link
                  key={membership.id}
                  href={`/admin/organizations/${membership.organization.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-gray-900 font-medium">
                        {membership.organization.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Member since{" "}
                        {new Date(membership.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-gray-300 text-gray-700 bg-white"
                    >
                      {membership.role}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {user.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-sm"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-mono text-xs truncate">
                    {session.id}
                  </p>
                  {session.ipAddress && (
                    <p className="text-gray-600 text-xs">
                      IP: {session.ipAddress}
                    </p>
                  )}
                </div>
                <div className="text-right text-gray-600 text-xs">
                  {new Date(session.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {user.sessions.length === 0 && (
              <p className="text-center text-gray-600 py-8">No sessions</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {user.notifications.slice(0, 10).map((notif) => (
              <div key={notif.id} className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-1">
                  <Badge
                    variant="outline"
                    className="border-gray-300 text-gray-700 bg-white text-xs"
                  >
                    {notif.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-900 text-sm font-medium mb-1">
                  {notif.title}
                </p>
                <p className="text-gray-600 text-xs">{notif.message}</p>
              </div>
            ))}
            {user.notifications.length === 0 && (
              <p className="text-center text-gray-600 py-8">No notifications</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      {user.activityLogs.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-gray-50 text-sm">
                  <div className="flex items-start justify-between mb-1">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                      {log.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-900 text-sm">{log.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
