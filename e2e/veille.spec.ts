import { test, expect } from "@playwright/test";

/**
 * Tests E2E - Parcours Veille
 *
 * Scénarios testés:
 * - Navigation vers veille
 * - Consultation des publications
 * - Filtrage par canton/type
 */

test.describe("Veille Flow", () => {
  test.skip("should subscribe to veille", async ({ page }) => {
    // SKIP: nécessite setup auth + Stripe

    await page.goto("/dashboard/veille");

    // Cliquer sur "S'abonner"
    await page.click("text=S'abonner");

    // Sélectionner cantons
    await page.click("text=Vaud");
    await page.click("text=Genève");

    // Valider l'abonnement
    await page.click('button:has-text("Continuer")');

    // Paiement Stripe (CHF 5 ou CHF 10)
    // ...

    // Confirmation
    await expect(page.locator("text=Abonnement actif")).toBeVisible();
  });

  test.skip("should view veille publications", async ({ page }) => {
    await page.goto("/dashboard/veille");

    // Liste des publications devrait être visible
    await expect(page.locator("text=Publications")).toBeVisible();
  });

  test.skip("should filter publications by canton", async ({ page }) => {
    await page.goto("/dashboard/veille");

    // Sélectionner filtre VD
    await page.click("text=Vaud");

    // Les résultats devraient être filtrés
    await page.waitForTimeout(500);
  });

  test.skip("should filter publications by type", async ({ page }) => {
    await page.goto("/dashboard/veille");

    // Sélectionner type "Permis de construire"
    await page.click("text=Permis de construire");

    // Les résultats devraient être filtrés
    await page.waitForTimeout(500);
  });

  test.skip("should search publications by keyword", async ({ page }) => {
    await page.goto("/dashboard/veille");

    // Rechercher "construction"
    await page.fill('input[placeholder*="Rechercher"]', "construction");
    await page.press('input[placeholder*="Rechercher"]', "Enter");

    // Les résultats devraient contenir "construction"
    await page.waitForTimeout(500);
  });
});
