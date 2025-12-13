# 📋 Changements du schéma Prisma - Enrichissement SIMAP

## ✅ Nouveaux champs dans le modèle `Tender`

### Informations de base

- `summary` (String?) - Résumé court 200-300 caractères
- `showBudget` (Boolean) - Afficher ou masquer le budget

### Durée et planning

- `contractDuration` (Int?) - Durée du contrat en jours
- `contractStartDate` (DateTime?) - Date de début souhaitée
- `isRenewable` (Boolean) - Contrat reconductible

### Type de procédure

- `procedure` (TenderProcedure) - OPEN / SELECTIVE / PRIVATE

### Délais

- `questionDeadline` (DateTime?) - Date limite pour questions

### Localisation complète

- `address` (String?) - Adresse exacte (optionnelle)
- `country` (String) - Pays (défaut: "CH")

### Gestion des lots

- `hasLots` (Boolean) - Appel d'offres multi-lots
- `allowPartialOffers` (Boolean) - Offres partielles autorisées

### Conditions de participation

- `participationConditions` (String?) - Conditions texte libre
- `requiredDocuments` (String?) - Liste des pièces justificatives
- `requiresReferences` (Boolean) - Références exigées
- `requiresInsurance` (Boolean) - Assurance RC pro requise
- `minExperience` (Int?) - Expérience minimale (années)

### Conditions contractuelles

- `contractualTerms` (String?) - Conditions contractuelles principales

## ✅ Nouveaux modèles

### `TenderLot`

Gestion des lots pour les appels d'offres multi-lots

- `number` - Numéro du lot
- `title` - Titre du lot
- `description` - Description
- `budget` - Budget indicatif

### `TenderCriteria`

Critères d'évaluation avec pondération

- `name` - Nom du critère
- `description` - Description
- `weight` - Pondération en %
- `order` - Ordre d'affichage

### Nouvel enum `TenderProcedure`

- OPEN - Appel d'offres ouvert à tous
- SELECTIVE - Procédure sélective / sur invitation
- PRIVATE - De gré à gré / privé

### Enrichissement `MarketType`

- Ajout de SERVICES (services généraux)

## 🚀 Commande de migration

```bash
# Générer la migration
npx prisma migrate dev --name enrich_tender_simap_fields

# Ou push direct (développement)
npx prisma db push
```

## 📝 Actions nécessaires après migration

1. ✅ Mettre à jour les actions `createTender` et `createTenderWithPayment`
2. ✅ Créer les actions pour gérer les lots et critères
3. ✅ Enrichir le stepper de création (passer de 5 à 7 étapes)
4. ✅ Mettre à jour les formulaires avec les nouveaux champs
5. ✅ Adapter l'affichage des tenders publics
