# 🚀 Super Admin - Guide d'installation rapide

## 1️⃣ Migration de la base de données

```bash
npx prisma migrate dev --name add-super-admin
```

Cette migration ajoute :

- ✅ Champ `isSuperAdmin` au modèle User
- ✅ Modèle `ActivityLog` avec enum `ActivityType`
- ✅ Relation User → ActivityLog

## 2️⃣ Créer votre premier super admin

```bash
npx tsx scripts/make-super-admin.ts votre@email.com
```

Ou manuellement dans la DB :

```sql
UPDATE users SET "isSuperAdmin" = true WHERE email = 'votre@email.com';
```

## 3️⃣ Accéder au panneau admin

```
http://localhost:3000/admin
```

## 📋 Fonctionnalités disponibles

✅ **Dashboard** (`/admin`)

- Statistiques globales
- System health
- Recent users & orgs

✅ **Users** (`/admin/users`)

- Liste complète
- Recherche
- Promouvoir/Révoquer super admin

✅ **Organizations** (`/admin/organizations`)

- Liste avec détails
- Membres et rôles
- Subscriptions Stripe

✅ **Activity Logs** (`/admin/activity`)

- Audit trail complet
- Filtres par type
- Métadonnées JSON

✅ **System Health** (`/admin/health`)

- Database status
- Response time
- Record counts

## 🔐 Sécurité

Toutes les routes sont protégées par :

```typescript
await requireSuperAdmin(); // dans chaque page
```

Redirection automatique vers `/dashboard` si non autorisé.

## 📖 Documentation complète

Voir : `docs/features/SUPER_ADMIN_PANEL.md`

## 🎨 Design

- **Theme** : Dark mode (gray-900/800)
- **Sidebar** : Navigation fixe à gauche
- **Cards** : Hover effects et transitions
- **Badges** : Couleurs par statut/rôle

## ⚡ Actions rapides

**Promouvoir un user en super admin :**

```bash
npx tsx scripts/make-super-admin.ts user@example.com
```

**Révoquer le statut super admin :**
Via l'interface admin → Users → Click "Revoke Admin"

Ou en SQL :

```sql
UPDATE users SET "isSuperAdmin" = false WHERE email = 'user@example.com';
```

---

C'est tout ! Votre panneau super-admin est prêt. 🎉
