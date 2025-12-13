# 🌐 Publio - Plateforme SaaS pour Appels d'Offres

Publio est une application web destinée aux **communes**, **entreprises**, **architectes**, **ingénieurs**, **bureaux professionnels** et aux **privés** pour la gestion moderne et équitable des appels d'offres.

---

## ⚡ Démarrage Rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos variables

# Base de données
npx prisma generate
npx prisma db push

# Lancer le serveur
npm run dev
```

📖 **[Documentation complète →](./docs/README.md)**

---

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

Voir le **[Guide complet de démarrage](./docs/guides/GETTING_STARTED.md)** pour l'installation détaillée.

---

## 📚 Documentation

Toute la documentation est organisée dans le dossier **[`docs/`](./docs/README.md)** :

- 🎯 **[Guides](./docs/guides/)** - Installation, tests, lifecycle
- 🎨 **[Features](./docs/features/)** - Documentation des fonctionnalités
- 🏗️ **[Architecture](./docs/architecture/)** - Architecture technique
- 🚀 **[Deployment](./docs/deployment/)** - Guides de déploiement

---

## 🏗️ Principes d'architecture

### ✅ Feature-based architecture

Chaque module métier (`/features/*`) contient ses actions, composants et types.

### ✅ Design System artisanal

- Palette jaune #DEAE00 + vert #1B4332
- Style hand-drawn subtil (Caveat font)
- Composants shadcn/ui personnalisés

### ✅ Architecture mobile-first

- Menu hamburger + bottom navigation
- Responsive sur tous les devices
- Touch-optimized

---

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

---

## 📝 Licence

Ce projet est sous licence privée. Tous droits réservés.

---

## 🤝 Contact

Pour toute question ou support :

- 📧 Email: support@publio.ch
- 🌐 Site: [publio.ch](https://publio.ch)

---

**Fait avec ❤️ en Suisse romande**
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
```
