# Système de génération PDF des offres - Publio

## 📄 Vue d'ensemble

Le système de génération de PDF permet de créer des **offres professionnelles au format PDF** avec le logo Publio et les informations de l'entreprise émettrice. Ces PDF sont **indicatifs** et servent à faciliter la mise en contact entre les parties.

## 🎯 Objectif

- **Logo Publio** : Met en avant la plateforme comme facilitateur
- **Nom de l'entreprise** : Affiche clairement l'émetteur de l'offre
- **Document indicatif** : Précise que c'est un document de mise en relation
- **Professionnel** : Format structuré avec tableaux de prix, prestations, conditions

## 📦 Architecture

### 1. Service de génération (`lib/pdf/offer-generator.ts`)

Service principal utilisant **pdfmake** pour générer les PDF.

**Fonctionnalités :**

- Template professionnel avec en-tête Publio
- Coordonnées de l'entreprise émettrice
- Informations du destinataire (appel d'offres)
- Tableau détaillé des prestations et prix
- Inclusions/exclusions
- Matériaux proposés
- Conditions de paiement et garanties
- Pied de page avec mention "Document généré via Publio"

### 2. API Route (`app/api/offers/[offerId]/pdf/route.ts`)

Endpoint pour générer et télécharger le PDF d'une offre existante.

**Sécurité :**

- Vérifie l'authentification
- Contrôle les droits (émetteur de l'offre OU propriétaire du tender)
- Génère le PDF côté serveur

**Endpoint :** `GET /api/offers/[offerId]/pdf`

### 3. Composant de téléchargement (`components/offers/download-offer-pdf-button.tsx`)

Bouton réutilisable pour télécharger le PDF d'une offre.

**Utilisation :**

```tsx
<DownloadOfferPdfButton
  offerId="xxx"
  offerNumber="OFF-2024-001"
  variant="outline"
  size="sm"
/>
```

### 4. Intégration dans les interfaces

#### a) Étape de révision (`step5-review.tsx`)

- **Prévisualisation avant soumission**
- Génère un PDF temporaire côté client
- Permet de vérifier le rendu avant de soumettre l'offre

#### b) Dashboard des offres reçues (`offers-table.tsx`)

- Bouton dans le menu des actions
- Accessible pour le destinataire de l'offre

#### c) Mes offres (`my-offers-table.tsx`)

- Bouton dans le menu des actions
- Accessible pour l'émetteur de l'offre
- Désactivé pour les brouillons

## 📋 Structure du PDF

### En-tête

```
┌────────────────────────────────────────┐
│ PUBLIO (logo texte bleu)              │
│ Plateforme de mise en relation         │
│ Document indicatif                     │
│                                        │
│                    [Nom Entreprise]    │
│                    Adresse             │
│                    Contact             │
└────────────────────────────────────────┘
```

### Corps du document

1. **Informations destinataire**
2. **Référence et date de l'offre**
3. **Résumé du projet**
4. **Prestations incluses** (liste à puces)
5. **Prestations NON incluses** (liste à puces)
6. **Matériaux proposés** (détails avec garanties)
7. **Tableau de prix détaillé**
   - Prix global OU décomposition par lignes
   - Total HT, TVA, TTC
8. **Délais et planning**
9. **Conditions de paiement**
10. **Garanties**

### Pied de page

```
─────────────────────────────────────────
Document généré via Publio
Cette offre est indicative et facilitera
votre mise en relation. Une fois le marché
validé, vous êtes en contact direct avec le
prestataire.
```

## 🔄 Workflow

### 1. Création de l'offre

```
Utilisateur → Formulaire en 5 étapes → Étape 5 (Révision)
                                           ↓
                                   [Prévisualiser PDF]
                                           ↓
                                   Téléchargement PDF aperçu
```

### 2. Après soumission

```
Offre soumise → Dashboard
                    ↓
            [Télécharger PDF]
                    ↓
            API /api/offers/[id]/pdf
                    ↓
            Génération + Téléchargement
```

## 🎨 Personnalisation

### Modifier le template

Éditer `lib/pdf/offer-generator.ts` dans la fonction `generateOfferContent()`.

### Ajouter des éléments

- Logo personnalisé : Ajouter un fichier image et l'intégrer via pdfmake
- Sections supplémentaires : Ajouter du contenu dans le tableau `content`
- Styles : Modifier l'objet `styles` dans `TDocumentDefinitions`

## 🔐 Sécurité et droits

### Qui peut générer un PDF ?

1. **L'émetteur de l'offre** (l'entreprise qui a soumis)
2. **Le destinataire** (l'organisation qui a créé le tender)

### Vérifications

- Authentification requise
- Membership dans l'organisation vérifié
- Offre doit exister et être accessible

## 📝 Notes importantes

### Document indicatif

Le PDF **n'est pas un document contractuel**. Il sert uniquement à :

- Faciliter la compréhension de l'offre
- Présenter l'offre de manière professionnelle
- Mettre en contact les parties

### Après attribution

Une fois le marché validé sur Publio :

1. Les parties sont mises en contact
2. Publio n'intervient plus
3. Les parties établissent leur propre contrat

## 🚀 Améliorations futures possibles

1. **Logo personnalisé** : Permettre aux organisations d'uploader leur propre logo
2. **Templates multiples** : Différents styles selon le type de marché
3. **Signature électronique** : Intégration d'un système de signature
4. **Envoi par email** : Envoyer automatiquement le PDF par email
5. **Historique de versions** : Garder l'historique des PDF générés
6. **Multi-langue** : Support de plusieurs langues (FR, DE, IT)

## 📦 Dépendances

- `pdfmake` : Génération de PDF
- `@types/pdfmake` : Types TypeScript
- Next.js API Routes pour l'endpoint serveur

## 🔧 Maintenance

### Problèmes connus

- Les polices sont limitées aux polices standard (Helvetica)
- Images/logos nécessitent une conversion en base64

### Support

Pour toute question ou amélioration, consulter la documentation de pdfmake :
https://pdfmake.github.io/docs/
