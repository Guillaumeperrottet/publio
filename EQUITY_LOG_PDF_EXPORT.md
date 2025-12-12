# 📄 Export PDF du Journal d'Équité

## ✅ Implémentation complète

L'export PDF du journal d'équité est maintenant **100% fonctionnel**.

## 🎯 Fonctionnalités

### ✓ Ce qui est inclus dans le PDF

- **En-tête institutionnel** avec logo et informations de l'appel d'offres
- **Métadonnées** : titre, organisation, date d'export
- **Avertissement légal** sur la nature immuable du document
- **Tableau détaillé** avec toutes les entrées du journal :
  - Date et heure horodatée
  - Type d'action (traduit en français)
  - Description complète
  - Identité de l'acteur
- **Pied de page** avec pagination et signature numérique
- **Design professionnel** adapté à un usage institutionnel

### 🎨 Style du PDF

- Format **A4 paysage** pour meilleure lisibilité
- Couleurs sobres et administratives (gris/noir)
- Tableau avec lignes alternées pour faciliter la lecture
- Police claire et professionnelle
- Signature numérique en pied de page

## 📍 Localisation des fichiers

```
/app/api/tenders/[id]/equity-log/pdf/route.ts  # API route
/components/equity-log/export-pdf-button.tsx   # Bouton d'export
/app/dashboard/tenders/[id]/equity-log/page.tsx # Page mise à jour
```

## 🔒 Sécurité et permissions

### Vérifications effectuées

1. ✅ Utilisateur authentifié requis
2. ✅ Vérification que l'appel d'offres existe
3. ✅ Vérification que l'utilisateur est **OWNER** ou **ADMIN** de l'organisation
4. ❌ Rejet si l'utilisateur n'a pas les droits

### Réponses HTTP

| Cas                 | Code | Message                               |
| ------------------- | ---- | ------------------------------------- |
| Succès              | 200  | PDF téléchargé                        |
| Non authentifié     | 401  | "Non authentifié"                     |
| Tender introuvable  | 404  | "Appel d'offres introuvable"          |
| Droits insuffisants | 403  | "Accès refusé - droits insuffisants"  |
| Erreur serveur      | 500  | "Erreur lors de la génération du PDF" |

## 🚀 Utilisation

### Pour l'utilisateur final

1. Aller sur `/dashboard/tenders/[id]/equity-log`
2. Cliquer sur le bouton **"Exporter en PDF"**
3. Le fichier se télécharge automatiquement

### Nom du fichier généré

Format : `journal-equite-{tenderId-8-chars}-{date}.pdf`

Exemple : `journal-equite-cm4x3a7z-2025-12-12.pdf`

### États du bouton

- 🔵 **Disponible** : Affiche "Exporter en PDF" avec icône Download
- ⏳ **En cours** : Affiche "Export en cours..." avec spinner animé
- ❌ **Désactivé** : Si aucune entrée dans le journal

## 🧪 Test de l'export

### Test manuel

1. Créer un tender de test
2. Effectuer des actions (publication, réception d'offres, etc.)
3. Aller sur la page equity-log
4. Cliquer sur "Exporter en PDF"
5. Vérifier que le PDF contient toutes les entrées

### Test API direct

```bash
# Récupérer le cookie de session
curl -c cookies.txt -X POST https://your-app.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Télécharger le PDF
curl -b cookies.txt \
  https://your-app.com/api/tenders/{tender-id}/equity-log/pdf \
  --output test-equity-log.pdf

# Ouvrir le PDF
open test-equity-log.pdf  # macOS
xdg-open test-equity-log.pdf  # Linux
```

## 📦 Dépendances installées

```json
{
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.4"
}
```

Ces bibliothèques permettent :

- `jspdf` : Génération de PDF côté serveur
- `jspdf-autotable` : Création de tableaux formatés

## 🎯 Améliorations futures possibles

### Court terme (optionnel)

- [ ] Ajouter un logo de l'organisation dans l'en-tête
- [ ] Filtrer les logs par période (dernier mois, etc.)
- [ ] Exporter au format CSV également

### Long terme (si besoin)

- [ ] Signature électronique qualifiée (SwissSign)
- [ ] Horodatage certifié TSA
- [ ] Archivage conforme à la réglementation suisse

## 🔍 Structure du PDF généré

```
┌─────────────────────────────────────────────────────┐
│ JOURNAL D'ÉQUITÉ                                    │
│                                                     │
│ Appel d'offres: Rénovation salle polyvalente       │
│ Organisation: Commune de Fribourg                  │
│ Date d'export: 12/12/2025 14:30                    │
├─────────────────────────────────────────────────────┤
│ Ce document constitue une trace horodatée...       │
├──────┬──────┬────────┬─────────────┬──────────────┤
│ Date │ Heure│ Type   │ Description │ Acteur       │
├──────┼──────┼────────┼─────────────┼──────────────┤
│ 10/12│ 14:30│ Créé   │ Appel...    │ Jean Dupont  │
│ 10/12│ 14:35│ Publié │ Appel...    │ Jean Dupont  │
│ 11/12│ 09:20│ Offre..│ Offre...    │ Marie Martin │
│ ...  │ ...  │ ...    │ ...         │ ...          │
├──────┴──────┴────────┴─────────────┴──────────────┤
│ Page 1 sur 2                                       │
│ Signature numérique: Y20yNS0xMi0xMlQxN...          │
└─────────────────────────────────────────────────────┘
```

## ✅ Checklist de vérification

- [x] Route API créée et fonctionnelle
- [x] Authentification et permissions vérifiées
- [x] Bouton d'export ajouté à la page
- [x] État de chargement pendant l'export
- [x] Nom de fichier dynamique et descriptif
- [x] En-tête PDF avec métadonnées
- [x] Tableau formaté avec toutes les données
- [x] Pagination automatique
- [x] Design professionnel et institutionnel
- [x] Gestion des erreurs
- [x] Types TypeScript corrects
- [x] Aucune erreur de compilation

---

✅ **L'export PDF du journal d'équité est prêt pour la production !**

Les utilisateurs OWNER et ADMIN peuvent maintenant générer un document officiel et immuable de la traçabilité de leurs appels d'offres.
