// Types globaux pour Publio
// Ces types complètent ceux générés par Prisma

import {
  OrganizationType,
  OrganizationRole,
  TenderStatus,
  TenderVisibility,
  TenderMode,
  TenderProcedure,
  MarketType,
  OfferStatus,
} from "@prisma/client";

// ============================================
// ORGANISATIONS
// ============================================

export type OrganizationWithMembers = {
  id: string;
  name: string;
  type: OrganizationType;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  canton?: string | null;
  country: string;
  phone?: string | null;
  siret?: string | null;
  taxId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: {
    id: string;
    role: OrganizationRole;
    joinedAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
};

export type OrganizationMemberWithUser = {
  id: string;
  role: OrganizationRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// ============================================
// APPELS D'OFFRES (TENDERS)
// ============================================

export type TenderWithDetails = {
  id: string;
  title: string;
  description: string;
  marketType: MarketType;
  budget?: number | null;
  currency: string;
  status: TenderStatus;
  visibility: TenderVisibility;
  mode: TenderMode;
  publishedAt?: Date | null;
  deadline: Date;
  location?: string | null;
  city?: string | null;
  canton?: string | null;
  createdAt: Date;
  updatedAt: Date;
  identityRevealed: boolean;
  revealedAt?: Date | null;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
    logo?: string | null;
    city?: string | null;
  };
  documents: {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  }[];
  _count?: {
    offers: number;
  };
};

export type TenderCard = {
  id: string;
  title: string;
  marketType: MarketType;
  budget?: number | null;
  currency: string;
  deadline: Date;
  city?: string | null;
  canton?: string | null;
  status: TenderStatus;
  mode: TenderMode;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
    logo?: string | null;
  };
};

export type TenderSearchFilters = {
  keywords?: string;
  marketType?: MarketType[];
  canton?: string[];
  budgetMin?: number;
  budgetMax?: number;
  mode?: TenderMode;
  organizationType?: OrganizationType[];
  visibility?: TenderVisibility;
};

// ============================================
// OFFRES (OFFERS)
// ============================================

export type OfferWithDetails = {
  id: string;
  price: number;
  currency: string;
  description: string;
  methodology?: string | null;
  timeline?: string | null;
  references?: string | null;
  status: OfferStatus;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: string;
  paidAt?: Date | null;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
    logo?: string | null;
    city?: string | null;
    canton?: string | null;
  };
  documents: {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  }[];
  tender: {
    id: string;
    title: string;
    deadline: Date;
    mode: TenderMode;
    identityRevealed: boolean;
  };
};

export type OfferCard = {
  id: string;
  price: number;
  currency: string;
  submittedAt?: Date | null;
  status: OfferStatus;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
  };
};

// ============================================
// AUTHENTIFICATION & SESSIONS
// ============================================

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export type UserWithOrganizations = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  memberships: {
    id: string;
    role: OrganizationRole;
    organization: {
      id: string;
      name: string;
      type: OrganizationType;
      logo?: string | null;
    };
  }[];
};

// ============================================
// PAIEMENTS
// ============================================

export type PaymentIntentData = {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    offerId?: string;
    organizationId: string;
    type: "offer_submission" | "subscription";
  };
};

export type StripeCheckoutSession = {
  id: string;
  url: string;
};

// ============================================
// UTILITAIRES
// ============================================

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// ============================================
// FORMULAIRES
// ============================================

export type CreateTenderInput = {
  title: string;
  summary?: string;
  description: string;
  marketType: MarketType;
  cfcCode?: string;
  budget?: number;
  showBudget?: boolean;
  surfaceM2?: number;
  volumeM3?: number;
  unitsQuantity?: string;
  contractDuration?: number;
  contractStartDate?: string;
  isRenewable?: boolean;
  deadline: Date;
  questionDeadline?: Date;
  location?: string;
  address?: string;
  city?: string;
  canton?: string;
  country?: string;
  visibility: TenderVisibility;
  mode: TenderMode;
  procedure?: TenderProcedure;
  hasLots?: boolean;
  allowPartialOffers?: boolean;
  participationConditions?: string;
  requiredDocuments?: string;
  requiresReferences?: boolean;
  requiresInsurance?: boolean;
  minExperience?: number;
  contractualTerms?: string;
  organizationId: string;
};

export type CreateOfferInput = {
  tenderId: string;
  organizationId: string;
  price: number;
  description: string;
  methodology?: string;
  timeline?: string;
  references?: string;
};

export type CreateOrganizationInput = {
  name: string;
  type: OrganizationType;
  description?: string;
  address?: string;
  city?: string;
  canton?: string;
  phone?: string;
  website?: string;
  siret?: string;
};

export type InviteMemberInput = {
  organizationId: string;
  email: string;
  role: OrganizationRole;
};

// ============================================
// VEILLE COMMUNALE
// ============================================

export type VeillePublicationCard = {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  commune: string;
  canton: string;
  type: string;
  publishedAt: Date;
  scrapedAt: Date;
};

export type VeilleSearchCriteria = {
  communes?: string[];
  cantons?: string[];
  keywords?: string[];
  startDate?: Date;
  endDate?: Date;
  types?: string[];
};
