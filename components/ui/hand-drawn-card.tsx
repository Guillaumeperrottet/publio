import * as React from "react";
import { cn } from "@/lib/utils";

const HandDrawnCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border-2 border-muted-foreground/20 bg-card text-card-foreground shadow-sm",
      "hover:shadow-md transition-shadow",
      "relative",
      className
    )}
    style={{
      borderRadius: "12px",
    }}
    {...props}
  />
));
HandDrawnCard.displayName = "HandDrawnCard";

const HandDrawnCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
HandDrawnCardHeader.displayName = "HandDrawnCardHeader";

const HandDrawnCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-tight", className)}
    {...props}
  />
));
HandDrawnCardTitle.displayName = "HandDrawnCardTitle";

const HandDrawnCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
HandDrawnCardDescription.displayName = "HandDrawnCardDescription";

const HandDrawnCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
HandDrawnCardContent.displayName = "HandDrawnCardContent";

const HandDrawnCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
HandDrawnCardFooter.displayName = "HandDrawnCardFooter";

export {
  HandDrawnCard,
  HandDrawnCardHeader,
  HandDrawnCardFooter,
  HandDrawnCardTitle,
  HandDrawnCardDescription,
  HandDrawnCardContent,
};
