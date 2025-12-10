import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const handDrawnBadgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#DEAE00] bg-[#DEAE00]/10 text-[#0D0D0D] hover:bg-[#DEAE00]/20",
        secondary:
          "border-[#1B4332] bg-[#1B4332]/10 text-[#1B4332] hover:bg-[#1B4332]/20",
        success:
          "border-[#52b788] bg-[#52b788]/10 text-[#1B4332] hover:bg-[#52b788]/20",
        warning:
          "border-[#f77f00] bg-[#f77f00]/10 text-[#0D0D0D] hover:bg-[#f77f00]/20",
        error:
          "border-[#d62828] bg-[#d62828]/10 text-[#d62828] hover:bg-[#d62828]/20",
        outline: "border-[#6B705C] text-[#0D0D0D] hover:bg-[#6B705C]/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface HandDrawnBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof handDrawnBadgeVariants> {}

function HandDrawnBadge({ className, variant, ...props }: HandDrawnBadgeProps) {
  return (
    <div
      className={cn(handDrawnBadgeVariants({ variant }), className)}
      style={{
        transform: "rotate(-0.5deg)",
      }}
      {...props}
    />
  );
}

export { HandDrawnBadge, handDrawnBadgeVariants };
