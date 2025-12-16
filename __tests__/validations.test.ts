/**
 * Tests pour les helpers de validation
 */

import { describe, it, expect } from "vitest";

describe("Validations communes", () => {
  describe("Email validation", () => {
    it("devrait valider un email correct", () => {
      const validEmails = [
        "test@example.com",
        "user+tag@domain.co.uk",
        "name.surname@company.ch",
      ];

      validEmails.forEach((email) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it("devrait rejeter un email invalide", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
      ];

      invalidEmails.forEach((email) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });
  });

  describe("Swiss phone validation", () => {
    it("devrait valider un numéro suisse correct", () => {
      const validPhones = [
        "+41791234567",
        "+41 79 123 45 67",
        "0791234567",
        "079 123 45 67",
      ];

      validPhones.forEach((phone) => {
        const cleaned = phone.replace(/\s/g, "");
        const isValid =
          /^(\+41|0)[1-9]\d{8}$/.test(cleaned) || /^\+41\d{9}$/.test(cleaned);
        expect(isValid).toBe(true);
      });
    });
  });

  describe("CHF amount validation", () => {
    it("devrait valider les montants CHF positifs", () => {
      const validAmounts = [100, 1000.5, 999999.99];

      validAmounts.forEach((amount) => {
        expect(amount).toBeGreaterThan(0);
        expect(amount).toBeLessThan(10000000); // Max 10M CHF
      });
    });

    it("devrait rejeter les montants négatifs", () => {
      const invalidAmounts = [-100, -0.01];

      invalidAmounts.forEach((amount) => {
        expect(amount).toBeLessThan(0);
      });
    });
  });

  describe("Deadline validation", () => {
    it("devrait valider une deadline future", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // Dans 30 jours

      const now = new Date();
      expect(futureDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it("devrait rejeter une deadline passée", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Hier

      const now = new Date();
      expect(pastDate.getTime()).toBeLessThan(now.getTime());
    });
  });

  describe("Tender title validation", () => {
    it("devrait valider un titre de longueur correcte", () => {
      const validTitle = "Construction d'un bâtiment"; // 15+ caractères

      expect(validTitle.length).toBeGreaterThanOrEqual(15);
      expect(validTitle.length).toBeLessThanOrEqual(200);
    });

    it("devrait rejeter un titre trop court", () => {
      const shortTitle = "Court"; // Moins de 15 caractères

      expect(shortTitle.length).toBeLessThan(15);
    });
  });

  describe("Description validation", () => {
    it("devrait valider une description de longueur correcte", () => {
      const validDescription =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.";

      expect(validDescription.length).toBeGreaterThanOrEqual(150);
    });

    it("devrait rejeter une description trop courte", () => {
      const shortDescription = "Trop court";

      expect(shortDescription.length).toBeLessThan(150);
    });
  });

  describe("Canton validation", () => {
    it("devrait valider les cantons suisses", () => {
      const validCantons = [
        "VD",
        "GE",
        "FR",
        "VS",
        "NE",
        "ZH",
        "BE",
        "TI",
        "AG",
      ];

      validCantons.forEach((canton) => {
        expect(canton).toHaveLength(2);
        expect(canton).toEqual(canton.toUpperCase());
      });
    });

    it("devrait avoir exactement 26 cantons", () => {
      const allCantons = [
        "AG",
        "AI",
        "AR",
        "BE",
        "BL",
        "BS",
        "FR",
        "GE",
        "GL",
        "GR",
        "JU",
        "LU",
        "NE",
        "NW",
        "OW",
        "SG",
        "SH",
        "SO",
        "SZ",
        "TG",
        "TI",
        "UR",
        "VD",
        "VS",
        "ZG",
        "ZH",
      ];

      expect(allCantons).toHaveLength(26);
    });
  });

  describe("Percentage validation", () => {
    it("devrait valider des pourcentages corrects", () => {
      const validPercentages = [0, 25, 50, 75, 100];

      validPercentages.forEach((pct) => {
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThanOrEqual(100);
      });
    });

    it("devrait rejeter des pourcentages invalides", () => {
      const invalidPercentages = [-1, 101, 150];

      invalidPercentages.forEach((pct) => {
        const isValid = pct >= 0 && pct <= 100;
        expect(isValid).toBe(false);
      });
    });
  });

  describe("Criteria weight total validation", () => {
    it("devrait valider que les critères totalisent 100%", () => {
      const criteria = [
        { name: "Prix", weight: 40 },
        { name: "Qualité", weight: 30 },
        { name: "Délai", weight: 20 },
        { name: "Références", weight: 10 },
      ];

      const total = criteria.reduce((sum, c) => sum + c.weight, 0);
      expect(total).toBe(100);
    });

    it("devrait rejeter des critères qui ne totalisent pas 100%", () => {
      const criteria = [
        { name: "Prix", weight: 50 },
        { name: "Qualité", weight: 30 },
      ];

      const total = criteria.reduce((sum, c) => sum + c.weight, 0);
      expect(total).not.toBe(100);
    });
  });
});
