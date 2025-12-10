"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Organization {
  id: string;
  name: string;
  type: string;
  logo: string | null;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization) => void;
  availableOrganizations: Organization[];
  setAvailableOrganizations: (orgs: Organization[]) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganizationState] =
    useState<Organization | null>(null);
  const [availableOrganizations, setAvailableOrganizations] = useState<
    Organization[]
  >([]);

  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrganizationState(org);
    if (typeof window !== "undefined") {
      localStorage.setItem("currentOrganizationId", org.id);
    }
  };

  // Initialiser depuis localStorage
  useEffect(() => {
    if (typeof window === "undefined" || availableOrganizations.length === 0) {
      return;
    }

    const stored = localStorage.getItem("currentOrganizationId");
    if (!stored) {
      // Sélectionner la première organisation par défaut
      if (availableOrganizations[0]) {
        setCurrentOrganization(availableOrganizations[0]);
      }
      return;
    }

    const org = availableOrganizations.find((o) => o.id === stored);
    if (org && (!currentOrganization || currentOrganization.id !== org.id)) {
      setCurrentOrganizationState(org);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOrganizations]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        availableOrganizations,
        setAvailableOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}
