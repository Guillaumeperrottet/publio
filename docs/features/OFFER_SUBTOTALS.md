# Sous-totaux par Catégories dans les Offres

## Fonctionnalité

Les soumissionnaires peuvent maintenant regrouper leurs lignes d'offre par **catégories** pour afficher automatiquement des **sous-totaux** dans leurs propositions.

## Comment ça marche

### 1. Ajout de catégories (optionnel)

Lors de la création d'une offre avec décomposition détaillée (Step 3 - Prix), chaque ligne de prix dispose d'un champ **"Catégorie"** :

- **Champ optionnel** : Si vous ne remplissez aucune catégorie, l'affichage reste classique
- **Regroupement automatique** : Si vous ajoutez des catégories, les lignes seront automatiquement groupées
- **Sous-totaux calculés** : Un sous-total HT est affiché pour chaque catégorie

### 2. Exemples de catégories

```
Main d'œuvre
├─ Installation électrique : 2'500 CHF HT
├─ Mise en service : 800 CHF HT
└─ Sous-total Main d'œuvre : 3'300 CHF HT

Matériaux
├─ Câbles : 450 CHF HT
├─ Boîtiers : 200 CHF HT
└─ Sous-total Matériaux : 650 CHF HT

Transport et logistique
├─ Déplacement : 150 CHF HT
├─ Manutention : 100 CHF HT
└─ Sous-total Transport et logistique : 250 CHF HT

TOTAL HT : 4'200 CHF
TVA 7.7% : 323.40 CHF
TOTAL TTC : 4'523.40 CHF
```

### 3. Exemples d'utilisation

**Construction / Rénovation :**

- Démolition
- Maçonnerie
- Électricité
- Plomberie
- Finitions

**Services IT :**

- Analyse et conception
- Développement
- Tests et déploiement
- Formation
- Support et maintenance

**Événementiel :**

- Location de matériel
- Restauration
- Animation
- Logistique
- Personnel

## Avantages

✅ **Transparence** : Structure claire et compréhensible pour l'émetteur  
✅ **Flexibilité** : Les catégories sont libres (pas de liste prédéfinie)  
✅ **Lisibilité** : Facilite la comparaison entre offres  
✅ **Optionnel** : Pas obligatoire, fonctionne avec ou sans catégories

## Technique

### Modèle de données

```prisma
model OfferLineItem {
  // ... autres champs
  category     String? // Catégorie (ex: "Main d'œuvre", "Matériaux")
  sectionOrder Int?    // Ordre d'affichage des sections
}
```

### Affichage

- **Avec catégories** : Groupement + sous-totaux affichés
- **Sans catégories** : Affichage classique ligne par ligne
- **Détection automatique** : Le système détecte si au moins une ligne a une catégorie

### Calcul des sous-totaux

```typescript
// Sous-total HT par catégorie
subtotalHT = sum(lignes de la catégorie)

// Sous-total TVA par catégorie (si affiché)
subtotalTVA = sum((priceHT * tvaRate / 100) pour chaque ligne)

// Total final (toutes catégories confondues)
TOTAL HT + TOTAL TVA = TOTAL TTC
```

## Composants

- **`groupLineItemsByCategory()`** : Fonction utilitaire pour grouper les lignes
- **`hasCategories()`** : Détecte si des catégories sont présentes
- **`LineItemsWithSubtotals`** : Composant réutilisable pour affichage en lecture seule
- **Templates d'offres** : Mis à jour pour supporter les sous-totaux

## Migration

✅ Migration créée : `20260102153703_add_categories_to_line_items`  
✅ Rétrocompatible : Les offres existantes continuent de fonctionner sans catégories  
✅ Pas d'impact : Aucune modification requise sur les offres existantes
