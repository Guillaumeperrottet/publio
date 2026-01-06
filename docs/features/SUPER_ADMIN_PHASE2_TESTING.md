# 🎉 Super Admin - Installation & Test des 3 Nouvelles Features

## 📦 Installation

### 1. Installer recharts (pour les graphiques)

```bash
npm install recharts
```

### 2. Créer la migration Prisma

```bash
npx prisma migrate dev --name add-super-admin-features
```

### 3. Créer votre premier super admin (si pas déjà fait)

```bash
npx tsx scripts/make-super-admin.ts votre@email.com
```

---

## 🧪 Tests des fonctionnalités

### ✅ Feature 1 : Revenue Analytics

**Accéder :**

```
http://localhost:3000/admin/revenue
```

**Vérifier :**

- [ ] Stats cards affichées (MRR, ARR, Total Revenue, etc.)
- [ ] Churn Rate calculé
- [ ] Graphique revenue des 12 mois visible
- [ ] Subscriptions by Plan affichées
- [ ] Recent invoices listées avec statuts

**Tester :**

1. Créer des subscriptions dans votre seed
2. Créer quelques invoices PAID
3. Vérifier que MRR = somme des plans actifs
4. Vérifier que le graphique affiche les bonnes données

---

### ✅ Feature 2 : User Details

**Accéder :**

```
http://localhost:3000/admin/users
→ Cliquer sur n'importe quel user
```

**Vérifier :**

- [ ] Card cliquable (cursor pointer au hover)
- [ ] Page de détails se charge
- [ ] Nom, email, création affichés
- [ ] Badge "SUPER ADMIN" si applicable
- [ ] Organizations listées avec rôles
- [ ] Recent sessions visibles
- [ ] Notifications affichées
- [ ] Bouton "Back to Users" fonctionne

**Tester :**

1. Cliquer sur un user → vérifier tous les détails
2. Cliquer sur une org → redirection vers org details
3. Tester bouton "Make Admin" / "Revoke Admin"
4. Vérifier toast notifications
5. Vérifier refresh automatique

---

### ✅ Feature 3 : Organization Details

**Accéder :**

```
http://localhost:3000/admin/organizations
→ Cliquer sur n'importe quelle org
```

**Vérifier :**

- [ ] Card cliquable
- [ ] Page de détails se charge
- [ ] Badge ACTIVE/SUSPENDED
- [ ] Contact info (email, phone, address)
- [ ] Stats cards (membres, tenders, offers)
- [ ] Current subscription avec plan
- [ ] Members listés avec rôles
- [ ] Recent tenders affichés
- [ ] Billing history visible

**Tester :**

1. Cliquer sur une org → vérifier détails
2. Cliquer sur un membre → redirection vers user
3. Voir subscription Stripe si existante
4. Voir invoices avec montants et statuts

---

### ✅ Action : Suspend Organization

**Tester :**

1. Sur page détail org → cliquer "Suspend"
2. Modal s'ouvre
3. Entrer une raison : "Test suspension"
4. Confirmer
5. **Vérifier :**

   - [ ] Toast "Organization suspended"
   - [ ] Badge devient "SUSPENDED"
   - [ ] Page refresh automatiquement
   - [ ] Champ `isActive` = false en DB

6. Cliquer "Reactivate"
7. **Vérifier :**
   - [ ] Toast "Organization reactivated"
   - [ ] Badge devient "ACTIVE"
   - [ ] Champ `isActive` = true en DB

**Impact :**

- Org suspendue → members ne peuvent plus accéder
- Vous devrez ajouter checks dans votre app

---

### ✅ Action : Add Manual Credits

**Tester :**

1. Sur page détail org → "Add Credits"
2. Modal s'ouvre
3. Entrer :
   - **Amount** : 100
   - **Reason** : "Promotional credit"
4. Confirmer
5. **Vérifier :**

   - [ ] Toast "CHF 100 credit added"
   - [ ] Dans Billing History : nouvelle ligne
   - [ ] Montant = **-100.00** (négatif)
   - [ ] Status = PAID
   - [ ] Description = "Manual credit: Promotional credit"

6. Vérifier en DB :

```sql
SELECT * FROM invoices WHERE amount < 0;
```

---

### ✅ Action : Toggle Super Admin

**Tester (sur user details) :**

1. User normal → cliquer "Make Admin"
2. Confirmation alert
3. Confirmer
4. **Vérifier :**

   - [ ] Toast "Super admin granted"
   - [ ] Badge "SUPER ADMIN" apparaît
   - [ ] Bouton devient "Revoke Admin"
   - [ ] Champ `isSuperAdmin` = true en DB

5. Cliquer "Revoke Admin"
6. **Vérifier :**
   - [ ] Toast "Super admin revoked"
   - [ ] Badge disparaît
   - [ ] Champ `isSuperAdmin` = false

---

## 🎨 Tests UI/UX

### Navigation

- [ ] Sidebar a lien "Revenue"
- [ ] Toutes les pages admin chargent
- [ ] Hover effects sur cards
- [ ] Curseur pointer sur elements cliquables
- [ ] Boutons "Back to..." fonctionnent

### Responsive

- [ ] Dashboard responsive sur mobile
- [ ] Charts adaptés à mobile
- [ ] Modals centrées
- [ ] Cards empilées sur petit écran

### Performance

- [ ] Pages de détails chargent < 1s
- [ ] Pas de flicker au hover
- [ ] Transitions smooth
- [ ] Pas de layout shift

---

## 🐛 Troubleshooting

### Erreur : "Cannot find module 'recharts'"

```bash
npm install recharts
# ou
yarn add recharts
```

### Revenue Analytics affiche 0 partout

- Vérifier que vous avez des subscriptions ACTIVE
- Vérifier que vous avez des invoices PAID
- Check les plans dans le code (lignes 103-111 de actions.ts)

### Churn Rate = 0%

- Normal si aucune subscription CANCELLED
- Créer une sub cancelled pour tester

### Graphique vide

- Besoin d'invoices avec `paidAt` des 12 derniers mois
- Vérifier que `paidAt` est bien rempli

### Credits n'apparaissent pas

- Vérifier en DB : `SELECT * FROM invoices WHERE amount < 0`
- Le montant doit être négatif
- Status doit être PAID

---

## 🔄 Seed de test

Pour tester facilement, ajoutez à votre seed :

```typescript
// Create some invoices
await prisma.invoice.createMany({
  data: [
    {
      organizationId: org.id,
      number: "INV-001",
      amount: 99,
      currency: "CHF",
      status: "PAID",
      description: "Pro Plan - January 2026",
      paidAt: new Date("2026-01-15"),
    },
    {
      organizationId: org.id,
      number: "INV-002",
      amount: 99,
      currency: "CHF",
      status: "PAID",
      description: "Pro Plan - December 2025",
      paidAt: new Date("2025-12-15"),
    },
    // Add more for past months to see graph
  ],
});

// Create active subscriptions
await prisma.subscription.create({
  data: {
    organizationId: org.id,
    plan: "PRO",
    status: "ACTIVE",
    stripeCustomerId: "cus_test123",
    currentPeriodEnd: new Date("2026-02-15"),
  },
});
```

---

## ✅ Checklist finale

- [ ] Migration créée et appliquée
- [ ] Recharts installé
- [ ] Super admin créé
- [ ] Revenue page accessible et fonctionnelle
- [ ] User details cliquables et complets
- [ ] Org details cliquables et complets
- [ ] Suspend/Reactivate fonctionne
- [ ] Add Credits fonctionne
- [ ] Toggle Super Admin fonctionne
- [ ] Toasts notifications apparaissent
- [ ] Activity logs enregistrés
- [ ] Navigation fluide
- [ ] Pas d'erreurs console

---

## 🚀 C'est prêt !

Votre super-admin est maintenant **production-ready** avec :

- 💰 Analytics financiers
- 👤 Gestion users complète
- 🏢 Gestion orgs complète
- ⚡ Actions admin puissantes

**Enjoy!** 🎉
