import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Deadline = {
  id: string;
  title: string;
  deadline: Date;
  type: "tender" | "offer";
  status?: string;
};

type DeadlinesTimelineProps = {
  deadlines: Deadline[];
};

export function DeadlinesTimeline({ deadlines }: DeadlinesTimelineProps) {
  if (deadlines.length === 0) {
    return (
      <HandDrawnCard>
        <HandDrawnCardHeader>
          <HandDrawnCardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-artisan-yellow" />
            Prochaines échéances
          </HandDrawnCardTitle>
        </HandDrawnCardHeader>
        <HandDrawnCardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-artisan-yellow mb-3" />
            <p className="text-sm font-medium text-matte-black mb-1">
              Aucune échéance
            </p>
            <p className="text-xs text-muted-foreground">
              Publiez un appel d&apos;offres pour voir vos échéances ici
            </p>
          </div>
        </HandDrawnCardContent>
      </HandDrawnCard>
    );
  }

  // Calculer l'urgence en heures
  const getUrgency = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return diff / (1000 * 60 * 60); // heures
  };

  const getUrgencyBadge = (deadline: Date) => {
    const hours = getUrgency(deadline);

    if (hours < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Expiré
        </Badge>
      );
    }

    if (hours <= 48) {
      return (
        <Badge className="bg-red-500 text-white text-xs border-2 border-red-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          Urgent
        </Badge>
      );
    }

    if (hours <= 120) {
      // 5 jours
      return (
        <Badge className="bg-artisan-yellow text-matte-black text-xs border-2 border-matte-black">
          Bientôt
        </Badge>
      );
    }

    return null;
  };

  return (
    <HandDrawnCard>
      <HandDrawnCardHeader className="pb-2">
        <HandDrawnCardTitle className="flex items-center gap-1.5 text-sm">
          <Clock className="w-4 h-4 text-artisan-yellow" />
          Prochaines échéances
        </HandDrawnCardTitle>
      </HandDrawnCardHeader>
      <HandDrawnCardContent className="pt-2">
        <div className="space-y-1.5">
          {deadlines.slice(0, 3).map((item) => {
            const urgency = getUrgency(item.deadline);
            const isUrgent = urgency <= 48 && urgency > 0;

            return (
              <Link
                key={item.id}
                href={
                  item.type === "tender"
                    ? `/dashboard/tenders/${item.id}`
                    : `/dashboard/offers`
                }
                className={`block p-2 rounded-lg border-2 transition-all group ${
                  isUrgent
                    ? "border-red-300 bg-red-50 hover:border-red-500"
                    : "border-gray-200 hover:border-artisan-yellow hover:bg-artisan-yellow/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs truncate group-hover:text-artisan-yellow transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.deadline), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  {getUrgencyBadge(item.deadline)}
                </div>
              </Link>
            );
          })}
        </div>

        {deadlines.length > 5 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            + {deadlines.length - 5} autre{deadlines.length - 5 > 1 ? "s" : ""}{" "}
            échéance{deadlines.length - 5 > 1 ? "s" : ""}
          </p>
        )}
      </HandDrawnCardContent>
    </HandDrawnCard>
  );
}
