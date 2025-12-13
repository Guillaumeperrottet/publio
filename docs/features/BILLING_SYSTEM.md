# 💳 Système de Facturation et Abonnements - Documentation

## ✅ Ce qui a été implémenté

### 📄 **1. Page de facturation principale**

`/app/dashboard/billing/page.tsx`

**Fonctionnalités :**

- Affichage de l'abonnement actuel (plan, statut, renouvellement)
- Statistiques d'utilisation (tenders publiés, offres déposées, total dépensé)
- Historique complet des factures
- Accessible uniquement aux OWNER et ADMIN

**URL :** `/dashboard/billing`

---

### 🔐 **2. Stripe Customer Portal**

`/app/api/stripe/create-portal-session/route.ts`

**Permet aux utilisateurs de :**

- Gérer leurs moyens de paiement (cartes bancaires)
- Consulter et télécharger les factures PDF
- Annuler ou réactiver leur abonnement
- Mettre à jour les informations de facturation

**Sécurité :** Seuls les rôles OWNER et ADMIN y ont accès

---

### 📊 **3. Composants de billing**

#### **CurrentSubscriptionCard** (`/components/billing/current-subscription-card.tsx`)

- Affiche le plan actif (FREE, VEILLE_BASIC, VEILLE_UNLIMITED)
- Badge de statut (actif, période d'essai, annulé, etc.)
- Date de prochain renouvellement
- Alerte si abonnement en cours d'annulation
- Bouton "Gérer l'abonnement" → ouvre le Stripe Portal

#### **InvoiceHistory** (`/components/billing/invoice-history.tsx`)

- Tableau des factures avec n°, description, date, montant, statut
- Badges de statut (Payée, En attente, Échec, Remboursée)
- Bouton de téléchargement PDF pour les factures payées
- Empty state si aucune facture

#### **UsageStatsCard** (`/components/billing/usage-stats-card.tsx`)

- Nombre d'appels d'offres publiés
- Nombre d'offres déposées
- Total dépensé en CHF

---

### 🔔 **4. Webhooks Stripe améliorés**

`/app/api/stripe/webhook/route.ts`

**Nouveaux événements gérés :**

| Événement                       | Action                                     |
| ------------------------------- | ------------------------------------------ |
| `invoice.paid`                  | Crée une facture en BDD avec statut PAID   |
| `invoice.payment_failed`        | Crée une facture avec statut FAILED        |
| `payment_intent.payment_failed` | Enregistre l'échec de paiement             |
| `checkout.session.completed`    | Crée facture pour tender/offre publication |

**Création automatique de factures pour :**

- ✅ Abonnements Veille (via `invoice.paid`)
- ✅ Publication d'appels d'offres (paiement one-time)
- ✅ Dépôt d'offres (paiement one-time)
- ✅ Échecs de paiement (tracking)

---

### 🛠️ **5. Actions serveur**

`/features/billing/actions.ts`

**Fonctions disponibles :**

- `getOrganizationSubscription(orgId)` - Récupère l'abonnement actuel
- `getOrganizationInvoices(orgId)` - Liste les factures
- `getOrganizationPaymentStats(orgId)` - Statistiques de paiement
- `getOrganizationUsageStats(orgId)` - Statistiques d'utilisation
- `getInvoice(invoiceId)` - Récupère une facture spécifique
- `downloadInvoicePdf(stripeInvoiceId)` - URL du PDF depuis Stripe

---

### 📥 **6. API de téléchargement de factures**

`/app/api/stripe/invoice/[invoiceId]/route.ts`

**Endpoint :** `GET /api/stripe/invoice/{stripeInvoiceId}`

**Retourne :**

```json
{
  "url": "https://invoice.stripe.com/...",
  "number": "INV-2024-001"
}
```

**Sécurité :** Vérifie que l'utilisateur appartient à l'organisation propriétaire de la facture

---

### 🔗 **7. Intégration dans l'UI**

**Menu utilisateur mis à jour :**

- Ajout du lien "Facturation" avec icône carte bancaire
- Accessible depuis le menu déroulant (avatar en haut à droite)

---

## 🚀 Configuration requise

### **1. Variables d'environnement**

Assurez-vous d'avoir ces variables dans votre `.env` :

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..." ou "sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..." ou "pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Prix Stripe Veille
STRIPE_VEILLE_BASIC_PRICE_ID="price_xxx"      # CHF 5/mois
STRIPE_VEILLE_UNLIMITED_PRICE_ID="price_xxx"  # CHF 10/mois

# Prix publication tender (optionnel, défaut 1000 = CHF 10)
TENDER_PRICE_CHF="1000"  # en centimes

# URL de votre app
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"
```

---

### **2. Configurer les webhooks Stripe**

Dans le **Dashboard Stripe** > **Developers** > **Webhooks**, ajoutez ces événements :

**Événements à écouter :**

- ✅ `checkout.session.completed`
- ✅ `checkout.session.expired`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid` ⭐ **NOUVEAU**
- ✅ `invoice.payment_failed` ⭐ **NOUVEAU**
- ✅ `payment_intent.payment_failed`

**Endpoint URL :** `https://votre-domaine.com/api/stripe/webhook`

---

### **3. Activer le Stripe Customer Portal**

Dans **Dashboard Stripe** > **Settings** > **Billing** > **Customer portal** :

1. Activer le portail client
2. Configurer les options :
   - ✅ Permettre l'annulation d'abonnement
   - ✅ Permettre le changement de moyen de paiement
   - ✅ Afficher l'historique des factures

---

## 📖 Guide d'utilisation

### **Pour les utilisateurs (OWNER/ADMIN)**

1. **Accéder à la facturation**

   - Cliquer sur l'avatar en haut à droite
   - Sélectionner "Facturation"

2. **Voir l'abonnement actuel**

   - Plan actif et prix
   - Date de prochain renouvellement
   - Statut de l'abonnement

3. **Gérer l'abonnement**

   - Cliquer sur "Gérer l'abonnement"
   - Redirection vers Stripe Customer Portal
   - Possibilité de :
     - Changer de carte bancaire
     - Annuler l'abonnement
     - Télécharger les factures
     - Voir l'historique de paiements

4. **Consulter les factures**
   - Toutes les factures apparaissent dans le tableau
   - Cliquer sur l'icône téléchargement pour obtenir le PDF
   - Factures conservées 7 ans (conformité légale suisse)

---

### **Pour les développeurs**

#### **Tester en local**

1. Installer Stripe CLI :

```bash
brew install stripe/stripe-cli/stripe
```

2. Login Stripe :

```bash
stripe login
```

3. Écouter les webhooks localement :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copier le webhook signing secret affiché et l'ajouter dans `.env.local`

5. Tester un paiement :

```bash
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

---

#### **Créer une facture manuellement (exemple)**

```typescript
import { prisma } from "@/lib/db/prisma";

await prisma.invoice.create({
  data: {
    number: "INV-2024-001",
    amount: 10.0,
    currency: "CHF",
    status: "PAID",
    description: "Publication d'appel d'offres",
    paidAt: new Date(),
    organizationId: "org_xxxxx",
  },
});
```

---

## 🔍 Debugging

### **Problème : Les factures n'apparaissent pas**

1. Vérifier que les webhooks sont bien configurés dans Stripe
2. Vérifier les logs des webhooks dans Dashboard Stripe > Developers > Webhooks
3. Vérifier les logs de votre application (console.log dans webhook/route.ts)
4. S'assurer que les métadonnées `organizationId` sont bien passées dans les sessions Stripe

---

### **Problème : Le Customer Portal ne s'ouvre pas**

1. Vérifier que l'organisation a un `stripeCustomerId`
2. Vérifier que l'utilisateur a le rôle OWNER ou ADMIN
3. Vérifier que le Customer Portal est activé dans Stripe Dashboard

---

### **Problème : Le PDF de facture n'est pas disponible**

1. Les factures Stripe prennent quelques secondes à générer le PDF
2. Seules les factures payées ont un PDF disponible
3. Vérifier que `stripeInvoiceId` est bien enregistré en BDD

---

## 📝 TODO (améliorations futures)

- [ ] Notifications email pour échecs de paiement
- [ ] Webhook `invoice.upcoming` pour prévenir 3 jours avant le prélèvement
- [ ] Export CSV des factures
- [ ] Filtres et recherche dans l'historique des factures
- [ ] Graphiques d'évolution des dépenses
- [ ] Support multi-devises (actuellement CHF uniquement)
- [ ] Gestion des remboursements (webhook `charge.refunded`)

---

## 🎉 Résumé

Vous avez maintenant un **système complet de facturation et gestion d'abonnements** :

✅ Page de facturation professionnelle
✅ Intégration Stripe Customer Portal (self-service)
✅ Création automatique des factures via webhooks
✅ Historique complet et téléchargement PDF
✅ Statistiques d'utilisation
✅ Sécurité et permissions (OWNER/ADMIN uniquement)
✅ Conformité légale (conservation 7 ans)

**Prochaine étape :** Tester le flux complet en mode test Stripe ! 🚀
