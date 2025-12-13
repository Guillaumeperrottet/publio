# 🌱 Couverture de test des Seeds

Ce document détaille tous les scénarios de test couverts par le fichier `prisma/seed.ts`.

## 📊 Vue d'ensemble

- **7 utilisateurs** avec authentification Better Auth
- **4 organisations** avec tous les types et rôles
- **8 appels d'offres** couvrant tous les statuts et modes
- **12 offres** testant tous les statuts possibles
- **27 logs d'équité** pour traçabilité complète

---

## 👥 Utilisateurs créés

| Email                             | Nom                 | Organisation         | Rôle   | Mot de passe |
| --------------------------------- | ------------------- | -------------------- | ------ | ------------ |
| `commune.fribourg@test.ch`        | Commune de Fribourg | Ville de Fribourg    | OWNER  | Test1234!    |
| `entreprise.construction@test.ch` | Jean Dupont         | Construction Pro SA  | OWNER  | Test1234!    |
| `admin.construction@test.ch`      | Sophie Lambert      | Construction Pro SA  | ADMIN  | Test1234!    |
| `editor.construction@test.ch`     | Thomas Müller       | Construction Pro SA  | EDITOR | Test1234!    |
| `viewer.construction@test.ch`     | Julie Moreau        | Construction Pro SA  | VIEWER | Test1234!    |
| `architecte.lausanne@test.ch`     | Marie Martin        | Architectes Associés | OWNER  | Test1234!    |
| `bureau.ingenieur@test.ch`        | Pierre Schneider    | Bureau d'Ingénieurs  | OWNER  | Test1234!    |

### ✅ Rôles testés

- **OWNER** : Créateur, gère facturation et paramètres globaux (4 users)
- **ADMIN** : Peut tout gérer sauf facturation (1 user)
- **EDITOR** : Peut créer/modifier les contenus (1 user)
- **VIEWER** : Lecture seule (1 user)

---

## 🏢 Organisations créées

| Nom                             | Type       | Canton | Email                        | Membres                              |
| ------------------------------- | ---------- | ------ | ---------------------------- | ------------------------------------ |
| Ville de Fribourg               | COMMUNE    | FR     | info@ville-fribourg.ch       | 1 OWNER                              |
| Construction Pro SA             | ENTREPRISE | VD     | contact@construction-pro.ch  | 1 OWNER, 1 ADMIN, 1 EDITOR, 1 VIEWER |
| Architectes Associés Sàrl       | ENTREPRISE | VD     | info@architectes-associes.ch | 1 OWNER                              |
| Bureau d'Ingénieurs Conseils SA | ENTREPRISE | GE     | contact@bureau-ingenieurs.ch | 1 OWNER                              |

### ✅ Types testés

- **COMMUNE** : Administration publique (1x)
- **ENTREPRISE** : Entreprises privées (3x)

---

## 📢 Appels d'offres (Tenders)

### Tender 1 : Rénovation salle polyvalente ✅ PUBLISHED + ANONYMOUS

- **Statut** : PUBLISHED
- **Mode** : ANONYMOUS (identité NON révélée)
- **Deadline** : Future (2026-01-15)
- **Offres** : 2 SUBMITTED, 1 WITHDRAWN
- **Test** : Mode anonyme actif, identités masquées

### Tender 2 : Parking souterrain ✅ CLOSED + CLASSIC

- **Statut** : CLOSED
- **Mode** : CLASSIC (identité visible dès le début)
- **Deadline** : Passée (2025-12-01)
- **Offres** : 1 ACCEPTED, 1 REJECTED
- **Test** : Mode classique avec identités toujours visibles

### Tender 3 : Aménagement paysager ✅ DRAFT

- **Statut** : DRAFT (brouillon)
- **Mode** : ANONYMOUS
- **Deadline** : Future (2026-03-01)
- **Offres** : Aucune
- **Test** : Tender non publié, invisible au public

### Tender 4 : Étude pont piétonnier ✅ PUBLISHED + ANONYMOUS

- **Statut** : PUBLISHED
- **Mode** : ANONYMOUS
- **Deadline** : Future (2026-02-10)
- **Offres** : 1 SUBMITTED
- **Test** : Mode anonyme récemment publié

### Tender 5 : Vidéosurveillance ✅ CLOSED + ANONYMOUS + REVEALED

- **Statut** : CLOSED
- **Mode** : ANONYMOUS avec **identité RÉVÉLÉE**
- **Deadline** : Passée (2025-11-30)
- **Offres** : 1 SHORTLISTED, 1 REJECTED
- **Test** : Identité révélée après deadline en mode anonyme ⭐

### Tender 6 : Fourniture matériel ✅ AWARDED + ANONYMOUS

- **Statut** : AWARDED (marché attribué)
- **Mode** : ANONYMOUS avec identité révélée
- **Deadline** : Passée (2025-10-15)
- **Offres** : 1 AWARDED, 1 REJECTED
- **Test** : Processus complet jusqu'à attribution ⭐

### Tender 7 : Maintenance espaces verts ✅ PUBLISHED + CLASSIC

- **Statut** : PUBLISHED
- **Mode** : CLASSIC
- **Deadline** : Future (2026-01-31)
- **Offres** : 1 SUBMITTED, 1 DRAFT
- **Test** : Mode classique avec offre en brouillon

### Tender 8 : Réfection toiture ✅ CANCELLED

- **Statut** : CANCELLED (annulé)
- **Mode** : ANONYMOUS
- **Deadline** : Future (2025-12-20)
- **Offres** : Aucune
- **Test** : Tender annulé après publication ⭐

---

## 💼 Offres (Offers)

### Statuts testés

| Statut          | Nombre | Description                 | Tenders associés |
| --------------- | ------ | --------------------------- | ---------------- |
| **DRAFT**       | 1      | Brouillon non soumis        | Tender 7         |
| **SUBMITTED**   | 5      | Soumise, en attente         | Tenders 1, 4, 7  |
| **SHORTLISTED** | 1      | Liste restreinte            | Tender 5         |
| **WITHDRAWN**   | 1      | Retirée par soumissionnaire | Tender 1         |
| **REJECTED**    | 3      | Rejetée par émetteur        | Tenders 2, 5, 6  |
| **AWARDED**     | 1      | Gagnante, marché attribué   | Tender 6         |

### Détails des offres

#### Offre AWARDED (gagnante) ⭐

- **Tender** : Fourniture matériel de bureau (Tender 6)
- **Organisation** : Construction Pro SA
- **Prix** : CHF 87'500
- **Statut paiement** : PAID
- **Test** : Offre payante avec paiement effectué

#### Offre SHORTLISTED ⭐

- **Tender** : Vidéosurveillance (Tender 5)
- **Organisation** : Construction Pro SA
- **Note interne** : "Offre intéressante, à étudier en détail"
- **Test** : Repère interne privé pour l'émetteur

#### Offre WITHDRAWN ⭐

- **Tender** : Rénovation salle (Tender 1)
- **Organisation** : Bureau d'Ingénieurs
- **Raison** : Conflit de planning
- **Test** : Offre retirée volontairement

#### Offres REJECTED (3x)

- Tender 2 : Prix trop élevé (CHF 3'650'000 vs gagnant 3'280'000)
- Tender 5 : Note interne "Prix trop élevé par rapport au budget"
- Tender 6 : Manque d'expérience dans le domaine

---

## 📜 Logs d'équité (Equity Logs)

27 entrées de traçabilité couvrant :

### Actions testées

- ✅ `TENDER_CREATED` : Création d'appel d'offres
- ✅ `TENDER_PUBLISHED` : Publication
- ✅ `TENDER_UPDATED` : Modification (à tester manuellement)
- ✅ `TENDER_CLOSED` : Clôture automatique
- ✅ `TENDER_AWARDED` : Attribution du marché
- ✅ `TENDER_CANCELLED` : Annulation
- ✅ `OFFER_RECEIVED` : Réception d'offre
- ✅ `OFFER_SHORTLISTED` : Mise en liste restreinte
- ✅ `OFFER_REJECTED` : Rejet d'offre
- ✅ `IDENTITY_REVEALED` : Révélation d'identité

### Logs par tender

- **Tender 1** : 5 logs (création, publication, 3 offres reçues)
- **Tender 2** : 5 logs (cycle complet jusqu'à attribution)
- **Tender 5** : 6 logs (anonyme avec révélation + tri des offres)
- **Tender 6** : 5 logs (cycle complet AWARDED)
- **Tender 8** : 3 logs (création, publication, annulation)

---

## 🎯 Scénarios de test du système d'anonymisation

### ✅ Mode ANONYMOUS - Identités masquées (Tenders 1, 4)

**Test** : Avant la deadline, les identités des émetteurs sont masquées

- Tender 1 : En cours, deadline future
- Tender 4 : Récemment publié

**Vérifications** :

- L'émetteur (Ville de Fribourg) est anonymisé
- Les offres montrent TOUJOURS les noms des organisations soumissionnaires
- Les emails de notification incluent les contacts

### ✅ Mode ANONYMOUS - Identités révélées (Tenders 5, 6)

**Test** : Après la deadline, les identités sont automatiquement révélées

- Tender 5 : `identityRevealed: true`, `revealedAt` défini
- Tender 6 : Marché attribué avec identité révélée

**Vérifications** :

- L'émetteur devient visible après deadline
- Les offres montrent toujours les organisations (pas de changement)
- Log `IDENTITY_REVEALED` créé automatiquement

### ✅ Mode CLASSIC - Identités toujours visibles (Tenders 2, 7)

**Test** : L'émetteur est visible dès la publication

- Tender 2 : Clôturé en mode classique
- Tender 7 : Publié en mode classique

**Vérifications** :

- Aucune anonymisation à aucun moment
- `identityRevealed: true` dès la création
- Offres montrent les organisations (comme en mode anonyme)

---

## 🔒 Tests de permissions par rôle

### OWNER (4 utilisateurs)

- ✅ Peut créer des tenders
- ✅ Peut créer des offres
- ✅ Peut gérer la facturation
- ✅ Peut inviter des membres
- ✅ Peut modifier tous les paramètres

### ADMIN (1 utilisateur)

- ✅ Peut créer/modifier des tenders
- ✅ Peut créer/modifier des offres
- ✅ Peut inviter des membres
- ❌ Ne peut PAS gérer la facturation

### EDITOR (1 utilisateur)

- ✅ Peut créer/modifier des tenders
- ✅ Peut créer/modifier des offres
- ❌ Ne peut PAS inviter des membres
- ❌ Ne peut PAS gérer la facturation

### VIEWER (1 utilisateur)

- ✅ Peut voir tous les tenders
- ✅ Peut voir toutes les offres
- ❌ Ne peut PAS créer/modifier
- ❌ Lecture seule uniquement

---

## 💰 Tests de paiement

### Offre payante (PAID)

- **Tender** : Fourniture matériel (Tender 6)
- **Offre** : AWARDED avec `paymentStatus: "PAID"`
- **Test** : Offre payante avec paiement effectué

### Offres gratuites (PENDING)

- Toutes les autres offres ont `paymentStatus: "PENDING"`
- Test du modèle freemium

---

## 📝 Notes internes privées

### Test de confidentialité

- **Tender 5 - Offre SHORTLISTED** : "Offre intéressante, à étudier en détail"
- **Tender 5 - Offre REJECTED** : "Prix trop élevé par rapport au budget"

**Vérifications** :

- Notes visibles uniquement par l'émetteur
- Ne pas exposer dans les APIs publiques
- Utile pour coordination interne

---

## 🚀 Commandes de test

### Réinitialiser et seeder la base

```bash
npm run db:reset     # Réinitialise la base complète
npx tsx prisma/seed.ts  # Lance le seeding
```

### Vérifier les données

```bash
npx prisma studio    # Interface visuelle
```

### Tester les scénarios

1. **Se connecter** avec `commune.fribourg@test.ch` / `Test1234!`
2. **Vérifier mode anonyme** : Tender 1 doit masquer l'émetteur
3. **Vérifier révélation** : Tender 5 doit montrer l'émetteur
4. **Tester les rôles** : Se connecter avec les différents comptes ADMIN/EDITOR/VIEWER
5. **Vérifier les offres** : Toutes doivent TOUJOURS montrer l'organisation soumissionnaire

---

## ✅ Checklist de tests

### Système d'anonymisation

- [ ] Mode ANONYMOUS masque l'émetteur avant deadline
- [ ] Mode ANONYMOUS révèle l'émetteur après deadline
- [ ] Mode CLASSIC montre toujours l'émetteur
- [ ] Les offres montrent TOUJOURS les organisations soumissionnaires
- [ ] Log `IDENTITY_REVEALED` créé automatiquement

### Statuts de tenders

- [ ] DRAFT non visible publiquement
- [ ] PUBLISHED visible et accepte des offres
- [ ] CLOSED n'accepte plus d'offres
- [ ] AWARDED avec offre gagnante identifiée
- [ ] CANCELLED avec raison d'annulation

### Statuts d'offres

- [ ] DRAFT modifiable par soumissionnaire
- [ ] SUBMITTED visible par émetteur
- [ ] SHORTLISTED avec note interne
- [ ] WITHDRAWN retirée volontairement
- [ ] REJECTED avec raison
- [ ] AWARDED unique par tender

### Permissions

- [ ] OWNER accès complet
- [ ] ADMIN sans facturation
- [ ] EDITOR création/modification uniquement
- [ ] VIEWER lecture seule

### Emails

- [ ] Organisations ont tous un email de contact
- [ ] Notifications incluent les coordonnées
- [ ] Emails respectent l'anonymat avant deadline

---

## 🎉 Conclusion

Les seeds couvrent maintenant **tous les scénarios critiques** pour tester le système d'anonymisation et les fonctionnalités principales de Publio :

✅ **Anonymisation** : Modes ANONYMOUS et CLASSIC avec révélation d'identité  
✅ **Statuts** : Tous les statuts de tenders et offres  
✅ **Rôles** : OWNER, ADMIN, EDITOR, VIEWER  
✅ **Paiements** : Offres payantes et gratuites  
✅ **Traçabilité** : 27 logs d'équité  
✅ **Contacts** : Emails d'organisations pour notifications

**Prêt pour des tests complets ! 🚀**
