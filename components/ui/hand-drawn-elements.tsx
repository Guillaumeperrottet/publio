export function HandDrawnArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="roughness">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="5"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path
        d="M10,50 Q80,10 150,50"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#roughness)"
      />
      <path
        d="M140,35 L150,50 L140,60"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#roughness)"
      />
    </svg>
  );
}

export function HandDrawnUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 20"
      className={`absolute -bottom-2 left-0 w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="underline-roughness">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.1"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path
        d="M5,10 Q75,5 150,10 T295,10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        filter="url(#underline-roughness)"
      />
    </svg>
  );
}

export function HandDrawnCircle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="circle-roughness">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        filter="url(#circle-roughness)"
      />
    </svg>
  );
}

export function HandDrawnStar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="star-roughness">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.1"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path
        d="M50,10 L61,40 L95,40 L68,60 L79,90 L50,70 L21,90 L32,60 L5,40 L39,40 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.2"
        filter="url(#star-roughness)"
      />
    </svg>
  );
}
