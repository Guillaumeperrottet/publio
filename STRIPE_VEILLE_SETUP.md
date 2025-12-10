# Configuration Stripe pour la Veille Communale

## Prérequis

- Compte Stripe (test ou production)
- Accès au dashboard Stripe : https://dashboard.stripe.com

## Étapes de configuration

### 1. Créer les produits et prix dans Stripe

#### A. Produit "Veille Basic"

1. Aller dans **Products** > **Add product**
2. Configurer :
   - **Name**: `Veille Basic`
   - **Description**: `Surveillance de 5 communes - Alertes email quotidiennes`
   - **Pricing model**: `Recurring`
   - **Price**: `5.00 CHF`
   - **Billing period**: `Monthly`
3. Cliquer sur **Save product**
4. **Copier le Price ID** (commence par `price_...`)
5. L'ajouter dans `.env` :
   ```bash
   STRIPE_VEILLE_BASIC_PRICE_ID="price_xxxxxxxxxxxxx"
   ```

#### B. Produit "Veille Premium"

1. Aller dans **Products** > **Add product**
2. Configurer :
   - **Name**: `Veille Premium`
   - **Description**: `Communes illimitées - Export CSV - Support prioritaire`
   - **Pricing model**: `Recurring`
   - **Price**: `10.00 CHF`
   - **Billing period**: `Monthly`
3. Cliquer sur **Save product**
4. **Copier le Price ID** (commence par `price_...`)
5. L'ajouter dans `.env` :
   ```bash
   STRIPE_VEILLE_UNLIMITED_PRICE_ID="price_xxxxxxxxxxxxx"
   ```

### 2. Configurer les webhooks

#### A. Créer l'endpoint webhook

1. Aller dans **Developers** > **Webhooks**
2. Cliquer sur **Add endpoint**
3. Configurer :
   - **Endpoint URL**: `https://votre-domaine.com/api/stripe/webhook`
     - En développement local avec Stripe CLI : `http://localhost:3000/api/stripe/webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `payment_intent.payment_failed`

#### B. Récupérer le Webhook Secret

1. Après création, cliquer sur l'endpoint
2. Cliquer sur **Reveal** dans la section "Signing secret"
3. Copier le secret (commence par `whsec_...`)
4. L'ajouter dans `.env` :
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
   ```

### 3. Configuration des variables d'environnement

Votre fichier `.env` doit contenir :

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"

# Stripe Price IDs pour les abonnements Veille
STRIPE_VEILLE_BASIC_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_VEILLE_UNLIMITED_PRICE_ID="price_xxxxxxxxxxxxx"
```

### 4. Test en développement local avec Stripe CLI

#### Installation du Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Autres OS : https://stripe.com/docs/stripe-cli
```

#### Login

```bash
stripe login
```

#### Écouter les webhooks localement

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Cette commande vous donnera un **webhook signing secret** temporaire à utiliser dans `.env.local`.

#### Déclencher un événement de test

```bash
# Tester un abonnement créé
stripe trigger customer.subscription.created
```

### 5. Tester le flux complet

1. Aller sur `/dashboard/veille`
2. Cliquer sur **Activer la Veille**
3. Choisir un plan (Basic ou Premium)
4. Compléter le paiement avec une carte de test :

   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - **3D Secure** : `4000 0027 6000 3184`
   - Date : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres

5. Vérifier :
   - Redirection vers `/dashboard/veille/settings?success=true`
   - Webhook reçu dans les logs
   - `VeilleSubscription` créée/mise à jour dans la DB
   - Champs `stripeCustomerId`, `stripeSubscriptionId`, `stripeSubscriptionPlan` mis à jour dans `Organization`

### 6. Gestion des abonnements

#### Annuler un abonnement

1. Dashboard Stripe > **Customers**
2. Trouver le customer (utilisez l'email ou organizationId dans metadata)
3. Cliquer sur l'abonnement actif
4. **Cancel subscription**
5. Le webhook `customer.subscription.deleted` désactivera automatiquement la veille

#### Portail client (recommandé pour production)

Créer un lien vers le portail client Stripe pour permettre aux utilisateurs de gérer leur abonnement :

```typescript
// Dans un API route
const session = await stripe.billingPortal.sessions.create({
  customer: organization.stripeCustomerId!,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/veille/settings`,
});

return NextResponse.json({ url: session.url });
```

### 7. Passage en production

1. **Créer les produits** en mode production (mêmes configurations)
2. **Copier les nouveaux Price IDs** dans les variables d'environnement de production
3. **Configurer le webhook** en production avec l'URL réelle
4. **Tester** avec une vraie carte (mode test désactivé)

## Architecture technique

### Flux d'abonnement

```
1. Utilisateur clique "Activer la Veille"
   └─> UpgradeVeilleDialog.handleUpgrade()

2. Appel API POST /api/stripe/create-veille-subscription
   └─> Crée un Stripe Customer (si nécessaire)
   └─> Crée une Checkout Session avec metadata (organizationId, planId)
   └─> Retourne l'URL de checkout

3. Redirection vers Stripe Checkout
   └─> Utilisateur entre ses infos de paiement

4. Paiement confirmé → webhook customer.subscription.created
   └─> Met à jour Organization (stripeCustomerId, stripeSubscriptionId, stripeSubscriptionPlan)
   └─> Crée/met à jour VeilleSubscription (status: ACTIVE, maxCommunes)

5. Redirection vers /dashboard/veille/settings?success=true
```

### Événements webhook gérés

| Événement                       | Action                                                          |
| ------------------------------- | --------------------------------------------------------------- |
| `customer.subscription.created` | Active la veille, met à jour Organization et VeilleSubscription |
| `customer.subscription.updated` | Met à jour le statut (changement de plan, renouvellement)       |
| `customer.subscription.deleted` | Désactive la veille, reset communes                             |
| `checkout.session.completed`    | Gère les paiements one-time (tenders, offers)                   |
| `checkout.session.expired`      | Nettoie les sessions expirées                                   |
| `payment_intent.payment_failed` | Log des échecs de paiement                                      |

## Dépannage

### Le webhook ne fonctionne pas

- Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifier les logs dans Stripe Dashboard > Webhooks > [votre endpoint]
- En local, utiliser `stripe listen` pour capturer les webhooks

### L'abonnement ne s'active pas

- Vérifier que les metadata `organizationId` et `planId` sont bien passés
- Vérifier les logs de `/api/stripe/webhook`
- Vérifier que la VeilleSubscription existe dans la DB

### Prix non configurés

```
Error: Price ID not configured for plan VEILLE_BASIC
```

→ Ajouter `STRIPE_VEILLE_BASIC_PRICE_ID` dans `.env`

## Ressources

- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Cartes de test](https://stripe.com/docs/testing)
