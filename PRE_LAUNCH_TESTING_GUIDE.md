# 🧪 Guide de Tests - Publio MVP

Ce guide vous permet de tester manuellement toutes les fonctionnalités essentielles avant le déploiement en production.

---

## ✅ CHECKLIST PRÉ-DÉPLOIEMENT

### 🔐 Configuration

- [ ] Variables d'environnement configurées dans Vercel

  - [ ] `DATABASE_URL` (PostgreSQL production)
  - [ ] `AUTH_SECRET` (clé sécurisée générée)
  - [ ] `STRIPE_SECRET_KEY` (mode live)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (mode live)
  - [ ] `RESEND_API_KEY`
  - [ ] `CLOUDINARY_*` credentials
  - [ ] `CRON_SECRET` (pour cron jobs)
  - [ ] `NEXT_PUBLIC_APP_URL` (URL production)

- [ ] Stripe configuré en mode production

  - [ ] Webhooks configurés
  - [ ] Prix des produits créés (CHF 10.-)
  - [ ] Test d'un paiement réel (CHF 0.50)

- [ ] Base de données migrée

  ```bash
  npx prisma migrate deploy
  ```

- [ ] Cloudinary configuré
  - [ ] Dossiers créés (tenders/, offers/)
  - [ ] Limites de taille configurées

---

## 🧑‍💻 TESTS FONCTIONNELS

### 1️⃣ **Authentification & Onboarding**

#### Inscription

```
✅ Test: Créer un nouveau compte
1. Aller sur /auth/signup
2. Remplir email + mot de passe
3. Soumettre le formulaire
4. Vérifier redirection vers /onboarding

✓ Résultat attendu: Compte créé, redirection automatique
```

#### Onboarding

```
✅ Test: Créer une organisation
1. Sur /onboarding, remplir le formulaire:
   - Nom de l'organisation
   - Type (COMMUNE / ENTREPRISE / PRIVÉ)
   - Ville, Canton
2. Soumettre
3. Vérifier redirection vers /dashboard

✓ Résultat attendu: Organisation créée, utilisateur = OWNER
```

#### Connexion

```
✅ Test: Se connecter
1. Aller sur /auth/signin
2. Entrer identifiants
3. Vérifier redirection vers /dashboard

✓ Résultat attendu: Accès au dashboard
```

---

### 2️⃣ **Appels d'Offres (Créa**tion)\*\*

#### Créer un appel d'offres DRAFT

```
✅ Test: Créer un brouillon
1. Dashboard → "Créer un appel d'offre"
2. Remplir étape 1 (infos générales)
3. Cliquer "Enregistrer le brouillon"
4. Vérifier que status = DRAFT

✓ Résultat attendu: Tender sauvegardé en brouillon
```

#### Publier un appel d'offres (avec paiement Stripe)

```
✅ Test: Publier un tender
1. Créer ou éditer un brouillon
2. Compléter toutes les étapes
3. Cliquer "Publier" → Redirection Stripe
4. Payer avec carte test: 4242 4242 4242 4242
5. Vérifier redirection /payment/success
6. Vérifier que:
   - status = PUBLISHED
   - publishedAt = date actuelle
   - Visible dans /tenders (catalogue public)

✓ Résultat attendu: Tender publié et visible publiquement
```

#### Mode anonyme

```
✅ Test: Vérifier l'anonymisation
1. Créer un tender en mode ANONYMOUS
2. Publier
3. Soumettre une offre (voir section suivante)
4. Vérifier que l'identité du soumissionnaire est masquée
5. Attendre deadline
6. Cliquer "Révéler les identités"
7. Vérifier que les vrais noms apparaissent

✓ Résultat attendu: Identités masquées puis révélées
```

---

### 3️⃣ **Offres (Soumissions)**

#### Soumettre une offre

```
✅ Test: Déposer une offre
1. Se connecter avec un AUTRE compte (entreprise)
2. Aller sur /tenders
3. Cliquer sur un tender ouvert
4. Cliquer "Soumettre une offre"
5. Remplir le formulaire (prix, description, etc.)
6. Uploader des documents (PDF)
7. Cliquer "Payer et soumettre" → Stripe
8. Payer CHF 10.- avec carte test
9. Vérifier email de confirmation

✓ Résultat attendu:
- Offre soumise (status = SUBMITTED)
- Email reçu par soumissionnaire
- Email reçu par émetteur (notification)
```

#### Retirer une offre

```
✅ Test: Retirer son offre avant deadline
1. Dashboard soumissionnaire → Mes offres
2. Cliquer sur une offre SUBMITTED
3. Cliquer "Retirer mon offre"
4. Confirmer
5. Vérifier status = WITHDRAWN

✓ Résultat attendu: Offre retirée, plus visible par émetteur
```

---

### 4️⃣ **Gestion des Offres (Côté Émetteur)**

#### Voir les offres reçues

```
✅ Test: Liste des offres
1. Se connecter comme émetteur
2. Dashboard → Mes appels d'offres
3. Cliquer sur un tender avec offres
4. Vérifier la liste des offres
5. Si mode anonyme: vérifier que noms masqués

✓ Résultat attendu: Liste des offres visible
```

#### Révéler les identités

```
✅ Test: Révélation après deadline
1. Attendre que deadline soit passée
2. Cliquer "Révéler les identités"
3. Vérifier que:
   - Noms réels apparaissent
   - Logos visibles
   - Documents accessibles

✓ Résultat attendu: Identités dévoilées
```

#### Clôturer l'appel d'offres

```
✅ Test: Clôture manuelle
1. Après deadline, cliquer "Clôturer l'appel d'offres"
2. Confirmer
3. Vérifier status = CLOSED
4. Vérifier email envoyé

✓ Résultat attendu: Tender fermé
```

#### Accepter / Rejeter des offres

```
✅ Test: Accepter une offre
1. Sur une offre, cliquer "Accepter"
2. Confirmer
3. Vérifier status offre = ACCEPTED
4. Vérifier email au soumissionnaire

✅ Test: Rejeter une offre
1. Sur une offre, cliquer "Rejeter"
2. Confirmer
3. Vérifier status offre = REJECTED
4. Vérifier email au soumissionnaire

✓ Résultat attendu: Status mis à jour, emails envoyés
```

#### Attribuer le marché

```
✅ Test: Attribution finale
1. Accepter une offre
2. Cliquer "Attribuer le marché" sur cette offre
3. Confirmer
4. Vérifier que:
   - Tender status = AWARDED
   - Offre gagnante = ACCEPTED
   - Autres offres = REJECTED automatiquement
   - Emails envoyés (félicitations + notifications)

✓ Résultat attendu: Marché attribué, tous les emails envoyés
```

---

### 5️⃣ **Recherches Sauvegardées & Alertes**

#### Sauvegarder une recherche

```
✅ Test: Créer une recherche sauvegardée
1. Aller sur /tenders
2. Appliquer des filtres (canton, type, budget, etc.)
3. Cliquer "Sauvegarder cette recherche"
4. Donner un nom
5. Activer les alertes
6. Sauvegarder
7. Vérifier dans /dashboard/saved-searches

✓ Résultat attendu: Recherche sauvegardée visible
```

#### Gérer les alertes

```
✅ Test: Toggle alertes
1. Dashboard → Recherches sauvegardées
2. Désactiver les alertes sur une recherche
3. Réactiver
4. Vérifier que l'état persiste

✓ Résultat attendu: Alertes activables/désactivables
```

#### Test des alertes email

```
✅ Test: Recevoir une alerte
1. Créer une recherche avec alertes ON
2. Publier un tender qui correspond aux critères
3. Attendre le cron job (ou exécuter manuellement):
   npx tsx scripts/send-search-alerts.ts
4. Vérifier réception de l'email d'alerte

✓ Résultat attendu: Email reçu avec les nouveaux tenders
```

---

### 6️⃣ **Catalogue Public & Filtres**

#### Navigation du catalogue

```
✅ Test: Parcourir les tenders
1. Aller sur /tenders
2. Vérifier affichage des cartes
3. Tester les filtres:
   - Recherche textuelle
   - Canton / Ville
   - Type de marché
   - Budget min/max
   - Mode (classique/anonyme)
4. Vérifier pagination si > 10 tenders

✓ Résultat attendu: Filtres fonctionnels, résultats corrects
```

#### Page détail d'un tender

```
✅ Test: Voir un tender
1. Cliquer sur une carte tender
2. Vérifier affichage:
   - Titre, description
   - Budget, deadline
   - Documents téléchargeables
   - Bouton "Soumettre une offre"
3. Si connecté: vérifier bouton visible
4. Si non connecté: redirection /auth/signin

✓ Résultat attendu: Détails complets affichés
```

---

### 7️⃣ **Page Détail d'une Offre**

#### Voir le détail d'une offre

```
✅ Test: Page /dashboard/tenders/[id]/offers/[offerId]
1. Depuis la liste des offres, cliquer sur une offre
2. Vérifier affichage:
   - Prix, délais, garantie
   - Description / méthode
   - Documents joints
   - Historique (soumise → acceptée/rejetée)
   - Informations complémentaires

✓ Résultat attendu: Vue complète de l'offre
```

---

### 8️⃣ **Gestion des Collaborateurs**

#### Inviter un collaborateur

```
✅ Test: Invitation
1. Dashboard → Organisation → Collaborateurs
2. Cliquer "Inviter"
3. Entrer email + rôle (ADMIN / EDITOR / VIEWER)
4. Envoyer
5. Vérifier email d'invitation reçu
6. Cliquer sur le lien
7. Créer un compte (si nouveau)
8. Vérifier que le collaborateur apparaît dans la liste

✓ Résultat attendu: Collaborateur ajouté avec bon rôle
```

#### Permissions selon rôles

```
✅ Test: VIEWER
- Peut voir tenders / offres
- Ne peut PAS créer / modifier

✅ Test: EDITOR
- Peut créer et modifier tenders
- Peut soumettre des offres

✅ Test: ADMIN
- Peut tout faire sauf supprimer l'organisation

✅ Test: OWNER
- Accès complet y compris facturation

✓ Résultat attendu: Permissions respectées
```

---

### 9️⃣ **Cron Jobs Automatiques**

#### Fermeture automatique des tenders

```
✅ Test: Cron close-tenders
1. Créer un tender avec deadline dans le passé (modifier en DB si nécessaire)
2. Attendre 7 jours OU exécuter manuellement:
   npx tsx scripts/close-expired-tenders.ts
3. Vérifier que status passe à CLOSED
4. Vérifier email envoyé à l'émetteur

✓ Résultat attendu: Tender fermé automatiquement
```

#### Alertes de recherches sauvegardées

```
✅ Test: Cron search-alerts
1. Avoir une recherche sauvegardée avec alertes ON
2. Publier un nouveau tender correspondant
3. Exécuter:
   npx tsx scripts/send-search-alerts.ts
4. Vérifier email reçu
5. Vérifier que lastAlertSent est mis à jour

✓ Résultat attendu: Alertes envoyées, pas de spam (12h minimum)
```

---

### 🔟 **Emails**

#### Vérifier tous les emails

```
✅ Tender publié (émetteur)
✅ Nouvelle offre reçue (émetteur)
✅ Offre soumise - confirmation (soumissionnaire)
✅ Offre acceptée (soumissionnaire)
✅ Offre rejetée (soumissionnaire)
✅ Marché attribué - félicitations (gagnant)
✅ Marché attribué - notification (perdants)
✅ Tender clôturé automatiquement (émetteur)
✅ Alerte recherche sauvegardée (utilisateur)
✅ Invitation collaborateur (invité)

✓ Pour chaque email, vérifier:
- Design cohérent (couleurs Publio)
- Liens fonctionnels
- Texte clair
- Boutons CTA visibles
```

---

## 🎨 TESTS UI / UX

### Responsive Design

```
✅ Desktop (1920x1080)
✅ Tablet (768x1024)
✅ Mobile (375x667)

Vérifier sur chaque device:
- Navigation fluide
- Formulaires utilisables
- Cartes lisibles
- Boutons accessibles
```

### Performance

```
✅ Lighthouse Score:
- Performance > 80
- Accessibility > 90
- Best Practices > 90
- SEO > 85

✅ Temps de chargement:
- Page d'accueil < 2s
- Catalogue < 3s
- Dashboard < 2s
```

---

## 🔒 TESTS SÉCURITÉ

### Autorisations

```
✅ Utilisateur non connecté:
- Ne peut pas accéder aux routes /dashboard/*
- Redirigé vers /auth/signin

✅ Utilisateur sans organisation:
- Redirigé vers /onboarding
- Ne peut pas accéder au dashboard

✅ Permissions des rôles:
- VIEWER ne peut pas créer de tender
- Un utilisateur ne peut pas modifier le tender d'une autre org
- Un utilisateur ne peut pas voir les offres d'un tender qui n'est pas le sien
```

### Validation des données

```
✅ Formulaires:
- Champs requis validés côté serveur
- Formats email validés
- Prix minimum (> 0)
- Dates cohérentes (deadline > now)

✅ Uploads:
- Taille max respectée (10MB)
- Types de fichiers validés (PDF, images)
- Pas d'injection de code
```

---

## 📊 TESTS DE CHARGE (Optionnel pré-MVP)

```bash
# Avec k6 ou Artillery
✅ 10 utilisateurs simultanés sur /tenders
✅ 5 créations de tenders/min
✅ 20 soumissions d'offres/min

✓ Résultat attendu: Pas de crash, temps de réponse < 3s
```

---

## 🚀 CHECKLIST FINALE

### Avant le déploiement

- [ ] Tous les tests fonctionnels passent
- [ ] Pas d'erreurs en console (navigateur)
- [ ] Pas d'erreurs en logs (Vercel)
- [ ] Variables d'environnement vérifiées
- [ ] Stripe en mode live configuré
- [ ] Base de données production migrée
- [ ] Cloudinary configuré
- [ ] Cron jobs activés dans Vercel
- [ ] SEO de base configuré (meta tags, sitemap)
- [ ] Analytics configurés (Google Analytics, Plausible, etc.)

### Post-déploiement

- [ ] Test du flow complet en production
- [ ] Vérifier logs Vercel (pas d'erreurs)
- [ ] Tester paiement réel avec carte personnelle (CHF 0.50)
- [ ] Vérifier emails reçus (vrai inbox)
- [ ] Monitoring activé (Sentry, LogRocket, etc.)

---

## 🐛 DEBUGGING

### Logs utiles

```bash
# Vercel logs
vercel logs --follow

# Base de données
npx prisma studio

# Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Problèmes courants

**❌ Emails non envoyés:**

- Vérifier `RESEND_API_KEY`
- Vérifier domaine vérifié dans Resend
- Check logs Resend dashboard

**❌ Paiements Stripe échouent:**

- Vérifier webhooks configurés
- Vérifier clés API (live vs test)
- Check Stripe dashboard

**❌ Cron jobs ne s'exécutent pas:**

- Vérifier `CRON_SECRET` configuré
- Check Vercel cron logs
- Tester manuellement avec curl

---

## ✅ VALIDATION FINALE

Une fois tous les tests passés :

🎉 **Votre application est prête pour le lancement MVP !**

Prochaine étape : Marketing, acquisition des premiers utilisateurs, et itérations basées sur les retours.

---

**Bon courage et bon lancement ! 🚀**
