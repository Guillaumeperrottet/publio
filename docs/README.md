# 📚 Documentation Publio

Bienvenue dans la documentation complète de **Publio**, la plateforme SaaS d'appels d'offres pour la Suisse romande.

---

## 🚀 Démarrage Rapide

**Nouveau sur le projet ?** Commencez ici :

1. 📖 **[Guide de démarrage](./guides/GETTING_STARTED.md)** - Installation et configuration
2. ⚡ **[Commandes rapides](./guides/QUICK_COMMANDS.md)** - Commandes essentielles
3. 🧪 **[Guide de test rapide](./guides/QUICK_START_TESTING.md)** - Tester l'application

---

## 📂 Structure de la Documentation

### 🎯 [Guides](./guides/)

Documentation pratique pour les développeurs :

- **[Getting Started](./guides/GETTING_STARTED.md)** - Installation et premiers pas
- **[Quick Commands](./guides/QUICK_COMMANDS.md)** - Commandes CLI utiles
- **[Testing Guide](./guides/TESTING_GUIDE.md)** - Guide complet des tests
- **[Pre-Launch Testing](./guides/PRE_LAUNCH_TESTING_GUIDE.md)** - Checklist pré-production
- **[Lifecycle Guide](./guides/LIFECYCLE_GUIDE.md)** - Cycle de vie d'un appel d'offres
- **[Implementation Summary](./guides/IMPLEMENTATION_SUMMARY.md)** - Résumé des implémentations

---

### 🎨 [Features](./features/)

Documentation détaillée des fonctionnalités :

#### 💰 Facturation & Paiements

- **[Billing System](./features/BILLING_SYSTEM.md)** - Système de facturation Stripe
- **[Stripe Customer Portal](./features/STRIPE_CUSTOMER_PORTAL_CONFIG.md)** - Configuration du portail client
- **[Stripe Veille Setup](./features/STRIPE_VEILLE_SETUP.md)** - Abonnements veille communale

#### 📧 Emails

- **[Email System](./features/EMAIL_SYSTEM.md)** - Architecture du système d'emails
- **[Email Implementation](./features/EMAIL_IMPLEMENTATION.md)** - Implémentation des templates

#### 📄 Appels d'Offres

- **[Equity Log PDF Export](./features/EQUITY_LOG_PDF_EXPORT.md)** - Export PDF du journal d'équité
- **[Anonymity Implementation](./features/INTERNAL_NOTES_AND_ANONYMITY_IMPLEMENTATION.md)** - Système d'anonymat

#### 🔔 Veille Communale

- **[Veille Module](./features/VEILLE_MODULE_DOCUMENTATION.md)** - Documentation complète
- **[Scraping System](./features/VEILLE_SCRAPING_SYSTEM.md)** - Architecture du scraping
- **[Scraping Schedule](./features/VEILLE_SCRAPING_SCHEDULE.md)** - Planification des scrapers
- **[Veille Testing](./features/VEILLE_TESTING_GUIDE.md)** - Tests de la veille
- **[Fribourg Scraper](./features/FRIBOURG_PDF_SCRAPER.md)** - Scraper spécifique Fribourg
- **[SIMAP Documentation](./features/SIMAP_FORM_DOCUMENTATION.md)** - Documentation SIMAP

---

### 🏗️ [Architecture](./architecture/)

Documentation technique de l'architecture :

- **[Mobile Architecture](./architecture/MOBILE_ARCHITECTURE.md)** - Architecture responsive mobile
- **[Schema Changes](./architecture/SCHEMA_CHANGES.md)** - Historique des changements de schéma

---

### 🚀 [Deployment](./deployment/)

Documentation de déploiement et production :

- **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - Guide de déploiement complet
- **[Cron Jobs Setup](./deployment/CRON_JOBS_SETUP.md)** - Configuration des tâches automatiques

---

## 📊 Résumés de Projet

- **[MVP Completion Summary](./MVP_COMPLETION_SUMMARY.md)** - État d'avancement du MVP
- **[Critical Features Completed](./CRITICAL_FEATURES_COMPLETED.md)** - Fonctionnalités critiques implémentées
- **[Seeds Summary](./SEEDS_SUMMARY.md)** - Documentation des données de test

---

## 🛠️ Stack Technique

- **Framework:** Next.js 15 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Base de données:** PostgreSQL + Prisma ORM
- **Auth:** Better Auth
- **Paiements:** Stripe
- **Fichiers:** Cloudinary
- **Hébergement:** Vercel

---

## 🤝 Contribution

Ce projet suit les standards de développement moderne :

1. **Code Style:** ESLint + Prettier
2. **Commits:** Conventional Commits
3. **Branches:** Git Flow (main, develop, feature/\*)
4. **Tests:** Vitest + Testing Library

---

## 📞 Support

Pour toute question :

- 📧 Email: support@publio.ch
- 📱 Documentation: `/docs`
- 🐛 Issues: GitHub Issues

---

**Dernière mise à jour:** 13 Décembre 2025
