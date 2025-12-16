# Guide Pratique - Tests Automatisés Vitest

## 🎯 Introduction

Ce guide t'explique comment utiliser les tests automatisés dans Publio avec Vitest.

**Pourquoi tester ?**

- Éviter les bugs de paiement (calculs Stripe critiques)
- Confiance lors des refactorings
- Documentation vivante du code
- Détection précoce des régressions

---

## 🚀 Commandes rapides

```bash
# Mode watch (développement)
npm test

# Run unique (avant commit)
npm test -- --run

# Interface graphique
npm run test:ui

# Coverage
npm run test:coverage
```

---

## 📁 Tests existants (78 tests ✅)

1. **validations.test.ts** (17 tests)

   - Email, téléphone suisse, montants CHF
   - Titres, descriptions, cantons
   - Critères à 100%

2. **billing.test.ts** (18 tests)

   - Calculs Stripe (centimes → CHF)
   - Prix tender (CHF 10), veille (CHF 5/10)
   - TVA, remboursements, factures

3. **date-helpers.test.ts** (20 tests)

   - Deadlines, validations futures/passées
   - Formatage dates français
   - Jours ouvrables, durées

4. **toast-messages.test.ts** (6 tests)

   - Gestion d'erreurs standardisée
   - Messages utilisateur

5. **loading-button.test.tsx** (9 tests)

   - États du bouton (loading, disabled)
   - Interactions utilisateur

6. **error-boundary.test.tsx** (8 tests)
   - Catch d'erreurs React
   - UI d'erreur

---

## ✍️ Écrire un test simple

```typescript
import { describe, it, expect } from "vitest";

describe("Ma fonctionnalité", () => {
  it("devrait faire quelque chose", () => {
    // Arrange
    const input = 100;

    // Act
    const result = maFonction(input);

    // Assert
    expect(result).toBe(200);
  });
});
```

---

## 🔄 Workflow quotidien

### Développer une feature

```bash
# 1. Lance les tests en mode watch
npm test

# 2. Code ta feature
# Les tests se relancent automatiquement

# 3. Vérifie que tout passe
✅ 78 tests passed
```

### Avant de commit

```bash
# Lance tous les tests une fois
npm test -- --run

# Build pour vérifier
npm run build

# Si tout passe, commit
git add . && git commit -m "feat: ma feature"
```

### Fixer un bug

```bash
# 1. Crée un test qui reproduit le bug
it("devrait calculer CHF 10 pour 3 cantons", () => {
  expect(calculate(["VD", "GE", "FR"])).toBe(1000);
  // ❌ FAIL: reçoit 500
});

# 2. Fix le code
# 3. Le test passe ✅
# 4. Le bug ne reviendra jamais
```

---

## 🎯 Que tester ?

### ✅ Priorité haute

- Calculs de prix Stripe
- Validations de données critiques
- Logique métier complexe (permissions, états)
- Composants avec interactions (forms, buttons)

### ⚠️ Priorité basse

- Composants purement visuels
- CSS/styles
- Pages simples d'affichage

---

## 🧪 Matchers courants

```typescript
// Égalité
expect(value).toBe(42);
expect(obj).toEqual({ name: "Test" });

// Nombres
expect(value).toBeGreaterThan(10);
expect(value).toBeCloseTo(10.5, 2);

// Strings
expect(text).toContain("substring");

// Arrays
expect(array).toHaveLength(3);

// DOM (React)
expect(element).toBeInTheDocument();
expect(button).toBeDisabled();
```

---

## 🐛 Debugging

### Un test échoue

```bash
# 1. Lire l'erreur
FAIL: Expected 1000, received 500

# 2. Ajouter des logs
console.log("Debug:", value);

# 3. Lancer uniquement ce test
npm test -- billing
```

---

## 🚀 GitHub Actions

Les tests s'exécutent automatiquement sur :

- Chaque push sur `main`
- Chaque Pull Request
- Chaque tag de release

Config : `.github/workflows/ci.yml`

---

## 📚 Ressources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- Tests existants dans `__tests__/`

---

## 💡 Exemples

### Test de validation

```typescript
it("devrait valider un email correct", () => {
  const email = "user@publio.ch";
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  expect(isValid).toBe(true);
});
```

### Test de composant

```typescript
it("devrait afficher un spinner", () => {
  render(<LoadingButton loading={true}>Save</LoadingButton>);
  expect(document.querySelector(".animate-spin")).toBeInTheDocument();
});
```

### Test de calcul

```typescript
it("devrait calculer CHF 10 pour 1 tender", () => {
  const price = 1000; // centimes
  expect(price / 100).toBe(10); // CHF
});
```

---

**Besoin d'aide ?** Regarde les tests existants dans `__tests__/` ! 🚀
