/**
 * Données réalistes pour la Suisse romande
 */

export const SWISS_CANTONS = [
  {
    code: "VD",
    name: "Vaud",
    cities: [
      "Lausanne",
      "Montreux",
      "Yverdon-les-Bains",
      "Vevey",
      "Morges",
      "Nyon",
    ],
  },
  {
    code: "GE",
    name: "Genève",
    cities: ["Genève", "Carouge", "Vernier", "Lancy", "Meyrin", "Onex"],
  },
  {
    code: "FR",
    name: "Fribourg",
    cities: ["Fribourg", "Bulle", "Villars-sur-Glâne", "Marly", "Romont"],
  },
  {
    code: "VS",
    name: "Valais",
    cities: ["Sion", "Martigny", "Monthey", "Sierre", "Fully"],
  },
  {
    code: "NE",
    name: "Neuchâtel",
    cities: ["Neuchâtel", "La Chaux-de-Fonds", "Le Locle", "Val-de-Travers"],
  },
  {
    code: "JU",
    name: "Jura",
    cities: ["Delémont", "Porrentruy", "Saignelégier"],
  },
];

export const COMMUNE_NAMES = [
  "Ville de Lausanne",
  "Commune de Montreux",
  "Ville de Fribourg",
  "Commune de Bulle",
  "Ville de Genève",
  "Commune de Carouge",
  "Ville de Sion",
  "Commune de Martigny",
  "Ville de Neuchâtel",
  "Commune de Delémont",
];

export const COMPANY_NAMES = [
  "Construction SA",
  "Bâtiment & Cie",
  "Entreprise Générale Romande",
  "Génie Civil Suisse",
  "Travaux Publics SA",
  "Maçonnerie Moderne",
  "Rénovation Plus",
  "Infrastructure Pro",
  "Technic Build",
  "SwissBuild SA",
];

export const ARCHITECTURE_NAMES = [
  "Architectes Associés",
  "Bureau Architecture Moderne",
  "Atelier Design Romand",
  "Studio Urbanisme",
  "Concept Architecture SA",
  "Design & Bâti",
];

export const ENGINEERING_NAMES = [
  "Bureau Ingénieurs Civils",
  "Ingénierie Technique SA",
  "Études & Projets",
  "Conseil Ingénierie",
  "Expertise Technique",
];

export const PRIVATE_NAMES = [
  "Jean Dupont",
  "Marie Martin",
  "Pierre Favre",
  "Sophie Bernard",
  "Luc Perret",
  "Anne Dubois",
  "Nicolas Schmid",
  "Claire Monnier",
];

export const TENDER_TITLES = {
  CONSTRUCTION: [
    "Rénovation du bâtiment communal",
    "Construction d'une nouvelle école primaire",
    "Réfection de la salle polyvalente",
    "Agrandissement du centre sportif",
    "Construction d'un parking souterrain",
    "Rénovation énergétique de l'hôtel de ville",
    // Titres pour privés
    "Rénovation de ma maison familiale",
    "Extension de mon chalet",
    "Transformation de mon appartement",
    "Création d'une terrasse et pergola",
    "Rénovation de ma salle de bain",
    "Isolation de mes combles",
    "Remplacement de mes fenêtres",
    "Construction d'un garage",
    "Aménagement de mon jardin",
    "Pose d'une nouvelle cuisine",
  ],
  ENGINEERING: [
    "Aménagement d'une zone piétonne",
    "Réfection complète de la route principale",
    "Construction d'un nouveau pont",
    "Installation d'un réseau d'éclairage LED",
    "Modernisation du réseau d'eau potable",
    "Création d'une piste cyclable",
    // Titres pour privés
    "Installation pompe à chaleur",
    "Mise en place panneaux solaires",
    "Raccordement électrique complet",
    "Système de chauffage au sol",
    "Installation borne électrique",
  ],
  ARCHITECTURE: [
    "Étude architecturale pour nouveau quartier",
    "Plans pour la rénovation du théâtre",
    "Conception d'un centre culturel",
    "Projet architectural pour crèche",
    // Titres pour privés
    "Plans pour extension de ma maison",
    "Projet de transformation intérieure",
    "Étude faisabilité surélévation",
  ],
  SUPPLIES: [
    "Fourniture de mobilier scolaire",
    "Acquisition de véhicules communaux",
    "Fourniture de matériel informatique",
    // Titres pour privés
    "Fourniture et pose carrelage",
    "Achat matériaux de construction",
    "Fourniture parquet massif",
  ],
  MAINTENANCE: [
    "Entretien des espaces verts communaux",
    "Maintenance des installations sportives",
    "Entretien de la voirie communale",
    // Titres pour privés
    "Entretien annuel de mon jardin",
    "Maintenance chaudière et chauffage",
    "Nettoyage façade de ma maison",
    "Déneigement de mon allée",
  ],
};

export const OFFER_DESCRIPTIONS = [
  "Nous proposons une solution complète et clé en main, avec une équipe expérimentée et des matériaux de qualité.",
  "Notre entreprise dispose de 15 ans d'expérience dans ce type de projet. Nous garantissons le respect des délais et du budget.",
  "Nous mettons à votre disposition notre expertise technique et notre savoir-faire reconnu dans la région.",
  "Solution innovante et durable, avec un excellent rapport qualité-prix. Références disponibles sur demande.",
  "Équipe locale dynamique, matériaux écologiques, respect des normes suisses et garantie décennale incluse.",
];

export const VEILLE_TITLES = [
  "Mise à l'enquête publique - Rénovation bâtiment",
  "Demande de permis de construire - Villa individuelle",
  "Avis de construction - Transformation immeuble",
  "Mise à l'enquête - Projet d'agrandissement",
  "Demande d'autorisation - Installation panneaux solaires",
  "Avis public - Travaux de voirie",
];
