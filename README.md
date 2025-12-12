# 🌐 Publio - Plateforme SaaS pour Appels d'Offres

Publio est une application web destinée aux **communes**, **entreprises**, **architectes**, **ingénieurs**, **bureaux professionnels** et aux **privés** pour la gestion moderne et équitable des appels d'offres.

## 🎨 Stack Technique

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Base de données**: PostgreSQL + Prisma
- **Authentification**: Better Auth
- **Paiements**: Stripe
- **Fichiers**: Cloudinary
- **Hébergement**: Vercel
- **Langage**: TypeScript

## 📁 Architecture du Projet

```
publio/
├── app/                    # Pages et routes (Next.js App Router)
├── components/             # Composants UI réutilisables
│   ├── ui/                # Composants shadcn/ui
│   └── layout/            # Layout components
├── features/              # Modules métier organisés par domaine
│   ├── organizations/     # Gestion des organisations
│   ├── tenders/           # Appels d'offres
│   ├── offers/            # Offres
│   ├── auth/              # Authentification
│   └── veille/            # Veille communale
├── lib/                   # Utilitaires et configurations
│   ├── db/               # Client Prisma
│   ├── auth/             # Configuration Better Auth
│   ├── stripe/           # Configuration Stripe
│   ├── cloudinary/       # Configuration Cloudinary
│   └── utils/            # Helpers et utilitaires
├── types/                 # Types TypeScript globaux
├── prisma/                # Schéma de base de données
│   ├── schema.prisma     # Modèles de données
│   └── seed.ts           # Données de test
├── scripts/               # Scripts utilitaires
├── __tests__/             # Tests (exemples)
└── public/                # Assets statiques
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/Guillaumeperrottet/publio.git
cd publio

# 2. Installer les dépendances
npm install

# 3. Installer bcryptjs pour les seeds
npm install bcryptjs
npm install -D @types/bcryptjs

# 4. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos variables

# 5. Créer et initialiser la base de données
npx prisma db push

# 6. Seed les données de test
npm run db:seed

# 7. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🧪 Tests & Développement

### Comptes de test

Après avoir exécuté `npm run db:seed` :

| Email                             | Mot de passe  | Organisation                      |
| --------------------------------- | ------------- | --------------------------------- |
| `commune.fribourg@test.ch`        | `password123` | Ville de Fribourg (Commune)       |
| `entreprise.construction@test.ch` | `password123` | Construction Pro SA (Entreprise)  |
| `architecte.lausanne@test.ch`     | `password123` | Architectes Associés (Architecte) |
| `bureau.ingenieur@test.ch`        | `password123` | Bureau Ingénieurs (Ingénieur)     |

### Commandes utiles

```bash
# Base de données
npm run db:seed          # Ajouter des données de test
npm run db:reset         # Reset complet + seed
npm run db:studio        # Ouvrir Prisma Studio

# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm start                # Serveur de production

# Scripts
npx tsx scripts/scrape-publications.ts    # Tester scraping veille
npx tsx scripts/close-expired-tenders.ts  # Tester clôture auto
npx tsx scripts/send-search-alerts.ts     # Tester alertes recherches
```

### Documentation complète

- 📖 [QUICK_START_TESTING.md](./QUICK_START_TESTING.md) - Guide de démarrage pour les tests
- 🧪 [TESTING.md](./TESTING.md) - Guide complet des tests
- 🚀 [GETTING_STARTED.md](./GETTING_STARTED.md) - Guide de démarrage détaillé
- 📊 [PRE_LAUNCH_TESTING_GUIDE.md](./PRE_LAUNCH_TESTING_GUIDE.md) - Checklist pré-lancement

## 🎯 Fonctionnalités Principales

### Pour les Émetteurs (Communes, Organisations)

- ✅ Création d'appels d'offres (mode simple ou avancé)
- ✅ Mode anonyme pour garantir l'équité
- ✅ Gestion des offres reçues
- ✅ Journal d'équité avec export PDF
- ✅ Attribution des marchés
- ✅ Module de veille communale

### Pour les Soumissionnaires (Entreprises, Architectes)

- ✅ Recherche et filtrage d'appels d'offres
- ✅ Recherches sauvegardées avec alertes email
- ✅ Soumission d'offres
- ✅ Suivi de ses offres
- ✅ Tenders sauvegardés

### Fonctionnalités Système

- ✅ Authentification sécurisée (Better Auth)
- ✅ Paiements Stripe (CHF)
- ✅ Emails automatiques (Resend)
- ✅ Upload de fichiers (Cloudinary)
- ✅ Cron jobs automatiques (5 tâches)
- ✅ Facturation et abonnements

## 🔐 Sécurité

- Authentification Better Auth avec sessions sécurisées
- Permissions granulaires (OWNER, ADMIN, EDITOR, VIEWER)
- Mode anonyme pour l'équité des offres
- Journal d'équité immuable
- Validation des données (Zod)
- Protection CSRF
- Rate limiting (à implémenter)

## 🌍 Déploiement

### Vercel (Recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Configurer les variables d'environnement dans Vercel Dashboard
# 4. Vérifier les cron jobs (5 configurés dans vercel.json)
```

### Variables d'environnement requises

Voir `.env.example` pour la liste complète.

## 📚 Documentation Technique

- [BILLING_SYSTEM.md](./BILLING_SYSTEM.md) - Système de facturation Stripe
- [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md) - Système d'emails
- [VEILLE_MODULE_DOCUMENTATION.md](./VEILLE_MODULE_DOCUMENTATION.md) - Module de veille
- [EQUITY_LOG_PDF_EXPORT.md](./EQUITY_LOG_PDF_EXPORT.md) - Export PDF du journal
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guide de déploiement

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) (à créer).

## 📄 Licence

Voir [LICENSE](./LICENSE).

## 🆘 Support

- 📧 Email: contact@publio.ch (à configurer)
- 📖 Documentation: [GETTING_STARTED.md](./GETTING_STARTED.md)
- 🐛 Issues: [GitHub Issues](https://github.com/Guillaumeperrottet/publio/issues)

---

**Fait avec ❤️ en Suisse romande** 🇨🇭
