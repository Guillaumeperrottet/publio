import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonitoringStats, getRecentErrors } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { ErrorList } from "@/components/admin/error-list";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function MonitoringPage() {
  const [stats, recentErrors] = await Promise.all([
    getMonitoringStats(),
    getRecentErrors(20),
  ]);

  const unresolvedErrors = recentErrors.filter(
    (e) => e.status === "unresolved"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Monitoring & Observability</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring, error tracking, and system health
        </p>
      </div>

      {/* Alert Banner */}
      {unresolvedErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">
              {unresolvedErrors.length} unresolved error
              {unresolvedErrors.length > 1 ? "s" : ""} detected
            </p>
            <p className="text-sm text-red-700">
              Review and resolve critical issues below
            </p>
          </div>
        </div>
      )}

      {/* Error Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Errors (24h)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errors.last24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.errors.unresolved} unresolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.performance.errorRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.performance.errorRate < 1
                ? "✓ Within threshold"
                : "⚠ Above threshold"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.performance.uptime}%
            </div>
            <p className="text-xs text-green-500">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.performance.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {stats.performance.p95ResponseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Average Response Time
              </span>
              <span className="font-mono font-bold">
                {stats.performance.avgResponseTime}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                P95 Response Time
              </span>
              <span className="font-mono font-bold">
                {stats.performance.p95ResponseTime}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <Badge
                variant={
                  stats.performance.errorRate < 1 ? "default" : "destructive"
                }
              >
                {stats.performance.errorRate.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <Badge variant="default">{stats.performance.uptime}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Analytics (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Page Views</span>
              <span className="font-mono font-bold">
                {stats.analytics.pageviews.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Unique Users
              </span>
              <span className="font-mono font-bold">
                {stats.analytics.uniqueUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Session Duration
              </span>
              <span className="font-mono font-bold">
                {stats.analytics.avgSessionDuration}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
              <Badge variant="secondary">{stats.analytics.bounceRate}%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Database Connections
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.system.dbConnections}
                </span>
                <span className="text-sm text-muted-foreground">active</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Memory Usage
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.system.memoryUsage}%
                </span>
                <Badge
                  variant={
                    stats.system.memoryUsage > 80 ? "destructive" : "secondary"
                  }
                >
                  {stats.system.memoryUsage > 80 ? "High" : "Normal"}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                CPU Usage
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.system.cpuUsage}%
                </span>
                <Badge
                  variant={
                    stats.system.cpuUsage > 80 ? "destructive" : "secondary"
                  }
                >
                  {stats.system.cpuUsage > 80 ? "High" : "Normal"}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Disk Usage
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {stats.system.diskUsage}%
                </span>
                <Badge
                  variant={
                    stats.system.diskUsage > 80 ? "destructive" : "secondary"
                  }
                >
                  {stats.system.diskUsage > 80 ? "High" : "Normal"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Errors
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Last 20 errors grouped by similarity
            </p>
          </div>
          {process.env.NEXT_PUBLIC_SENTRY_DSN && (
            <Link
              href="https://sentry.io"
              target="_blank"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              View in Sentry
              <Clock className="h-3 w-3" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <ErrorList errors={recentErrors} />
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  process.env.NEXT_PUBLIC_SENTRY_DSN
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              />
              <div>
                <div className="font-medium">Sentry</div>
                <div className="text-xs text-muted-foreground">
                  {process.env.NEXT_PUBLIC_SENTRY_DSN
                    ? "Connected"
                    : "Not configured"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  process.env.NEXT_PUBLIC_POSTHOG_KEY
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              />
              <div>
                <div className="font-medium">PostHog</div>
                <div className="text-xs text-muted-foreground">
                  {process.env.NEXT_PUBLIC_POSTHOG_KEY
                    ? "Connected"
                    : "Not configured"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
