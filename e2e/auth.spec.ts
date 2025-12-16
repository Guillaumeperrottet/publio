import { test, expect } from "@playwright/test";

/**
 * Tests E2E - Parcours d'authentification
 *
 * Scénarios testés:
 * - Signup d'un nouvel utilisateur
 * - Login avec email/password
 * - Création d'une organisation
 */

test.describe("Authentication Flow", () => {
  test("should complete signup and create organization", async ({ page }) => {
    // Générer email unique pour éviter les conflits
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@publio.test`;
    const testPassword = "Test123456!";
    const testName = `Test User ${timestamp}`;
    const orgName = `Test Org ${timestamp}`;

    // 1. Aller sur la page d'accueil
    await page.goto("/");
    await expect(page).toHaveTitle(/Publio/);

    // 2. Cliquer sur "S'inscrire"
    await page.click("text=S'inscrire");
    await expect(page).toHaveURL(/\/auth\/signup/);

    // 3. Remplir le formulaire de signup
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', testName);

    // 4. Soumettre le formulaire
    await page.click('button[type="submit"]');

    // 5. Vérifier redirection vers onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/onboarding/);

    // 6. Créer une organisation
    await page.fill('input[name="name"]', orgName);
    await page.selectOption('select[name="type"]', "ENTREPRISE");
    await page.fill('input[name="city"]', "Lausanne");
    await page.selectOption('select[name="canton"]', "VD");

    // 7. Soumettre le formulaire d'organisation
    await page.click('button[type="submit"]:has-text("Créer")');

    // 8. Vérifier redirection vers dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // 9. Vérifier que l'organisation est affichée
    await expect(page.locator(`text=${orgName}`)).toBeVisible();
  });

  test("should login with existing credentials", async ({ page }) => {
    // Ce test nécessite un compte existant en DB
    // Pour l'instant on teste juste l'UI de login

    await page.goto("/auth/signin");
    await expect(page).toHaveURL(/\/auth\/signin/);

    // Vérifier que le formulaire de login est présent
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors on invalid signup", async ({ page }) => {
    await page.goto("/auth/signup");

    // Essayer de soumettre sans remplir
    await page.click('button[type="submit"]');

    // Attendre les erreurs de validation HTML5
    const emailInput = page.locator('input[name="email"]');
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test("should navigate between signin and signup", async ({ page }) => {
    // Commencer sur signin
    await page.goto("/auth/signin");
    await expect(page).toHaveURL(/\/auth\/signin/);

    // Cliquer sur "S'inscrire"
    await page.click("text=S'inscrire");
    await expect(page).toHaveURL(/\/auth\/signup/);

    // Retourner à signin
    await page.click("text=Se connecter");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});
