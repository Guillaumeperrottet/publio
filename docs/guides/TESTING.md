# 🧪 Guide de Tests - Publio

## 📋 Table des matières

1. [Tests manuels](#tests-manuels)
2. [Tests automatisés](#tests-automatisés)
3. [Seeds de données](#seeds-de-données)
4. [Tests de régression](#tests-de-régression)

---

## 🎯 Seeds de données

### Installation

```bash
# Installer bcryptjs pour le hashing des mots de passe
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Utilisation

```bash
# 1. Seed la base de données avec des données de test
npx tsx prisma/seed.ts

# 2. Reset complet de la DB + seed
npx prisma migrate reset --skip-seed
npx tsx prisma/seed.ts

# 3. Voir les données dans Prisma Studio
npx prisma studio
```

### Données créées

Le script de seed crée automatiquement :

#### 👥 **4 Utilisateurs de test**

| Email                             | Organisation         | Rôle               | Mot de passe  |
| --------------------------------- | -------------------- | ------------------ | ------------- |
| `commune.fribourg@test.ch`        | Ville de Fribourg    | OWNER (Commune)    | `password123` |
| `entreprise.construction@test.ch` | Construction Pro SA  | OWNER (Entreprise) | `password123` |
| `architecte.lausanne@test.ch`     | Architectes Associés | OWNER (Architecte) | `password123` |
| `bureau.ingenieur@test.ch`        | Bureau Ingénieurs    | OWNER (Ingénieur)  | `password123` |

#### 🏢 **4 Organisations**

1. **Ville de Fribourg** (COMMUNE)

   - Créateur : commune.fribourg@test.ch
   - Ville : Fribourg, Canton FR

2. **Construction Pro SA** (ENTREPRISE)

   - Créateur : entreprise.construction@test.ch
   - Ville : Lausanne, Canton VD

3. **Architectes Associés Sàrl** (ENTREPRISE)

   - Créateur : architecte.lausanne@test.ch
   - Ville : Lausanne, Canton VD

4. **Bureau d'Ingénieurs Conseils SA** (ENTREPRISE)
   - Créateur : bureau.ingenieur@test.ch
   - Ville : Genève, Canton GE

#### 📢 **4 Appels d'offres**

1. **Rénovation salle polyvalente** (PUBLISHED, ANONYMOUS)

   - Budget : CHF 450'000
   - Deadline : 15 janvier 2026
   - 2 offres soumises
   - Émetteur : Ville de Fribourg

2. **Parking souterrain 80 places** (CLOSED)

   - Budget : CHF 3'500'000
   - Deadline passée
   - 2 offres (1 acceptée, 1 rejetée)
   - Marché attribué
   - Émetteur : Ville de Fribourg

3. **Aménagement paysager** (DRAFT)

   - Budget : CHF 180'000
   - Brouillon non publié
   - Émetteur : Ville de Fribourg

4. **Étude pont piétonnier** (PUBLISHED, ANONYMOUS)
   - Budget : CHF 85'000
   - Deadline : 10 février 2026
   - 1 offre soumise
   - Émetteur : Ville de Fribourg

#### 💼 **5 Offres**

- 2 offres pour Tender #1 (rénovation)
- 2 offres pour Tender #2 (parking) - 1 acceptée
- 1 offre pour Tender #4 (étude)

#### 📜 **9 Logs d'équité**

Traçabilité complète des actions sur les tenders

#### 🔍 **3 Recherches sauvegardées**

- "Travaux construction Fribourg" (alertes ON)
- "Projets architecture Romandie" (alertes ON)
- "Études techniques" (alertes OFF)

#### 📰 **3 Publications veille**

Publications de test pour Fribourg et Bulle

---

## 🧪 Tests manuels

### Scénario 1 : Flux complet émetteur

```bash
# 1. Se connecter
Email: commune.fribourg@test.ch
Password: password123

# 2. Voir mes appels d'offres
→ Dashboard → Mes appels d'offres
✓ Devrait voir 4 tenders

# 3. Consulter les offres reçues
→ Cliquer sur "Rénovation salle polyvalente"
→ Onglet "Offres reçues"
✓ Devrait voir 2 offres avec noms d'entreprises visibles
✓ Budget : CHF 425'000 et CHF 398'000

# 4. Révéler l'identité de l'émetteur (si mode anonyme et deadline passée)
→ Bouton "Révéler mon identité"
✓ L'identité de la commune émettrice est révélée

# 5. Accepter une offre
→ Bouton "Accepter" sur une offre
✓ Statut → ACCEPTED

# 6. Attribuer le marché
→ Bouton "Attribuer le marché"
✓ Tender statut → AWARDED
✓ Autres offres → REJECTED

# 7. Consulter le journal d'équité
→ Onglet "Journal d'équité"
✓ Voir toutes les actions
→ Bouton "Exporter en PDF"
✓ Télécharge un PDF
```

### Scénario 2 : Flux complet soumissionnaire

```bash
# 1. Se connecter
Email: entreprise.construction@test.ch
Password: password123

# 2. Parcourir les appels d'offres
→ Menu → "Appels d'offres"
✓ Voir les tenders PUBLISHED uniquement

# 3. Filtrer
→ Canton : FR
→ Type : Construction
→ Budget min : 100000
✓ Résultats filtrés

# 4. Sauvegarder un tender
→ Icône signet sur un tender
✓ Ajouté aux sauvegardés
→ Menu → "Sauvegardés"
✓ Voir le tender

# 5. Soumettre une offre
→ Cliquer sur un tender
→ Bouton "Soumettre une offre"
→ Remplir le formulaire
→ Payer via Stripe (carte test : 4242...)
✓ Offre soumise
✓ Email de confirmation

# 6. Voir mes offres
→ Dashboard → "Mes offres"
✓ Voir toutes mes offres avec statuts
```

### Scénario 3 : Recherches sauvegardées

```bash
# 1. Se connecter
Email: architecte.lausanne@test.ch
Password: password123

# 2. Effectuer une recherche
→ Appels d'offres
→ Filtrer : Canton VD, Type Architecture
→ Bouton "Sauvegarder cette recherche"
→ Nom : "Projets VD"
→ Activer les alertes
✓ Recherche sauvegardée

# 3. Gérer mes recherches
→ Dashboard → "Mes recherches"
✓ Voir toutes les recherches
→ Toggle alertes ON/OFF
→ Supprimer une recherche
```

### Scénario 4 : Module Veille

```bash
# 1. Se connecter en tant que commune
Email: commune.fribourg@test.ch
Password: password123

# 2. Activer la veille
→ Dashboard → "Veille communale"
→ "Activer la veille"
→ Choisir plan : Veille Basic (CHF 5/mois)
→ Payer via Stripe
✓ Abonnement actif

# 3. Configurer les communes
→ "Paramètres de veille"
→ Sélectionner max 5 communes
→ Activer alertes email
→ Enregistrer
✓ Configuration sauvegardée

# 4. Voir les publications
→ "Veille communale"
✓ Voir les publications des communes suivies
✓ Filtrer par type (Mise à l'enquête, Permis, etc.)
```

---

## 🤖 Tests automatisés (TODO)

Pour implémenter plus tard :

### Tests unitaires (Jest/Vitest)

```bash
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom
```

**Exemple de test :**

```typescript
// features/tenders/__tests__/actions.test.ts
import { describe, it, expect } from "vitest";
import { createTender } from "../actions";

describe("Tender Actions", () => {
  it("should create a draft tender", async () => {
    const result = await createTender({
      title: "Test Tender",
      description: "Description",
      deadline: new Date("2026-12-31"),
      organizationId: "org-test",
    });

    expect(result.tender).toBeDefined();
    expect(result.tender?.status).toBe("DRAFT");
  });
});
```

### Tests d'intégration (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

**Exemple de test E2E :**

```typescript
// e2e/tender-flow.spec.ts
import { test, expect } from "@playwright/test";

test("complete tender creation flow", async ({ page }) => {
  await page.goto("http://localhost:3000/auth/signin");

  await page.fill('[name="email"]', "commune.fribourg@test.ch");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");

  await page.click("text=Créer un appel d'offre");
  // ... reste du test
});
```

---

## 📊 Tests de régression

### Checklist avant chaque déploiement

- [ ] Authentification fonctionne
- [ ] Création d'organisation
- [ ] Publication tender + paiement Stripe
- [ ] Soumission offre + paiement Stripe
- [ ] Mode anonyme fonctionne (émetteur masqué, offres visibles)
- [ ] Révélation d'identité de l'émetteur
- [ ] Acceptation/rejet offres
- [ ] Attribution marché
- [ ] Export PDF journal équité
- [ ] Recherches sauvegardées + alertes
- [ ] Tenders sauvegardés
- [ ] Module veille + abonnements
- [ ] Emails envoyés correctement
- [ ] Cron jobs configurés

---

## 🔧 Scripts utiles

```json
{
  "scripts": {
    "seed": "npx tsx prisma/seed.ts",
    "db:reset": "npx prisma migrate reset --force",
    "db:seed": "npm run db:reset && npm run seed",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 🎯 Prochaines étapes recommandées

1. **Implémenter tests unitaires** pour les actions critiques :

   - `features/tenders/actions.ts`
   - `features/offers/actions.ts`
   - `features/billing/actions.ts`

2. **Implémenter tests E2E** pour les flux critiques :

   - Flux publication tender
   - Flux soumission offre
   - Flux attribution marché

3. **CI/CD** :

   - GitHub Actions pour tests automatiques
   - Tests avant chaque merge
   - Tests de smoke après déploiement

4. **Monitoring** :
   - Sentry pour erreurs en production
   - LogRocket pour sessions utilisateurs
   - Vercel Analytics pour performance

---

## ❓ FAQ

**Q : Dois-je implémenter des tests unitaires maintenant ?**
R : Pour un MVP, les tests manuels + seeds suffisent. Ajoutez les tests automatisés après le lancement quand vous avez des utilisateurs réels.

**Q : Comment tester les paiements Stripe ?**
R : Utilisez les cartes de test : `4242 4242 4242 4242` (succès), `4000 0000 0000 0002` (échec)

**Q : Comment tester les cron jobs ?**
R : Exécutez les scripts manuellement : `npx tsx scripts/close-expired-tenders.ts`

**Q : Combien de tests devrais-je avoir ?**
R : Règle 80/20 : Testez les 20% de code qui représentent 80% du risque (paiements, authentification, permissions).
