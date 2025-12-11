import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

type Insight = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  type: "success" | "warning" | "info";
};

type InsightsCardProps = {
  insights: Insight[];
};

export function InsightsCard({ insights }: InsightsCardProps) {
  if (insights.length === 0) {
    return null;
  }

  const getTypeColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "bg-deep-green/10 border-deep-green/30 text-deep-green";
      case "warning":
        return "bg-artisan-yellow/10 border-artisan-yellow/30 text-artisan-yellow";
      case "info":
        return "bg-olive-soft/10 border-olive-soft/30 text-olive-soft";
    }
  };

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-artisan-yellow" />
          Insights & recommandations
        </HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getTypeColor(
                insight.type
              )}`}
            >
              <h4 className="font-semibold text-sm mb-1 text-matte-black">
                {insight.title}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {insight.description}
              </p>
              {insight.action && (
                <Link
                  href={insight.action.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-matte-black hover:underline"
                >
                  {insight.action.label}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
