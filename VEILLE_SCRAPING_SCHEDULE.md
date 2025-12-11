# 📅 Planning des Scraping Veille

## Vue d'ensemble

Le système de veille utilise **deux cron jobs** avec des fréquences différentes selon la source de données.

---

## 🔄 Scraping Quotidien (SIMAP)

**Cron:** `/api/cron/scrape-veille`  
**Fréquence:** 6 fois par jour  
**Horaires UTC:** 4h, 7h, 10h, 13h, 16h, 19h  
**Horaires Suisse (été):** 6h, 9h, 12h, 15h, 18h, 21h

### Sources scrapées

- ✅ **SIMAP** (plateforme fédérale)
  - API REST officielle
  - Tous cantons surveillés
  - Contrats > 230'000 CHF

### Raison

SIMAP est une base de données **temps réel** mise à jour continuellement par les administrations. Un scraping fréquent permet de notifier rapidement les nouveaux appels d'offres.

---

## 📅 Scraping Hebdomadaire (Sources PDF)

**Cron:** `/api/cron/scrape-veille-weekly`  
**Fréquence:** 1 fois par semaine  
**Horaires:** Jeudi 7h UTC (9h Suisse été)

### Sources scrapées

- ✅ **Feuille Officielle Fribourg**
  - Format : PDF hebdomadaire
  - Publication : Mercredi (généralement)
  - Scraping : Jeudi matin
  - Contenu : Mises à l'enquête, permis, oppositions

### Raison

Ces sources publient **une fois par semaine** à jour fixe. Scraper 6x/jour serait inutile et gaspillerait des ressources. Le scraping du jeudi laisse 24h à la publication du mercredi.

---

## 🚀 Scraping On-Demand

**Endpoint:** `/api/veille/trigger-scrape`  
**Déclencheur:** Changement d'abonnement utilisateur

### Quand ?

- ✅ Nouvel abonnement créé
- ✅ Canton ajouté/retiré
- ✅ Modification des préférences

### Comportement

- Scrape **immédiatement** SIMAP pour les cantons sélectionnés
- Scrape Fribourg FO si canton FR sélectionné
- Permet de voir les résultats instantanément

---

## 📊 Commandes Manuelles

```bash
# Scraping quotidien (SIMAP uniquement)
npx tsx scripts/scrape-publications.ts

# Scraping complet avec sources hebdomadaires
npx tsx scripts/scrape-publications.ts --include-weekly

# Test Fribourg FO uniquement
npx tsx scripts/test-fribourg-scraper.ts
```

---

## 🔮 Sources Futures

### Planifiées

- 📄 **Feuille Avis Officiels Vaud (FAO VD)** - Hebdomadaire
- 📄 **Genève Publications Officielles** - Hebdomadaire
- 🌐 **Autres plateformes cantonales** - Variable

### Stratégie

- Sources **temps réel** → Quotidien 6x/jour
- Sources **hebdomadaires** → Hebdomadaire (jeudi)
- Sources **mensuelles** → Mensuel (1er du mois)

---

## ⚙️ Configuration Vercel

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-veille",
      "schedule": "0 4,7,10,13,16,19 * * *"
    },
    {
      "path": "/api/cron/scrape-veille-weekly",
      "schedule": "0 7 * * 4"
    }
  ]
}
```

### Schedule Syntax (cron)

- `0 4,7,10,13,16,19 * * *` = Toutes les 3h (6 fois/jour)
- `0 7 * * 4` = Jeudi à 7h UTC (9h Suisse été)

---

## 📈 Performance

### Quotidien (SIMAP)

- Durée : ~5-10 secondes
- Publications : 5-20 par exécution
- Coût : Minimal (API REST)

### Hebdomadaire (Fribourg FO)

- Durée : ~3-5 secondes
- Publications : 15-20 par semaine
- Coût : Moyen (download PDF + parsing)

---

## 🔐 Sécurité

Les endpoints cron sont protégés par :

- `CRON_SECRET` dans les variables d'environnement
- Header `Authorization: Bearer ${CRON_SECRET}`
- Vercel Cron authentification automatique
