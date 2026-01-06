# 🚀 Super Admin Monitoring - Quick Start

## Installation rapide (5 minutes)

### 1. Installer dépendances

```bash
npm install @sentry/nextjs posthog-js
```

### 2. Variables d'environnement

Ajouter à `.env` :

```env
# Sentry (optionnel mais recommandé en prod)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
SENTRY_AUTH_TOKEN=sntrys_xxx

# PostHog (optionnel)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Alertes (optionnel)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
ADMIN_EMAIL=admin@publio.ch
```

### 3. Activer instrumentation

Dans `next.config.ts` :

```typescript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};
```

### 4. Ajouter PostHog Provider

Dans `app/layout.tsx` :

```typescript
import { PostHogProvider } from "@/lib/monitoring/posthog";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
```

### 5. Rebuild

```bash
npm run build
npm run dev
```

### 6. Tester

```bash
# Accéder au dashboard
open http://localhost:3000/admin/monitoring

# Tester une alerte
npx tsx -e "import('./lib/monitoring/alerts').then(m => m.sendTestAlert())"
```

---

## ✅ Mode Minimal (sans Sentry/PostHog)

Le monitoring fonctionne **sans** Sentry/PostHog !

**Ce qui marche** :

- ✅ Dashboard monitoring
- ✅ Error tracking via ActivityLog
- ✅ Performance metrics (estimés)
- ✅ System health
- ✅ Alertes

**Ce qui manque** :

- ❌ Source maps en prod
- ❌ Session replays
- ❌ Advanced analytics
- ❌ Feature flags

---

## 📊 Accès Dashboard

```
http://localhost:3000/admin/monitoring
```

**Sections disponibles** :

- Error Stats (24h)
- Performance Metrics
- Analytics
- System Resources
- Recent Errors (groupées)
- Integration Status

---

## 🎯 Configuration Sentry (optionnel)

1. **Créer compte** : [sentry.io](https://sentry.io)
2. **Nouveau projet** : Next.js
3. **Copier DSN** → `.env`
4. **Auth token** : Settings → Auth Tokens
5. **Rebuild** : `npm run build`

---

## 🎯 Configuration PostHog (optionnel)

1. **Créer compte** : [posthog.com](https://posthog.com)
2. **Nouveau projet**
3. **Copier Project API Key** → `.env`
4. **Rebuild** : `npm run build`

---

## 🚨 Alertes Slack (optionnel)

1. **Créer Incoming Webhook** : [Slack API](https://api.slack.com/messaging/webhooks)
2. **Copier URL** → `.env` (`SLACK_WEBHOOK_URL`)
3. **Tester** :
   ```bash
   npx tsx -e "import('./lib/monitoring/alerts').then(m => m.sendTestAlert())"
   ```
4. **Vérifier** : Message reçu dans Slack

---

## 🐛 Troubleshooting

### Dashboard vide ?

- ✅ User est super admin ?
- ✅ Rebuild après ajout instrumentation ?
- ✅ Pas d'erreurs console ?

### Sentry ne track pas ?

- ✅ `NEXT_PUBLIC_SENTRY_DSN` dans `.env` ?
- ✅ `experimental.instrumentationHook: true` ?
- ✅ Rebuild ?

### PostHog ne track pas ?

- ✅ `NEXT_PUBLIC_POSTHOG_KEY` dans `.env` ?
- ✅ `PostHogProvider` ajouté au layout ?
- ✅ AdBlocker désactivé pour test ?

---

## 📚 Docs complètes

Voir [SUPER_ADMIN_PHASE3_MONITORING.md](./SUPER_ADMIN_PHASE3_MONITORING.md)

---

**C'est tout ! Le monitoring est prêt.** 🎉
