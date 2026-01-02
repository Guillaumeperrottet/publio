/**
 * Composant pour afficher les lignes d'offre avec sous-totaux par catégorie
 * Utilisé dans les vues en lecture seule (PDF, preview, etc.)
 */

import {
  groupLineItemsByCategory,
  hasCategories,
} from "@/lib/utils/offer-line-items";

interface OfferLineItem {
  position: number;
  description: string;
  quantity?: number;
  unit?: string;
  priceHT: number;
  tvaRate: number;
  category?: string;
  sectionOrder?: number;
}

interface LineItemsWithSubtotalsProps {
  lineItems: OfferLineItem[];
  currency: string;
  showTVA?: boolean;
}

export function LineItemsWithSubtotals({
  lineItems,
  currency,
  showTVA = false,
}: LineItemsWithSubtotalsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency,
    }).format(value);

  const categorizedGroups = groupLineItemsByCategory(lineItems);
  const showCategories = hasCategories(lineItems);

  if (!showCategories) {
    // Affichage simple sans catégories
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 w-16">Pos</th>
            <th className="text-left p-2">Désignation</th>
            <th className="text-right p-2 w-20">Qté</th>
            <th className="text-left p-2 w-24">Unité</th>
            <th className="text-right p-2 w-32">Prix HT</th>
            <th className="text-right p-2 w-32">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{String(item.position).padStart(2, "0")}</td>
              <td className="p-2">{item.description}</td>
              <td className="text-right p-2">{item.quantity || "-"}</td>
              <td className="p-2">{item.unit || "-"}</td>
              <td className="text-right p-2">{formatCurrency(item.priceHT)}</td>
              <td className="text-right p-2 font-semibold">
                {formatCurrency(item.priceHT * (item.quantity || 1))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Affichage avec catégories et sous-totaux
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2 w-16">Pos</th>
          <th className="text-left p-2">Désignation</th>
          <th className="text-right p-2 w-20">Qté</th>
          <th className="text-left p-2 w-24">Unité</th>
          <th className="text-right p-2 w-32">Prix HT</th>
          <th className="text-right p-2 w-32">Total</th>
        </tr>
      </thead>
      <tbody>
        {categorizedGroups.map((group, groupIndex) => (
          <>
            {/* En-tête de catégorie */}
            <tr key={`cat-${groupIndex}`} className="bg-gray-100">
              <td colSpan={6} className="p-2 font-bold text-sm">
                {group.category}
              </td>
            </tr>

            {/* Lignes de la catégorie */}
            {group.items.map((item, index) => (
              <tr key={`${groupIndex}-${index}`} className="border-b">
                <td className="p-2">
                  {String(item.position).padStart(2, "0")}
                </td>
                <td className="p-2">{item.description}</td>
                <td className="text-right p-2">{item.quantity || "-"}</td>
                <td className="p-2">{item.unit || "-"}</td>
                <td className="text-right p-2">
                  {formatCurrency(item.priceHT)}
                </td>
                <td className="text-right p-2 font-semibold">
                  {formatCurrency(item.priceHT * (item.quantity || 1))}
                </td>
              </tr>
            ))}

            {/* Sous-total de la catégorie */}
            <tr className="bg-gray-50">
              <td colSpan={5} className="text-right p-2 font-semibold text-sm">
                Sous-total {group.category}
              </td>
              <td className="text-right p-2 font-semibold text-sm">
                {formatCurrency(group.subtotalHT)}
              </td>
            </tr>

            {showTVA && (
              <tr className="bg-gray-50 text-xs">
                <td
                  colSpan={5}
                  className="text-right p-2 text-muted-foreground"
                >
                  TVA {group.items[0]?.tvaRate || 0}%
                </td>
                <td className="text-right p-2 text-muted-foreground">
                  {formatCurrency(group.subtotalTVA)}
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}
