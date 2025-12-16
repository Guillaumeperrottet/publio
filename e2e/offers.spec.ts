import { test, expect } from "@playwright/test";

/**
 * Tests E2E - Parcours Offer complet
 *
 * Scénarios testés:
 * - Visualisation d'un tender
 * - Soumission d'une offre
 * - Consultation des offres reçues (côté client)
 */

test.describe("Offer Flow", () => {
  test.skip("should submit an offer to a tender", async ({ page }) => {
    // SKIP: nécessite setup auth + tender publié

    // 1. Aller sur un tender publié
    await page.goto("/tenders/some-tender-id");

    // 2. Cliquer sur "Soumettre une offre"
    await page.click("text=Soumettre une offre");

    // 3. Remplir le formulaire d'offre
    await page.fill('input[name="price"]', "50000");
    await page.fill(
      'textarea[name="description"]',
      "Notre proposition technique"
    );
    await page.fill('input[name="timeline"]', "3 mois");
    await page.fill('textarea[name="methodology"]', "Méthode Agile");

    // 4. Soumettre l'offre
    await page.click('button[type="submit"]:has-text("Soumettre")');

    // 5. Paiement Stripe (test mode)
    // ...

    // 6. Confirmation
    await expect(page.locator("text=Offre soumise avec succès")).toBeVisible();
  });

  test.skip("should view received offers as client", async ({ page }) => {
    // SKIP: nécessite setup auth + tender avec offres

    // 1. Aller sur dashboard des tenders
    await page.goto("/dashboard/tenders");

    // 2. Cliquer sur un tender avec offres
    await page.click("text=Voir les offres");

    // 3. Liste des offres devrait apparaître
    await expect(page).toHaveURL(/\/dashboard\/offers/);
    await expect(page.locator("text=Offres reçues")).toBeVisible();
  });

  test.skip("should accept an offer", async ({ page }) => {
    // SKIP: nécessite setup auth + offres existantes

    await page.goto("/dashboard/offers/tender-id");

    // Cliquer sur "Accepter" pour la première offre
    const acceptButton = page.locator('button:has-text("Accepter")').first();
    await acceptButton.click();

    // Confirmer l'action
    await page.click('button:has-text("Confirmer")');

    // Vérifier le statut
    await expect(page.locator("text=Acceptée")).toBeVisible();
  });

  test.skip("should shortlist an offer", async ({ page }) => {
    await page.goto("/dashboard/offers/tender-id");

    // Mettre en liste d'étude
    const shortlistButton = page
      .locator('button:has-text("À étudier")')
      .first();
    await shortlistButton.click();

    // Vérifier le badge
    await expect(page.locator("text=À étudier")).toBeVisible();
  });
});
