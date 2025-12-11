import {
  HandDrawnCard,
  HandDrawnCardContent,
} from "@/components/ui/hand-drawn-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, Search, Bell } from "lucide-react";

type SmartAction = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  icon: "plus" | "search" | "file" | "bell";
  variant?: "default" | "outline";
};

const iconMap = {
  plus: Plus,
  search: Search,
  file: FileText,
  bell: Bell,
};

type SmartActionsProps = {
  actions: SmartAction[];
};

export function SmartActions({ actions }: SmartActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {actions.map((action, index) => {
        const Icon = iconMap[action.icon];

        return (
          <HandDrawnCard key={index}>
            <HandDrawnCardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {action.description}
              </p>
              <Link href={action.href}>
                <Button
                  variant={action.variant || "default"}
                  className="w-full"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.buttonLabel}
                </Button>
              </Link>
            </HandDrawnCardContent>
          </HandDrawnCard>
        );
      })}
    </div>
  );
}
