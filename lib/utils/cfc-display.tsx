import { Badge } from "@/components/ui/badge";
import { getCFCByCode } from "@/lib/constants/cfc-codes";

/**
 * Composant pour afficher un ou plusieurs codes CFC comme badges
 */
export function CFCBadges({
  codes,
  variant = "outline",
}: {
  codes: string[];
  variant?: "default" | "secondary" | "outline" | "destructive";
}) {
  if (!codes || codes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {codes.map((code) => {
        const cfcInfo = getCFCByCode(code);
        return (
          <Badge key={code} variant={variant} className="text-sm">
            {code} - {cfcInfo?.label || "Code inconnu"}
          </Badge>
        );
      })}
    </div>
  );
}

/**
 * Fonction helper pour formater un code CFC avec son label
 */
export function formatCFCCode(code: string): string {
  const cfcInfo = getCFCByCode(code);
  return cfcInfo ? `${code} - ${cfcInfo.label}` : code;
}

/**
 * Fonction helper pour obtenir tous les labels des codes CFC
 */
export function getCFCLabels(codes: string[]): string[] {
  return codes
    .map((code) => {
      const cfcInfo = getCFCByCode(code);
      return cfcInfo?.label;
    })
    .filter((label): label is string => label !== undefined);
}
