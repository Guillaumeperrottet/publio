# Formulaire Enrichi SIMAP - Documentation

## Vue d'ensemble

Le formulaire de création d'appel d'offres a été étendu de 5 à **7 étapes** pour respecter les exigences SIMAP (Swiss Public Procurement Platform).

## Architecture du Formulaire

### Étapes du Stepper

1. **Step 1 - Informations de base** (`step1-basic-info.tsx`)

   - Titre (min 10 caractères)
   - Résumé (max 300 caractères, avec compteur)
   - Description (min 50 caractères)

2. **Step 2 - Détails du marché** (`step2-details.tsx`)

   - Type de marché (CONSTRUCTION, ENGINEERING, ARCHITECTURE, IT_SERVICES, CONSULTING, SERVICES, SUPPLIES, MAINTENANCE, OTHER)
   - Budget indicatif (optionnel)
   - Affichage public du budget (checkbox native HTML)
   - Durée du contrat (en jours)
   - Date de début souhaitée
   - Contrat renouvelable (checkbox native HTML)
   - Date limite de soumission (datetime-local)

3. **Step 3 - Localisation** (`step3-location.tsx`)

   - Adresse complète (optionnelle)
   - Ville (requise)
   - Canton (dropdown avec 26 cantons suisses)
   - Pays (par défaut: Suisse)
   - Indication complémentaire (texte libre)

4. **Step 4 - Lots et Critères** (`step4-lots-criteria.tsx`)

   - **Lots du projet** (optionnel)
     - Numéro, titre, description, budget par lot
     - Gestion dynamique (ajout/suppression)
   - **Critères d'évaluation**
     - Nom, description, pondération (%)
     - Validation: total = 100%
     - Gestion dynamique avec IDs uniques

5. **Step 5 - Délais et Conditions** (`step5-delays-conditions.tsx`)

   - Délai pour questions (datetime-local)
   - Conditions de participation
   - Documents requis (textarea multiligne)
   - Références requises (checkbox)
   - Assurance RC obligatoire (checkbox)
   - Expérience minimale (texte libre)
   - Conditions contractuelles

6. **Step 6 - Paramètres de publication** (`step6-parameters.tsx`)

   - Type de procédure (OPEN/SELECTIVE/PRIVATE)
     - Info contextuelle selon le type
     - Seuils LMP affichés
   - Offres partielles autorisées (checkbox)
   - Visibilité (PUBLIC/PRIVATE)
   - Mode de soumission (ANONYMOUS/PUBLIC)

7. **Step 7 - Vérification finale** (`step7-review.tsx`)
   - Récapitulatif complet de toutes les informations
   - Affichage par sections avec icônes
   - Badges pour les options activées
   - Validation des critères (100%)
   - Avertissement de paiement (CHF 10.-)

## Modèle de Données

### FormData Interface

```typescript
{
  // Step 1
  title: string
  summary: string
  description: string

  // Step 2
  marketType: string
  budget: string
  showBudget: boolean
  contractDuration: string
  contractStartDate: string
  isRenewable: boolean
  deadline: string

  // Step 3
  address: string
  city: string
  canton: string
  country: string
  location: string

  // Step 4
  hasLots: boolean
  lots: Array<{
    number: number
    title: string
    description: string
    budget: string
  }>
  criteria: Array<{
    id: string
    name: string
    description: string
    weight: number
  }>

  // Step 5
  questionDeadline: string
  participationConditions: string
  requiredDocuments: string
  requiresReferences: boolean
  requiresInsurance: boolean
  minExperience: string
  contractualTerms: string

  // Step 6
  procedure: string
  allowPartialOffers: boolean
  visibility: string
  mode: string

  // Documents (existant)
  documents: Array<{...}>
}
```

## Validation par Étape

### canProceed() Logic

- **Step 1**: title ≥ 10 chars AND description ≥ 50 chars
- **Step 2**: marketType présent AND deadline présente
- **Step 3**: city AND canton présents
- **Step 4**: Si critères présents, leur somme doit = 100%
- **Step 5**: Toujours valide (champs optionnels)
- **Step 6**: procedure, visibility, mode présents
- **Step 7**: Toujours valide (révision uniquement)

## Base de Données

### Nouveaux Champs dans Tender

```prisma
model Tender {
  summary                 String?
  showBudget              Boolean @default(true)
  contractDuration        Int?
  contractStartDate       DateTime?
  isRenewable             Boolean @default(false)
  procedure               TenderProcedure @default(OPEN)
  questionDeadline        DateTime?
  address                 String?
  country                 String @default("CH")
  hasLots                 Boolean @default(false)
  allowPartialOffers      Boolean @default(true)
  participationConditions String?
  requiredDocuments       String?
  requiresReferences      Boolean @default(false)
  requiresInsurance       Boolean @default(false)
  minExperience           Int?
  contractualTerms        String?

  lots                    TenderLot[]
  criteria                TenderCriteria[]
}
```

### Nouveaux Modèles

**TenderLot**: Gestion des lots multiples

```prisma
model TenderLot {
  id          String
  number      Int
  title       String
  description String
  budget      Float?
  tenderId    String
  tender      Tender
}
```

**TenderCriteria**: Critères d'évaluation pondérés

```prisma
model TenderCriteria {
  id          String
  name        String
  description String
  weight      Int
  order       Int
  tenderId    String
  tender      Tender
}
```

**TenderProcedure**: Nouvel enum

```prisma
enum TenderProcedure {
  OPEN       // Procédure ouverte
  SELECTIVE  // Procédure sélective
  PRIVATE    // Gré à gré
}
```

## Server Actions

### createTenderWithPayment

Accepte maintenant tous les nouveaux champs:

```typescript
export async function createTenderWithPayment(data: {
  organizationId: string
  title: string
  summary?: string
  description: string
  // ... 30+ autres champs
  lots?: Array<{...}>
  criteria?: Array<{...}>
})
```

**Logique**:

1. Crée le Tender en status DRAFT
2. Crée les TenderLot (si présents)
3. Crée les TenderCriteria (si présents, avec ordre)
4. Génère la session Stripe (CHF 10.-)
5. Retourne l'URL de checkout

### Conversions de Types

- `contractDuration`: string → parseInt()
- `contractStartDate`: string → new Date()
- `minExperience`: string → parseInt()
- `questionDeadline`: string → new Date()
- `procedure`: string → TenderProcedure enum
- `criteria.order`: ajouté automatiquement (index + 1)

## UX et Design

### Checkboxes Natives

Pour éviter la dépendance à `@/components/ui/checkbox`:

```tsx
<input
  type="checkbox"
  checked={value}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    updateFormData({ field: e.target.checked })
  }
  className="w-4 h-4"
/>
```

### Icônes Lucide

- FileText: Informations générales
- Briefcase: Détails du marché
- MapPin: Localisation
- Package: Lots et critères
- Calendar: Délais
- ShieldCheck: Conditions
- Gavel: Procédure
- CheckCircle2: Vérification finale

### Couleurs Thématiques

- `artisan-yellow` (#DEAE00): Icônes principales
- Badges verts: Validation réussie (critères 100%)
- Badges bleus: Contrat renouvelable
- Badges violets: Offres partielles
- Info boxes: Blue (OPEN), Amber (SELECTIVE), Purple (PRIVATE)

## Fichiers Créés/Modifiés

### Nouveaux Fichiers

- `components/tenders/create-tender-steps/step4-lots-criteria.tsx`
- `components/tenders/create-tender-steps/step5-delays-conditions.tsx`
- `components/tenders/create-tender-steps/step6-parameters.tsx`
- `components/tenders/create-tender-steps/step7-review.tsx`

### Fichiers Modifiés

- `components/tenders/create-tender-steps/step1-basic-info.tsx` (ajout summary)
- `components/tenders/create-tender-steps/step2-details.tsx` (budget, durée, date)
- `components/tenders/create-tender-steps/step3-location.tsx` (address, country)
- `components/tenders/create-tender-stepper.tsx` (5→7 steps, formData enrichi)
- `features/tenders/payment-actions.ts` (30+ nouveaux paramètres)
- `prisma/schema.prisma` (20+ nouveaux champs, 2 nouveaux modèles)

## Tests Recommandés

1. **Navigation**: Tester le passage entre les 7 étapes
2. **Validation Step 4**: Ajouter critères, vérifier total ≠ 100% bloque
3. **Validation Step 4**: Vérifier total = 100% permet de continuer
4. **Lots**: Ajouter/supprimer plusieurs lots
5. **Review Step 7**: Vérifier que toutes les données s'affichent correctement
6. **Submission**: Créer tender complet, vérifier redirection Stripe
7. **Webhook**: Confirmer que le tender DRAFT devient PUBLISHED après paiement
8. **Database**: Vérifier que lots et critères sont bien créés avec relations

## Migration Prisma

La migration a été appliquée avec succès:

```bash
npx prisma db push
```

Aucune perte de données, tous les nouveaux champs ont des valeurs par défaut ou sont optionnels.

## Conformité SIMAP

✅ Résumé court (300 chars)
✅ Durée de contrat et date de début
✅ Gestion des lots multiples
✅ Critères d'évaluation pondérés (%)
✅ Type de procédure (OPEN/SELECTIVE/PRIVATE)
✅ Conditions de participation détaillées
✅ Documents requis listés
✅ Expérience minimale
✅ Délai pour questions
✅ Localisation précise (adresse, pays)
✅ Offres partielles autorisées

## Notes Techniques

- Les checkboxes utilisent des inputs HTML natifs (pas de dépendance shadcn)
- Les lots ont des IDs auto-générés (number 1, 2, 3...)
- Les critères ont des IDs basés sur timestamp
- L'ordre des critères est préservé (order field)
- Le paiement reste à CHF 10.- (TENDER_PUBLICATION_PRICE)
- La soumission d'offres reste gratuite
