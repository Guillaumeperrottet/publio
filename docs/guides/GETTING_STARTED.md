# 🌐 Publio - Plateforme SaaS d'Appels d'Offres

Publio est une application web moderne destinée aux **communes**, **entreprises**, **architectes** et **privés** pour gérer des appels d'offres de manière équitable et transparente.

## 🚀 Démarrage rapide

### 1️⃣ Installation

```bash
npm install
```

### 2️⃣ Configuration de l'environnement

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Configurez vos variables d'environnement dans `.env` :

- **DATABASE_URL** : URL de votre base PostgreSQL
- **AUTH_SECRET** : Clé secrète pour l'authentification (générez-en une sécurisée)
- **STRIPE_SECRET_KEY** / **STRIPE_PUBLISHABLE_KEY** : Clés Stripe
- **CLOUDINARY\_** : Identifiants Cloudinary

### 3️⃣ Base de données

Générez le client Prisma et créez la base de données :

```bash
npx prisma generate
npx prisma db push
```

Pour ouvrir Prisma Studio (interface visuelle) :

```bash
npx prisma studio
```

### 4️⃣ Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Architecture du projet

```
/app                    # Pages Next.js (App Router)
  /api/auth/[...all]   # Routes API Better Auth
  /auth                # Pages d'authentification
  /dashboard           # Dashboard protégé
  /page.tsx            # Page d'accueil publique

/components            # Composants UI réutilisables
  /layout             # Layouts (public, auth, protected)
  /ui                 # Composants shadcn + hand-drawn

/features              # Modules métier (domain-driven design)
  /organizations      # Gestion des organisations
  /tenders            # Appels d'offres
  /offers             # Soumission d'offres
  /veille             # Veille communale

/lib                   # Utilitaires et configurations
  /auth               # Configuration Better Auth
  /db                 # Client Prisma
  /stripe             # Client Stripe
  /cloudinary         # Client Cloudinary

/prisma                # Schéma de base de données
  /schema.prisma      # Modèle de données

/types                 # Types TypeScript globaux
```

---

## 🏗️ Principes d'architecture

### ✅ Sécurité par Layout (pas de middleware)

Chaque section de l'application utilise un layout approprié :

- **PublicLayout** : Pages publiques (accueil, catalogue)
- **AuthLayout** : Pages d'authentification (signin, signup)
- **ProtectedLayout** : Pages protégées (dashboard, organisations)

La vérification de session se fait **côté serveur** dans chaque layout.

### ✅ Feature-based architecture

Chaque feature (`/features/*`) contient :

- **actions.ts** : Server Actions Next.js
- **components/** : Composants spécifiques à la feature
- **types.ts** : Types TypeScript de la feature

### ✅ Design System avec style hand-drawn

Composants UI personnalisés :

- `HandDrawnCard` : Cartes avec bordures irrégulières
- `HandDrawnBadge` : Badges avec rotation subtile
- `HandDrawnHighlight` : Surlignage jaune artisanal

Palette de couleurs :

- `#DEAE00` : Jaune artisanal (accent principal)
- `#1B4332` : Vert profond
- `#6B705C` : Olive doux
- `#F0EDE3` : Sable clair
- `#FAFAF7` : Blanc cassé
- `#0D0D0D` : Noir mat

---

## 🔑 Fonctionnalités principales

### MODULE 1 : Appels d'offres

- ✅ Création d'appels d'offres (communes, entreprises, privés)
- ✅ Paiement Stripe pour publier un appel d'offres (CHF 10.–)
- ✅ Soumission d'offres GRATUITE
- ✅ Mode anonyme avec révélation à la deadline
- ✅ Gestion des collaborateurs et rôles (OWNER, ADMIN, EDITOR, VIEWER)

### MODULE 2 : Veille communale

- 📋 Scraping des publications communales
- 📋 Alertes email pour nouvelles publications
- 📋 Suivi de communes personnalisé

---

## 🛠️ Stack technique

- **Framework** : Next.js 15 (App Router)
- **UI** : shadcn/ui + Tailwind CSS 4
- **Auth** : Better Auth (sans middleware)
- **Database** : PostgreSQL + Prisma ORM
- **Payments** : Stripe Checkout
- **Storage** : Cloudinary
- **Deployment** : Vercel

---

## 📝 Prochaines étapes

1. ✅ **Architecture de base** : structure des dossiers, layouts, composants UI
2. ⏳ **Authentification** : Finaliser Better Auth avec gestion des sessions
3. ⏳ **Organisations** : CRUD complet + invitations collaborateurs
4. ⏳ **Appels d'offres** : Création, publication, anonymisation
5. ⏳ **Offres** : Soumission avec paiement Stripe
6. ⏳ **Catalogue** : Page de recherche immoscout-style
7. ⏳ **Veille** : Module secondaire de scraping

---

## 🧑‍💻 Développement

### Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
```

### Base de données

```bash
npx prisma studio              # Interface visuelle
npx prisma generate            # Générer le client Prisma
npx prisma db push             # Pousser le schéma vers la DB
npx prisma migrate dev         # Créer une migration
```

---

## 📞 Support

Pour toute question ou suggestion, contactez l'équipe Publio.

---

**Bonne chance avec Publio ! 🎯**
