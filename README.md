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
└── public/                # Assets statiques
```

## 🚀 Installation

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### 1. Installer les dépendances

```bash
npm install
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
