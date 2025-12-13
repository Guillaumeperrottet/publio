# 🤝 Guide de Contribution

Merci de ton intérêt pour contribuer à **Publio** ! Ce document explique comment organiser et documenter ton travail.

---

## 📁 Structure de la Documentation

Toute la documentation est organisée dans le dossier `/docs/` :

```
docs/
├── README.md                    # Index de la documentation
├── guides/                      # Guides pratiques
│   ├── GETTING_STARTED.md
│   ├── TESTING_GUIDE.md
│   └── ...
├── features/                    # Documentation des fonctionnalités
│   ├── BILLING_SYSTEM.md
│   ├── VEILLE_MODULE_DOCUMENTATION.md
│   └── ...
├── architecture/                # Architecture technique
│   ├── MOBILE_ARCHITECTURE.md
│   └── SCHEMA_CHANGES.md
└── deployment/                  # Déploiement
    ├── DEPLOYMENT_GUIDE.md
    └── CRON_JOBS_SETUP.md
```

---

## 📝 Convention de Nommage des Fichiers

### Fichiers Markdown

- **UPPERCASE_SNAKE_CASE.md** pour la documentation
- Exemples : `BILLING_SYSTEM.md`, `MOBILE_ARCHITECTURE.md`

### Code

- **kebab-case** pour les fichiers/dossiers
- **PascalCase** pour les composants React
- **camelCase** pour les fonctions et variables

---

## 🔄 Workflow Git

### Branches

```
main                    # Production
├── feature/nom        # Nouvelles fonctionnalités
├── fix/nom            # Corrections de bugs
└── docs/nom           # Modifications de documentation
```

### Commits (Conventional Commits)

```bash
feat: ajouter le module de veille
fix: corriger le bug de déconnexion mobile
docs: mettre à jour la documentation de billing
refactor: restructurer les composants de layout
style: améliorer le responsive du header
test: ajouter tests pour les offres
chore: mettre à jour les dépendances
```

---

## 📚 Documenter une Nouvelle Fonctionnalité

Lorsque tu ajoutes une feature, crée un fichier dans le bon dossier :

```bash
# Nouvelle fonctionnalité
docs/features/MA_NOUVELLE_FEATURE.md

# Nouveau guide
docs/guides/GUIDE_POUR_X.md

# Changement architectural
docs/architecture/NOUVELLE_ARCHITECTURE.md
```

### Template de Documentation

```markdown
# 🎯 Nom de la Fonctionnalité

**Date:** [Date]
**Statut:** ✅ Implémenté / 🚧 En cours / 📋 Planifié

---

## 📋 Résumé

Description courte de la fonctionnalité.

---

## 🏗️ Architecture

Explication technique.

---

## 📦 Fichiers Implémentés

- ✅ `chemin/vers/fichier.ts` - Description
- ✅ `chemin/vers/composant.tsx` - Description

---

## 🧪 Tests

Comment tester la fonctionnalité.

---

## 🚀 Déploiement

Notes spécifiques au déploiement si nécessaire.
```

---

## 🧪 Tests

Avant de commit :

```bash
# Vérifier les types TypeScript
npm run build

# Linter
npm run lint

# Tests (si configurés)
npm test
```

---

## 📊 Mettre à Jour les Résumés

Quand tu complètes une feature majeure, mets à jour :

- `docs/MVP_COMPLETION_SUMMARY.md`
- `docs/CRITICAL_FEATURES_COMPLETED.md`

---

## ✅ Checklist avant Pull Request

- [ ] Code testé manuellement
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de console.log oubliés
- [ ] Documentation créée/mise à jour
- [ ] Commit messages conventionnels
- [ ] Screenshots si changement UI
- [ ] Variables d'environnement documentées (si nouvelles)

---

## 🎨 Style Guide

### React/TypeScript

- Utiliser les Server Components par défaut
- `"use client"` uniquement si nécessaire (hooks, events)
- Préférer les fonctions asynchrones pour les data fetching
- Utiliser Zod pour la validation

### CSS/Tailwind

- Classes utilitaires Tailwind en priorité
- Composants shadcn/ui pour l'UI
- Classes custom dans `globals.css` uniquement si nécessaire
- Responsive mobile-first (`md:`, `lg:`)

---

## 🐛 Signaler un Bug

Utilise le template suivant :

```markdown
**Description**
Description claire du bug.

**Étapes pour reproduire**

1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer.

**Screenshots**
Si applicable.

**Environnement**

- OS: [macOS, Windows, Linux]
- Browser: [Chrome, Firefox, Safari]
- Version: [ex: 1.0.0]
```

---

## 📞 Questions ?

Si tu as des questions, contacte l'équipe ou consulte la documentation complète dans `/docs/`.

---

**Merci de contribuer à Publio ! 🚀**
