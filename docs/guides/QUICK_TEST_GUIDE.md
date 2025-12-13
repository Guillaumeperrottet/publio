# 🧪 Guide de test rapide - Système d'anonymisation

## 🚀 Lancer les tests

```bash
# 1. Réinitialiser la base de données et créer les seeds
npm run db:reset

# 2. Démarrer l'application
npm run dev

# 3. Ouvrir Prisma Studio (optionnel)
npx prisma studio
```

---

## 🎯 Scénarios de test prioritaires

### 1️⃣ Mode ANONYMOUS - Identité masquée (Tender 1)

**Connexion** : `commune.fribourg@test.ch` / `Test1234!`

**Vérifications** :

- [ ] L'émetteur "Ville de Fribourg" est anonymisé dans la liste publique
- [ ] Les offres de "Construction Pro SA" et "Architectes Associés" montrent les noms complets
- [ ] Le bouton "Révéler les identités" n'est pas disponible (deadline future)

**URL** : `/dashboard/tenders` puis cliquer sur "Rénovation salle polyvalente"

---

### 2️⃣ Mode ANONYMOUS - Identité révélée (Tender 5)

**Connexion** : `commune.fribourg@test.ch` / `Test1234!`

**Vérifications** :

- [ ] L'émetteur "Ville de Fribourg" est maintenant visible (deadline passée)
- [ ] Badge "Identité révélée" affiché
- [ ] Les offres montrent toujours les noms des organisations
- [ ] Dans l'equity log : action "IDENTITY_REVEALED" visible

**URL** : `/dashboard/tenders` puis "Installation système vidéosurveillance"

---

### 3️⃣ Mode CLASSIC - Toujours visible (Tender 7)

**Connexion** : `commune.fribourg@test.ch` / `Test1234!`

**Vérifications** :

- [ ] L'émetteur "Ville de Fribourg" est visible dès le début
- [ ] Pas de notion d'anonymat
- [ ] Les offres montrent les organisations normalement

**URL** : `/dashboard/tenders` puis "Maintenance espaces verts"

---

### 4️⃣ Offre AWARDED - Marché attribué (Tender 6)

**Connexion** : `commune.fribourg@test.ch` / `Test1234!`

**Vérifications** :

- [ ] Statut "AWARDED" affiché
- [ ] Offre gagnante de "Construction Pro SA" mise en évidence
- [ ] Badge "Marché attribué" visible
- [ ] Equity log montre "TENDER_AWARDED"

**URL** : `/dashboard/tenders` puis "Fourniture matériel de bureau"

---

### 5️⃣ Test des rôles utilisateurs

**Connexions à tester** :

| Compte                            | Rôle   | Doit pouvoir         | Ne doit PAS pouvoir |
| --------------------------------- | ------ | -------------------- | ------------------- |
| `entreprise.construction@test.ch` | OWNER  | Tout faire           | -                   |
| `admin.construction@test.ch`      | ADMIN  | Créer tenders/offres | Gérer facturation   |
| `editor.construction@test.ch`     | EDITOR | Créer/modifier       | Inviter membres     |
| `viewer.construction@test.ch`     | VIEWER | Voir seulement       | Créer/modifier      |

**Vérifications** :

- [ ] VIEWER ne voit pas les boutons "Créer" / "Modifier"
- [ ] EDITOR peut créer une offre
- [ ] ADMIN peut inviter un membre
- [ ] OWNER peut accéder à la facturation

---

### 6️⃣ Notes internes privées

**Connexion** : `commune.fribourg@test.ch` / `Test1234!`

**Tender** : Vidéosurveillance (Tender 5)

**Vérifications** :

- [ ] Offre SHORTLISTED a une note : "Offre intéressante, à étudier en détail"
- [ ] Offre REJECTED a une note : "Prix trop élevé par rapport au budget"
- [ ] Notes visibles uniquement par l'émetteur
- [ ] Les soumissionnaires ne voient PAS ces notes

---

### 7️⃣ Statuts d'offres variés

**Connexion** : `entreprise.construction@test.ch` / `Test1234!`

**Vérifications dans "Mes offres"** :

- [ ] DRAFT : Offre modifiable (Tender 7)
- [ ] SUBMITTED : Offre soumise (Tender 1)
- [ ] SHORTLISTED : Badge "Liste restreinte" (Tender 5)
- [ ] AWARDED : Badge "Gagnante" (Tender 6)
- [ ] REJECTED : Badge "Rejetée" (Tender 5, 6)

---

### 8️⃣ Tender CANCELLED

**Connexion** : `commune.fribourg@test.ch` / `Test1234!`

**Vérifications** :

- [ ] Statut "CANCELLED" affiché
- [ ] Raison d'annulation visible
- [ ] Impossible de soumettre des offres
- [ ] Equity log montre "TENDER_CANCELLED"

**Rechercher** : "Réfection toiture" dans la liste des tenders

---

## 📧 Tests des emails

### Vérifier les coordonnées d'organisations

**Dans Prisma Studio** :

```sql
SELECT name, email, phone, city, canton FROM "organizations"
```

**Vérifications** :

- [ ] Ville de Fribourg : `info@ville-fribourg.ch`
- [ ] Construction Pro SA : `contact@construction-pro.ch`
- [ ] Architectes Associés : `info@architectes-associes.ch`
- [ ] Bureau d'Ingénieurs : `contact@bureau-ingenieurs.ch`

---

## 🔍 Vérifications en base de données

### Equity Logs (Traçabilité)

```sql
SELECT action, description, "createdAt"
FROM "equity_logs"
WHERE "tenderId" = 'tender5_id'
ORDER BY "createdAt" ASC
```

**Attendu pour Tender 5** :

1. TENDER_CREATED
2. TENDER_PUBLISHED
3. TENDER_CLOSED
4. IDENTITY_REVEALED ⭐
5. OFFER_SHORTLISTED
6. OFFER_REJECTED

---

### Vérifier l'anonymisation

**Mode ANONYMOUS avant deadline (Tender 1)** :

```sql
SELECT id, title, mode, status, "identityRevealed", deadline
FROM tenders
WHERE id = 'tender1_id'
```

Attendu : `mode = 'ANONYMOUS'`, `identityRevealed = false`, `deadline > NOW()`

**Mode ANONYMOUS après deadline (Tender 5)** :

```sql
SELECT id, title, mode, status, "identityRevealed", "revealedAt"
FROM tenders
WHERE id = 'tender5_id'
```

Attendu : `mode = 'ANONYMOUS'`, `identityRevealed = true`, `revealedAt` défini

---

## ✅ Checklist complète

### Anonymisation

- [ ] Mode ANONYMOUS masque l'émetteur avant deadline
- [ ] Mode ANONYMOUS révèle l'émetteur après deadline
- [ ] Mode CLASSIC montre toujours l'émetteur
- [ ] Les offres montrent TOUJOURS les organisations
- [ ] Bouton "Révéler identités" visible uniquement si anonyme et deadline passée

### Lifecycle des tenders

- [ ] DRAFT non visible publiquement
- [ ] PUBLISHED accepte des offres
- [ ] CLOSED refuse nouvelles offres
- [ ] AWARDED montre l'offre gagnante
- [ ] CANCELLED affiche la raison

### Lifecycle des offres

- [ ] DRAFT modifiable
- [ ] SUBMITTED visible par émetteur
- [ ] SHORTLISTED avec note interne
- [ ] WITHDRAWN affichée comme retirée
- [ ] REJECTED avec raison
- [ ] AWARDED unique et mise en évidence

### Permissions

- [ ] OWNER : accès complet
- [ ] ADMIN : pas de facturation
- [ ] EDITOR : création/modification uniquement
- [ ] VIEWER : lecture seule

### Emails & Notifications

- [ ] Toutes les organisations ont un email
- [ ] Notifications incluent les coordonnées
- [ ] Emails respectent l'anonymat

---

## 🐛 Problèmes connus à tester

1. **Révélation automatique** : Vérifier que les identités sont révélées automatiquement après la deadline
2. **Confidentialité des notes** : S'assurer que les notes internes ne sont jamais exposées aux soumissionnaires
3. **Permissions VIEWER** : Vérifier que le VIEWER ne peut vraiment rien modifier
4. **Offre WITHDRAWN** : S'assurer qu'elle n'est plus considérée comme active

---

## 📊 Comptes de test

| Email                             | Mot de passe | Rôle   | Organisation         |
| --------------------------------- | ------------ | ------ | -------------------- |
| `commune.fribourg@test.ch`        | Test1234!    | OWNER  | Ville de Fribourg    |
| `entreprise.construction@test.ch` | Test1234!    | OWNER  | Construction Pro SA  |
| `admin.construction@test.ch`      | Test1234!    | ADMIN  | Construction Pro SA  |
| `editor.construction@test.ch`     | Test1234!    | EDITOR | Construction Pro SA  |
| `viewer.construction@test.ch`     | Test1234!    | VIEWER | Construction Pro SA  |
| `architecte.lausanne@test.ch`     | Test1234!    | OWNER  | Architectes Associés |
| `bureau.ingenieur@test.ch`        | Test1234!    | OWNER  | Bureau d'Ingénieurs  |

---

## 🎉 Résultat attendu

Après avoir suivi ce guide, vous devriez avoir validé :

✅ Le système d'anonymisation fonctionne correctement  
✅ Les identités des émetteurs sont masquées/révélées au bon moment  
✅ Les offres montrent TOUJOURS les organisations soumissionnaires  
✅ Tous les statuts de tenders et offres fonctionnent  
✅ Les permissions par rôle sont respectées  
✅ La traçabilité via equity logs est complète

**Prêt pour le lancement ! 🚀**
