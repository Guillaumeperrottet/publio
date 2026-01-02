/**
 * Exemple d'utilisation des sous-totaux par catégories dans une offre
 *
 * Cet exemple montre comment structurer une offre de rénovation
 * avec des catégories pour une meilleure lisibilité.
 */

export const exampleOfferWithCategories = {
  priceType: "DETAILED",
  tvaRate: 7.7,

  lineItems: [
    // === DÉMOLITION ===
    {
      position: 1,
      description: "Dépose revêtement sol existant",
      quantity: 45,
      unit: "m²",
      priceHT: 15,
      tvaRate: 7.7,
      category: "Démolition",
      sectionOrder: 1,
    },
    {
      position: 2,
      description: "Évacuation gravats en déchetterie",
      quantity: 1,
      unit: "forfait",
      priceHT: 350,
      tvaRate: 7.7,
      category: "Démolition",
      sectionOrder: 1,
    },
    // Sous-total Démolition : 1'025 CHF HT

    // === MAÇONNERIE ===
    {
      position: 3,
      description: "Ragréage sol",
      quantity: 45,
      unit: "m²",
      priceHT: 28,
      tvaRate: 7.7,
      category: "Maçonnerie",
      sectionOrder: 2,
    },
    {
      position: 4,
      description: "Reprise angles et joints",
      quantity: 8,
      unit: "heures",
      priceHT: 75,
      tvaRate: 7.7,
      category: "Maçonnerie",
      sectionOrder: 2,
    },
    // Sous-total Maçonnerie : 1'860 CHF HT

    // === REVÊTEMENT DE SOL ===
    {
      position: 5,
      description: "Fourniture parquet chêne massif",
      quantity: 45,
      unit: "m²",
      priceHT: 120,
      tvaRate: 7.7,
      category: "Revêtement de sol",
      sectionOrder: 3,
    },
    {
      position: 6,
      description: "Pose parquet avec sous-couche",
      quantity: 45,
      unit: "m²",
      priceHT: 45,
      tvaRate: 7.7,
      category: "Revêtement de sol",
      sectionOrder: 3,
    },
    {
      position: 7,
      description: "Plinthes en chêne (fourniture et pose)",
      quantity: 28,
      unit: "ml",
      priceHT: 18,
      tvaRate: 7.7,
      category: "Revêtement de sol",
      sectionOrder: 3,
    },
    // Sous-total Revêtement de sol : 8'229 CHF HT

    // === FINITIONS ===
    {
      position: 8,
      description: "Vitrification parquet (2 couches)",
      quantity: 45,
      unit: "m²",
      priceHT: 22,
      tvaRate: 7.7,
      category: "Finitions",
      sectionOrder: 4,
    },
    {
      position: 9,
      description: "Nettoyage final de chantier",
      quantity: 1,
      unit: "forfait",
      priceHT: 180,
      tvaRate: 7.7,
      category: "Finitions",
      sectionOrder: 4,
    },
    // Sous-total Finitions : 1'170 CHF HT
  ],

  // Calculs finaux
  totalHT: 12284, // 1'025 + 1'860 + 8'229 + 1'170
  totalTVA: 945.87, // 12'284 × 7.7%
  price: 13229.87, // TTC
};

/**
 * Résultat visuel attendu :
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Démolition                                                  │
 * ├─────┬───────────────────────────┬─────┬──────┬────────┬─────┤
 * │ 01  │ Dépose revêtement sol     │ 45  │ m²   │  15.00 │  675│
 * │ 02  │ Évacuation gravats        │  1  │ forf.│ 350.00 │  350│
 * ├─────┴───────────────────────────┴─────┴──────┴────────┼─────┤
 * │ Sous-total Démolition                                  │1'025│
 * ├────────────────────────────────────────────────────────┴─────┤
 * │ Maçonnerie                                                   │
 * ├─────┬───────────────────────────┬─────┬──────┬────────┬─────┤
 * │ 03  │ Ragréage sol              │ 45  │ m²   │  28.00 │1'260│
 * │ 04  │ Reprise angles et joints  │  8  │ h    │  75.00 │  600│
 * ├─────┴───────────────────────────┴─────┴──────┴────────┼─────┤
 * │ Sous-total Maçonnerie                                  │1'860│
 * ├────────────────────────────────────────────────────────┴─────┤
 * │ Revêtement de sol                                            │
 * ├─────┬───────────────────────────┬─────┬──────┬────────┬─────┤
 * │ 05  │ Fourniture parquet chêne  │ 45  │ m²   │ 120.00 │5'400│
 * │ 06  │ Pose parquet              │ 45  │ m²   │  45.00 │2'025│
 * │ 07  │ Plinthes chêne            │ 28  │ ml   │  18.00 │  504│
 * ├─────┴───────────────────────────┴─────┴──────┴────────┼─────┤
 * │ Sous-total Revêtement de sol                           │8'229│
 * ├────────────────────────────────────────────────────────┴─────┤
 * │ Finitions                                                    │
 * ├─────┬───────────────────────────┬─────┬──────┬────────┬─────┤
 * │ 08  │ Vitrification parquet     │ 45  │ m²   │  22.00 │  990│
 * │ 09  │ Nettoyage final           │  1  │ forf.│ 180.00 │  180│
 * ├─────┴───────────────────────────┴─────┴──────┴────────┼─────┤
 * │ Sous-total Finitions                                   │1'170│
 * ╞═════════════════════════════════════════════════════════════╡
 * │ TOTAL HT                                            12'284.00│
 * │ TVA 7.7%                                               945.87│
 * ╞═════════════════════════════════════════════════════════════╡
 * │ TOTAL TTC                                           13'229.87│
 * └─────────────────────────────────────────────────────────────┘
 */
