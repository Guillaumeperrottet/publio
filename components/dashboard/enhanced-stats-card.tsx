import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

type EnhancedStatsCardProps = {
  title: string;
  mainValue: number;
  mainLabel: string;
  icon: LucideIcon;
  href: string;
  buttonLabel: string;
  colorClass: string;
  metrics?: {
    label: string;
    value: string | number;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }[];
};

export function EnhancedStatsCard({
  title,
  mainValue,
  mainLabel,
  icon: Icon,
  href,
  buttonLabel,
  colorClass,
  metrics = [],
}: EnhancedStatsCardProps) {
  return (
    <HandDrawnCard>
      <HandDrawnCardHeader>
        <HandDrawnCardTitle className="text-xl font-semibold">
          {title}
        </HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent>
        <p className={`text-5xl font-bold mb-2 ${colorClass}`}>{mainValue}</p>
        <p className="text-sm text-muted-foreground mb-4">{mainLabel}</p>

        {metrics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {metrics.map((metric, index) => (
              <Badge
                key={index}
                variant={metric.variant || "outline"}
                className="text-xs"
              >
                {metric.label}: {metric.value}
              </Badge>
            ))}
          </div>
        )}

        <Link href={href}>
          <Button variant="outline" size="sm" className="w-full">
            <Icon className="w-4 h-4 mr-2" />
            {buttonLabel}
          </Button>
        </Link>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
