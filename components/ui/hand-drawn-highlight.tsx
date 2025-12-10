import { cn } from "@/lib/utils";

interface HandDrawnHighlightProps {
  children: React.ReactNode;
  className?: string;
  variant?: "yellow" | "green" | "olive" | "blue";
}

export function HandDrawnHighlight({
  children,
  className,
  variant = "yellow",
}: HandDrawnHighlightProps) {
  // Couleurs vives pour un effet marqueur visible
  const colors = {
    yellow: "#FFD93D",
    green: "#6BCF7F",
    olive: "#B8C77E",
    blue: "#74B9FF",
  };

  return (
    <span
      className={cn("relative inline-block font-handdrawn", className)}
      style={{
        fontFamily: "var(--font-handdrawn)",
      }}
    >
      <span className="relative z-10 px-3 py-1.5">{children}</span>
      {/* SVG avec effet coup de pinceau visible */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: "scale(1.05, 1.3)",
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`brush-texture-${variant}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.5"
              numOctaves="4"
              seed={
                variant === "yellow"
                  ? 5
                  : variant === "green"
                  ? 10
                  : variant === "olive"
                  ? 15
                  : 20
              }
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* Trois traits de pinceau décalés - effet main levée */}
        {/* Premier trait - en haut, légèrement décalé */}
        <rect
          x="1%"
          y="25%"
          width="98%"
          height="18%"
          fill={colors[variant]}
          opacity="0.4"
          rx="8"
          transform="rotate(-0.8 50 50)"
          filter={`url(#brush-texture-${variant})`}
        />

        {/* Deuxième trait - milieu, angle opposé */}
        <rect
          x="0.5%"
          y="38%"
          width="99%"
          height="16%"
          fill={colors[variant]}
          opacity="0.5"
          rx="8"
          transform="rotate(0.5 50 50)"
          filter={`url(#brush-texture-${variant})`}
        />

        {/* Troisième trait - bas, plus épais */}
        <rect
          x="0%"
          y="50%"
          width="100%"
          height="20%"
          fill={colors[variant]}
          opacity="0.6"
          rx="10"
          transform="rotate(-0.3 50 50)"
          filter={`url(#brush-texture-${variant})`}
        />
      </svg>
    </span>
  );
}
