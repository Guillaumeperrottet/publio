import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

/**
 * Composant pour afficher un état vide élégant
 * Utilisé quand il n'y a pas de données à afficher
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-sand-light flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-olive-soft" />
        </div>
      )}

      <h3 className="text-xl font-semibold text-matte-black mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}

      {(actionLabel && onAction) || actionHref ? (
        <Button
          onClick={onAction}
          className="bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black"
          asChild={!!actionHref}
        >
          {actionHref ? (
            <a href={actionHref}>{actionLabel}</a>
          ) : (
            <span>{actionLabel}</span>
          )}
        </Button>
      ) : null}
    </div>
  );
}
