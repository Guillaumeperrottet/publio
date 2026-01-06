"use client";

import { ErrorSummary } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { resolveError } from "@/features/admin/actions";
import { useState } from "react";
import { toast } from "sonner";

interface ErrorListProps {
  errors: ErrorSummary[];
}

export function ErrorList({ errors }: ErrorListProps) {
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (errorId: string) => {
    try {
      setResolving(errorId);
      await resolveError(errorId);
      toast.success("Error marked as resolved");
    } catch {
      toast.error("Failed to resolve error");
    } finally {
      setResolving(null);
    }
  };

  if (errors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
        <p>No errors detected. All systems operational! 🎉</p>
      </div>
    );
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "fatal":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "fatal":
        return <Badge variant="destructive">Fatal</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "warning":
        return <Badge variant="secondary">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`border rounded-lg p-4 transition-colors ${
            error.status === "resolved"
              ? "bg-gray-50 border-gray-200"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getLevelIcon(error.level)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{error.title}</h3>
                  {getLevelBadge(error.level)}
                  {error.status === "resolved" && (
                    <Badge
                      variant="outline"
                      className="text-green-500 border-green-500"
                    >
                      Resolved
                    </Badge>
                  )}
                  {error.count > 1 && (
                    <Badge variant="secondary">{error.count}x</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {error.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Platform: {error.platform}</span>
                  <span>
                    Last seen: {new Date(error.lastSeen).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            {error.status === "unresolved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResolve(error.id)}
                disabled={resolving === error.id}
              >
                {resolving === error.id ? "Resolving..." : "Resolve"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
