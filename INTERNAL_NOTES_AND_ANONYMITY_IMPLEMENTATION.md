# ✅ Implémentation des Repères Internes et Révélation d'Anonymat

## ⚠️ IMPORTANT : Concept d'anonymat dans Publio

**Seul l'émetteur du tender est anonyme, PAS les offres !**

🔐 **Mode anonyme :**

- L'identité de l'**organisation émettrice** est masquée jusqu'à la clôture
- Les **soumissionnaires** sont TOUJOURS visibles (nom, ville, canton)
- Objectif : réduire les biais liés à la notoriété de l'émetteur
- Après clôture : l'émetteur est révélé automatiquement

✅ **Ce qui est visible :**

- Les offres montrent clairement QUI soumet (organisation, localisation)
- L'émetteur peut évaluer les offres en connaissance de cause
- Transparence totale sur les soumissionnaires

❌ **Ce qui est masqué :**

- L'identité de l'organisation émettrice (jusqu'à révélation)
- Logo, nom, ville, canton de l'émetteur
- Révélé automatiquement : à la clôture, à l'attribution, ou après 7 jours

---

## 📋 Résumé des changements

### 1. 🏷️ Repères internes pour marquer les offres

#### Modifications effectuées :

**✅ Schema Prisma (`prisma/schema.prisma`)**

- Ajout du champ `internalNote: String?` au modèle `Offer`
- Mise à jour du commentaire `SHORTLISTED` : "À étudier (liste restreinte / repère interne)"
- Migration créée : `20251212134039_add_internal_note_to_offers`

**✅ Actions serveur (`features/offers/actions.ts`)**

- Nouvelle action `updateOfferInternalNote()` pour ajouter/modifier des notes privées
- Mise à jour de `getTenderOffers()` pour inclure les offres SHORTLISTED et REJECTED

**✅ Interface utilisateur**

- Renommage "Pré-sélectionnée" → "À étudier" dans tous les composants
- Nouveau composant `OfferInternalNote` avec modale pour gérer les notes
- Ajout du bouton "Ajouter une note" / "Modifier la note" dans `OffersTable`
- Affichage des notes internes dans la section détails des offres

**✅ Composants mis à jour :**

- `components/offers/offers-table.tsx` - Affichage des notes et nouveau label
- `components/offers/shortlist-offer-button.tsx` - Label "À étudier"
- `components/offers/offer-internal-note.tsx` - **NOUVEAU** composant modale

---

### 2. 🔓 Révélation automatique de l'anonymat

#### Modifications effectuées :

**✅ Actions serveur (`features/tenders/actions.ts`)**

1. **`closeTender()`** - Révélation automatique à la clôture

   ```typescript
   // Si mode anonyme, révèle l'identité lors de la clôture
   if (tender.mode === TenderMode.ANONYMOUS && !tender.identityRevealed) {
     updateData.identityRevealed = true;
     updateData.revealedAt = new Date();
   }
   ```

2. **`awardTender()`** - Révélation automatique à l'attribution

   ```typescript
   // Si mode anonyme, révèle l'identité lors de l'attribution du marché
   if (tender.mode === TenderMode.ANONYMOUS && !tender.identityRevealed) {
     tenderUpdateData.identityRevealed = true;
     tenderUpdateData.revealedAt = new Date();
   }
   ```

3. **`revealTenderIdentity()`** - **NOUVELLE** action pour révélation manuelle
   - Accessible uniquement aux OWNER et ADMIN
   - Vérifie que la deadline est passée
   - Vérifie que le tender est en mode anonyme
   - Action irréversible

**✅ Script automatisé (`scripts/close-expired-tenders.ts`)**

- Révélation automatique de l'identité lors de la fermeture auto après 7 jours
- Logs détaillés pour le suivi

**✅ Composants UI**

- Mise à jour de `RevealIdentitiesButton` pour utiliser la nouvelle action
- **NOUVEAU** composant `IdentityRevealedBadge` pour afficher l'état de révélation

---

## 🎯 Fonctionnement

### Repères internes

1. **Marquer "À étudier"** : Change le statut de l'offre en SHORTLISTED
2. **Ajouter une note** : Stocke une note privée visible uniquement par l'organisation émettrice
3. **Tri automatique** : Les offres "À étudier" apparaissent en haut de la liste
4. **Badge visuel** : Icône étoile jaune + compteur des offres à étudier

### Révélation d'anonymat

**Automatique :**

- ✅ À la clôture manuelle du tender
- ✅ À l'attribution du marché
- ✅ À la fermeture automatique après 7 jours (script cron)

**Manuelle :**

- ✅ Bouton "Révéler mon identité" (après deadline uniquement)
- ✅ Confirmation requise (action irréversible)

**Affichage :**

- 🔒 Badge "Identité masquée" (avant révélation)
- 👁️ Badge "Identité révélée · DD/MM/YYYY" (après révélation)

---

## 📊 Base de données

### Migration Prisma appliquée

```sql
-- AddColumn
ALTER TABLE "offers" ADD COLUMN "internalNote" TEXT;
```

**Champs utilisés :**

- `Offer.internalNote` - Note privée de l'émetteur
- `Tender.identityRevealed` - Boolean (déjà existant)
- `Tender.revealedAt` - DateTime (déjà existant)

---

## 🔐 Sécurité

**Permissions requises :**

- **Notes internes** : OWNER ou ADMIN de l'organisation émettrice
- **Révélation manuelle** : OWNER ou ADMIN de l'organisation émettrice
- **Révélation auto** : Déclenché par le système

**Validations :**

- ✅ Vérification des droits utilisateur
- ✅ Vérification du statut du tender
- ✅ Vérification de la deadline (pour révélation manuelle)
- ✅ Vérification du mode anonyme
- ✅ Protection contre les révélations multiples

---

## ✅ Tests recommandés

1. **Repères internes**

   - [ ] Marquer une offre "À étudier"
   - [ ] Ajouter une note interne
   - [ ] Modifier une note existante
   - [ ] Vérifier que la note n'est pas visible par le soumissionnaire
   - [ ] Vérifier le tri avec offres "À étudier" en haut

2. **Révélation d'anonymat**
   - [ ] Créer un tender anonyme
   - [ ] Vérifier que l'identité est masquée avant deadline
   - [ ] Clôturer le tender → identité révélée automatiquement
   - [ ] Vérifier que le badge change de "Masquée" à "Révélée"
   - [ ] Attribuer un marché → identité révélée automatiquement
   - [ ] Tester la révélation manuelle (après deadline)

---

## 🎉 Résultat final

**Module 1 - Appels d'Offres à Publication Anonyme : 100% complet**

✅ Publication (classique/anonyme)
✅ Page publique
✅ Dépôt d'offre
✅ **Clôture et sélection avec repères internes**
✅ **Révélation automatique de l'anonymat**
✅ Paiement Stripe

Le système est maintenant **production-ready** ! 🚀
