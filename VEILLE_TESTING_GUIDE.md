# Guide de Test - Module Veille Communale

## Configuration initiale (à faire une seule fois)

### 1. Créer les produits Stripe

Aller sur https://dashboard.stripe.com/test/products et créer :

**Produit 1 : Veille Basic**

- Name: `Veille Basic`
- Price: `5.00 CHF` / mois
- Copier le Price ID → `.env` : `STRIPE_VEILLE_BASIC_PRICE_ID`

**Produit 2 : Veille Premium**

- Name: `Veille Premium`
- Price: `10.00 CHF` / mois
- Copier le Price ID → `.env` : `STRIPE_VEILLE_UNLIMITED_PRICE_ID`

### 2. Configurer le webhook local

```bash
# Terminal 1 : Lancer l'app
npm run dev

# Terminal 2 : Écouter les webhooks Stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le webhook secret → `.env.local` : `STRIPE_WEBHOOK_SECRET`

## Test du flux complet

### 1. Tester le scraping

```bash
npx tsx scripts/scrape-publications.ts
```

✅ Devrait scraper ~35 publications de Fribourg

### 2. Accéder au module Veille

1. Aller sur http://localhost:3000/dashboard/veille
2. Voir le message : "Veille non disponible sur le plan gratuit"
3. Cliquer sur **Activer la Veille**

### 3. Choisir un plan

1. Modal avec 3 plans : Gratuit, Basic (recommandé), Premium
2. Cliquer sur **Choisir ce plan** pour Basic ou Premium
3. Redirection vers Stripe Checkout

### 4. Payer avec une carte de test

Utiliser les cartes de test Stripe :

- **Succès** : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : `123`
- Email : votre email de test

### 5. Vérifier l'activation

1. Redirection vers `/dashboard/veille/settings?success=true`
2. Vérifier dans les logs du terminal avec `stripe listen` :
   ```
   customer.subscription.created [evt_xxx]
   ```
3. Page settings devrait afficher :
   - Plan actuel : **Veille Basic** (ou Premium)
   - Sélecteur de communes disponible
   - Toggle d'alertes email

### 6. Configurer les communes

1. Cliquer sur le sélecteur de communes
2. Chercher "Fribourg" ou "Lausanne"
3. Sélectionner jusqu'à 5 communes (Basic) ou illimité (Premium)
4. Activer les alertes email
5. Cliquer sur **Enregistrer**

### 7. Voir les publications

1. Retourner sur `/dashboard/veille`
2. Devrait afficher :
   - Badge du plan actif
   - Liste des communes sélectionnées
   - Publications scrapées pour ces communes
   - Filtres par type de publication

## Vérifications dans la base de données

```sql
-- Vérifier l'organisation
SELECT
  id,
  name,
  "stripeCustomerId",
  "stripeSubscriptionId",
  "stripeSubscriptionPlan"
FROM organizations
WHERE id = 'votre-org-id';

-- Vérifier la VeilleSubscription
SELECT
  "organizationId",
  status,
  "maxCommunes",
  communes,
  "emailAlerts",
  "appNotifications"
FROM veille_subscriptions
WHERE "organizationId" = 'votre-org-id';

-- Vérifier les publications
SELECT
  title,
  commune,
  type,
  "publishedAt",
  "scrapedAt"
FROM veille_publications
ORDER BY "publishedAt" DESC
LIMIT 10;
```

## Test d'annulation d'abonnement

### Via Stripe Dashboard

1. https://dashboard.stripe.com/test/customers
2. Trouver le customer (chercher par email)
3. Cliquer sur l'abonnement actif
4. **Cancel subscription** > **Cancel subscription**
5. Vérifier dans les logs :
   ```
   customer.subscription.deleted [evt_xxx]
   ```

### Vérifier la désactivation

1. Recharger `/dashboard/veille`
2. Devrait afficher : "Veille non disponible sur le plan gratuit"
3. Les communes sont réinitialisées dans la DB

## Cas de test importants

### ✅ Plan gratuit

- Accès aux appels d'offres
- Pas d'accès à la veille
- CTA pour upgrade visible

### ✅ Plan Basic (CHF 5/mois)

- Maximum 5 communes
- Sélecteur bloque après 5 communes
- Alertes email quotidiennes
- Publications des 30 derniers jours

### ✅ Plan Premium (CHF 10/mois)

- Communes illimitées
- Toutes les features Basic
- Publications des 90 jours (à implémenter)
- Export CSV (à implémenter)

### ✅ Webhooks

- `subscription.created` → Active la veille
- `subscription.updated` → Met à jour le plan
- `subscription.deleted` → Désactive la veille

## Commandes utiles

```bash
# Relancer le scraping
npx tsx scripts/scrape-publications.ts

# Tester un webhook spécifique
stripe trigger customer.subscription.created

# Voir les logs Stripe
stripe logs tail

# Vérifier la config Prisma
npx prisma studio
```

## Variables d'environnement requises

```bash
# .env.local
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Du stripe listen
STRIPE_VEILLE_BASIC_PRICE_ID="price_..."
STRIPE_VEILLE_UNLIMITED_PRICE_ID="price_..."
```

## Problèmes courants

### "Price ID not configured"

→ Vérifier que `STRIPE_VEILLE_BASIC_PRICE_ID` et `STRIPE_VEILLE_UNLIMITED_PRICE_ID` sont dans `.env`

### Webhook non reçu

→ Vérifier que `stripe listen` est en cours d'exécution
→ Copier le nouveau webhook secret dans `.env.local` et redémarrer l'app

### Publications vides

→ Lancer `npx tsx scripts/scrape-publications.ts` pour scraper les données

### Communes non sauvegardées

→ Vérifier que le statut de la veille est `ACTIVE` dans la DB
→ Vérifier que `maxCommunes` correspond au plan

## Prochaines étapes

- [ ] Implémenter le système d'alertes email quotidiennes
- [ ] Ajouter les scrapers Genève et Valais
- [ ] Export CSV des publications
- [ ] Portail client Stripe pour gérer l'abonnement
- [ ] Filtres avancés par canton/type
- [ ] Archives 90 jours pour Premium
