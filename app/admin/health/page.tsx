import { getSystemHealth } from "@/features/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Database, Clock, HardDrive, Table } from "lucide-react";

export default async function HealthPage() {
  const health = await getSystemHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-pink-500/10">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-1">
            Real-time system status and diagnostics
          </p>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Status</span>
            <Badge
              variant={health.status === "healthy" ? "default" : "destructive"}
              className={
                health.status === "healthy"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : ""
              }
            >
              {health.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Last checked:</span>
              <span className="text-gray-900 font-mono">
                {new Date(health.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Health */}
      {health.status === "healthy" && health.database && (
        <>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Connection</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {health.database.connected ? "Connected" : "Disconnected"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Response Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {health.database.responseTime}ms
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Database Size</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(health.database.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Tables */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5 text-purple-500" />
                Record Counts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(health.database.tables).map(
                  ([table, count]) => (
                    <div
                      key={table}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <p className="text-sm text-gray-600 capitalize mb-1">
                        {table}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {count.toLocaleString()}
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Error State */}
      {health.status === "unhealthy" && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  System Error
                </h3>
                <p className="text-sm text-red-700">
                  {"error" in health ? health.error : "Unknown error occurred"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Check Info */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Health Check Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              • <strong>Database connectivity:</strong> Tests PostgreSQL
              connection and response time
            </p>
            <p>
              • <strong>Database size:</strong> Current database size in
              megabytes
            </p>
            <p>
              • <strong>Record counts:</strong> Number of records in main tables
            </p>
            <p className="pt-3 text-gray-500 text-xs">
              Health checks are performed in real-time when this page loads.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
