# Guide d'utilisation Playwright - Tests E2E

> Documentation pour exécuter et créer des tests End-to-End avec Playwright sur Publio

## 📚 Table des matières

- [Pourquoi les tests E2E ?](#pourquoi-les-tests-e2e-)
- [Commandes disponibles](#commandes-disponibles)
- [Structure des tests](#structure-des-tests)
- [Écrire un test](#écrire-un-test)
- [Best practices](#best-practices)
- [Debugging](#debugging)

---

## Pourquoi les tests E2E ?

Les tests End-to-End (E2E) simulent un **utilisateur réel** interagissant avec l'application dans un navigateur :

- ✅ **Parcours utilisateur complets** : signup → create tender → receive offers
- ✅ **Intégrations externes** : Stripe, Cloudinary, emails
- ✅ **Cross-browser** : Chrome, Firefox, Safari, mobile
- ✅ **Screenshots & videos** : Capture automatique en cas d'échec
- ✅ **Complément aux tests unitaires** : Vitest teste la logique, Playwright teste l'UX

---

## Commandes disponibles

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Interface UI interactive
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (step-by-step)
npm run test:e2e:debug

# Tests sur un navigateur spécifique
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Voir le rapport HTML
npx playwright show-report
```

---

## Structure des tests

```
e2e/
├── auth.spec.ts          # Authentification (signup, login)
├── tenders.spec.ts       # Tenders (create, publish, view)
├── offers.spec.ts        # Offers (submit, accept, reject)
└── veille.spec.ts        # Veille (subscribe, filter, alerts)
```

---

## Écrire un test

### Structure de base

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    // 1. Navigation
    await page.goto("/page");

    // 2. Interactions
    await page.click('button:has-text("Click me")');
    await page.fill('input[name="email"]', "test@example.com");

    // 3. Assertions
    await expect(page).toHaveURL(/\/success/);
    await expect(page.locator("text=Success")).toBeVisible();
  });
});
```

### Sélecteurs recommandés

```typescript
// ✅ BIEN : Par texte (plus robuste)
await page.click("text=S'inscrire");
await page.locator('button:has-text("Créer")').click();

// ✅ BIEN : Par attribut name
await page.fill('input[name="email"]', "test@example.com");

// ✅ BIEN : Par data-testid
await page.click('[data-testid="submit-button"]');

// ❌ ÉVITER : Par classes CSS (fragile)
await page.click(".btn-primary.text-lg");
```

### Actions courantes

```typescript
// Navigation
await page.goto("/dashboard");
await page.goBack();
await page.reload();

// Clics
await page.click("button");
await page.dblclick("button");
await page.locator("button").first().click();

// Saisie
await page.fill("input", "value");
await page.type("input", "slow typing");
await page.press("input", "Enter");

// Sélection
await page.selectOption('select[name="canton"]', "VD");
await page.check('input[type="checkbox"]');
await page.setChecked('input[type="checkbox"]', true);

// Upload fichier
await page.setInputFiles('input[type="file"]', "path/to/file.pdf");

// Attentes
await page.waitForURL(/\/success/);
await page.waitForSelector("text=Loaded");
await page.waitForTimeout(1000); // ⚠️ Éviter si possible
```

### Assertions

```typescript
// URL
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle(/Publio/);

// Éléments
await expect(page.locator("h1")).toBeVisible();
await expect(page.locator("h1")).toHaveText("Welcome");
await expect(page.locator("h1")).toContainText("Wel");
await expect(page.locator("button")).toBeDisabled();
await expect(page.locator(".error")).toHaveCount(0);

// Valeurs
await expect(page.locator("input")).toHaveValue("test@example.com");
await expect(page.locator("input")).toHaveAttribute("disabled");
```

---

## Best practices

### 1. Utiliser test.skip() pour les tests incomplets

```typescript
test.skip("should complete payment", async ({ page }) => {
  // Test nécessitant Stripe test mode configuré
});
```

### 2. Générer des données uniques

```typescript
const timestamp = Date.now();
const testEmail = `test-${timestamp}@publio.test`;
```

### 3. Nettoyer après les tests

```typescript
test.afterEach(async ({ page }) => {
  // Nettoyer les données créées
});
```

### 4. Utiliser des fixtures pour l'authentification

```typescript
// playwright.config.ts
test.use({ storageState: "playwright/.auth/user.json" });
```

### 5. Parallélisation

```typescript
// Par défaut, Playwright exécute les tests en parallèle
// Pour forcer séquentiel :
test.describe.serial("Sequential tests", () => {
  // Tests exécutés un par un
});
```

---

## Debugging

### Mode debug interactif

```bash
npm run test:e2e:debug
```

- **Pause** : `await page.pause();`
- **Inspecteur** : Cliquer sur les éléments, tester les sélecteurs
- **Step-by-step** : Avancer ligne par ligne

### Voir le navigateur en action

```bash
npm run test:e2e:headed
```

### Voir traces & screenshots

```bash
npx playwright show-report
```

- **Traces** : Enregistrement vidéo des actions
- **Screenshots** : Capture à chaque étape
- **Logs réseau** : Requêtes API, erreurs console

### Logs dans les tests

```typescript
console.log("Current URL:", page.url());
console.log("Title:", await page.title());
```

---

## Exemples complets

### Test signup complet

```typescript
test("complete signup flow", async ({ page }) => {
  const timestamp = Date.now();
  const email = `user-${timestamp}@test.com`;

  await page.goto("/auth/signup");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "Test123!");
  await page.fill('input[name="name"]', "Test User");
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/onboarding/);
  await expect(page.locator("h1")).toContainText("Onboarding");
});
```

### Test avec upload fichier

```typescript
test("upload tender document", async ({ page }) => {
  await page.goto("/dashboard/tenders/create");

  await page.setInputFiles('input[type="file"]', {
    name: "document.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("PDF content"),
  });

  await expect(page.locator("text=document.pdf")).toBeVisible();
});
```

### Test navigation conditionnelle

```typescript
test("navigate if element exists", async ({ page }) => {
  await page.goto("/tenders");

  const tenderCard = page.locator('[href^="/tenders/"]').first();
  const count = await tenderCard.count();

  if (count > 0) {
    await tenderCard.click();
    await expect(page).toHaveURL(/\/tenders\/[a-z0-9-]+/);
  } else {
    console.log("No tenders available");
  }
});
```

---

## CI/CD Integration

Les tests Playwright peuvent être intégrés dans GitHub Actions :

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Ressources

- [Documentation Playwright](https://playwright.dev/)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
