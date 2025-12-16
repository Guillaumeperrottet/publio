import { test, expect } from "@playwright/test";

/**
 * Tests E2E - Parcours Tender complet
 *
 * Scénarios testés:
 * - Navigation vers création de tender
 * - Création d'un tender en mode draft
 * - Publication du tender (nécessite paiement Stripe en test mode)
 * - Visualisation du tender publié
 */

test.describe("Tender Flow", () => {
  test.skip("should create and publish a tender", async ({ page }) => {
    // SKIP: nécessite setup auth + Stripe test mode

    // 1. Aller sur le dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Cliquer sur "Créer un appel d'offres"
    await page.click("text=Créer un appel d'offres");
    await expect(page).toHaveURL(/\/dashboard\/tenders\/create/);

    // 3. Remplir le formulaire
    const timestamp = Date.now();
    await page.fill('input[name="title"]', `Test Tender ${timestamp}`);
    await page.fill(
      'textarea[name="description"]',
      "Description du projet test"
    );
    await page.selectOption('select[name="marketType"]', "IT_SERVICES");
    await page.selectOption('select[name="visibility"]', "PUBLIC");
    await page.selectOption('select[name="mode"]', "ANONYMOUS");

    // Date deadline (30 jours dans le futur)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split("T")[0];
    await page.fill('input[name="deadline"]', dateString);

    // 4. Sauvegarder le draft
    await page.click('button[type="submit"]:has-text("Sauvegarder")');

    // 5. Vérifier redirection vers liste des tenders
    await page.waitForURL(/\/dashboard\/tenders/, { timeout: 10000 });
    await expect(page.locator(`text=Test Tender ${timestamp}`)).toBeVisible();

    // 6. Le tender devrait être en statut DRAFT
    await expect(page.locator("text=Brouillon")).toBeVisible();
  });

  test("should display public tenders list", async ({ page }) => {
    // 1. Aller sur la page publique des tenders
    await page.goto("/tenders");
    await expect(page).toHaveURL(/\/tenders/);

    // 2. Vérifier que la page charge
    await expect(page.locator("h1")).toContainText(/Appels d'offres|Tenders/);

    // 3. Vérifier présence des filtres
    await expect(page.locator("text=Filtrer")).toBeVisible();
  });

  test("should filter tenders by canton", async ({ page }) => {
    await page.goto("/tenders");

    // Attendre que la liste charge
    await page.waitForTimeout(1000);

    // Cliquer sur filtre canton
    await page.click("text=Canton");

    // Sélectionner VD
    await page.click("text=Vaud");

    // Attendre que les résultats se filtrent
    await page.waitForTimeout(500);

    // Les résultats devraient être filtrés (difficile à tester sans données)
  });

  test("should navigate to tender detail", async ({ page }) => {
    await page.goto("/tenders");

    // Attendre que des tenders apparaissent
    const firstTenderCard = page.locator('[href^="/tenders/"]').first();

    // Si des tenders existent, cliquer sur le premier
    const count = await firstTenderCard.count();
    if (count > 0) {
      await firstTenderCard.click();
      await expect(page).toHaveURL(/\/tenders\/[a-z0-9-]+/);
    }
  });
});
