"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

export function ShareTenderButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full border-2 border-matte-black hover:bg-sand-light transition-colors"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-deep-green" />
          Lien copié !
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Partager ce projet
        </>
      )}
    </Button>
  );
}
