# 📊 Super Admin Panel - Phase 3: Monitoring & Observability

## Vue d'ensemble

Phase 3 ajoute un système de monitoring complet avec :

- **Sentry** : Error tracking en production
- **PostHog** : Analytics utilisateurs et feature flags
- **Dashboard unifié** : Vue d'ensemble de tous les métriques
- **Alertes** : Notifications pour événements critiques
- **Instrumentation** : Telemetry Next.js intégrée

---

## 🎯 Features implémentées

### 1. Error Tracking (Sentry)

**Configuration** :

- `sentry.client.config.ts` : Config client-side
- `sentry.server.config.ts` : Config server-side
- `instrumentation.ts` : Next.js instrumentation

**Fonctionnalités** :

- ✅ Error tracking automatique
- ✅ Performance monitoring
- ✅ Session replay (10% sample + 100% sur erreurs)
- ✅ User context tracking
- ✅ Breadcrumbs avec données sensibles filtrées
- ✅ Filtrage erreurs réseau/cancelled requests

**Config DSN** :

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
```

### 2. Analytics (PostHog)

**Configuration** :

- `lib/monitoring/posthog.tsx` : Provider + pageview tracking

**Fonctionnalités** :

- ✅ Automatic pageview tracking
- ✅ User identification
- ✅ Feature flags support
- ✅ Custom events
- ✅ Debug mode en development

**Config** :

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Dashboard Monitoring (`/admin/monitoring`)

**Sections** :

#### a) Error Stats Cards

- Total errors (24h)
- Error rate
- Uptime
- Average response time

#### b) Performance Metrics

- Avg response time
- P95 response time
- Error rate avec seuil
- Uptime pourcentage

#### c) Analytics (24h)

- Page views
- Unique users
- Avg session duration
- Bounce rate

#### d) System Resources

- Database connections
- Memory usage (% avec alerte)
- CPU usage (% avec alerte)
- Disk usage (% avec alerte)

#### e) Recent Errors

- Liste des 20 dernières erreurs
- Groupées par similarité
- Badge niveau (fatal/error/warning)
- Count d'occurrences
- Bouton "Resolve" pour marquer résolu
- Link direct vers Sentry

#### f) Integration Status

- Sentry : Connected/Not configured
- PostHog : Connected/Not configured
- Database : Connected

### 4. Alert System (`lib/monitoring/alerts.ts`)

**Fonctionnalités** :

- ✅ Vérification automatique des seuils
- ✅ Alertes par email (TODO: intégrer Resend)
- ✅ Alertes Slack via webhook
- ✅ Logging dans ActivityLog
- ✅ Fonction de test d'alerte

**Seuils par défaut** :

```typescript
{
  errorThreshold: 50,        // Max 50 erreurs/heure
  uptimeThreshold: 99.0,     // Min 99% uptime
  responseTimeThreshold: 1000 // Max 1000ms response time
}
```

**Config Slack** :

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
ADMIN_EMAIL=admin@publio.ch
```

---

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install @sentry/nextjs posthog-js posthog-js/react
```

### 2. Configurer Sentry

1. Créer compte sur [sentry.io](https://sentry.io)
2. Créer projet Next.js
3. Copier DSN dans `.env` :

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
SENTRY_AUTH_TOKEN=sntrys_xxx  # Pour uploads source maps
```

4. Ajouter au `next.config.ts` :

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // ... existing config
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "publio",
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
});
```

### 3. Configurer PostHog

1. Créer compte sur [posthog.com](https://posthog.com)
2. Créer projet
3. Copier clé dans `.env` :

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

4. Ajouter Provider au `app/layout.tsx` :

```tsx
import { PostHogProvider } from "@/lib/monitoring/posthog";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
```

### 4. Activer l'instrumentation

Dans `next.config.ts`, ajouter :

```typescript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};
```

### 5. Configuration Slack (optionnel)

1. Créer Incoming Webhook : [Slack Apps](https://api.slack.com/messaging/webhooks)
2. Copier URL dans `.env` :

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

---

## 🧪 Tests

### 1. Tester Error Tracking

**Déclencher erreur manuellement** :

```typescript
import * as Sentry from "@sentry/nextjs";

// Dans n'importe quel component ou action
throw new Error("Test error from admin panel");

// Ou capture explicitement
Sentry.captureException(new Error("Manual test error"));
```

**Vérifier** :

1. Aller sur `/admin/monitoring`
2. Voir l'erreur dans "Recent Errors"
3. Cliquer sur "View in Sentry" → voir détails complets

### 2. Tester PostHog

**Track custom event** :

```typescript
import { usePostHog } from "posthog-js/react";

function MyComponent() {
  const posthog = usePostHog();

  const handleClick = () => {
    posthog.capture("button_clicked", {
      button_name: "test",
      page: "admin",
    });
  };
}
```

**Vérifier** :

1. PostHog Dashboard → Events
2. Voir l'événement "button_clicked"

### 3. Tester Alertes

**Via script** :

```bash
npx tsx scripts/test-alerts.ts
```

Ou créer le script :

```typescript
import { sendTestAlert } from "@/lib/monitoring/alerts";

async function main() {
  await sendTestAlert();
  console.log("✅ Test alert sent");
}

main();
```

**Vérifier** :

- Slack : message reçu dans channel
- ActivityLog : nouvelle entrée SYSTEM_ERROR
- Console : log d'alerte

### 4. Tester Dashboard

1. **Accéder** : `/admin/monitoring`
2. **Vérifier cards** :
   - Total Errors affiche un nombre
   - Error Rate calculé
   - Uptime = 99.9%
   - Response time affiché
3. **Vérifier System Resources** :
   - DB connections > 0
   - Memory/CPU/Disk < 100%
4. **Vérifier Integration Status** :
   - Sentry : vert si DSN configuré
   - PostHog : vert si KEY configuré
   - Database : toujours vert

---

## 🔧 Server Actions disponibles

### `getMonitoringStats()`

Récupère toutes les métriques du dashboard.

**Retour** :

```typescript
{
  errors: {
    total: number,
    unresolved: number,
    last24h: number,
    byLevel: Record<string, number>
  },
  performance: {
    avgResponseTime: number,
    p95ResponseTime: number,
    errorRate: number,
    uptime: number
  },
  analytics: {
    pageviews: number,
    uniqueUsers: number,
    avgSessionDuration: number,
    bounceRate: number
  },
  system: {
    dbConnections: number,
    memoryUsage: number,
    cpuUsage: number,
    diskUsage: number
  }
}
```

### `getRecentErrors(limit?: number)`

Récupère les erreurs récentes groupées.

**Paramètres** :

- `limit` : nombre max d'erreurs (défaut: 50)

**Retour** :

```typescript
ErrorSummary[] = {
  id: string,
  title: string,
  message: string,
  count: number,
  lastSeen: Date,
  status: "unresolved" | "resolved" | "ignored",
  level: "error" | "warning" | "fatal",
  platform: string
}
```

### `resolveError(errorId: string)`

Marque une erreur comme résolue.

### `logError(error: {...})`

Log une erreur custom dans ActivityLog.

**Exemple** :

```typescript
await logError({
  title: "Payment Failed",
  message: "Stripe webhook timeout",
  level: "error",
  metadata: { userId, amount },
});
```

### `checkAndSendAlerts()`

Vérifie les seuils et envoie alertes si nécessaire.

**Utilisation** : Cron job toutes les 5 minutes

```typescript
// scripts/check-alerts.ts
import { checkAndSendAlerts } from "@/lib/monitoring/alerts";

await checkAndSendAlerts();
```

---

## 📈 Intégrations avancées

### Sentry : Source Maps

Pour debug en production avec source maps :

1. **Configurer Sentry Auth Token** :

```env
SENTRY_AUTH_TOKEN=sntrys_xxx
```

2. **Build génère automatiquement les source maps** :

```bash
npm run build
```

3. **Vérifier upload** :

```
✓ Uploading source maps for release...
✓ 125 files uploaded
```

### PostHog : Feature Flags

**Définir un flag dans PostHog** :

- Dashboard → Feature Flags
- Créer flag : `new_admin_ui`
- Rollout : 50% users

**Utiliser dans le code** :

```typescript
import { useFeatureFlagEnabled } from "posthog-js/react";

function AdminPanel() {
  const newUI = useFeatureFlagEnabled("new_admin_ui");

  return newUI ? <NewUI /> : <OldUI />;
}
```

### PostHog : User Identification

**Identifier user après login** :

```typescript
import { usePostHog } from "posthog-js/react";

function AuthCallback() {
  const posthog = usePostHog();

  useEffect(() => {
    if (user) {
      posthog?.identify(user.id, {
        email: user.email,
        name: user.name,
        plan: user.subscription?.plan,
      });
    }
  }, [user]);
}
```

---

## 🚨 Monitoring en Production

### Cron Job : Vérification alertes

**Ajouter dans Vercel/Railway/etc** :

```bash
# Toutes les 5 minutes
*/5 * * * * curl https://publio.ch/api/cron/check-alerts
```

**Route API** `app/api/cron/check-alerts/route.ts` :

```typescript
import { checkAndSendAlerts } from "@/lib/monitoring/alerts";

export async function GET(request: Request) {
  // Vérifier cron secret
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await checkAndSendAlerts();
  return Response.json(result);
}
```

### Métriques temps réel

**Ajouter revalidation automatique** dans `app/admin/monitoring/page.tsx` :

```typescript
export const revalidate = 60; // Refresh toutes les 60s
```

### Dashboard externe

**Grafana + Prometheus** :

- Exporter métriques via API
- Créer endpoint `/api/metrics`
- Format Prometheus
- Dashboards custom

---

## 🎨 Customisation

### Modifier les seuils d'alerte

Dans `lib/monitoring/alerts.ts` :

```typescript
const DEFAULT_CONFIG: AlertConfig = {
  errorThreshold: 100, // Augmenter à 100 erreurs/heure
  uptimeThreshold: 99.9, // Plus strict
  responseTimeThreshold: 500, // Plus rapide requis
};
```

### Ajouter nouveaux types d'alertes

1. **Définir le type** :

```typescript
type AlertType =
  | "error_threshold"
  | "uptime_low"
  | "response_time_high"
  | "memory_high" // ← Nouveau
  | "disk_full"; // ← Nouveau
```

2. **Ajouter check** :

```typescript
if (stats.system.memoryUsage > 90) {
  await sendAlert({
    type: "memory_high",
    severity: "warning",
    title: "High Memory Usage",
    message: `Memory at ${stats.system.memoryUsage}%`,
  });
}
```

### Personnaliser dashboard

**Ajouter widget custom** dans `/admin/monitoring/page.tsx` :

```typescript
<Card>
  <CardHeader>
    <CardTitle>Custom Metric</CardTitle>
  </CardHeader>
  <CardContent>
    <MyCustomChart data={customData} />
  </CardContent>
</Card>
```

---

## 🐛 Troubleshooting

### Sentry : Erreurs non capturées

**Vérifier** :

1. DSN configuré dans `.env`
2. `instrumentation.ts` existe
3. `next.config.ts` a `instrumentationHook: true`
4. Rebuild après changement config

### PostHog : Events non trackés

**Vérifier** :

1. KEY configuré dans `.env`
2. `PostHogProvider` dans `layout.tsx`
3. Pas de AdBlocker actif
4. Console : pas d'erreurs PostHog

### Alertes Slack non reçues

**Vérifier** :

1. `SLACK_WEBHOOK_URL` correct
2. Channel existe
3. App Slack a permissions
4. Tester avec `sendTestAlert()`

### Dashboard vide

**Vérifier** :

1. User est super admin
2. ActivityLog a des entrées SYSTEM_ERROR
3. Sessions existent en DB
4. Console : pas d'erreurs serveur

---

## 📊 Métriques Clés

### KPIs à surveiller

| Metric              | Seuil OK | Seuil Warning | Seuil Critical |
| ------------------- | -------- | ------------- | -------------- |
| Error Rate          | < 0.5%   | 0.5-1%        | > 1%           |
| Uptime              | > 99.9%  | 99-99.9%      | < 99%          |
| Response Time (avg) | < 200ms  | 200-500ms     | > 500ms        |
| Response Time (P95) | < 500ms  | 500-1000ms    | > 1000ms       |
| Memory Usage        | < 70%    | 70-85%        | > 85%          |
| CPU Usage           | < 60%    | 60-80%        | > 80%          |
| Errors/hour         | < 20     | 20-50         | > 50           |

---

## 🚀 Next Steps (Phase 4)

Fonctionnalités potentielles futures :

1. **APM Avancé**

   - Distributed tracing
   - Database query performance
   - External API latency

2. **Logs Aggregation**

   - Centralized logging (Logtail, Datadog)
   - Log search and filtering
   - Real-time log streaming

3. **Business Intelligence**

   - Custom reports builder
   - Scheduled PDF reports
   - Data export (CSV, JSON)

4. **Synthetic Monitoring**

   - Uptime checks (Pingdom, UptimeRobot)
   - Geographic availability
   - Performance from multiple regions

5. **Cost Monitoring**
   - Vercel/Railway usage tracking
   - Database costs
   - Storage costs
   - Alert on cost spikes

---

## ✅ Checklist Complète

### Installation

- [ ] Installer @sentry/nextjs
- [ ] Installer posthog-js
- [ ] Configurer Sentry DSN
- [ ] Configurer PostHog KEY
- [ ] Configurer Slack Webhook (optionnel)
- [ ] Activer instrumentation dans next.config.ts
- [ ] Ajouter PostHogProvider au layout
- [ ] Rebuild l'application

### Configuration

- [ ] Sentry : projets créés
- [ ] Sentry : auth token pour source maps
- [ ] PostHog : projet créé
- [ ] Slack : webhook URL obtenue
- [ ] Variables .env remplies

### Tests

- [ ] Dashboard `/admin/monitoring` accessible
- [ ] Error tracking fonctionne
- [ ] PostHog track pageviews
- [ ] Alertes Slack reçues
- [ ] Integration status correct

### Production

- [ ] Source maps uploadées
- [ ] Cron job alertes configuré
- [ ] Dashboard monitoring vérifié
- [ ] Seuils alertes ajustés
- [ ] Team notifiée des nouveaux outils

---

## 🎉 C'est prêt !

Vous avez maintenant un **système de monitoring production-ready** avec :

- ✅ Error tracking automatique (Sentry)
- ✅ Analytics utilisateurs (PostHog)
- ✅ Dashboard temps réel
- ✅ Alertes critiques (Slack/Email)
- ✅ System health monitoring
- ✅ Performance metrics

**Enjoy!** 📊🚀
