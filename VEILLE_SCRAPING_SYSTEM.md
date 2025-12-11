# 🔄 Système de Scraping Veille - Documentation

## 📋 Vue d'ensemble

Le système de scraping de la veille communale fonctionne sur **deux modes complémentaires** pour offrir la meilleure expérience utilisateur.

---

## 🎯 Mode 1 : Scraping à la demande (Instantané)

### **Déclencheurs**

Le scraping est lancé **immédiatement** quand :

- ✅ Un utilisateur active son abonnement veille
- ✅ Un utilisateur modifie ses cantons surveillés
- ✅ Un utilisateur ajoute un nouveau canton

### **Endpoint API**

```
POST /api/veille/trigger-scrape
```

**Paramètres :**

```json
{
  "organizationId": "org_xyz",
  "cantons": ["VD", "GE", "FR"]
}
```

**Authentification :** Session utilisateur (protégé)

### **Comportement**

1. L'utilisateur sauvegarde ses paramètres de veille
2. Le système déclenche automatiquement un scraping SIMAP pour les cantons sélectionnés
3. Un toast "Récupération des publications en cours..." s'affiche
4. Une fois terminé, l'utilisateur voit le résultat : "X publication(s) trouvée(s) (Y nouvelles)"
5. Redirection vers `/dashboard/veille` avec les données fraîches

### **Avantages**

- ✅ Satisfaction immédiate
- ✅ Pas d'attente jusqu'au prochain cron
- ✅ Feedback visuel direct

### **Source de données**

- SIMAP (API REST officielle)
- Scraping uniquement des cantons demandés
- Optimisé pour la rapidité

---

## 🤖 Mode 2 : Scraping automatique (Planifié)

### **Fréquence**

Le scraping automatique s'exécute **6 fois par jour** :

- 🌅 06h00 (UTC)
- ☕ 09h00 (UTC)
- 🌞 12h00 (UTC)
- 🕒 15h00 (UTC)
- 🌆 18h00 (UTC)
- 🌙 21h00 (UTC)

**Horaires suisses (UTC+1 en hiver, UTC+2 en été) :**

- Hiver : 7h, 10h, 13h, 16h, 19h, 22h
- Été : 8h, 11h, 14h, 17h, 20h, 23h

### **Configuration**

`vercel.json` :

```json
{
  "path": "/api/cron/scrape-veille",
  "schedule": "0 6,9,12,15,18,21 * * *"
}
```

### **Endpoint API**

```
GET /api/cron/scrape-veille
```

**Authentification :** Bearer token (CRON_SECRET)

### **Comportement**

1. Le cron job Vercel déclenche l'endpoint à l'heure prévue
2. Récupération de **tous les cantons** surveillés (toutes les VeilleSubscription actives)
3. Scraping SIMAP pour tous ces cantons
4. Scraping des sources cantonales complémentaires (Fribourg, etc.)
5. Déduplication intelligente (par projectNumber pour SIMAP, par URL pour les autres)
6. Filtrage des 30 derniers jours
7. Sauvegarde en base de données

### **Avantages**

- ✅ Données toujours à jour
- ✅ Capture des publications publiées entre deux actions utilisateur
- ✅ Couverture complète

### **Sources de données**

- **SIMAP** (source principale, obligatoire >230k CHF)
- **Sources cantonales** complémentaires (optionnelles)

---

## 🔍 Sources de Scraping

### **1. SIMAP (Prioritaire)**

**Type :** API REST officielle

**URL :** `https://www.simap.ch/rest/publications/v2/project/project-search`

**Paramètres :**

- `lang=fr`
- `orderAddressCountryOnlySwitzerland=true`
- `orderAddressCantons=VD,GE,FR` (filtre par canton)
- `firstItem=0` (pagination)

**Avantages :**

- ✅ Source officielle fédérale
- ✅ Obligatoire pour tous les marchés publics >230'000 CHF
- ✅ Couvre **tous les cantons suisses**
- ✅ Données structurées (JSON propre)
- ✅ Métadonnées riches (projectNumber, types, autorités)
- ✅ API stable et rapide

**Scraper :** `features/veille/scrapers/simap.ts`

### **2. Sources cantonales (Complémentaires)**

**Canton de Fribourg :**

- URL : `https://www.fr.ch/etat-et-droit/poursuites-et-faillites/appels-doffres`
- Type : HTML scraping (Cheerio)
- Statut : Implémenté

**Autres cantons :**

- Vaud, Genève, Valais, etc.
- Type : HTML scraping
- Statut : En développement (SIMAP suffit pour la V1)

**Scraper :** `features/veille/scraper.ts` (MasterScraper)

---

## 📊 Logique de Déduplication

### **Pour SIMAP (projectNumber unique)**

```typescript
// Recherche par projectNumber dans les métadonnées JSON
const existing = await prisma.veillePublication.findFirst({
  where: {
    metadata: {
      path: ["projectNumber"],
      equals: projectNumber,
    },
  },
});
```

### **Pour autres sources (URL unique)**

```typescript
// Recherche par URL + commune
const existing = await prisma.veillePublication.findFirst({
  where: {
    url: pub.url,
    commune: pub.commune,
  },
});
```

### **Mises à jour automatiques**

Si une publication existe déjà mais que l'URL a changé (fréquent avec SIMAP), elle est automatiquement mise à jour.

---

## 🎨 Expérience Utilisateur

### **Lors de la configuration**

1. L'utilisateur sélectionne ses cantons dans `/dashboard/veille/settings`
2. Il clique sur "Enregistrer"
3. Un toast apparaît : "Paramètres de veille enregistrés"
4. Immédiatement après : "Récupération des publications en cours..." (toast loading)
5. Une fois terminé : "45 publication(s) trouvée(s) (12 nouvelles)"
6. Redirection vers `/dashboard/veille` avec les publications affichées

### **Dans le dashboard**

1. Badge "X nouvelle(s)" pour les publications des dernières 24h
2. Filtrage par canton
3. Affichage des métadonnées (source SIMAP, type, commune)
4. Lien direct vers la publication officielle

### **Indicateurs visuels**

Un encadré jaune apparaît dans le formulaire de configuration :

```
💡 Les publications seront récupérées automatiquement après la sauvegarde
```

---

## ⚙️ Configuration Requise

### **Variables d'environnement**

```bash
# Pour le cron job
CRON_SECRET="your-secure-random-string"

# Base de données
DATABASE_URL="postgresql://..."
```

### **Permissions Vercel**

Aucune configuration spéciale requise. Les cron jobs Vercel sont automatiquement déclenchés selon le schedule dans `vercel.json`.

---

## 🧪 Tests

### **Tester le scraping à la demande**

1. Se connecter à l'application
2. Aller dans `/dashboard/veille/settings`
3. Sélectionner un ou plusieurs cantons
4. Cliquer sur "Enregistrer"
5. Observer les toasts et vérifier les publications dans `/dashboard/veille`

### **Tester le cron job en local**

```bash
# Exécuter le script manuellement
npx tsx scripts/scrape-publications.ts
```

### **Tester l'endpoint API directement**

```bash
# Avec authentification utilisateur
curl -X POST http://localhost:3000/api/veille/trigger-scrape \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=xxx" \
  -d '{"organizationId":"org_xyz","cantons":["VD","GE"]}'
```

---

## 📈 Monitoring

### **Logs à surveiller**

```bash
# Scraping à la demande
[Trigger Scrape] Début du scraping pour VD, GE
[Trigger Scrape] 45 publication(s) trouvée(s)
[Trigger Scrape] Résumé: 12 créées, 2 mises à jour, 31 inchangées

# Cron job automatique
[Veille Cron] Cantons surveillés: VD, GE, FR, VS
[Veille Cron] SIMAP: 120 publications
[Veille Cron] Sources cantonales: 15 publications
[Veille Cron] Terminé - 25 créées, 5 mises à jour, 105 ignorées
```

### **Métriques importantes**

- Nombre de publications scrapées par exécution
- Taux de nouvelles publications (created)
- Taux de déduplication (skipped)
- Temps d'exécution moyen

---

## 🚀 Améliorations Futures

### **Court terme**

- [ ] Emails d'alerte pour les nouvelles publications
- [ ] Filtrage par type de publication (APPEL_DOFFRES, PERMIS_CONSTRUIRE, etc.)
- [ ] Filtrage par mot-clé dans les titres

### **Moyen terme**

- [ ] Scrapers cantonaux additionnels (Vaud, Genève, Valais)
- [ ] Scraping des PDF pour extraire plus de métadonnées
- [ ] Notifications push dans l'application

### **Long terme**

- [ ] IA pour catégorisation automatique
- [ ] Analyse de pertinence par rapport au profil utilisateur
- [ ] Alertes intelligentes basées sur l'historique

---

## 🎯 Résumé

| Aspect          | Scraping à la demande           | Scraping automatique        |
| --------------- | ------------------------------- | --------------------------- |
| **Fréquence**   | À chaque modification           | 6x par jour                 |
| **Déclencheur** | Action utilisateur              | Cron job                    |
| **Cantons**     | Seulement ceux de l'utilisateur | Tous les cantons surveillés |
| **Feedback**    | Toast + redirection             | Silencieux                  |
| **Objectif**    | UX immédiate                    | Mise à jour continue        |
| **Auth**        | Session utilisateur             | CRON_SECRET                 |

**Les deux modes se complètent parfaitement pour une expérience optimale !**
