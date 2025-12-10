# 🔔 Module Veille Communale - Documentation d'implémentation

**Date:** 10 Décembre 2025  
**Statut:** ✅ MVP Structure complète implémentée

---

## 📋 RÉSUMÉ

Le module Veille Communale permet aux organisations de surveiller automatiquement les publications officielles (mises à l'enquête, permis de construire, avis) dans les communes de leur choix.

**Modèle économique:**

- **FREE:** 0 commune (pas de veille)
- **VEILLE_BASIC:** CHF 5/mois → 5 communes maximum
- **VEILLE_UNLIMITED:** CHF 10/mois → communes illimitées

---

## 🏗️ ARCHITECTURE IMPLÉMENTÉE

### **1. Types & Constantes**

📁 `features/veille/types.ts`

- ✅ Types TypeScript (PublicationType, Canton, ScrapedPublication)
- ✅ Liste complète des communes romandes (80+ communes)
- ✅ Labels et icônes pour les types de publications

### **2. Actions Serveur**

📁 `features/veille/actions.ts`

- ✅ `getOrganizationVeilleSubscription()` - Récupérer l'abonnement
- ✅ `upsertVeilleSubscription()` - Créer/modifier abonnement
- ✅ `deleteVeilleSubscription()` - Supprimer abonnement
- ✅ `getOrganizationVeillePublications()` - Récupérer publications
- ✅ `countNewVeillePublications()` - Compter nouvelles publications
- ✅ `canActivateVeille()` - Vérifier les droits selon le plan

### **3. Système de Scraping**

📁 `features/veille/scraper.ts`

**Architecture modulaire:**

```typescript
interface VeilleScraper {
  name: string;
  canton: string;
  scrape(): Promise<ScrapedPublication[]>;
}
```

**Scrapers implémentés (structure):**

- ✅ `VaudScraper` - Canton de Vaud
- ✅ `GeneveScraper` - Canton de Genève
- ✅ `ValaisScraper` - Canton du Valais
- ✅ `MasterScraper` - Orchestrateur global

**Helpers:**

- ✅ `deduplicatePublications()` - Déduplications
- ✅ `filterRecentPublications()` - Filtrer par date

⚠️ **IMPORTANT:** Les scrapers retournent actuellement des données de développement. Vous devez implémenter le scraping réel avec:

- **Puppeteer** pour sites JavaScript
- **Cheerio** pour sites HTML statiques
- **API officielles** si disponibles

### **4. Scripts & Cron Jobs**

📁 `scripts/scrape-publications.ts`

- ✅ Script autonome exécutable (`npx tsx scripts/scrape-publications.ts`)
- ✅ Scraping, déduplication, sauvegarde en DB
- ✅ Logs détaillés

📁 `app/api/cron/scrape-veille/route.ts`

- ✅ Endpoint API sécurisé (Bearer token)
- ✅ Appelé quotidiennement à 3h du matin (UTC)

📁 `vercel.json`

```json
{
  "path": "/api/cron/scrape-veille",
  "schedule": "0 3 * * *"
}
```

---

## 🎨 COMPOSANTS UI

### **1. Pages**

**📁 `/app/dashboard/veille/page.tsx`**

- ✅ Dashboard principal de veille
- ✅ Affichage abonnement actuel
- ✅ Liste des communes suivies
- ✅ Grille de publications (cards)
- ✅ Badge "nouvelles publications" (dernières 24h)
- ✅ Empty states (pas d'abonnement, pas de publications)
- ✅ CTA upgrade si plan FREE

**📁 `/app/dashboard/veille/settings/page.tsx`**

- ✅ Configuration de la veille
- ✅ Sélection des communes
- ✅ Toggle alertes email/app
- ✅ Sauvegarde

### **2. Composants**

**📁 `components/veille/upgrade-veille-dialog.tsx`**

- ✅ Dialog modal pour upgrade
- ✅ Comparaison des 3 plans (FREE, BASIC, UNLIMITED)
- ✅ Badges "Recommandé"
- ✅ Liste des features par plan
- ✅ Boutons d'action

**📁 `components/veille/commune-selector.tsx`**

- ✅ Autocomplete multi-sélection
- ✅ Groupé par canton
- ✅ Recherche en temps réel
- ✅ Badges avec NPA
- ✅ Limite visuelle selon plan
- ✅ Boutons de suppression rapide

**📁 `components/veille/publication-card.tsx`**

- ✅ Carte d'une publication
- ✅ Icône + type (Mise à l'enquête, Permis, etc.)
- ✅ Titre + description
- ✅ Localisation + date relative
- ✅ Métadonnées (adresse, parcelle, surface)
- ✅ Lien externe vers source officielle
- ✅ Lien PDF (si disponible)

**📁 `components/veille/veille-settings-form.tsx`**

- ✅ Formulaire de configuration
- ✅ Intégration CommuneSelector
- ✅ Switches pour notifications
- ✅ Validation et sauvegarde
- ✅ Toast notifications

### **3. Navigation**

**📁 `components/layout/universal-header.tsx`**

- ✅ Lien "🔔 Veille" dans le menu principal
- ✅ Visible pour tous les utilisateurs connectés

---

## 🗄️ BASE DE DONNÉES

**Schéma Prisma (déjà existant):**

```prisma
model VeilleSubscription {
  id                 String   @id
  communes           String[] // ["Lausanne", "Genève"]
  cantons            String[] // ["VD", "GE"]
  keywords           String[] // Optionnel (future)
  emailNotifications Boolean
  appNotifications   Boolean
  organizationId     String
  organization       Organization
  createdAt          DateTime
  updatedAt          DateTime
}

model VeillePublication {
  id          String   @id
  title       String
  description String?
  url         String
  commune     String
  canton      String
  type        String   // MISE_A_LENQUETE, PERMIS_CONSTRUIRE, etc.
  publishedAt DateTime
  scrapedAt   DateTime
  metadata    Json?    // {parcelle, adresse, superficie, pdfUrl}
}
```

---

## ⚙️ CONFIGURATION REQUISE

### **Variables d'environnement**

```bash
# Déjà configuré
DATABASE_URL="postgresql://..."
CRON_SECRET="your-secret-key"

# À configurer pour Stripe subscriptions
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Prix IDs Stripe à créer:
NEXT_PUBLIC_STRIPE_PRICE_VEILLE_BASIC="price_xxx"   # CHF 5/mois
NEXT_PUBLIC_STRIPE_PRICE_VEILLE_UNLIMITED="price_xxx" # CHF 10/mois
```

### **Dépendances manquantes à installer**

```bash
# Pour le scraping (selon besoin)
npm install cheerio          # Scraping HTML statique
npm install puppeteer        # Scraping sites dynamiques (optionnel)

# UI Components
npm install sonner           # Toast notifications
npx shadcn@latest add switch # Switch component
```

---

## 🚀 PROCHAINES ÉTAPES

### **PRIORITÉ 1: Implémenter le scraping réel**

Actuellement, les scrapers retournent des données de dev. Vous devez:

1. **Identifier les sources officielles**

   - Canton de Vaud: https://www.vd.ch/themes/territoire-et-construction/
   - Canton de Genève: https://ge.ch/miae/
   - Canton du Valais: Sites communaux individuels

2. **Implémenter le parsing**

   - Analyser la structure HTML
   - Extraire: titre, commune, type, date, URL, métadonnées
   - Gérer les cas d'erreur

3. **Tester le scraping**
   ```bash
   npx tsx scripts/scrape-publications.ts
   ```

### **PRIORITÉ 2: Emails d'alerte**

Créer le système de notifications email quotidiennes:

📁 `lib/email/veille-emails.ts`

```typescript
export async function sendVeilleAlertEmail(params: {
  to: string;
  organizationName: string;
  newPublications: VeillePublication[];
  communes: string[];
}) {
  // Email HTML avec liste des nouvelles publications
  // Lien vers /dashboard/veille
}
```

📁 `scripts/send-veille-alerts.ts`

```typescript
// Pour chaque VeilleSubscription avec emailNotifications = true
// 1. Récupérer les nouvelles publications (depuis lastAlertSent)
// 2. Si publications > 0, envoyer email groupé
// 3. Mettre à jour lastAlertSent
```

📁 `app/api/cron/veille-alerts/route.ts`

- Endpoint appelé quotidiennement
- Exécute send-veille-alerts.ts

📁 `vercel.json`

```json
{
  "path": "/api/cron/veille-alerts",
  "schedule": "0 8 * * *" // 8h du matin
}
```

### **PRIORITÉ 3: Intégration Stripe Subscriptions**

1. **Créer les produits Stripe**

   - Plan VEILLE_BASIC: CHF 5/mois
   - Plan VEILLE_UNLIMITED: CHF 10/mois

2. **Checkout flow**
   📁 `app/api/stripe/create-subscription/route.ts`

   ```typescript
   // Créer une session Stripe pour abonnement
   // Metadata: { organizationId, plan }
   ```

3. **Webhooks**
   Gérer dans `/api/stripe/webhook/route.ts`:

   - `customer.subscription.created` → Activer veille
   - `customer.subscription.deleted` → Désactiver veille
   - `invoice.payment_failed` → Notifier utilisateur

4. **Page Billing**
   📁 `/app/dashboard/billing/page.tsx`
   - Abonnement actuel
   - Upgrade/Downgrade
   - Historique factures
   - Portal Stripe

### **PRIORITÉ 4: Tests & Polish**

- [ ] Tester le scraping sur données réelles
- [ ] Tester le flow complet (signup → upgrade → config → notifications)
- [ ] Optimiser les performances (indexation DB, cache)
- [ ] Ajouter filtres avancés (type, date range)
- [ ] Pagination des publications
- [ ] Export CSV des publications
- [ ] Mobile responsive

---

## 📊 MÉTRIQUES À MONITORER

1. **Scraping**

   - Nombre de publications scrapées/jour
   - Taux d'échec par canton
   - Temps d'exécution

2. **Utilisateurs**

   - Nombre d'abonnements VEILLE_BASIC vs UNLIMITED
   - Communes les plus suivies
   - Taux d'ouverture emails d'alerte

3. **Performance**
   - Temps de chargement /dashboard/veille
   - Conversion FREE → VEILLE_BASIC

---

## 🎯 VALEUR POUR L'UTILISATEUR

**Avant Publio:**

- ❌ Visite manuelle de 5-10 sites communaux/jour
- ❌ Risque de rater une mise à l'enquête
- ❌ Perte de temps administrative

**Avec Publio Veille:**

- ✅ Centralisation automatique (1 seul endroit)
- ✅ Alertes email proactives
- ✅ Gain de temps: ~30min/jour → CHF 200-300/mois économisés
- ✅ Aucune opportunité ratée

**ROI pour un bureau d'architectes:**

- Coût: CHF 10/mois
- Gain: 1 projet raté évité = CHF 50'000+
- **ROI: 500,000%** 🚀

---

## ✅ CHECKLIST AVANT LANCEMENT

- [ ] Scrapers implémentés pour ≥3 cantons
- [ ] Données réelles scrapées quotidiennement
- [ ] Emails d'alerte fonctionnels
- [ ] Intégration Stripe complète
- [ ] Tests E2E passent
- [ ] Mobile responsive OK
- [ ] Documentation utilisateur
- [ ] Logs & monitoring en place
- [ ] CRON_SECRET configuré en prod
- [ ] Limites de plan correctement appliquées

---

## 🐛 PROBLÈMES CONNUS & SOLUTIONS

### **Problème: Composants manquants**

```bash
# Switch component
npx shadcn@latest add switch

# Toast notifications
npm install sonner
```

### **Problème: Scraping bloqué (bot detection)**

**Solution:** Utiliser des user-agents réalistes + rotating proxies

```typescript
const response = await fetch(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; PublioBot/1.0)",
  },
});
```

### **Problème: Trop de notifications**

**Solution:** Grouper par commune + fréquence configurable

```typescript
// Envoyer 1 email/jour avec toutes les nouvelles publications
// Au lieu de 1 email/publication
```

---

## 📚 RESSOURCES UTILES

- **Cheerio:** https://cheerio.js.org/
- **Puppeteer:** https://pptr.dev/
- **Stripe Subscriptions:** https://stripe.com/docs/billing/subscriptions/overview
- **Vercel Cron:** https://vercel.com/docs/cron-jobs

---

## 🎉 CONCLUSION

Le module Veille Communale est **structurellement complet** mais nécessite:

1. ✅ Implémentation du scraping réel (2-3 jours)
2. ✅ Système d'alertes email (1 jour)
3. ✅ Intégration Stripe (1-2 jours)

**Temps estimé pour MVP fonctionnel:** 4-6 jours

Cette fonctionnalité est un **différenciateur clé** de Publio et justifie un abonnement récurrent, créant ainsi un revenu prévisible (MRR).
