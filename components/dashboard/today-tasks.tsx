import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
  completed?: boolean;
};

type TodayTasksProps = {
  tasks: Task[];
};

export function TodayTasks({ tasks }: TodayTasksProps) {
  if (tasks.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-deep-green" />À faire
            aujourd&apos;hui
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto text-deep-green mb-3" />
            <p className="text-sm font-medium text-matte-black mb-1">
              Tout est à jour !
            </p>
            <p className="text-xs text-muted-foreground">
              Aucune tâche urgente pour le moment
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Circle className="w-4 h-4 text-artisan-yellow" />;
      case "low":
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-artisan-yellow text-matte-black text-xs border-2 border-matte-black">
            Important
          </Badge>
        );
      case "low":
        return null;
    }
  };

  return (
    <HandDrawnCard className="border-artisan-yellow border-2">
      <HandDrawnCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <HandDrawnCardTitle className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-artisan-yellow" />À faire
            aujourd&apos;hui
          </HandDrawnCardTitle>
          <Badge className="bg-artisan-yellow text-matte-black border-2 border-matte-black font-bold text-xs">
            {tasks.length}
          </Badge>
        </div>
      </HandDrawnCardHeader>
      <HandDrawnCardContent className="pt-2">
        <div className="space-y-1.5">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={task.href}
              className="block p-2 rounded-lg border-2 border-gray-200 hover:border-artisan-yellow hover:bg-artisan-yellow/5 transition-all group"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getPriorityIcon(task.priority)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="font-semibold text-xs group-hover:text-artisan-yellow transition-colors">
                      {task.title}
                    </h4>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {task.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
