import { getAdminStats, getSystemHealth } from "@/features/admin/actions";
import {
  Users,
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const [stats, health] = await Promise.all([
    getAdminStats(),
    getSystemHealth(),
  ]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Organizations",
      value: stats.stats.totalOrganizations,
      icon: Building2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Tenders",
      value: stats.stats.totalTenders,
      icon: FileText,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Total Offers",
      value: stats.stats.totalOffers,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Users (30d)",
      value: stats.stats.activeUsersLast30Days,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-400">System metrics and activity at a glance</p>
      </div>

      {/* System Health */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            System Health
            <Badge
              variant={health.status === "healthy" ? "default" : "destructive"}
              className={
                health.status === "healthy"
                  ? "bg-green-500 hover:bg-green-600"
                  : ""
              }
            >
              {health.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {health.status === "healthy" && health.database && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">DB Response</p>
                <p className="text-white font-semibold">
                  {health.database.responseTime}ms
                </p>
              </div>
              <div>
                <p className="text-gray-400">DB Size</p>
                <p className="text-white font-semibold">
                  {(health.database.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="text-green-500 font-semibold">Connected</p>
              </div>
              <div>
                <p className="text-gray-400">Last Check</p>
                <p className="text-white font-semibold">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-750 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">
                    {user.name || "No name"}
                  </p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {user.memberships.length} org
                    {user.memberships.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Organizations */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentOrgs.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-750 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{org.name}</p>
                  <p className="text-sm text-gray-400">
                    {org._count.members} members • {org._count.tenders} tenders
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
