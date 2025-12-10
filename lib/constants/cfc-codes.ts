// Codes de Frais de Construction (CFC) - Norme SIA 416
// Source: Liste officielle suisse des codes CFC

export interface CFCCode {
  code: string;
  label: string;
  searchText: string; // Pour faciliter la recherche
  category?: CFCCategory; // Catégorie générale
}

// Catégories générales dérivées des codes CFC
export type CFCCategory =
  | "TERRAIN_PREPARATION"
  | "GROS_OEUVRE"
  | "ENVELOPPE_BATIMENT"
  | "ELECTRICITE"
  | "CVCR"
  | "SANITAIRE"
  | "TRANSPORTS"
  | "AMENAGEMENTS_INTERIEURS"
  | "AMENAGEMENTS_EXTERIEURS"
  | "HONORAIRES"
  | "MOBILIER"
  | "AUTRES";

export const CFC_CATEGORIES = {
  TERRAIN_PREPARATION: {
    label: "Terrain & Préparation",
    description: "Études, acquisitions, terrassements, démolition",
    icon: "⛏️",
  },
  GROS_OEUVRE: {
    label: "Gros-œuvre & Structure",
    description: "Fondations, maçonnerie, béton, charpente, structure",
    icon: "🏗️",
  },
  ENVELOPPE_BATIMENT: {
    label: "Enveloppe du bâtiment",
    description: "Toiture, façade, fenêtres, portes, isolation",
    icon: "🏠",
  },
  ELECTRICITE: {
    label: "Électricité & Domotique",
    description: "Installations électriques, éclairage, automatisation",
    icon: "⚡",
  },
  CVCR: {
    label: "Chauffage, Ventilation & Climatisation",
    description: "Chauffage, ventilation, climatisation, réfrigération",
    icon: "🌡️",
  },
  SANITAIRE: {
    label: "Sanitaire & Plomberie",
    description: "Installations sanitaires, plomberie, eau",
    icon: "🚿",
  },
  TRANSPORTS: {
    label: "Transports & Levage",
    description: "Ascenseurs, monte-charges, escaliers roulants",
    icon: "🛗",
  },
  AMENAGEMENTS_INTERIEURS: {
    label: "Aménagements intérieurs",
    description: "Menuiserie, sols, murs, plafonds, peinture",
    icon: "🎨",
  },
  AMENAGEMENTS_EXTERIEURS: {
    label: "Aménagements extérieurs",
    description: "Jardinage, routes, places, clôtures",
    icon: "🌳",
  },
  HONORAIRES: {
    label: "Honoraires professionnels",
    description: "Architectes, ingénieurs, spécialistes",
    icon: "👷",
  },
  MOBILIER: {
    label: "Mobilier & Équipements",
    description: "Agencements, mobilier, équipements",
    icon: "🪑",
  },
  AUTRES: {
    label: "Autres travaux",
    description: "Travaux divers et frais secondaires",
    icon: "📦",
  },
} as const;

/**
 * Détermine la catégorie d'un code CFC selon son numéro
 */
export function getCFCCategory(code: string): CFCCategory {
  const num = parseInt(code);

  if (num >= 1 && num <= 69) return "TERRAIN_PREPARATION";
  if (
    (num >= 91 && num <= 99) ||
    (num >= 191 && num <= 199) ||
    (num >= 291 && num <= 299)
  )
    return "HONORAIRES";
  if (num >= 101 && num <= 139) return "TERRAIN_PREPARATION";
  if ((num >= 141 && num <= 149) || (num >= 201 && num <= 219))
    return "GROS_OEUVRE";
  if (num >= 211 && num <= 228) return "ENVELOPPE_BATIMENT";
  if (num >= 231 && num <= 239) return "ELECTRICITE";
  if (num >= 242 && num <= 249) return "CVCR";
  if (num >= 251 && num <= 259) return "SANITAIRE";
  if (num >= 261 && num <= 269) return "TRANSPORTS";
  if (num >= 271 && num <= 289) return "AMENAGEMENTS_INTERIEURS";
  if ((num >= 311 && num <= 389) || (num >= 421 && num <= 488))
    return "AMENAGEMENTS_EXTERIEURS";
  if (num >= 900 && num <= 909) return "MOBILIER";

  return "AUTRES";
}

export const CFC_CODES: CFCCode[] = [
  { code: "001", label: "Etudes de terrain", searchText: "001 etudes terrain" },
  {
    code: "002",
    label: "Arpentage, bornage",
    searchText: "002 arpentage bornage",
  },
  {
    code: "003",
    label: "Expertises géotechniques",
    searchText: "003 expertises geotechniques",
  },
  {
    code: "004",
    label: "Frais établiss. plan quartier",
    searchText: "004 frais plan quartier",
  },
  {
    code: "005",
    label: "Gabarits provisoires",
    searchText: "005 gabarits provisoires",
  },
  {
    code: "006",
    label: "Etude impact sur environnement",
    searchText: "006 etude impact environnement",
  },
  { code: "009", label: "Divers", searchText: "009 divers" },
  {
    code: "011",
    label: "Acquisit. du terrain",
    searchText: "011 acquisition terrain",
  },
  {
    code: "012",
    label: "Acquisit. droit de superficie",
    searchText: "012 acquisition droit superficie",
  },
  {
    code: "013",
    label: "Acquisit. droit de mitoyenneté",
    searchText: "013 acquisition mitoyennete",
  },
  {
    code: "018",
    label: "Assainissem. sites contaminés",
    searchText: "018 assainissement sites contamines",
  },
  { code: "019", label: "Divers", searchText: "019 divers" },
  { code: "021", label: "Droit de mutation", searchText: "021 droit mutation" },
  { code: "022", label: "Frais de notaire", searchText: "022 frais notaire" },
  {
    code: "023",
    label: "Inscript. au registre foncier",
    searchText: "023 inscription registre foncier",
  },
  {
    code: "024",
    label: "Frais de justice & d'avocat",
    searchText: "024 frais justice avocat",
  },
  {
    code: "025",
    label: "Commissions aux intermédiaires",
    searchText: "025 commissions intermediaires",
  },
  { code: "029", label: "Divers", searchText: "029 divers" },
  {
    code: "031",
    label: "Indemnis. locataires & fermiers",
    searchText: "031 indemnisation locataires fermiers",
  },
  { code: "032", label: "Dédommagements", searchText: "032 dedommagements" },
  {
    code: "033",
    label: "Constitution de servitudes",
    searchText: "033 constitution servitudes",
  },
  {
    code: "034",
    label: "Radiation de servitudes",
    searchText: "034 radiation servitudes",
  },
  {
    code: "035",
    label: "Patentes d'établiss. publics",
    searchText: "035 patentes etablissements publics",
  },
  {
    code: "036",
    label: "Participat. à l'amél. foncière",
    searchText: "036 participation amelioration fonciere",
  },
  {
    code: "037",
    label: "Participat. remembrem. parcell.",
    searchText: "037 participation remembrement parcellaire",
  },
  {
    code: "038",
    label: "Participat. des bordiers",
    searchText: "038 participation bordiers",
  },
  { code: "039", label: "Divers", searchText: "039 divers" },
  {
    code: "041",
    label: "Constit. hypothèques s/terrain",
    searchText: "041 constitution hypotheques terrain",
  },
  {
    code: "042",
    label: "Intérêts hypothécaires",
    searchText: "042 interets hypothecaires",
  },
  {
    code: "043",
    label: "Intérêts s/droit de superficie",
    searchText: "043 interets droit superficie",
  },
  {
    code: "044",
    label: "Intérêts bancaires",
    searchText: "044 interets bancaires",
  },
  {
    code: "045",
    label: "Intérêts s/fonds propres",
    searchText: "045 interets fonds propres",
  },
  { code: "046", label: "Impôts fonciers", searchText: "046 impots fonciers" },
  {
    code: "048",
    label: "Assurances avant début travaux",
    searchText: "048 assurances avant debut travaux",
  },
  { code: "049", label: "Divers", searchText: "049 divers" },
  { code: "051", label: "Terrassements", searchText: "051 terrassements" },
  {
    code: "052",
    label: "Canalisations (raccord. réseau)",
    searchText: "052 canalisations raccordement reseau",
  },
  {
    code: "053",
    label: "Electricité (raccord. réseau)",
    searchText: "053 electricite raccordement reseau",
  },
  {
    code: "054",
    label: "Chauf. vent. réfr. (racc. réseau)",
    searchText: "054 chauffage ventilation refrigeration raccordement",
  },
  {
    code: "055",
    label: "Eau & gaz (raccord. réseau)",
    searchText: "055 eau gaz raccordement reseau",
  },
  {
    code: "056",
    label: "Travaux accessoires",
    searchText: "056 travaux accessoires",
  },
  { code: "059", label: "Divers", searchText: "059 divers" },
  { code: "061", label: "Routes", searchText: "061 routes" },
  { code: "062", label: "Voie ferrée", searchText: "062 voie ferree" },
  { code: "063", label: "Voie navigable", searchText: "063 voie navigable" },
  { code: "069", label: "Divers", searchText: "069 divers" },
  { code: "091", label: "Architecte", searchText: "091 architecte" },
  { code: "092", label: "Ingénieur civil", searchText: "092 ingenieur civil" },
  {
    code: "093",
    label: "Ingénieur électricien",
    searchText: "093 ingenieur electricien",
  },
  {
    code: "094",
    label: "Ingénieur CVCR",
    searchText: "094 ingenieur cvcr chauffage ventilation",
  },
  {
    code: "095",
    label: "Ingénieur inst. sanitaires",
    searchText: "095 ingenieur installations sanitaires",
  },
  {
    code: "096",
    label: "Architecte paysagiste",
    searchText: "096 architecte paysagiste",
  },
  { code: "097", label: "Spécialistes 1", searchText: "097 specialistes" },
  { code: "098", label: "Spécialistes 2", searchText: "098 specialistes" },
  { code: "099", label: "Divers", searchText: "099 divers" },
  { code: "101", label: "Relevés", searchText: "101 releves" },
  {
    code: "102",
    label: "Etudes géotechniques",
    searchText: "102 etudes geotechniques",
  },
  {
    code: "103",
    label: "Etudes des eaux souterraines",
    searchText: "103 etudes eaux souterraines",
  },
  { code: "109", label: "Divers", searchText: "109 divers" },
  { code: "111", label: "Défrichage", searchText: "111 defrichage" },
  {
    code: "112",
    label: "Déconstruction",
    searchText: "112 deconstruction demolition",
  },
  {
    code: "113",
    label: "Assainissement de sites contaminés",
    searchText: "113 assainissement sites contamines",
  },
  {
    code: "114",
    label: "Déplacements de terre",
    searchText: "114 deplacements terre",
  },
  { code: "115", label: "Forages et coupes", searchText: "115 forages coupes" },
  { code: "119", label: "Divers", searchText: "119 divers" },
  {
    code: "121",
    label: "Protect. d'ouvrages existants",
    searchText: "121 protection ouvrages existants",
  },
  {
    code: "122",
    label: "Aménagements provisoires",
    searchText: "122 amenagements provisoires",
  },
  {
    code: "123",
    label: "Reprise en sous-œuvre",
    searchText: "123 reprise sous oeuvre",
  },
  {
    code: "124",
    label: "Travaux d'entretien",
    searchText: "124 travaux entretien",
  },
  { code: "129", label: "Divers", searchText: "129 divers" },
  { code: "131", label: "Clôtures", searchText: "131 clotures" },
  { code: "132", label: "Accès, places", searchText: "132 acces places" },
  {
    code: "133",
    label: "Bureau direction des travaux",
    searchText: "133 bureau direction travaux",
  },
  {
    code: "134",
    label: "Cantonnem., réfect., cuisines",
    searchText: "134 cantonnement refectoire cuisines",
  },
  {
    code: "135",
    label: "Installations provisoires",
    searchText: "135 installations provisoires",
  },
  {
    code: "136",
    label: "Frais d'énergie & d'eau, etc.",
    searchText: "136 frais energie eau",
  },
  {
    code: "137",
    label: "Fermetures et couvertures prov.",
    searchText: "137 fermetures couvertures provisoires",
  },
  {
    code: "138",
    label: "Tri des déchets de chantier",
    searchText: "138 tri dechets chantier",
  },
  { code: "139", label: "Divers", searchText: "139 divers" },
  {
    code: "141",
    label: "Mise forme terr., gros-oeuvre 1",
    searchText: "141 mise forme terrain gros oeuvre",
  },
  { code: "142", label: "Gros-œuvre 2", searchText: "142 gros oeuvre" },
  {
    code: "143",
    label: "Installations électriques",
    searchText: "143 installations electriques",
  },
  {
    code: "144",
    label: "Ch., ventil., cond. air, réfrigér.",
    searchText: "144 chauffage ventilation climatisation refrigeration",
  },
  {
    code: "145",
    label: "Installations sanitaires",
    searchText: "145 installations sanitaires plomberie",
  },
  {
    code: "146",
    label: "Installations de transport",
    searchText: "146 installations transport",
  },
  {
    code: "147",
    label: "Aménagements intérieurs 1",
    searchText: "147 amenagements interieurs",
  },
  {
    code: "148",
    label: "Aménagements intérieurs 2",
    searchText: "148 amenagements interieurs",
  },
  { code: "149", label: "Divers", searchText: "149 divers" },
  { code: "151", label: "Terrassements", searchText: "151 terrassements" },
  {
    code: "152",
    label: "Canalisat. (adapt. du réseau)",
    searchText: "152 canalisations adaptation reseau",
  },
  {
    code: "153",
    label: "Electricité (adapt. du réseau)",
    searchText: "153 electricite adaptation reseau",
  },
  {
    code: "154",
    label: "CVCR (adapt. du réseau)",
    searchText: "154 cvcr adaptation reseau",
  },
  {
    code: "155",
    label: "Eau & Gaz (adapt. du réseau)",
    searchText: "155 eau gaz adaptation reseau",
  },
  {
    code: "156",
    label: "Travaux accessoires",
    searchText: "156 travaux accessoires",
  },
  { code: "159", label: "Divers", searchText: "159 divers" },
  { code: "161", label: "Routes", searchText: "161 routes" },
  { code: "162", label: "Voie ferrée", searchText: "162 voie ferree" },
  { code: "163", label: "Voie navigable", searchText: "163 voie navigable" },
  { code: "169", label: "Divers", searchText: "169 divers" },
  { code: "171", label: "Pieux", searchText: "171 pieux fondations" },
  {
    code: "172",
    label: "Enceintes de fouille",
    searchText: "172 enceintes fouille",
  },
  { code: "173", label: "Etayages", searchText: "173 etayages" },
  { code: "174", label: "Ancrages", searchText: "174 ancrages" },
  {
    code: "175",
    label: "Etanchement ouvrages enterrés",
    searchText: "175 etanchement ouvrages enterres",
  },
  {
    code: "176",
    label: "Epuisement des eaux",
    searchText: "176 epuisement eaux",
  },
  {
    code: "177",
    label: "Amélioration sols de fondation",
    searchText: "177 amelioration sols fondation",
  },
  {
    code: "178",
    label: "Travaux accessoires",
    searchText: "178 travaux accessoires",
  },
  { code: "179", label: "Divers", searchText: "179 divers" },
  { code: "191", label: "Architecte", searchText: "191 architecte" },
  { code: "192", label: "Ingénieur civil", searchText: "192 ingenieur civil" },
  {
    code: "193",
    label: "Ingénieur électricien",
    searchText: "193 ingenieur electricien",
  },
  { code: "194", label: "Ingénieur CVCR", searchText: "194 ingenieur cvcr" },
  {
    code: "195",
    label: "Ingénieur inst. sanitaires",
    searchText: "195 ingenieur installations sanitaires",
  },
  {
    code: "196",
    label: "Architecte paysagiste",
    searchText: "196 architecte paysagiste",
  },
  { code: "197", label: "Spécialistes 1", searchText: "197 specialistes" },
  { code: "198", label: "Spécialistes 2", searchText: "198 specialistes" },
  { code: "199", label: "Divers", searchText: "199 divers" },
  {
    code: "201",
    label: "Fouilles en pleine masse",
    searchText: "201 fouilles pleine masse",
  },
  { code: "209", label: "Divers", searchText: "209 divers" },
  {
    code: "211",
    label: "Trx entreprise maçonnerie",
    searchText: "211 travaux entreprise maconnerie",
  },
  {
    code: "212",
    label: "Construction préfabriquée en béton et en maçonnerie",
    searchText: "212 construction prefabriquee beton maconnerie",
  },
  {
    code: "213",
    label: "Construction en acier",
    searchText: "213 construction acier metal",
  },
  {
    code: "214",
    label: "Construction en bois",
    searchText: "214 construction bois charpente",
  },
  {
    code: "215",
    label: "Construction légère préfabriquée",
    searchText: "215 construction legere prefabriquee",
  },
  {
    code: "216",
    label: "Trx pierre natur. & artific.",
    searchText: "216 travaux pierre naturelle artificielle",
  },
  {
    code: "217",
    label: "Eléments préconfect. abris PC",
    searchText: "217 elements preconfectionnes abris pc",
  },
  { code: "219", label: "Divers", searchText: "219 divers" },
  {
    code: "221",
    label: "Fenêtres, portes extérieures",
    searchText: "221 fenetres portes exterieures menuiserie",
  },
  { code: "222", label: "Ferblanterie", searchText: "222 ferblanterie" },
  {
    code: "223",
    label: "Protection contre la foudre",
    searchText: "223 protection foudre paratonnerre",
  },
  { code: "224", label: "Couverture", searchText: "224 couverture toiture" },
  {
    code: "225",
    label: "Etanchéités et isolations spéc.",
    searchText: "225 etancheites isolations speciales",
  },
  {
    code: "226",
    label: "Crépissage de façade",
    searchText: "226 crepissage facade",
  },
  {
    code: "227",
    label: "Traitement surfaces extér.",
    searchText: "227 traitement surfaces exterieures",
  },
  {
    code: "228",
    label: "Fermet. ext., protection soleil",
    searchText: "228 fermetures exterieures protection soleil stores",
  },
  { code: "229", label: "Divers", searchText: "229 divers" },
  {
    code: "231",
    label: "Appareils à courant fort",
    searchText: "231 appareils courant fort electrique",
  },
  {
    code: "232",
    label: "Installations de courant fort",
    searchText: "232 installations courant fort electrique",
  },
  { code: "233", label: "Lustrerie", searchText: "233 lustrerie eclairage" },
  {
    code: "234",
    label: "Appareils électriques",
    searchText: "234 appareils electriques",
  },
  {
    code: "235",
    label: "Equipements à courant faible",
    searchText: "235 equipements courant faible",
  },
  {
    code: "236",
    label: "Installations à courant faible",
    searchText: "236 installations courant faible",
  },
  {
    code: "237",
    label: "Automatismes du bâtiment",
    searchText: "237 automatismes batiment domotique",
  },
  {
    code: "238",
    label: "Installations provisoires",
    searchText: "238 installations provisoires",
  },
  { code: "239", label: "Divers", searchText: "239 divers" },
  {
    code: "242",
    label: "Installations de chauffage",
    searchText: "242 installations chauffage",
  },
  {
    code: "243",
    label: "Distribution de chaleur",
    searchText: "243 distribution chaleur",
  },
  {
    code: "244",
    label: "Installations de ventilation et de conditionnement d'air",
    searchText: "244 installations ventilation climatisation",
  },
  {
    code: "245",
    label: "Installations d'extraction de fumée et de chaleur",
    searchText: "245 installations extraction fumee chaleur",
  },
  {
    code: "246",
    label: "Installations de refroidissement",
    searchText: "246 installations refroidissement",
  },
  {
    code: "247",
    label: "Installations spéciales",
    searchText: "247 installations speciales",
  },
  {
    code: "248",
    label: "Isol. tuy, gaines, app., inst. CVCF",
    searchText: "248 isolation tuyaux gaines appareils cvcf",
  },
  { code: "249", label: "Divers", searchText: "249 divers" },
  {
    code: "251",
    label: "Appareils sanitaires courants",
    searchText: "251 appareils sanitaires courants",
  },
  {
    code: "252",
    label: "Appareils sanitaires spéciaux",
    searchText: "252 appareils sanitaires speciaux",
  },
  {
    code: "253",
    label: "App. sanit. aliment. & évacuat.",
    searchText: "253 appareils sanitaires alimentation evacuation",
  },
  {
    code: "254",
    label: "Tuyauterie sanitaire",
    searchText: "254 tuyauterie sanitaire plomberie",
  },
  {
    code: "255",
    label: "Isolations d'inst. sanitaires",
    searchText: "255 isolations installations sanitaires",
  },
  {
    code: "256",
    label: "Unités avec inst. sanit. incorp.",
    searchText: "256 unites installations sanitaires incorporees",
  },
  {
    code: "257",
    label: "Installations d'extinction d'incendie",
    searchText: "257 installations extinction incendie sprinklers",
  },
  {
    code: "258",
    label: "Agencements de cuisine",
    searchText: "258 agencements cuisine",
  },
  { code: "259", label: "Divers", searchText: "259 divers" },
  {
    code: "261",
    label: "Ascenseurs, monte-charge",
    searchText: "261 ascenseurs monte charge",
  },
  {
    code: "262",
    label: "Escaliers trottoirs roulants",
    searchText: "262 escaliers trottoirs roulants",
  },
  {
    code: "263",
    label: "Inst. de nettoyage de façade",
    searchText: "263 installations nettoyage facade",
  },
  {
    code: "264",
    label: "Inst. de manutention diverses",
    searchText: "264 installations manutention",
  },
  {
    code: "265",
    label: "Dispositifs de levage",
    searchText: "265 dispositifs levage",
  },
  {
    code: "266",
    label: "Systèmes automatiques parcage",
    searchText: "266 systemes automatiques parcage parking",
  },
  { code: "269", label: "Divers", searchText: "269 divers" },
  { code: "271", label: "Plâtrerie", searchText: "271 platrerie" },
  {
    code: "272",
    label: "Ouvrages métalliques",
    searchText: "272 ouvrages metalliques serrurerie",
  },
  { code: "273", label: "Menuiserie", searchText: "273 menuiserie" },
  {
    code: "274",
    label: "Vitrages intérieurs spéciaux",
    searchText: "274 vitrages interieurs speciaux",
  },
  {
    code: "275",
    label: "Systèmes de verrouillage",
    searchText: "275 systemes verrouillage serrures",
  },
  {
    code: "276",
    label: "Dispositifs intérieurs de fermeture",
    searchText: "276 dispositifs interieurs fermeture",
  },
  {
    code: "277",
    label: "Cloisons en éléments",
    searchText: "277 cloisons elements",
  },
  { code: "279", label: "Divers", searchText: "279 divers" },
  {
    code: "281",
    label: "Revêtement de sol",
    searchText: "281 revetement sol parquet carrelage",
  },
  {
    code: "282",
    label: "Revêtements de paroi",
    searchText: "282 revetements paroi mur",
  },
  { code: "283", label: "Faux-plafonds", searchText: "283 faux plafonds" },
  {
    code: "284",
    label: "Fumisterie et poêlerie",
    searchText: "284 fumisterie poelerie cheminees",
  },
  {
    code: "285",
    label: "Traitement des surfaces intérieures",
    searchText: "285 traitement surfaces interieures peinture",
  },
  {
    code: "286",
    label: "Assèchement du bâtiment",
    searchText: "286 assechement batiment",
  },
  {
    code: "287",
    label: "Nettoyage du bâtiment",
    searchText: "287 nettoyage batiment",
  },
  {
    code: "288",
    label: "Jardinage (bâtiment)",
    searchText: "288 jardinage batiment",
  },
  { code: "289", label: "Divers", searchText: "289 divers" },
  { code: "291", label: "Architecte", searchText: "291 architecte" },
  { code: "292", label: "Ingénieur civil", searchText: "292 ingenieur civil" },
  {
    code: "293",
    label: "Ingénieur électricien",
    searchText: "293 ingenieur electricien",
  },
  { code: "294", label: "Ingénieur CVCR", searchText: "294 ingenieur cvcr" },
  {
    code: "295",
    label: "Ingénieur inst. sanitaires",
    searchText: "295 ingenieur installations sanitaires",
  },
  {
    code: "296",
    label: "Architecte paysagiste",
    searchText: "296 architecte paysagiste",
  },
  { code: "297", label: "Spécialistes 1", searchText: "297 specialistes" },
  { code: "298", label: "Spécialistes 2", searchText: "298 specialistes" },
  { code: "299", label: "Divers", searchText: "299 divers" },
  {
    code: "900",
    label: "Mobilier général",
    searchText: "900 mobilier general",
  },
  {
    code: "901",
    label: "Equip. vestiaires, rayonnages",
    searchText: "901 equipements vestiaires rayonnages",
  },
  {
    code: "902",
    label: "Equipements de sport",
    searchText: "902 equipements sport",
  },
  {
    code: "903",
    label: "Agencements divers",
    searchText: "903 agencements divers",
  },
  { code: "904", label: "Jeux", searchText: "904 jeux" },
  {
    code: "905",
    label: "Agencements d'exposition",
    searchText: "905 agencements exposition",
  },
  {
    code: "908",
    label: "Equipements d'abris PC",
    searchText: "908 equipements abris pc",
  },
  { code: "909", label: "Divers", searchText: "909 divers" },

  // Aménagements extérieurs (codes 300)
  {
    code: "311",
    label: "Démolition, déblaiement",
    searchText: "311 demolition deblaiement exterieurs",
  },
  {
    code: "312",
    label: "Terrassements",
    searchText: "312 terrassements exterieurs",
  },
  {
    code: "313",
    label: "Fondations spéciales",
    searchText: "313 fondations speciales exterieurs",
  },
  {
    code: "321",
    label: "Routes, places, chemins",
    searchText: "321 routes places chemins voirie",
  },
  {
    code: "322",
    label: "Revêtements extérieurs",
    searchText: "322 revetements exterieurs dallages",
  },
  {
    code: "331",
    label: "Canalisations extérieures",
    searchText: "331 canalisations exterieures egouts",
  },
  {
    code: "332",
    label: "Installations électriques extérieures",
    searchText: "332 installations electriques exterieures eclairage",
  },
  {
    code: "341",
    label: "Clôtures, murs de soutènement",
    searchText: "341 clotures murs soutenement",
  },
  {
    code: "342",
    label: "Constructions extérieures",
    searchText: "342 constructions exterieures abris",
  },
  {
    code: "351",
    label: "Jardinage, plantations",
    searchText: "351 jardinage plantations arbres",
  },
  {
    code: "352",
    label: "Aménagements paysagers",
    searchText: "352 amenagements paysagers espaces verts",
  },
  {
    code: "359",
    label: "Divers aménagements extérieurs",
    searchText: "359 divers amenagements exterieurs",
  },

  // Aménagements extérieurs complémentaires (codes 400)
  {
    code: "421",
    label: "Equipements de jeux extérieurs",
    searchText: "421 equipements jeux exterieurs aires",
  },
  {
    code: "422",
    label: "Equipements sportifs extérieurs",
    searchText: "422 equipements sportifs exterieurs terrains",
  },
  {
    code: "431",
    label: "Signalisation extérieure",
    searchText: "431 signalisation exterieure panneaux",
  },
  {
    code: "441",
    label: "Mobilier urbain",
    searchText: "441 mobilier urbain bancs",
  },
  {
    code: "451",
    label: "Installations de stationnement",
    searchText: "451 installations stationnement parking",
  },
];

/**
 * Recherche des codes CFC par terme de recherche et/ou catégorie
 */
export function searchCFCCodes(
  searchTerm: string,
  limit: number = 20,
  category?: CFCCategory
): CFCCode[] {
  let results = CFC_CODES;

  // Filtrer par catégorie si spécifiée
  if (category) {
    results = results.filter((cfc) => getCFCCategory(cfc.code) === category);
  }

  // Filtrer par terme de recherche
  if (searchTerm && searchTerm.trim().length > 0) {
    const term = searchTerm.toLowerCase().trim();
    results = results.filter(
      (cfc) => cfc.searchText.includes(term) || cfc.code.includes(term)
    );
  }

  return results.slice(0, limit);
}

/**
 * Récupère tous les codes CFC d'une catégorie
 */
export function getCFCByCategory(category: CFCCategory): CFCCode[] {
  return CFC_CODES.filter((cfc) => getCFCCategory(cfc.code) === category);
}

/**
 * Récupère un code CFC par son code
 */
export function getCFCByCode(code: string): CFCCode | undefined {
  return CFC_CODES.find((cfc) => cfc.code === code);
}

/**
 * Mappe une catégorie CFC vers le type de marché correspondant
 * Utilisé pour dériver automatiquement le marketType depuis la catégorie CFC
 */
export function getMarketTypeFromCFCCategory(
  category: CFCCategory
): "CONSTRUCTION" | "ENGINEERING" | "ARCHITECTURE" | "OTHER" {
  const mapping: Record<
    CFCCategory,
    "CONSTRUCTION" | "ENGINEERING" | "ARCHITECTURE" | "OTHER"
  > = {
    TERRAIN_PREPARATION: "CONSTRUCTION",
    GROS_OEUVRE: "CONSTRUCTION",
    ENVELOPPE_BATIMENT: "CONSTRUCTION",
    ELECTRICITE: "CONSTRUCTION",
    CVCR: "CONSTRUCTION",
    SANITAIRE: "CONSTRUCTION",
    TRANSPORTS: "CONSTRUCTION",
    AMENAGEMENTS_INTERIEURS: "CONSTRUCTION",
    AMENAGEMENTS_EXTERIEURS: "CONSTRUCTION",
    HONORAIRES: "ARCHITECTURE", // Honoraires incluent architectes, ingénieurs
    MOBILIER: "OTHER",
    AUTRES: "OTHER",
  };

  return mapping[category];
}
