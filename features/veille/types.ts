/**
 * Types pour le module Veille Communale
 */

export type PublicationType =
  | "MISE_A_LENQUETE"
  | "PERMIS_CONSTRUIRE"
  | "AVIS_OFFICIEL"
  | "AUTORISATION_CONSTRUIRE"
  | "OPPOSITION"
  | "APPEL_DOFFRES"
  | "AUTRE";

export type Canton =
  | "VD"
  | "GE"
  | "VS"
  | "FR"
  | "NE"
  | "JU"
  | "BE"
  | "TI"
  | "GR";

export interface ScrapedPublication {
  title: string;
  description?: string;
  url: string;
  commune: string;
  canton: Canton;
  type: PublicationType;
  publishedAt: Date;
  metadata?: {
    parcelle?: string;
    adresse?: string;
    superficie?: string;
    auteur?: string;
    pdfUrl?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface VeilleSubscriptionData {
  cantons: Canton[];
  keywords?: string[];
  emailNotifications?: boolean;
  appNotifications?: boolean;
}

export interface CantonInfo {
  code: Canton;
  name: string;
  nameFull: string;
}

// Cantons suisses romands
export const CANTONS_ROMANDS: CantonInfo[] = [
  { code: "FR", name: "Fribourg", nameFull: "Canton de Fribourg" },
  { code: "VD", name: "Vaud", nameFull: "Canton de Vaud" },
  { code: "VS", name: "Valais", nameFull: "Canton du Valais" },
  { code: "GE", name: "Genève", nameFull: "Canton de Genève" },
  { code: "NE", name: "Neuchâtel", nameFull: "Canton de Neuchâtel" },
  { code: "JU", name: "Jura", nameFull: "Canton du Jura" },
  { code: "BE", name: "Berne", nameFull: "Canton de Berne (partie romande)" },
];

export interface Commune {
  name: string;
  canton: Canton;
  npa?: string;
}

// Liste des communes suisses romandes (extrait)
export const COMMUNES_ROMANDES: Commune[] = [
  // Vaud (VD) - Top 20
  { name: "Lausanne", canton: "VD", npa: "1000" },
  { name: "Yverdon-les-Bains", canton: "VD", npa: "1400" },
  { name: "Montreux", canton: "VD", npa: "1820" },
  { name: "Vevey", canton: "VD", npa: "1800" },
  { name: "Pully", canton: "VD", npa: "1009" },
  { name: "Nyon", canton: "VD", npa: "1260" },
  { name: "Renens", canton: "VD", npa: "1020" },
  { name: "Morges", canton: "VD", npa: "1110" },
  { name: "Prilly", canton: "VD", npa: "1008" },
  { name: "La Tour-de-Peilz", canton: "VD", npa: "1814" },
  { name: "Aigle", canton: "VD", npa: "1860" },
  { name: "Ecublens", canton: "VD", npa: "1024" },
  { name: "Gland", canton: "VD", npa: "1196" },
  { name: "Crissier", canton: "VD", npa: "1023" },
  { name: "Lutry", canton: "VD", npa: "1095" },
  { name: "Epalinges", canton: "VD", npa: "1066" },
  { name: "Chavannes-près-Renens", canton: "VD", npa: "1022" },
  { name: "Le Mont-sur-Lausanne", canton: "VD", npa: "1052" },
  { name: "Villeneuve", canton: "VD", npa: "1844" },
  { name: "Bussigny", canton: "VD", npa: "1030" },

  // Genève (GE) - Top 20
  { name: "Genève", canton: "GE", npa: "1200" },
  { name: "Vernier", canton: "GE", npa: "1214" },
  { name: "Lancy", canton: "GE", npa: "1212" },
  { name: "Meyrin", canton: "GE", npa: "1217" },
  { name: "Carouge", canton: "GE", npa: "1227" },
  { name: "Thônex", canton: "GE", npa: "1226" },
  { name: "Onex", canton: "GE", npa: "1213" },
  { name: "Versoix", canton: "GE", npa: "1290" },
  { name: "Chêne-Bougeries", canton: "GE", npa: "1224" },
  { name: "Plan-les-Ouates", canton: "GE", npa: "1228" },
  { name: "Grand-Saconnex", canton: "GE", npa: "1218" },
  { name: "Veyrier", canton: "GE", npa: "1255" },
  { name: "Bernex", canton: "GE", npa: "1233" },
  { name: "Confignon", canton: "GE", npa: "1232" },
  { name: "Anières", canton: "GE", npa: "1247" },
  { name: "Chêne-Bourg", canton: "GE", npa: "1225" },
  { name: "Collonge-Bellerive", canton: "GE", npa: "1245" },
  { name: "Cologny", canton: "GE", npa: "1223" },
  { name: "Pregny-Chambésy", canton: "GE", npa: "1292" },
  { name: "Aire-la-Ville", canton: "GE", npa: "1288" },

  // Valais (VS) - Top 15
  { name: "Sion", canton: "VS", npa: "1950" },
  { name: "Monthey", canton: "VS", npa: "1870" },
  { name: "Sierre", canton: "VS", npa: "3960" },
  { name: "Martigny", canton: "VS", npa: "1920" },
  { name: "Fully", canton: "VS", npa: "1926" },
  { name: "Saxon", canton: "VS", npa: "1907" },
  { name: "Conthey", canton: "VS", npa: "1964" },
  { name: "Collombey-Muraz", canton: "VS", npa: "1868" },
  { name: "Nendaz", canton: "VS", npa: "1997" },
  { name: "Bagnes", canton: "VS", npa: "1934" },
  { name: "Savièse", canton: "VS", npa: "1965" },
  { name: "Saint-Maurice", canton: "VS", npa: "1890" },
  { name: "Crans-Montana", canton: "VS", npa: "3963" },
  { name: "Brig-Glis", canton: "VS", npa: "3900" },
  { name: "Vétroz", canton: "VS", npa: "1963" },

  // Fribourg (FR) - Top 10
  { name: "Fribourg", canton: "FR", npa: "1700" },
  { name: "Bulle", canton: "FR", npa: "1630" },
  { name: "Villars-sur-Glâne", canton: "FR", npa: "1752" },
  { name: "Marly", canton: "FR", npa: "1723" },
  { name: "Givisiez", canton: "FR", npa: "1762" },
  { name: "Granges-Paccot", canton: "FR", npa: "1763" },
  { name: "Châtel-Saint-Denis", canton: "FR", npa: "1618" },
  { name: "Romont", canton: "FR", npa: "1680" },
  { name: "Estavayer-le-Lac", canton: "FR", npa: "1470" },
  { name: "Avry", canton: "FR", npa: "1754" },

  // Neuchâtel (NE) - Top 10
  { name: "Neuchâtel", canton: "NE", npa: "2000" },
  { name: "La Chaux-de-Fonds", canton: "NE", npa: "2300" },
  { name: "Le Locle", canton: "NE", npa: "2400" },
  { name: "Val-de-Ruz", canton: "NE", npa: "2053" },
  { name: "Marin-Epagnier", canton: "NE", npa: "2074" },
  { name: "Peseux", canton: "NE", npa: "2034" },
  { name: "Corcelles-Cormondrèche", canton: "NE", npa: "2035" },
  { name: "Colombier", canton: "NE", npa: "2013" },
  { name: "Boudry", canton: "NE", npa: "2017" },
  { name: "La Tène", canton: "NE", npa: "2074" },

  // Jura (JU) - Top 5
  { name: "Delémont", canton: "JU", npa: "2800" },
  { name: "Porrentruy", canton: "JU", npa: "2900" },
  { name: "Saignelégier", canton: "JU", npa: "2350" },
  { name: "Courrendlin", canton: "JU", npa: "2830" },
  { name: "Develier", canton: "JU", npa: "2802" },
];

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  MISE_A_LENQUETE: "Mise à l'enquête",
  PERMIS_CONSTRUIRE: "Permis de construire",
  AVIS_OFFICIEL: "Avis officiel",
  AUTORISATION_CONSTRUIRE: "Autorisation de construire",
  OPPOSITION: "Opposition",
  APPEL_DOFFRES: "Appel d'offres",
  AUTRE: "Autre",
};

export const PUBLICATION_TYPE_ICONS: Record<PublicationType, string> = {
  MISE_A_LENQUETE: "🏗️",
  PERMIS_CONSTRUIRE: "📋",
  AVIS_OFFICIEL: "📢",
  AUTORISATION_CONSTRUIRE: "✅",
  OPPOSITION: "⚠️",
  APPEL_DOFFRES: "💼",
  AUTRE: "📄",
};
