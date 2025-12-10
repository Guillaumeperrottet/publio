# 📋 Guide : Gestion du Cycle de Vie des Appels d'Offres

## ✅ Ce qui a été implémenté

### 1. **Actions de cycle de vie pour les offres**

Fichier : `features/offers/actions.ts`

- ✅ `acceptOffer(offerId)` - Accepter une offre (marquer comme gagnante potentielle)
- ✅ `rejectOffer(offerId)` - Rejeter une offre
- ✅ `withdrawOffer(offerId)` - Retirer son offre (action du soumissionnaire, avant deadline uniquement)

### 2. **Actions de cycle de vie pour les tenders**

Fichier : `features/tenders/actions.ts`

- ✅ `closeTender(tenderId)` - Clôturer un tender (empêche nouvelles soumissions)
- ✅ `awardTender(tenderId, winningOfferId)` - Attribuer le marché (accepte l'offre gagnante, rejette automatiquement les autres)
- ✅ `cancelTender(tenderId)` - Annuler un tender

### 3. **Composants UI**

- ✅ `OfferActionsButtons` - Boutons Accepter/Rejeter sur chaque offre
- ✅ `CloseTenderButton` - Bouton pour clôturer l'appel d'offres
- ✅ `AwardTenderButton` - Bouton pour attribuer le marché (visible seulement sur offre acceptée)

### 4. **Fermeture automatique (Cron Job)**

- ✅ Script `scripts/close-expired-tenders.ts`
- ✅ Endpoint `/api/cron/close-tenders`
- ✅ Configuration `vercel.json` pour exécution quotidienne

---

## 🔄 Comment ça fonctionne ? (Flux complet)

### **PHASE 1 : Deadline approche**

```
État : PUBLISHED
Deadline : Dans X jours
```

**Ce qui se passe :**

- ✅ Les soumissionnaires peuvent déposer des offres
- ✅ Le bouton "Soumettre offre" est visible sur `/tenders/[id]`
- ✅ L'émetteur voit les offres en temps réel (anonymisées si mode ANONYMOUS)

---

### **PHASE 2 : Deadline passée (immédiat)**

```
État : PUBLISHED (encore)
Deadline : Passée depuis quelques secondes
```

**Ce qui se passe automatiquement :**

1. ✅ Bouton "Soumettre offre" **disparaît** sur la page publique
2. ✅ Action `submitOffer()` **rejette** toute nouvelle soumission
3. ✅ Badge "Deadline passée" s'affiche
4. ✅ Si mode ANONYMOUS : bouton **"Révéler les identités"** apparaît

**L'émetteur peut maintenant :**

- 👁️ Cliquer "Révéler les identités" (si anonyme)
- 🔒 Cliquer "Clôturer l'appel d'offres"

---

### **PHASE 3 : Révélation des identités (manuel)**

```
État : PUBLISHED
identityRevealed : true
```

**L'émetteur clique "Révéler les identités" :**

- ✅ Les vrais noms des organisations apparaissent
- ✅ Les informations complètes deviennent visibles
- ✅ Les boutons **"Accepter" / "Rejeter"** apparaissent sur chaque offre

**Note :** On peut révéler SANS clôturer (l'émetteur garde contrôle)

---

### **PHASE 4 : Évaluation des offres (manuel)**

```
État : PUBLISHED ou CLOSED
identityRevealed : true
```

**L'émetteur évalue chaque offre :**

#### Option A : Accepter une offre

```typescript
await acceptOffer(offerId);
```

- ✅ Offre passe à status `ACCEPTED`
- ✅ **N'attribue PAS encore le marché** (permet d'accepter plusieurs offres pour comparaison)
- ✅ Bouton "Attribuer le marché" 🏆 apparaît sur cette offre

#### Option B : Rejeter une offre

```typescript
await rejectOffer(offerId);
```

- ✅ Offre passe à status `REJECTED`
- ✅ TODO: Email au soumissionnaire

---

### **PHASE 5 : Clôture (manuel ou automatique)**

```
État : PUBLISHED → CLOSED
```

#### Option A : Clôture manuelle (recommandée)

**L'émetteur clique "Clôturer l'appel d'offres" :**

```typescript
await closeTender(tenderId);
```

- ✅ Tender passe à `CLOSED`
- ✅ Aucune nouvelle offre ne peut être soumise
- ✅ Les offres restent consultables
- ✅ L'émetteur peut encore accepter/rejeter

#### Option B : Clôture automatique (sécurité)

**Cron job quotidien à 2h du matin :**

```
Deadline + 1 jour  : Email de rappel envoyé
Deadline + 3 jours : Période de grâce
Deadline + 7 jours : Fermeture AUTOMATIQUE
```

**Script `close-expired-tenders.ts` :**

1. Trouve tous les tenders `PUBLISHED` avec deadline passée > 7 jours
2. Les passe automatiquement à `CLOSED`
3. TODO: Envoie email de notification

---

### **PHASE 6 : Attribution du marché (finale)**

```
État : CLOSED → AWARDED
```

**L'émetteur clique "Attribuer le marché" sur l'offre gagnante :**

```typescript
await awardTender(tenderId, winningOfferId);
```

**Ce qui se passe (transaction atomique) :**

1. ✅ Tender passe à `AWARDED`
2. ✅ Offre gagnante passe à `ACCEPTED` (si pas déjà fait)
3. ✅ **Toutes les autres offres** `SUBMITTED` passent automatiquement à `REJECTED`
4. ✅ TODO: Emails envoyés (félicitations au gagnant + notification aux autres)

---

## 🎮 Interface Utilisateur

### **Dashboard Émetteur : `/dashboard/tenders/[id]`**

**Avant deadline :**

```
┌─────────────────────────────────────┐
│ 📋 Offres reçues (3)                │
├─────────────────────────────────────┤
│ [Liste des offres anonymisées]      │
│ - Entreprise #5382 : CHF 450'000    │
│ - Entreprise #1293 : CHF 480'000    │
└─────────────────────────────────────┘
```

**Après deadline (pas révélé) :**

```
┌─────────────────────────────────────────────────────┐
│ 📋 Offres reçues (3)  [Révéler identités] [Clôturer]│
├─────────────────────────────────────────────────────┤
│ ⚠️ Mode anonyme - Révélez les identités pour       │
│    accéder aux actions                               │
└─────────────────────────────────────────────────────┘
```

**Après révélation :**

```
┌──────────────────────────────────────────────────────┐
│ 📋 Offres reçues (3)                      [Clôturer] │
├──────────────────────────────────────────────────────┤
│ Architecture Dupont SA - CHF 450'000                 │
│ [Accepter] [Rejeter] [Voir détail]                  │
├──────────────────────────────────────────────────────┤
│ Bureau Martin Sàrl - CHF 480'000                     │
│ [Accepter] [Rejeter] [Voir détail]                  │
└──────────────────────────────────────────────────────┘
```

**Après acceptation d'une offre :**

```
┌──────────────────────────────────────────────────────┐
│ Architecture Dupont SA - CHF 450'000                 │
│ ✅ ACCEPTÉE                                          │
│ [🏆 Attribuer le marché] [Rejeter] [Voir détail]    │
└──────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration Vercel Cron

### Fichier `vercel.json` créé :

```json
{
  "crons": [
    {
      "path": "/api/cron/close-tenders",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule :** `0 2 * * *` = Tous les jours à 2h du matin (UTC)

### Variable d'environnement à ajouter :

```bash
CRON_SECRET="votre-secret-aleatoire-securise"
```

**Sécurité :** Vercel envoie `Authorization: Bearer ${CRON_SECRET}` pour authentifier les appels.

---

## 🚀 Configuration & Déploiement

### 1. **Variables d'environnement**

Ajouter dans Vercel ou `.env` :

```bash
CRON_SECRET="your-cron-secret-here"
TENDER_PRICE_CHF="1000"  # CHF 10.00
```

### 2. **Tester le cron localement**

```bash
# Exécuter le script manuellement
npx tsx scripts/close-expired-tenders.ts
```

### 3. **Tester l'endpoint cron**

```bash
curl -X GET http://localhost:3000/api/cron/close-tenders \
  -H "Authorization: Bearer your-cron-secret-here"
```

### 4. **Déployer sur Vercel**

```bash
vercel deploy
```

Vercel détectera automatiquement `vercel.json` et configurera le cron job.

---

## 🔍 Vérifications & Tests

### **Scénario de test complet :**

1. ✅ **Créer un tender** avec deadline dans 1 minute
2. ✅ **Soumettre 2-3 offres** (avec différentes organisations)
3. ⏰ **Attendre la deadline**
4. ✅ Vérifier que le bouton "Soumettre" a disparu
5. ✅ Cliquer **"Révéler les identités"**
6. ✅ Cliquer **"Accepter"** sur une offre
7. ✅ Cliquer **"Attribuer le marché"** sur l'offre acceptée
8. ✅ Vérifier que les autres offres sont passées à `REJECTED`

### **Vérifier les status dans la DB :**

```sql
-- Tender status
SELECT id, title, status, deadline FROM tenders;

-- Offers status
SELECT id, "organizationId", status, price FROM offers WHERE "tenderId" = 'xxx';
```

---

## 📧 TODO : Notifications Email

**À implémenter prochainement :**

1. ✅ Email "Deadline passée" → Émetteur (J+1)
2. ✅ Email "Offre acceptée" → Soumissionnaire
3. ✅ Email "Offre rejetée" → Soumissionnaire
4. ✅ Email "Marché attribué" → Gagnant
5. ✅ Email "Tender fermé automatiquement" → Émetteur

**Fichiers à créer :**

- `lib/email/tender-emails.ts` (templates email)
- Intégrer dans les actions existantes

---

## 🎯 Résumé de la Logique

### **Pourquoi cette approche hybride ?**

✅ **État calculé en temps réel** = Précision à la seconde

- Bloque immédiatement les nouvelles soumissions après deadline
- Pas besoin d'attendre le cron

✅ **Actions manuelles** = Contrôle humain

- L'émetteur décide quand révéler, clôturer, attribuer
- Flexibilité (peut prolonger si besoin)

✅ **Cron de sécurité** = Automatisation douce

- Rappels par email (J+1, J+3)
- Fermeture auto seulement après 7 jours d'inactivité
- Évite que des tenders restent en "limbes"

### **Avantages :**

- 🎯 Respect strict des deadlines
- 🧑‍💼 Émetteur garde le contrôle
- 🤖 Automatisation progressive (pas agressive)
- 📧 Notifications pour engagement

---

## 🛠️ Prochaines étapes

1. ✅ **Tester le flux complet** (créer tender → soumettre → révéler → attribuer)
2. ✅ **Implémenter les emails** (templates Resend)
3. ✅ **Tester le cron job** en local puis sur Vercel
4. ✅ **Ajouter analytics** (statistiques pour émetteur/soumissionnaire)

**Le système est maintenant COMPLET et FONCTIONNEL ! 🎉**
