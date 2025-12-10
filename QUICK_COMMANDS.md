# 🚀 Publio - Commandes Essentielles

Ce fichier regroupe toutes les commandes importantes pour développer, tester et déployer Publio.

---

## 🛠️ DÉVELOPPEMENT

### Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

### Base de données

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la DB (dev)
npx prisma db push

# Créer une migration
npx prisma migrate dev --name description_du_changement

# Déployer les migrations (production)
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface visuelle)
npx prisma studio
```

### Build & Lint

```bash
# Build de production
npm run build

# Lancer le serveur de production
npm start

# Linter le code
npm run lint
```

---

## 🧪 TESTS

### Tests manuels

```bash
# Suivre le guide complet
cat PRE_LAUNCH_TESTING_GUIDE.md
```

### Scripts de test

```bash
# Tester la fermeture automatique des tenders
npx tsx scripts/close-expired-tenders.ts

# Tester les alertes de recherches sauvegardées
npx tsx scripts/send-search-alerts.ts

# Tester la publication d'un tender (script à créer si besoin)
npx tsx scripts/publish-draft-tenders.ts
```

---

## 📧 EMAILS

### Tester l'envoi d'emails

```bash
# Vérifier la configuration Resend
echo $RESEND_API_KEY

# Tester un email (via script Node.js)
node -e "require('./lib/email/tender-emails').sendTenderPublishedEmail({
  to: 'test@example.com',
  tenderTitle: 'Test',
  tenderId: 'xxx',
  deadline: new Date(),
  budget: 10000
})"
```

---

## 💳 STRIPE

### Mode test

```bash
# Cartes de test Stripe
4242 4242 4242 4242  # Succès
4000 0000 0000 0002  # Décliné
4000 0025 0000 3155  # Authentification 3D Secure

# Écouter les webhooks en local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Mode production

```bash
# Vérifier les clés Stripe configurées
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY

# Tester un paiement réel (CHF 0.50)
# Utiliser l'interface web
```

---

## 🔐 SÉCURITÉ & VARIABLES D'ENVIRONNEMENT

### Générer des secrets

```bash
# Générer AUTH_SECRET
openssl rand -base64 32

# Générer CRON_SECRET
openssl rand -hex 32
```

### Vérifier les variables

```bash
# Localement (.env.local)
cat .env.local

# Sur Vercel
vercel env ls
vercel env pull
```

---

## 🌐 DÉPLOIEMENT

### Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer en preview
vercel

# Déployer en production
vercel --prod

# Voir les logs
vercel logs --follow

# Lister les déploiements
vercel ls

# Configurer les variables d'environnement
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
# ... etc
```

### Variables d'environnement à configurer sur Vercel

```bash
# Essentielles
DATABASE_URL=postgresql://...
AUTH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CRON_SECRET=...
NEXT_PUBLIC_APP_URL=https://publio.ch
RESEND_FROM_EMAIL=Publio <noreply@publio.ch>
RESEND_REPLY_TO=contact@publio.ch
```

---

## 🗄️ BASE DE DONNÉES

### Backup & Restore

```bash
# Backup de la base de données
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Requêtes utiles

```sql
-- Voir tous les tenders
SELECT id, title, status, deadline FROM tenders ORDER BY "createdAt" DESC;

-- Voir toutes les offres d'un tender
SELECT id, "organizationId", status, price FROM offers WHERE "tenderId" = 'xxx';

-- Voir les recherches sauvegardées avec alertes activées
SELECT id, name, "alertsEnabled", "lastAlertSent" FROM "saved_searches" WHERE "alertsEnabled" = true;

-- Compter les utilisateurs
SELECT COUNT(*) FROM users;

-- Compter les organisations
SELECT COUNT(*) FROM organizations;

-- Statistiques globales
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM organizations) as orgs,
  (SELECT COUNT(*) FROM tenders WHERE status = 'PUBLISHED') as active_tenders,
  (SELECT COUNT(*) FROM offers WHERE status = 'SUBMITTED') as pending_offers;
```

---

## 📊 MONITORING

### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs d'un deployment spécifique
vercel logs [deployment-url]

# Logs des fonctions
vercel logs --output --since=1h
```

### Cron Jobs

```bash
# Tester le cron de fermeture des tenders
curl -X GET https://publio.ch/api/cron/close-tenders \
  -H "Authorization: Bearer $CRON_SECRET"

# Tester le cron des alertes
curl -X GET https://publio.ch/api/cron/search-alerts \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 🐛 DEBUGGING

### Problèmes courants

#### Prisma ne trouve pas la base de données

```bash
# Vérifier la connexion
npx prisma db pull

# Régénérer le client
npx prisma generate
```

#### Emails non envoyés

```bash
# Vérifier la clé API Resend
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

#### Erreurs Stripe

```bash
# Vérifier les webhooks
stripe webhooks list

# Tester un webhook
stripe trigger payment_intent.succeeded
```

#### TypeScript errors

```bash
# Vérifier les types
npx tsc --noEmit

# Relancer Next.js
rm -rf .next
npm run dev
```

---

## 🔄 MAINTENANCE

### Mises à jour

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix
```

### Nettoyage

```bash
# Nettoyer node_modules et .next
rm -rf node_modules .next
npm install

# Nettoyer le cache Prisma
rm -rf node_modules/.prisma
npx prisma generate
```

---

## 📝 NOTES IMPORTANTES

### Avant chaque déploiement production

- [ ] Tests manuels complets
- [ ] Vérifier les migrations DB
- [ ] Vérifier les variables d'environnement
- [ ] Tester les paiements Stripe (mode live)
- [ ] Vérifier les webhooks Stripe
- [ ] Tester les cron jobs
- [ ] Vérifier les emails (inbox réel)

### Après chaque déploiement

- [ ] Vérifier les logs Vercel
- [ ] Tester le flow complet en production
- [ ] Vérifier les métriques (temps de réponse, erreurs)
- [ ] Tester les paiements
- [ ] Vérifier les cron jobs dans Vercel dashboard

---

## 📚 DOCUMENTATION

### Fichiers de référence

```bash
# Installation et démarrage
cat GETTING_STARTED.md

# Cycle de vie des tenders
cat LIFECYCLE_GUIDE.md

# Système d'emails
cat EMAIL_SYSTEM.md
cat EMAIL_IMPLEMENTATION.md

# Tests
cat TESTING_GUIDE.md
cat PRE_LAUNCH_TESTING_GUIDE.md

# Résumé des implémentations
cat IMPLEMENTATION_SUMMARY.md
cat MVP_COMPLETION_SUMMARY.md

# Ce fichier
cat QUICK_COMMANDS.md
```

---

## 🆘 AIDE

### Support Prisma

- Docs : https://www.prisma.io/docs
- Discord : https://discord.gg/prisma

### Support Next.js

- Docs : https://nextjs.org/docs
- Discord : https://discord.gg/nextjs

### Support Stripe

- Docs : https://stripe.com/docs
- Dashboard : https://dashboard.stripe.com

### Support Vercel

- Docs : https://vercel.com/docs
- Dashboard : https://vercel.com/dashboard

---

**Bon développement ! 🚀**
