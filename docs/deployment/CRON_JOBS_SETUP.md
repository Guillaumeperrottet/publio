# 🚀 Configuration des Cron Jobs Vercel

## ✅ Statut des Cron Jobs

Tous les cron jobs sont configurés dans `vercel.json` et prêts à être déployés.

### 📋 Liste des Cron Jobs

| Endpoint                         | Fréquence                                | Description                                     | Script source                                     |
| -------------------------------- | ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `/api/cron/close-tenders`        | Tous les jours à 2h (UTC)                | Clôture automatique des appels d'offres expirés | `scripts/close-expired-tenders.ts`                |
| `/api/cron/search-alerts`        | 2x/jour (8h et 20h UTC)                  | Envoi des alertes pour recherches sauvegardées  | `scripts/send-search-alerts.ts`                   |
| `/api/cron/scrape-veille`        | 6x/jour (4h, 7h, 10h, 13h, 16h, 19h UTC) | Scraping publications SIMAP et Valais           | `scripts/scrape-publications.ts`                  |
| `/api/cron/scrape-veille-weekly` | Jeudi à 7h (UTC)                         | Scraping hebdomadaire Fribourg FO               | `scripts/scrape-publications.ts --include-weekly` |
| `/api/cron/veille-alerts`        | Tous les jours à 8h (UTC)                | Envoi alertes nouvelles publications veille     | `scripts/send-veille-alerts.ts`                   |

## 🔒 Sécurité

Tous les endpoints cron vérifient l'authentification via le header `Authorization: Bearer <CRON_SECRET>`.

### Variables d'environnement requises

```bash
CRON_SECRET=<votre-secret-aleatoire>  # Généré automatiquement par Vercel
```

## 🎯 Vérification après déploiement

### 1. Vérifier dans Vercel Dashboard

- Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
- Sélectionner le projet `publio`
- Onglet "Cron Jobs" → Vérifier que les 5 jobs sont listés
- Vérifier les exécutions passées et les logs

### 2. Tester manuellement un cron job

```bash
# Récupérer le CRON_SECRET depuis Vercel
export CRON_SECRET="your-secret-from-vercel"

# Tester l'endpoint (remplacer par votre domaine)
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/close-tenders
```

### 3. Vérifier les logs

```bash
# Via Vercel CLI
vercel logs --follow
```

## 📊 Monitoring

### Logs de chaque cron job

Chaque cron job log :

- ✅ Nombre d'éléments traités
- 📧 Emails envoyés
- ❌ Erreurs rencontrées
- ⏱️ Timestamp d'exécution

### Exemple de log attendu

```
🚀 Starting close-expired-tenders cron job
🔍 Recherche des tenders expirés (2025-12-12T02:00:00.000Z)
📊 3 tender(s) expiré(s) trouvé(s)

📋 Tender: Rénovation salle polyvalente (ID: cm4...)
   Deadline passée depuis: 8 jour(s)
   Offres reçues: 5
   🔒 Fermeture automatique (8 jours écoulés)
   🔓 Révélation de l'identité (mode anonyme)
   ✅ Tender clôturé automatiquement

✅ Script terminé avec succès
```

## 🆘 Dépannage

### Le cron ne s'exécute pas

1. Vérifier que `vercel.json` est bien commité
2. Vérifier que le déploiement a réussi
3. Vérifier les logs dans Vercel Dashboard
4. Vérifier que `CRON_SECRET` est défini

### Erreurs d'authentification

```json
{ "error": "Unauthorized" }
```

→ Le `CRON_SECRET` ne correspond pas. Vérifier dans Vercel Dashboard → Settings → Environment Variables

### Timeout (>10s)

Les cron jobs Vercel ont un timeout de **10 secondes** sur le plan Hobby.
Pour les jobs longs, considérer :

- Plan Pro (timeout 60s)
- Externaliser vers service dédié (Render, Railway, etc.)

## 📝 Notes importantes

### Fuseaux horaires

Tous les horaires dans `vercel.json` sont en **UTC**.
Suisse (CET/CEST) = UTC+1 / UTC+2

Exemples :

- `0 2 * * *` (2h UTC) = 3h ou 4h en Suisse
- `0 8 * * *` (8h UTC) = 9h ou 10h en Suisse

### Fréquence SIMAP

La plateforme SIMAP est scrapée **6 fois par jour** pour capturer les nouvelles publications rapidement.

### Période de grâce

Les tenders expirés ont une **période de grâce de 3 jours** avant clôture automatique.
Fermeture définitive après **7 jours**.

## 🔄 Modifications

Pour modifier un cron job :

1. Éditer `vercel.json`
2. Commit et push
3. Vercel redéploie automatiquement
4. Les nouveaux horaires s'appliquent au prochain déploiement

```json
{
  "crons": [
    {
      "path": "/api/cron/mon-nouveau-job",
      "schedule": "*/30 * * * *" // Toutes les 30 minutes
    }
  ]
}
```

## ✅ Checklist de déploiement

- [x] `vercel.json` configuré avec 5 cron jobs
- [x] Routes API créées dans `/app/api/cron/`
- [x] Scripts dans `/scripts/` exportent leurs fonctions
- [x] Authentification `CRON_SECRET` implémentée
- [x] Logs structurés dans chaque job
- [ ] **TODO:** Vérifier que `CRON_SECRET` est défini dans Vercel
- [ ] **TODO:** Tester chaque endpoint après déploiement
- [ ] **TODO:** Monitorer les premières exécutions

---

✅ **Tous les cron jobs sont prêts pour le déploiement en production !**
