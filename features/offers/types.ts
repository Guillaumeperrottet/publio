/**
 * Types et interfaces pour la gestion des offres
 */

/**
 * Type pour le formulaire d'offre
 * Utilisé lors de la création et mise à jour des offres
 */
export interface OfferFormData {
  offerNumber?: string;
  validityDays: number;
  usesTenderDeadline?: boolean;
  projectSummary: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationWebsite?: string;
  inclusions: Array<{ position: number; description: string }>;
  exclusions: Array<{ position: number; description: string }>;
  materials: Array<{
    position: number;
    name: string;
    brand?: string;
    model?: string;
    range?: string;
    manufacturerWarranty?: string;
  }>;
  description: string;
  methodology?: string;
  priceType: "GLOBAL" | "DETAILED";
  price: number;
  totalHT?: number;
  totalTVA?: number;
  tvaRate: number;
  discount?: number;
  lineItems: Array<{
    position: number;
    description: string;
    quantity?: number;
    unit?: string;
    priceHT: number;
    tvaRate: number;
    category?: string;
    sectionOrder?: number;
  }>;
  timeline?: string;
  startDate?: string;
  durationDays?: number;
  constraints?: string;
  paymentTerms?: {
    deposit?: number;
    intermediate?: number;
    final?: number;
    netDays?: number;
  };
  warrantyYears?: number;
  insuranceAmount?: number;
  manufacturerWarranty?: string;
  references?: string;
  signature?: string;
  documents?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}
