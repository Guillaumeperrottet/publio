/**
 * Helper functions to check if tenders match saved search criteria
 */

import { Tender, Organization } from "@prisma/client";

type TenderWithOrg = Tender & {
  organization: Organization;
};

/**
 * Check if a tender matches saved search criteria
 */
export function matchesSavedSearchCriteria(
  tender: TenderWithOrg,
  criteria: Record<string, unknown>
): boolean {
  // Text search
  if (criteria.search && typeof criteria.search === "string") {
    const searchLower = criteria.search.toLowerCase();
    const titleMatch = tender.title.toLowerCase().includes(searchLower);
    const descMatch = tender.description.toLowerCase().includes(searchLower);

    if (!titleMatch && !descMatch) {
      return false;
    }
  }

  // Canton
  if (criteria.canton && tender.canton !== criteria.canton) {
    return false;
  }

  // City
  if (criteria.city && tender.city !== criteria.city) {
    return false;
  }

  // Market type
  if (criteria.marketType && tender.marketType !== criteria.marketType) {
    return false;
  }

  // Budget min
  if (criteria.budgetMin && typeof criteria.budgetMin === "number") {
    if (!tender.budget || tender.budget < criteria.budgetMin) {
      return false;
    }
  }

  // Budget max
  if (criteria.budgetMax && typeof criteria.budgetMax === "number") {
    if (!tender.budget || tender.budget > criteria.budgetMax) {
      return false;
    }
  }

  // Mode (ANONYMOUS, PUBLIC, etc.)
  if (criteria.mode && tender.mode !== criteria.mode) {
    return false;
  }

  // Organization type
  if (
    criteria.organizationType &&
    tender.organization.type !== criteria.organizationType
  ) {
    return false;
  }

  return true;
}
