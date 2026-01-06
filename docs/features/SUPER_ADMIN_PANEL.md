# 🛡️ Super Admin Panel - Documentation

## 📋 Vue d'ensemble

Le panneau super-admin de Publio est une interface complète de gestion et monitoring inspirée des meilleures pratiques des grandes applications SaaS (Stripe, Vercel, Linear).

## 🔐 Accès

- **URL** : `/admin`
- **Requis** : Champ `isSuperAdmin = true` dans le modèle User

## 🚀 Premier setup

### 1. Migration de la base de données

```bash
npx prisma migrate dev --name add-super-admin
```

### 2. Créer votre premier super admin

```bash
npx tsx scripts/make-super-admin.ts votre@email.com
```

Le script :

- ✅ Trouve l'utilisateur par email
- ✅ Active le flag `isSuperAdmin`
- ✅ Log l'activité dans ActivityLog
- ✅ Affiche le lien d'accès

## 📊 Fonctionnalités

### 1. Dashboard Overview (`/admin`)

**Métriques en temps réel :**

- Total users
- Total organizations
- Active tenders
- Total offers
- Active users (30 derniers jours)

**System Health :**

- Database connectivity
- Response time
- Database size
- Record counts

**Recent Activity :**

- 10 derniers users créés
- 10 dernières organizations créées

---

### 2. User Management (`/admin/users`)

**Affichage :**

- Liste complète des users avec pagination
- Recherche par email/nom
- Organizations de chaque user
- Nombre de sessions
- Date de création

**Actions disponibles :**

- ✅ Promouvoir/Révoquer Super Admin
- 🔄 Filtrer et rechercher

**À venir :**

- Bloquer/Débloquer un user
- Supprimer un user (RGPD)
- Impersonation sécurisée

---

### 3. Organization Management (`/admin/organizations`)

**Affichage :**

- Liste complète des organisations
- Membres et leurs rôles
- Statistiques (tenders, offers)
- Détails d'abonnement Stripe
- Status de subscription

**Informations visibles :**

- Nombre de membres
- Nombre de tenders publiés
- Nombre d'offres déposées
- Plan actuel
- Date de renouvellement

**À venir :**

- Modifier le plan manuellement
- Ajouter des crédits
- Suspendre une organisation
- Export des données

---

### 4. Activity Logs (`/admin/activity`)

**Types d'activités trackées :**

- `USER_CREATED` - Nouvel utilisateur
- `USER_DELETED` - Suppression user
- `USER_BLOCKED` / `USER_UNBLOCKED`
- `ORGANIZATION_CREATED` / `ORGANIZATION_DELETED`
- `SUBSCRIPTION_CREATED` / `SUBSCRIPTION_CANCELLED`
- `TENDER_PUBLISHED`
- `OFFER_SUBMITTED`
- `PAYMENT_SUCCESS` / `PAYMENT_FAILED`
- `ADMIN_LOGIN` - Connexion super admin
- `IMPERSONATION_START` / `IMPERSONATION_END`
- `SYSTEM_ERROR`

**Affichage :**

- Timeline complète des événements
- Filtres par type
- Métadonnées JSON expandables
- IP address & User Agent
- User associé (si applicable)

---

### 5. System Health (`/admin/health`)

**Checks en temps réel :**

- ✅ Database connectivity
- ⚡ Response time (ms)
- 💾 Database size (MB)
- 📊 Record counts par table

**Indicateurs :**

- Status : `healthy` / `unhealthy`
- Timestamp du dernier check
- Détails d'erreur si problème

---

## 🎨 Design System

### Couleurs

- **Background** : Gradient dark (gray-900 → gray-800)
- **Cards** : gray-800 avec bordures gray-700
- **Accents** :
  - Users : Bleu
  - Organizations : Vert
  - Activity : Orange
  - Health : Rose/Rouge
  - Super Admin badge : Rouge

### Navigation

- **Sidebar fixe** à gauche (64px de largeur)
- **Icons** : lucide-react
- **Hover states** : Transitions douces
- **Badge system** : Pour status et rôles

---

## 🔒 Sécurité

### Protection des routes

Toutes les routes `/admin/*` sont protégées par :

```typescript
// Dans app/admin/layout.tsx
await requireSuperAdmin(); // Redirige vers /dashboard si non super admin
```

### Activity Logging

Chaque action sensible est loggée :

```typescript
await logActivity({
  type: "USER_DELETED",
  description: "User john@doe.com deleted by admin",
  userId: currentUser.id,
  metadata: { targetUserId: "123", reason: "GDPR request" },
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});
```

### Audit Trail

- ✅ Tous les logs sont persistés en base
- ✅ Impossible de supprimer un log
- ✅ Traçabilité complète des actions admin

---

## 🛠️ Développement

### Ajouter une nouvelle action admin

1. **Créer l'action serveur** dans `/features/admin/actions.ts` :

```typescript
export async function deleteUser(userId: string) {
  const admin = await requireSuperAdmin();

  // Effectuer l'action
  await prisma.user.delete({ where: { id: userId } });

  // Logger l'activité
  await logActivity({
    type: "USER_DELETED",
    description: `User ${userId} deleted`,
    userId: admin.id,
  });

  revalidatePath("/admin/users");
}
```

2. **Utiliser dans un composant client** :

```typescript
"use client";
import { deleteUser } from "@/features/admin/actions";

async function handleDelete(userId: string) {
  await deleteUser(userId);
  toast.success("User deleted");
}
```

---

## 📈 Analytics & Monitoring

### Métriques à surveiller

**Croissance :**

- Nouveaux users / semaine
- Nouvelles orgs / semaine
- Taux de conversion signup → org créée

**Engagement :**

- Active users (7d, 30d)
- Tenders publiés / semaine
- Offers soumises / semaine

**Santé :**

- Database response time < 100ms
- Taux d'erreurs < 1%
- Uptime > 99.9%

### Intégrations futures

**Sentry** (Error tracking) :

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error, {
  tags: { section: "admin", action: "deleteUser" },
  user: { id: admin.id, email: admin.email },
});
```

**PostHog** (Product analytics) :

```typescript
posthog.capture("admin_action", {
  action: "delete_user",
  targetUserId: userId,
});
```

---

## 🚨 Best Practices

### ✅ DO

- Toujours logger les actions sensibles
- Utiliser `requireSuperAdmin()` sur toutes les routes/actions
- Afficher des confirmations pour les actions destructives
- Garder les Activity Logs lisibles par humains
- Revalider les paths après modifications

### ❌ DON'T

- Ne jamais exposer les routes admin publiquement
- Ne pas logger de données sensibles (passwords, tokens)
- Ne pas permettre la suppression d'Activity Logs
- Ne pas oublier les revalidatePath() après mutations

---

## 🔮 Roadmap

### Phase 2 - Advanced Features

- [ ] **Impersonation** : Se connecter comme un user pour support
- [ ] **Feature Flags** : Toggle features par org
- [ ] **Email broadcasts** : Envoyer des emails groupés
- [ ] **Data exports** : Export CSV/JSON
- [ ] **Revenue analytics** : MRR, ARR, churn
- [ ] **User blocking** : Suspendre temporairement
- [ ] **RGPD tools** : Anonymisation et suppression

### Phase 3 - Integrations

- [ ] Sentry pour error tracking
- [ ] PostHog pour product analytics
- [ ] Slack notifications pour alertes
- [ ] Datadog pour infrastructure monitoring

---

## 📞 Support

Pour toute question sur le panneau super-admin :

- 📧 Email : dev@publio.ch
- 📝 Issues : GitHub repository

---

**Dernière mise à jour** : 6 janvier 2026
