# Guide de test du flux de soumission d'offre

## 🚀 Configuration initiale

### 1. Variables d'environnement

Assurez-vous d'avoir ces variables dans votre fichier `.env.local` :

```bash
# Stripe Test Mode
STRIPE_SECRET_KEY="sk_test_votre_cle_test"
STRIPE_PUBLISHABLE_KEY="pk_test_votre_cle_test"
STRIPE_WEBHOOK_SECRET="whsec_votre_webhook_secret"
TENDER_PRICE_CHF="1000" # CHF 10.00 pour publier un appel d'offres

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database, Auth, Cloudinary (déjà configurés)
```

### 2. Configuration Stripe Webhook (pour le développement)

Pour tester les webhooks en local, utilisez Stripe CLI :

```bash
# Installer Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook secret (whsec_...) dans .env.local
```

### 3. Démarrer l'application

```bash
npm run dev
```

---

## 📋 Flux de test complet

### Étape 1 : Créer deux organisations

1. **Organisation A (Émetteur)** - Exemple : Commune de Lausanne

   - Créer un compte → `/auth/signup`
   - Créer l'organisation via onboarding
   - Type : COMMUNE

2. **Organisation B (Soumissionnaire)** - Exemple : Bureau d'architecture
   - Créer un second compte (autre email) → `/auth/signup`
   - Créer l'organisation via onboarding
   - Type : ENTREPRISE

### Étape 2 : Créer un appel d'offres (Organisation A)

1. Se connecter avec Organisation A
2. Aller dans `/dashboard/tenders/new`
3. Remplir le formulaire :
   - Titre : "Rénovation de l'école primaire"
   - Type : CONSTRUCTION
   - Budget : CHF 500'000
   - Mode : **ANONYMOUS** (important pour tester l'anonymisation)
   - Visibilité : PUBLIC
   - Date limite : Date future (ex: +7 jours)
   - Description complète
4. Publier l'appel d'offres

### Étape 3 : Soumettre une offre (Organisation B)

1. Se déconnecter et se connecter avec Organisation B
2. Aller dans `/tenders` (catalogue public)
3. Trouver l'appel d'offres créé
4. Cliquer sur "Soumettre une offre"
5. Remplir le formulaire :
   - Prix : CHF 450'000
   - Description (min 50 chars)
   - Méthodologie (min 100 chars)
   - Délai : "8 mois"
   - Références (optionnel)
   - **Upload PDF** (document d'offre)
6. Cliquer sur "Procéder au paiement"

### Étape 4 : Payer avec Stripe (Test Mode)

1. Vous êtes redirigé vers Stripe Checkout
2. Utiliser une carte de test :
   - Numéro : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel 3 chiffres
   - Code postal : N'importe lequel
3. Confirmer le paiement

### Étape 5 : Webhook Stripe confirme le paiement

**Si Stripe CLI est actif :**

- Le webhook reçoit l'événement `checkout.session.completed`
- L'offre passe de DRAFT à SUBMITTED
- L'identité du soumissionnaire est visible (nom, ville, canton)

**Vérifier dans les logs :**

```
Checkout session completed: cs_test_...
Offer [id] payment confirmed
```

### Étape 6 : Consulter les offres (Organisation A)

1. Se reconnecter avec Organisation A
2. Aller dans `/dashboard/tenders`
3. Cliquer sur l'appel d'offres créé
4. Voir la liste des offres reçues
5. **Vérifier la transparence :**
   - Nom réel de l'organisation soumissionnaire visible
   - Ville et canton affichés
   - Prix et contenu visibles
   - Documents accessibles

### Étape 7 : Révéler l'identité de l'émetteur (si mode anonyme)

1. Attendre que la deadline soit passée (ou modifier manuellement dans la DB pour tester)
2. Sur la page de l'appel d'offres, cliquer sur **"Révéler mon identité"**
3. Confirmer l'action
4. **Vérifier :**
   - L'identité de l'émetteur est révélée
   - Les offres restent inchangées (déjà visibles)

### Étape 8 : Consulter ses offres (Organisation B)

1. Se reconnecter avec Organisation B
2. Aller dans `/dashboard/offers`
3. Voir l'offre soumise avec statut "Soumise"
4. Cliquer sur "Voir l'appel d'offre" pour revenir au tender

---

## ✅ Checklist de vérification

### Soumission d'offre

- [ ] Le formulaire se remplit correctement
- [ ] L'upload de PDF fonctionne (Cloudinary)
- [ ] La redirection vers Stripe fonctionne
- [ ] Le paiement test passe
- [ ] Retour sur `/payment/success`

### Webhook et confirmation

- [ ] Le webhook reçoit l'événement
- [ ] L'offre passe à SUBMITTED
- [ ] Le nom réel de l'organisation est visible
- [ ] paymentStatus = PAID

### Transparence des offres

- [ ] Les noms d'organisations sont toujours visibles
- [ ] Les prix et contenus sont visibles
- [ ] Les documents sont accessibles
- [ ] La localisation (ville, canton) est affichée

### Révélation d'identité de l'émetteur

- [ ] Le bouton apparaît après la deadline
- [ ] La confirmation fonctionne
- [ ] Les vrais noms apparaissent après révélation

### Dashboard

- [ ] Les statistiques se mettent à jour
- [ ] La liste des tenders s'affiche correctement
- [ ] La liste des offres s'affiche correctement
- [ ] Les filtres fonctionnent

---

## 🐛 Dépannage

### Le webhook ne reçoit rien

```bash
# Vérifier que Stripe CLI est actif
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Tester manuellement
stripe trigger checkout.session.completed
```

### L'offre reste en DRAFT

- Vérifier les logs du webhook
- Vérifier que STRIPE_WEBHOOK_SECRET est correct
- Vérifier que l'offerId est bien dans les métadonnées

### Upload de fichiers échoue

- Vérifier les variables Cloudinary
- Vérifier la route `/api/upload`
- Vérifier la taille du fichier (max 10MB)

### Erreur de paiement

- Utiliser les cartes de test Stripe : https://stripe.com/docs/testing
- Vérifier STRIPE*SECRET_KEY (doit commencer par sk_test*)

---

## 🔧 Commandes utiles

```bash
# Voir les logs du webhook en temps réel
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Simuler un événement
stripe trigger checkout.session.completed

# Voir les événements Stripe
stripe events list

# Voir les sessions de checkout
stripe checkout sessions list --limit 10
```

---

## 📊 Base de données

Pour inspecter manuellement :

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Vérifier les tables :
# - offers : status, paymentStatus, anonymousId
# - tenders : identityRevealed, revealedAt
```
