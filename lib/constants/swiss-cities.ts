/**
 * Liste des principales villes suisses avec codes postaux
 * Organisée par canton pour faciliter la recherche
 */

export interface SwissCity {
  name: string;
  canton: string;
  postalCode: string;
  displayName: string; // Format: "Ville (Code postal) - Canton"
}

export const SWISS_CITIES: SwissCity[] = [
  // Canton de Vaud (VD)
  {
    name: "Lausanne",
    canton: "VD",
    postalCode: "1000",
    displayName: "Lausanne (1000) - VD",
  },
  {
    name: "Montreux",
    canton: "VD",
    postalCode: "1820",
    displayName: "Montreux (1820) - VD",
  },
  {
    name: "Vevey",
    canton: "VD",
    postalCode: "1800",
    displayName: "Vevey (1800) - VD",
  },
  {
    name: "Yverdon-les-Bains",
    canton: "VD",
    postalCode: "1400",
    displayName: "Yverdon-les-Bains (1400) - VD",
  },
  {
    name: "Nyon",
    canton: "VD",
    postalCode: "1260",
    displayName: "Nyon (1260) - VD",
  },
  {
    name: "Renens",
    canton: "VD",
    postalCode: "1020",
    displayName: "Renens (1020) - VD",
  },
  {
    name: "Morges",
    canton: "VD",
    postalCode: "1110",
    displayName: "Morges (1110) - VD",
  },
  {
    name: "Pully",
    canton: "VD",
    postalCode: "1009",
    displayName: "Pully (1009) - VD",
  },

  // Canton de Genève (GE)
  {
    name: "Genève",
    canton: "GE",
    postalCode: "1200",
    displayName: "Genève (1200) - GE",
  },
  {
    name: "Vernier",
    canton: "GE",
    postalCode: "1214",
    displayName: "Vernier (1214) - GE",
  },
  {
    name: "Lancy",
    canton: "GE",
    postalCode: "1212",
    displayName: "Lancy (1212) - GE",
  },
  {
    name: "Meyrin",
    canton: "GE",
    postalCode: "1217",
    displayName: "Meyrin (1217) - GE",
  },
  {
    name: "Carouge",
    canton: "GE",
    postalCode: "1227",
    displayName: "Carouge (1227) - GE",
  },
  {
    name: "Onex",
    canton: "GE",
    postalCode: "1213",
    displayName: "Onex (1213) - GE",
  },
  {
    name: "Thônex",
    canton: "GE",
    postalCode: "1226",
    displayName: "Thônex (1226) - GE",
  },

  // Canton du Valais (VS)
  {
    name: "Sion",
    canton: "VS",
    postalCode: "1950",
    displayName: "Sion (1950) - VS",
  },
  {
    name: "Martigny",
    canton: "VS",
    postalCode: "1920",
    displayName: "Martigny (1920) - VS",
  },
  {
    name: "Monthey",
    canton: "VS",
    postalCode: "1870",
    displayName: "Monthey (1870) - VS",
  },
  {
    name: "Sierre",
    canton: "VS",
    postalCode: "3960",
    displayName: "Sierre (3960) - VS",
  },
  {
    name: "Brig-Glis",
    canton: "VS",
    postalCode: "3900",
    displayName: "Brig-Glis (3900) - VS",
  },
  {
    name: "Visp",
    canton: "VS",
    postalCode: "3930",
    displayName: "Visp (3930) - VS",
  },

  // Canton de Fribourg (FR)
  {
    name: "Fribourg",
    canton: "FR",
    postalCode: "1700",
    displayName: "Fribourg (1700) - FR",
  },
  {
    name: "Bulle",
    canton: "FR",
    postalCode: "1630",
    displayName: "Bulle (1630) - FR",
  },
  {
    name: "Villars-sur-Glâne",
    canton: "FR",
    postalCode: "1752",
    displayName: "Villars-sur-Glâne (1752) - FR",
  },
  {
    name: "Marly",
    canton: "FR",
    postalCode: "1723",
    displayName: "Marly (1723) - FR",
  },

  // Canton de Neuchâtel (NE)
  {
    name: "Neuchâtel",
    canton: "NE",
    postalCode: "2000",
    displayName: "Neuchâtel (2000) - NE",
  },
  {
    name: "La Chaux-de-Fonds",
    canton: "NE",
    postalCode: "2300",
    displayName: "La Chaux-de-Fonds (2300) - NE",
  },
  {
    name: "Le Locle",
    canton: "NE",
    postalCode: "2400",
    displayName: "Le Locle (2400) - NE",
  },

  // Canton du Jura (JU)
  {
    name: "Delémont",
    canton: "JU",
    postalCode: "2800",
    displayName: "Delémont (2800) - JU",
  },
  {
    name: "Porrentruy",
    canton: "JU",
    postalCode: "2900",
    displayName: "Porrentruy (2900) - JU",
  },

  // Canton de Berne (BE)
  {
    name: "Berne",
    canton: "BE",
    postalCode: "3000",
    displayName: "Berne (3000) - BE",
  },
  {
    name: "Biel/Bienne",
    canton: "BE",
    postalCode: "2500",
    displayName: "Biel/Bienne (2500) - BE",
  },
  {
    name: "Thoune",
    canton: "BE",
    postalCode: "3600",
    displayName: "Thoune (3600) - BE",
  },
  {
    name: "Köniz",
    canton: "BE",
    postalCode: "3098",
    displayName: "Köniz (3098) - BE",
  },
  {
    name: "Burgdorf",
    canton: "BE",
    postalCode: "3400",
    displayName: "Burgdorf (3400) - BE",
  },
  {
    name: "Langenthal",
    canton: "BE",
    postalCode: "4900",
    displayName: "Langenthal (4900) - BE",
  },
  {
    name: "Steffisburg",
    canton: "BE",
    postalCode: "3612",
    displayName: "Steffisburg (3612) - BE",
  },
  {
    name: "Spiez",
    canton: "BE",
    postalCode: "3700",
    displayName: "Spiez (3700) - BE",
  },
  {
    name: "Interlaken",
    canton: "BE",
    postalCode: "3800",
    displayName: "Interlaken (3800) - BE",
  },

  // Canton de Zurich (ZH)
  {
    name: "Zurich",
    canton: "ZH",
    postalCode: "8000",
    displayName: "Zurich (8000) - ZH",
  },
  {
    name: "Winterthur",
    canton: "ZH",
    postalCode: "8400",
    displayName: "Winterthur (8400) - ZH",
  },
  {
    name: "Uster",
    canton: "ZH",
    postalCode: "8610",
    displayName: "Uster (8610) - ZH",
  },
  {
    name: "Dübendorf",
    canton: "ZH",
    postalCode: "8600",
    displayName: "Dübendorf (8600) - ZH",
  },
  {
    name: "Dietikon",
    canton: "ZH",
    postalCode: "8953",
    displayName: "Dietikon (8953) - ZH",
  },
  {
    name: "Wetzikon",
    canton: "ZH",
    postalCode: "8620",
    displayName: "Wetzikon (8620) - ZH",
  },
  {
    name: "Kloten",
    canton: "ZH",
    postalCode: "8302",
    displayName: "Kloten (8302) - ZH",
  },
  {
    name: "Bülach",
    canton: "ZH",
    postalCode: "8180",
    displayName: "Bülach (8180) - ZH",
  },
  {
    name: "Horgen",
    canton: "ZH",
    postalCode: "8810",
    displayName: "Horgen (8810) - ZH",
  },
  {
    name: "Wädenswil",
    canton: "ZH",
    postalCode: "8820",
    displayName: "Wädenswil (8820) - ZH",
  },
  {
    name: "Volketswil",
    canton: "ZH",
    postalCode: "8604",
    displayName: "Volketswil (8604) - ZH",
  },
  {
    name: "Schlieren",
    canton: "ZH",
    postalCode: "8952",
    displayName: "Schlieren (8952) - ZH",
  },
  {
    name: "Adliswil",
    canton: "ZH",
    postalCode: "8134",
    displayName: "Adliswil (8134) - ZH",
  },
  {
    name: "Thalwil",
    canton: "ZH",
    postalCode: "8800",
    displayName: "Thalwil (8800) - ZH",
  },
  {
    name: "Opfikon",
    canton: "ZH",
    postalCode: "8152",
    displayName: "Opfikon (8152) - ZH",
  },
  {
    name: "Illnau-Effretikon",
    canton: "ZH",
    postalCode: "8307",
    displayName: "Illnau-Effretikon (8307) - ZH",
  },
  {
    name: "Meilen",
    canton: "ZH",
    postalCode: "8706",
    displayName: "Meilen (8706) - ZH",
  },
  {
    name: "Regensdorf",
    canton: "ZH",
    postalCode: "8105",
    displayName: "Regensdorf (8105) - ZH",
  },

  // Canton de Lucerne (LU)
  {
    name: "Lucerne",
    canton: "LU",
    postalCode: "6000",
    displayName: "Lucerne (6000) - LU",
  },
  {
    name: "Emmen",
    canton: "LU",
    postalCode: "6020",
    displayName: "Emmen (6020) - LU",
  },
  {
    name: "Kriens",
    canton: "LU",
    postalCode: "6010",
    displayName: "Kriens (6010) - LU",
  },
  {
    name: "Horw",
    canton: "LU",
    postalCode: "6048",
    displayName: "Horw (6048) - LU",
  },
  {
    name: "Sursee",
    canton: "LU",
    postalCode: "6210",
    displayName: "Sursee (6210) - LU",
  },

  // Canton d'Uri (UR)
  {
    name: "Altdorf",
    canton: "UR",
    postalCode: "6460",
    displayName: "Altdorf (6460) - UR",
  },

  // Canton de Schwyz (SZ)
  {
    name: "Schwyz",
    canton: "SZ",
    postalCode: "6430",
    displayName: "Schwyz (6430) - SZ",
  },
  {
    name: "Freienbach",
    canton: "SZ",
    postalCode: "8807",
    displayName: "Freienbach (8807) - SZ",
  },
  {
    name: "Einsiedeln",
    canton: "SZ",
    postalCode: "8840",
    displayName: "Einsiedeln (8840) - SZ",
  },

  // Canton d'Obwald (OW)
  {
    name: "Sarnen",
    canton: "OW",
    postalCode: "6060",
    displayName: "Sarnen (6060) - OW",
  },

  // Canton de Nidwald (NW)
  {
    name: "Stans",
    canton: "NW",
    postalCode: "6370",
    displayName: "Stans (6370) - NW",
  },

  // Canton de Glaris (GL)
  {
    name: "Glaris",
    canton: "GL",
    postalCode: "8750",
    displayName: "Glaris (8750) - GL",
  },

  // Canton de Zoug (ZG)
  {
    name: "Zoug",
    canton: "ZG",
    postalCode: "6300",
    displayName: "Zoug (6300) - ZG",
  },
  {
    name: "Baar",
    canton: "ZG",
    postalCode: "6340",
    displayName: "Baar (6340) - ZG",
  },
  {
    name: "Cham",
    canton: "ZG",
    postalCode: "6330",
    displayName: "Cham (6330) - ZG",
  },

  // Canton de Soleure (SO)
  {
    name: "Soleure",
    canton: "SO",
    postalCode: "4500",
    displayName: "Soleure (4500) - SO",
  },
  {
    name: "Olten",
    canton: "SO",
    postalCode: "4600",
    displayName: "Olten (4600) - SO",
  },
  {
    name: "Grenchen",
    canton: "SO",
    postalCode: "2540",
    displayName: "Grenchen (2540) - SO",
  },

  // Canton de Bâle-Ville (BS)
  {
    name: "Bâle",
    canton: "BS",
    postalCode: "4000",
    displayName: "Bâle (4000) - BS",
  },
  {
    name: "Riehen",
    canton: "BS",
    postalCode: "4125",
    displayName: "Riehen (4125) - BS",
  },

  // Canton de Bâle-Campagne (BL)
  {
    name: "Liestal",
    canton: "BL",
    postalCode: "4410",
    displayName: "Liestal (4410) - BL",
  },
  {
    name: "Allschwil",
    canton: "BL",
    postalCode: "4123",
    displayName: "Allschwil (4123) - BL",
  },
  {
    name: "Reinach",
    canton: "BL",
    postalCode: "4153",
    displayName: "Reinach (4153) - BL",
  },
  {
    name: "Muttenz",
    canton: "BL",
    postalCode: "4132",
    displayName: "Muttenz (4132) - BL",
  },
  {
    name: "Pratteln",
    canton: "BL",
    postalCode: "4133",
    displayName: "Pratteln (4133) - BL",
  },
  {
    name: "Binningen",
    canton: "BL",
    postalCode: "4102",
    displayName: "Binningen (4102) - BL",
  },

  // Canton de Schaffhouse (SH)
  {
    name: "Schaffhouse",
    canton: "SH",
    postalCode: "8200",
    displayName: "Schaffhouse (8200) - SH",
  },

  // Canton d'Appenzell Rhodes-Extérieures (AR)
  {
    name: "Herisau",
    canton: "AR",
    postalCode: "9100",
    displayName: "Herisau (9100) - AR",
  },

  // Canton d'Appenzell Rhodes-Intérieures (AI)
  {
    name: "Appenzell",
    canton: "AI",
    postalCode: "9050",
    displayName: "Appenzell (9050) - AI",
  },

  // Canton de Saint-Gall (SG)
  {
    name: "Saint-Gall",
    canton: "SG",
    postalCode: "9000",
    displayName: "Saint-Gall (9000) - SG",
  },
  {
    name: "Rapperswil-Jona",
    canton: "SG",
    postalCode: "8640",
    displayName: "Rapperswil-Jona (8640) - SG",
  },
  {
    name: "Wil",
    canton: "SG",
    postalCode: "9500",
    displayName: "Wil (9500) - SG",
  },
  {
    name: "Gossau",
    canton: "SG",
    postalCode: "9200",
    displayName: "Gossau (9200) - SG",
  },
  {
    name: "Uzwil",
    canton: "SG",
    postalCode: "9240",
    displayName: "Uzwil (9240) - SG",
  },
  {
    name: "Altstätten",
    canton: "SG",
    postalCode: "9450",
    displayName: "Altstätten (9450) - SG",
  },

  // Canton des Grisons (GR)
  {
    name: "Coire",
    canton: "GR",
    postalCode: "7000",
    displayName: "Coire (7000) - GR",
  },
  {
    name: "Davos",
    canton: "GR",
    postalCode: "7270",
    displayName: "Davos (7270) - GR",
  },
  {
    name: "Saint-Moritz",
    canton: "GR",
    postalCode: "7500",
    displayName: "Saint-Moritz (7500) - GR",
  },

  // Canton d'Argovie (AG)
  {
    name: "Aarau",
    canton: "AG",
    postalCode: "5000",
    displayName: "Aarau (5000) - AG",
  },
  {
    name: "Baden",
    canton: "AG",
    postalCode: "5400",
    displayName: "Baden (5400) - AG",
  },
  {
    name: "Wettingen",
    canton: "AG",
    postalCode: "5430",
    displayName: "Wettingen (5430) - AG",
  },
  {
    name: "Wohlen",
    canton: "AG",
    postalCode: "5610",
    displayName: "Wohlen (5610) - AG",
  },
  {
    name: "Rheinfelden",
    canton: "AG",
    postalCode: "4310",
    displayName: "Rheinfelden (4310) - AG",
  },

  // Canton de Thurgovie (TG)
  {
    name: "Frauenfeld",
    canton: "TG",
    postalCode: "8500",
    displayName: "Frauenfeld (8500) - TG",
  },
  {
    name: "Kreuzlingen",
    canton: "TG",
    postalCode: "8280",
    displayName: "Kreuzlingen (8280) - TG",
  },
  {
    name: "Arbon",
    canton: "TG",
    postalCode: "9320",
    displayName: "Arbon (9320) - TG",
  },
  {
    name: "Amriswil",
    canton: "TG",
    postalCode: "8580",
    displayName: "Amriswil (8580) - TG",
  },

  // Canton du Tessin (TI)
  {
    name: "Lugano",
    canton: "TI",
    postalCode: "6900",
    displayName: "Lugano (6900) - TI",
  },
  {
    name: "Bellinzone",
    canton: "TI",
    postalCode: "6500",
    displayName: "Bellinzone (6500) - TI",
  },
  {
    name: "Locarno",
    canton: "TI",
    postalCode: "6600",
    displayName: "Locarno (6600) - TI",
  },
  {
    name: "Mendrisio",
    canton: "TI",
    postalCode: "6850",
    displayName: "Mendrisio (6850) - TI",
  },
];

/**
 * Obtenir les villes d'un canton spécifique
 */
export function getCitiesByCanton(canton: string): SwissCity[] {
  return SWISS_CITIES.filter((city) => city.canton === canton);
}

/**
 * Rechercher une ville par nom ou code postal
 */
export function searchCities(query: string): SwissCity[] {
  const lowerQuery = query.toLowerCase();
  return SWISS_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.postalCode.includes(query) ||
      city.displayName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtenir une ville par son nom exact
 */
export function getCityByName(name: string): SwissCity | undefined {
  return SWISS_CITIES.find(
    (city) => city.name.toLowerCase() === name.toLowerCase()
  );
}
