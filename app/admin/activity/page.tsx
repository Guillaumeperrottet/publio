import { getActivityLogs } from "@/features/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity as ActivityIcon, User } from "lucide-react";

export default async function ActivityPage() {
  const { logs } = await getActivityLogs({ limit: 100 });

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      USER_CREATED: "bg-green-500",
      USER_DELETED: "bg-red-500",
      USER_BLOCKED: "bg-orange-500",
      USER_UNBLOCKED: "bg-blue-500",
      ORGANIZATION_CREATED: "bg-green-500",
      ORGANIZATION_DELETED: "bg-red-500",
      SUBSCRIPTION_CREATED: "bg-purple-500",
      SUBSCRIPTION_CANCELLED: "bg-orange-500",
      ADMIN_LOGIN: "bg-yellow-500",
      SYSTEM_ERROR: "bg-red-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-orange-500/10">
          <ActivityIcon className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            System audit trail and activity history
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {logs.map((log) => (
          <Card
            key={log.id}
            className="bg-white border-gray-200 hover:border-gray-300 transition-colors"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Type Badge */}
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(
                    log.type
                  )}`}
                />

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={`${getActivityColor(
                            log.type
                          )} hover:${getActivityColor(log.type)}/80`}
                        >
                          {log.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  {log.user && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{log.user.name || log.user.email}</span>
                    </div>
                  )}

                  {/* Metadata */}
                  {log.metadata && (
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-700">
                        View metadata
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}

                  {/* IP & User Agent */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    {log.userAgent && (
                      <span className="truncate max-w-md">{log.userAgent}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {logs.length === 0 && (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No activity logs yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
