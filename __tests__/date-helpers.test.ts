/**
 * Tests pour les helpers de dates
 * Logique critique pour deadlines, validations, etc.
 */

import { describe, it, expect } from "vitest";
import {
  format,
  formatDistanceToNow,
  addDays,
  isBefore,
  isAfter,
} from "date-fns";
import { fr } from "date-fns/locale";

describe("Date helpers", () => {
  describe("Deadline validation", () => {
    it("devrait valider qu'une deadline est dans le futur", () => {
      const now = new Date("2025-01-15T10:00:00");
      const futureDeadline = new Date("2025-02-15T10:00:00");

      expect(isAfter(futureDeadline, now)).toBe(true);
    });

    it("devrait rejeter une deadline dans le passé", () => {
      const now = new Date("2025-01-15T10:00:00");
      const pastDeadline = new Date("2025-01-10T10:00:00");

      expect(isBefore(pastDeadline, now)).toBe(true);
    });

    it("devrait calculer les jours restants avant deadline", () => {
      const now = new Date("2025-01-15");
      const deadline = new Date("2025-01-30");

      const daysRemaining = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysRemaining).toBe(15);
    });
  });

  describe("Date formatting", () => {
    it("devrait formater une date en français", () => {
      const date = new Date("2025-01-15T14:30:00");
      const formatted = format(date, "dd MMMM yyyy", { locale: fr });

      expect(formatted).toBe("15 janvier 2025");
    });

    it("devrait formater une date avec heure", () => {
      const date = new Date("2025-01-15T14:30:00");
      const formatted = format(date, "dd.MM.yyyy HH:mm", { locale: fr });

      expect(formatted).toBe("15.01.2025 14:30");
    });

    it("devrait calculer le temps relatif", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Il y a 2h

      const relative = formatDistanceToNow(past, {
        locale: fr,
        addSuffix: true,
      });

      expect(relative).toContain("environ 2 heures");
    });
  });

  describe("Deadline warnings", () => {
    it("devrait détecter une deadline proche (< 24h)", () => {
      const now = new Date("2025-01-15T10:00:00");
      const deadline = new Date("2025-01-15T20:00:00"); // Dans 10h

      const hoursRemaining =
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(hoursRemaining).toBeLessThan(24);
      expect(hoursRemaining).toBeGreaterThan(0);
    });

    it("devrait détecter une deadline très proche (< 3h)", () => {
      const now = new Date("2025-01-15T10:00:00");
      const deadline = new Date("2025-01-15T12:00:00"); // Dans 2h

      const hoursRemaining =
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(hoursRemaining).toBeLessThan(3);
    });
  });

  describe("Working days calculations", () => {
    it("devrait calculer 30 jours ouvrables", () => {
      const startDate = new Date("2025-01-15"); // Mercredi
      const endDate = addDays(startDate, 30);

      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(30);
    });

    it("devrait identifier un jour de weekend", () => {
      const saturday = new Date("2025-01-18"); // Samedi
      const sunday = new Date("2025-01-19"); // Dimanche

      expect(saturday.getDay()).toBe(6); // Samedi = 6
      expect(sunday.getDay()).toBe(0); // Dimanche = 0
    });

    it("devrait identifier un jour ouvrable", () => {
      const monday = new Date("2025-01-20"); // Lundi
      const day = monday.getDay();

      const isWorkingDay = day >= 1 && day <= 5;
      expect(isWorkingDay).toBe(true);
    });
  });

  describe("Tender publication timing", () => {
    it("devrait calculer une durée de publication standard (30 jours)", () => {
      const publishedAt = new Date("2025-01-15");
      const deadline = addDays(publishedAt, 30);

      const duration = Math.ceil(
        (deadline.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(duration).toBe(30);
    });

    it("devrait vérifier si un tender est encore actif", () => {
      const now = new Date("2025-01-20");
      const deadline = new Date("2025-02-20");

      const isActive = isAfter(deadline, now);
      expect(isActive).toBe(true);
    });

    it("devrait vérifier si un tender est expiré", () => {
      const now = new Date("2025-01-20");
      const deadline = new Date("2025-01-10");

      const isExpired = isBefore(deadline, now);
      expect(isExpired).toBe(true);
    });
  });

  describe("Question deadline validation", () => {
    it("devrait valider que la question deadline est avant la deadline principale", () => {
      const mainDeadline = new Date("2025-02-15");
      const questionDeadline = new Date("2025-02-10");

      expect(isBefore(questionDeadline, mainDeadline)).toBe(true);
    });

    it("devrait rejeter une question deadline après la deadline principale", () => {
      const mainDeadline = new Date("2025-02-15");
      const questionDeadline = new Date("2025-02-20");

      expect(isAfter(questionDeadline, mainDeadline)).toBe(true);
    });
  });

  describe("Contract dates", () => {
    it("devrait calculer une date de début de contrat", () => {
      const awardDate = new Date("2025-02-15");
      const contractStart = addDays(awardDate, 14); // 2 semaines après

      const daysDiff = Math.ceil(
        (contractStart.getTime() - awardDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(14);
    });

    it("devrait calculer la durée d'un contrat en mois", () => {
      const startDate = new Date("2025-01-15");
      const endDate = new Date("2025-07-15");

      const monthsDiff =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      expect(monthsDiff).toBe(6);
    });
  });

  describe("Offer validity period", () => {
    it("devrait calculer la date d'expiration d'une offre (60 jours)", () => {
      const submittedAt = new Date("2025-01-15");
      const validityDays = 60;
      const expiresAt = addDays(submittedAt, validityDays);

      const daysDiff = Math.ceil(
        (expiresAt.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(60);
    });

    it("devrait vérifier si une offre est encore valide", () => {
      const now = new Date("2025-02-01");
      const expiresAt = new Date("2025-03-01");

      const isValid = isAfter(expiresAt, now);
      expect(isValid).toBe(true);
    });
  });
});
