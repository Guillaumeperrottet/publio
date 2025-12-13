# 🚀 Démarrage Rapide - Tests & Développement

## Installation initiale

```bash
# 1. Installer les dépendances
npm install

# 2. Installer bcryptjs pour les seeds
npm install bcryptjs
npm install -D @types/bcryptjs

# 3. Configurer la base de données
cp .env.example .env
# Éditer .env avec vos variables

# 4. Créer la base de données
npx prisma db push

# 5. Seed les données de test
npm run db:seed
```

## 🎯 Commandes utiles

### Base de données

```bash
# Seed uniquement (ajouter des données)
npm run db:seed

# Reset + Seed (supprime tout et recrée)
npm run db:reset

# Ouvrir Prisma Studio (interface visuelle)
npm run db:studio

# Voir les migrations
npx prisma migrate status

# Appliquer les migrations
npx prisma migrate deploy
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev

# Lancer en production locale
npm run build
npm start

# Lint
npm run lint
```

### Scripts manuels

```bash
# Tester le scraping veille
npx tsx scripts/scrape-publications.ts

# Tester la clôture automatique
npx tsx scripts/close-expired-tenders.ts

# Tester les alertes de recherches
npx tsx scripts/send-search-alerts.ts

# Tester les alertes veille
npx tsx scripts/send-veille-alerts.ts

# Debug tenders
npx tsx scripts/debug-tenders.ts

# Debug veille
npx tsx scripts/debug-veille-db.ts
```

## 👥 Comptes de test

Après avoir exécuté `npm run db:seed`, vous avez accès à ces comptes :

| Type       | Email                             | Mot de passe  | Organisation         |
| ---------- | --------------------------------- | ------------- | -------------------- |
| Commune    | `commune.fribourg@test.ch`        | `password123` | Ville de Fribourg    |
| Entreprise | `entreprise.construction@test.ch` | `password123` | Construction Pro SA  |
| Architecte | `architecte.lausanne@test.ch`     | `password123` | Architectes Associés |
| Ingénieur  | `bureau.ingenieur@test.ch`        | `password123` | Bureau Ingénieurs    |

## 🧪 Scénarios de test rapides

### Test 1 : Voir les appels d'offres (2 min)

```bash
1. Connexion : commune.fribourg@test.ch / password123
2. Dashboard → "Mes appels d'offres"
3. Voir 4 tenders (1 draft, 2 publiés, 1 clôturé)
```

### Test 2 : Soumettre une offre (5 min)

```bash
1. Connexion : entreprise.construction@test.ch / password123
2. Menu → "Appels d'offres"
3. Cliquer sur "Rénovation salle polyvalente"
4. "Soumettre une offre"
5. Remplir le formulaire
6. Payer avec carte test : 4242 4242 4242 4242
7. Vérifier l'email de confirmation
```

### Test 3 : Consulter les offres (3 min)

```bash
1. Connexion : commune.fribourg@test.ch / password123
2. Cliquer sur "Parking souterrain" (CLOSED)
3. Onglet "Offres reçues"
4. Voir 2 offres (1 acceptée, 1 rejetée)
5. Onglet "Journal d'équité"
6. "Exporter en PDF"
```

### Test 4 : Module Veille (5 min)

```bash
1. Connexion : commune.fribourg@test.ch / password123
2. Dashboard → "Veille communale"
3. Voir 3 publications de test
4. "Paramètres de veille" → Sélectionner communes
```

## 🎨 Paiements Stripe (Mode Test)

### Cartes de test

| Carte                 | Résultat             |
| --------------------- | -------------------- |
| `4242 4242 4242 4242` | ✅ Paiement réussi   |
| `4000 0000 0000 0002` | ❌ Paiement échoué   |
| `4000 0000 0000 9995` | ❌ Solde insuffisant |

**Infos à remplir :**

- Date : n'importe quelle date future (ex: 12/28)
- CVC : n'importe quel 3 chiffres (ex: 123)
- Code postal : n'importe (ex: 1000)

## 🐛 Résolution de problèmes

### Erreur : Database connection failed

```bash
# Vérifier que PostgreSQL est lancé
# Vérifier DATABASE_URL dans .env
npx prisma db push
```

### Erreur : Prisma client not generated

```bash
npx prisma generate
```

### Seed échoue

```bash
# Reset complet
npm run db:reset
```

### Port 3000 déjà utilisé

```bash
# Tuer le processus
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
PORT=3001 npm run dev
```

## 📊 Données créées par le seed

- **4 utilisateurs** avec organisations
- **4 appels d'offres** (différents statuts)
- **5 offres** (soumises, acceptées, rejetées)
- **9 logs d'équité** (traçabilité)
- **3 recherches sauvegardées**
- **4 tenders sauvegardés**
- **3 publications veille**

## 🔄 Workflow de développement recommandé

1. **Démarrer une fonctionnalité**

   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```

2. **Développer avec hot reload**

   ```bash
   npm run dev
   # + Prisma Studio dans un autre terminal
   npm run db:studio
   ```

3. **Tester manuellement** avec les comptes de test

4. **Vérifier le build**

   ```bash
   npm run build
   ```

5. **Commit et push**
   ```bash
   git add .
   git commit -m "feat: ma nouvelle fonctionnalité"
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

## 🎯 Prochaines étapes

1. ✅ Seeds créés
2. ⏳ Tests unitaires (optionnel pour MVP)
3. ⏳ Tests E2E (optionnel pour MVP)
4. ⏳ CI/CD (après lancement)

## 📚 Documentation complète

- [TESTING.md](./TESTING.md) - Guide complet des tests
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Guide de démarrage
- [README.md](./README.md) - Documentation du projet

---

**Besoin d'aide ?** Consultez la documentation ou créez une issue sur GitHub.
