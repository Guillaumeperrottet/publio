/**
 * Tests pour les toast messages standardisés
 */

import { describe, it, expect, vi } from "vitest";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/toast-messages";

// Mock Sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
  },
}));

describe("toast-messages", () => {
  describe("handleError", () => {
    it("devrait appeler toast.error pour une erreur unauthorized", () => {
      const error = new Error("Unauthorized");
      handleError(error, "testContext");

      expect(toast.error).toHaveBeenCalledWith(
        "Accès refusé",
        expect.objectContaining({
          description: "Vous n'avez pas les permissions nécessaires.",
        })
      );
    });

    it("devrait appeler toast.error pour une erreur authenticated", () => {
      const error = new Error("Non authentifié");
      handleError(error, "testContext");

      expect(toast.error).toHaveBeenCalledWith(
        "Non authentifié",
        expect.objectContaining({
          description: "Vous devez être connecté pour effectuer cette action.",
        })
      );
    });

    it("devrait appeler toast.error pour une erreur network", () => {
      const error = new Error("network error");
      handleError(error, "testContext");

      expect(toast.error).toHaveBeenCalledWith(
        "Erreur de connexion",
        expect.any(Object)
      );
    });

    it("devrait gérer les erreurs génériques", () => {
      const error = new Error("Something went wrong");
      handleError(error, "testContext");

      expect(toast.error).toHaveBeenCalledWith(
        "Une erreur est survenue",
        expect.objectContaining({
          description: "Something went wrong",
        })
      );
    });

    it("devrait gérer les erreurs non-Error", () => {
      handleError("string error", "testContext");

      expect(toast.error).toHaveBeenCalledWith(
        "Erreur serveur",
        expect.any(Object)
      );
    });

    it("devrait logger l'erreur dans la console", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");

      handleError(error, "testContext");

      expect(consoleSpy).toHaveBeenCalledWith("Error in testContext:", error);

      consoleSpy.mockRestore();
    });
  });
});
