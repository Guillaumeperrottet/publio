/**
 * Utilitaires pour gérer les lignes d'offre et les sous-totaux par catégorie
 */

export interface OfferLineItem {
  position: number;
  description: string;
  quantity?: number;
  unit?: string;
  priceHT: number;
  tvaRate: number;
  category?: string;
  sectionOrder?: number;
}

export interface LineItemsByCategory {
  category: string;
  sectionOrder: number;
  items: OfferLineItem[];
  subtotalHT: number;
  subtotalTVA: number;
  subtotalTTC: number;
}

/**
 * Groupe les lignes d'offre par catégorie et calcule les sous-totaux
 * Les lignes sans catégorie sont regroupées dans "Autres postes"
 */
export function groupLineItemsByCategory(
  lineItems: OfferLineItem[]
): LineItemsByCategory[] {
  if (!lineItems || lineItems.length === 0) return [];

  // Grouper par catégorie
  const grouped = new Map<string, OfferLineItem[]>();
  const categoryOrders = new Map<string, number>();

  lineItems.forEach((item) => {
    const category = item.category || "Autres postes";
    const sectionOrder = item.sectionOrder ?? 999;

    if (!grouped.has(category)) {
      grouped.set(category, []);
      categoryOrders.set(category, sectionOrder);
    }
    grouped.get(category)!.push(item);
  });

  // Calculer les sous-totaux pour chaque catégorie
  const result: LineItemsByCategory[] = [];

  grouped.forEach((items, category) => {
    let subtotalHT = 0;
    let subtotalTVA = 0;

    items.forEach((item) => {
      const lineHT = item.priceHT;
      const lineTVA = (lineHT * item.tvaRate) / 100;
      subtotalHT += lineHT;
      subtotalTVA += lineTVA;
    });

    result.push({
      category,
      sectionOrder: categoryOrders.get(category) || 999,
      items,
      subtotalHT,
      subtotalTVA,
      subtotalTTC: subtotalHT + subtotalTVA,
    });
  });

  // Trier par sectionOrder
  result.sort((a, b) => a.sectionOrder - b.sectionOrder);

  return result;
}

/**
 * Vérifie si un tableau de lignes contient des catégories
 */
export function hasCategories(lineItems: OfferLineItem[]): boolean {
  return lineItems.some((item) => item.category && item.category.trim() !== "");
}

/**
 * Calcule le total HT de toutes les lignes
 */
export function calculateTotalHT(lineItems: OfferLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.priceHT, 0);
}

/**
 * Calcule le total TVA de toutes les lignes
 */
export function calculateTotalTVA(lineItems: OfferLineItem[]): number {
  return lineItems.reduce((sum, item) => {
    const tva = (item.priceHT * item.tvaRate) / 100;
    return sum + tva;
  }, 0);
}

/**
 * Calcule le total TTC de toutes les lignes
 */
export function calculateTotalTTC(lineItems: OfferLineItem[]): number {
  const ht = calculateTotalHT(lineItems);
  const tva = calculateTotalTVA(lineItems);
  return ht + tva;
}
