"use client";

import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface SignaturePadProps {
  value?: string;
  onChange: (signature: string) => void;
}

export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (value && sigCanvas.current) {
      sigCanvas.current.fromDataURL(value);
    }
  }, [value]);

  const clear = () => {
    sigCanvas.current?.clear();
    onChange("");
  };

  const save = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL();
      onChange(dataURL);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "w-full h-48 cursor-crosshair",
          }}
          onEnd={save}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Effacer
        </Button>
        {value && (
          <span className="text-sm text-green-600 flex items-center">
            ✓ Signature enregistrée
          </span>
        )}
      </div>
    </div>
  );
}
