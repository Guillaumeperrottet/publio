# 🎯 Publio - Guide de déploiement production

## ✅ Statut : Prêt pour la production

Tous les composants critiques du MVP sont implémentés et fonctionnels.

---

## 📦 Ce qui a été ajouté aujourd'hui (12 décembre 2025)

### 1. Export PDF du Journal d'Équité

- **Route API** : `/api/tenders/[id]/equity-log/pdf`
- **Composant** : Bouton d'export avec état de chargement
- **Fonctionnalité** : Génération de PDF professionnel avec traçabilité complète

### 2. Vérification des Cron Jobs

- Tous les cron jobs sont déjà configurés et opérationnels
- Documentation complète créée

---

## 🚀 Étapes de déploiement

### 1. Commit et push des changements

```bash
git add .
git commit -m "feat: add equity log PDF export and finalize cron jobs"
git push origin main
```

### 2. Déploiement automatique Vercel

Le déploiement se fait automatiquement via l'intégration GitHub → Vercel.

### 3. Variables d'environnement à vérifier

Aller sur [Vercel Dashboard](https://vercel.com) → Votre projet → Settings → Environment Variables

**Obligatoires** :

- ✅ `DATABASE_URL` - URL PostgreSQL
- ✅ `STRIPE_SECRET_KEY` - Clé secrète Stripe
- ✅ `STRIPE_WEBHOOK_SECRET` - Secret webhook Stripe
- ✅ `RESEND_API_KEY` - Clé API Resend (emails)
- ✅ `NEXT_PUBLIC_APP_URL` - URL de production (ex: https://publio.ch)
- ✅ `CRON_SECRET` - **Généré automatiquement par Vercel**

**Optionnelles** :

- `CLOUDINARY_CLOUD_NAME` - Upload fichiers
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 4. Vérifier les cron jobs

**Dans Vercel Dashboard** :

1. Aller sur votre projet
2. Onglet "Cron Jobs"
3. Vérifier que les 5 jobs sont listés :
   - `close-tenders` (2h UTC)
   - `search-alerts` (8h et 20h UTC)
   - `scrape-veille` (6x/jour)
   - `scrape-veille-weekly` (jeudi 7h)
   - `veille-alerts` (8h UTC)

### 5. Test post-déploiement

#### Test 1 : Export PDF

1. Se connecter à l'application
2. Créer un tender de test (ou utiliser un existant)
3. Aller sur `/dashboard/tenders/[id]/equity-log`
4. Cliquer sur "Exporter en PDF"
5. ✅ Le PDF doit se télécharger automatiquement

#### Test 2 : Cron jobs (optionnel)

```bash
# Récupérer le CRON_SECRET depuis Vercel Dashboard
export CRON_SECRET="votre-secret"
export APP_URL="https://votre-app.vercel.app"

# Tester la clôture des tenders
curl -H "Authorization: Bearer $CRON_SECRET" \
  $APP_URL/api/cron/close-tenders

# Tester les alertes de recherche
curl -H "Authorization: Bearer $CRON_SECRET" \
  $APP_URL/api/cron/search-alerts
```

✅ Réponse attendue : `{ "success": true, ... }`

---

## 📊 Monitoring

### Logs des cron jobs

**Via Vercel CLI** :

```bash
vercel logs --follow
```

**Via Dashboard** :

1. Vercel Dashboard → Votre projet
2. Onglet "Functions" ou "Logs"
3. Filtrer par `/api/cron/*`

### Ce qu'il faut surveiller

**Première semaine** :

- [ ] Les tenders expirés se clôturent automatiquement
- [ ] Les utilisateurs reçoivent les alertes de recherche
- [ ] Le scraping veille fonctionne (nouvelles publications)
- [ ] Les exports PDF se génèrent sans erreur

**Indicateurs de succès** :

- ✅ Aucune erreur 500 sur les endpoints cron
- ✅ Emails envoyés (vérifier logs Resend)
- ✅ Nouveaux logs dans les journaux d'équité
- ✅ PDFs générés avec contenu complet

---

## ⚠️ Problèmes courants et solutions

### "Unauthorized" sur les cron jobs

**Cause** : `CRON_SECRET` incorrect ou manquant

**Solution** :

1. Vercel Dashboard → Settings → Environment Variables
2. Vérifier que `CRON_SECRET` existe
3. Si absent, Vercel le génère automatiquement au premier cron

### Export PDF échoue (500)

**Causes possibles** :

- Problème de dépendances (`jspdf`, `jspdf-autotable`)
- Tender introuvable
- Permissions utilisateur

**Solution** :

1. Vérifier les logs : `vercel logs`
2. Vérifier que l'utilisateur est OWNER ou ADMIN
3. Vérifier que le tender existe

### Cron ne s'exécute pas

**Causes possibles** :

- Cron désactivé sur plan Hobby Vercel (devrait être ok)
- Erreur dans `vercel.json`
- Endpoint non accessible

**Solution** :

1. Vérifier `vercel.json` est bien commité
2. Tester l'endpoint manuellement avec `curl`
3. Vérifier les logs dans Dashboard

---

## 📚 Documentation complète

Pour plus de détails, consulter :

- **`CRITICAL_FEATURES_COMPLETED.md`** - Synthèse des 3 fonctionnalités ajoutées
- **`EQUITY_LOG_PDF_EXPORT.md`** - Documentation complète export PDF
- **`CRON_JOBS_SETUP.md`** - Guide détaillé des cron jobs
- **`MVP_COMPLETION_SUMMARY.md`** - Récapitulatif global du MVP

---

## 🎉 Checklist finale avant lancement

### Code

- [x] Toutes les fonctionnalités MVP implémentées
- [x] Aucune erreur de compilation
- [x] Tests manuels effectués en local
- [x] Documentation créée

### Configuration

- [x] `vercel.json` configuré
- [x] Variables d'environnement documentées
- [x] Routes API sécurisées

### Déploiement

- [ ] Code pushé sur `main`
- [ ] Déploiement Vercel réussi
- [ ] Variables d'environnement vérifiées
- [ ] Cron jobs activés
- [ ] Tests post-déploiement effectués

### Monitoring

- [ ] Logs vérifiés (première heure)
- [ ] Emails de test envoyés
- [ ] Export PDF testé
- [ ] Premier cron exécuté avec succès

---

## 🚀 Lancement !

Une fois tous les points de la checklist validés, **Publio est prêt pour la production** !

**Bon lancement ! 🎉**

---

## 📞 Support

En cas de problème, consulter :

1. Les logs Vercel (`vercel logs`)
2. La documentation dans ce repository
3. Les fichiers de configuration (`vercel.json`, `.env.example`)

**Astuce** : Activer les notifications Vercel pour être alerté en cas d'erreur sur les cron jobs.
