# 📧 Système d'Emails - Publio

Documentation complète du système de notifications par email.

## 🏗️ Architecture

```
lib/email/
├── config.ts          # Configuration Resend + helpers (sendEmail, layouts)
├── tender-emails.ts   # Templates emails pour tenders/offers
└── index.ts           # Email invitations + exports
```

## ⚙️ Configuration

### Variables d'environnement

```env
# Requis pour envoyer des emails
RESEND_API_KEY=re_xxxxx

# Configuration optionnelle
RESEND_FROM_EMAIL="Publio <noreply@publio.ch>"
RESEND_REPLY_TO="contact@publio.ch"
NEXT_PUBLIC_APP_URL="https://publio.ch"
```

### Mode Dev vs Prod

Le système s'adapte automatiquement :

**Sans `RESEND_API_KEY` (dev local) :**

- ✅ Les actions fonctionnent normalement
- 📝 Les emails sont loggés dans la console
- ⚠️ Message : "RESEND_API_KEY non configurée - Email non envoyé"
- 🚫 Aucune erreur bloquante

**Avec `RESEND_API_KEY` (prod) :**

- ✅ Emails envoyés via Resend
- 📊 Logs de confirmation avec ID
- ❌ Erreurs loggées mais non bloquantes
- 🔄 Le flux métier continue même si email échoue

## 📨 Emails Disponibles

### Pour l'Émetteur (Donneur d'ordre)

#### 1. Confirmation de publication

**Trigger :** `publishTender()`  
**Template :** `sendTenderPublishedEmail()`  
**Contenu :**

- ✅ Confirmation que l'appel d'offres est publié
- 📅 Récapitulatif (deadline, budget)
- 🔗 Lien vers le tender

#### 2. Nouvelle offre reçue

**Trigger :** `submitOffer()`  
**Template :** `sendNewOfferReceivedEmail()`  
**Contenu :**

- 🎉 Notification de nouvelle offre
- 💰 Montant de l'offre
- 🔒 Anonymisation si mode ANONYMOUS
- 📊 Total d'offres reçues
- 🔗 Lien vers les offres

#### 3. Deadline passée (rappel)

**Trigger :** `close-expired-tenders.ts` (J+1)  
**Template :** `sendDeadlinePassedEmail()`  
**Contenu :**

- ⏰ Notification deadline passée
- 📊 Nombre d'offres reçues
- ✅ Actions recommandées (révéler, clôturer, attribuer)
- 🔗 Lien vers le tender

### Pour le Soumissionnaire

#### 4. Confirmation de soumission

**Trigger :** `submitOffer()`  
**Template :** `sendOfferSubmittedEmail()`  
**Contenu :**

- ✅ Confirmation soumission réussie
- 💰 Récapitulatif de l'offre
- 📅 Date limite
- ℹ️ Info sur retrait possible avant deadline
- 🔗 Lien vers mes offres

#### 5. Offre acceptée

**Trigger :** `acceptOffer()`  
**Template :** `sendOfferAcceptedEmail()`  
**Contenu :**

- 🎉 Félicitations offre acceptée
- 💼 Prochaines étapes
- 🔗 Lien vers l'offre

#### 6. Offre rejetée

**Trigger :** `rejectOffer()`  
**Template :** `sendOfferRejectedEmail()`  
**Contenu :**

- ℹ️ Notification de rejet
- 💡 Encouragement à continuer
- 🔗 Lien vers nouveaux appels d'offres

#### 7. Marché attribué - GAGNANT

**Trigger :** `awardTender()` (gagnant)  
**Template :** `sendTenderAwardedWinnerEmail()`  
**Contenu :**

- 🏆 Félicitations marché attribué
- 💰 Montant du marché
- 📋 Prochaines étapes contractuelles
- 🔗 Lien vers le tender

#### 8. Marché attribué - PERDANTS

**Trigger :** `awardTender()` (perdants)  
**Template :** `sendTenderAwardedLosersEmail()`  
**Contenu :**

- ℹ️ Info marché attribué à autre organisation
- 💡 Encouragement
- 🔗 Lien vers catalogue

### Autres

#### 9. Invitation organisation

**Trigger :** `inviteMember()`  
**Template :** `sendInvitationEmail()`  
**Contenu :**

- 👋 Invitation à rejoindre organisation
- 🔐 Rôle et permissions
- ⏰ Date d'expiration
- 🔗 Lien d'acceptation

## 🔄 Flux Complet avec Emails

```
ÉMETTEUR                                    SOUMISSIONNAIRE
────────                                    ───────────────

1. Créer tender (DRAFT)
2. Payer (Stripe)
3. Publier ──────────────────────> 📧 Voir catalog + soumettre offre
   📧 Confirmation publication
                                            4. Soumettre offre
   📧 Nouvelle offre reçue <───────────────── 📧 Confirmation soumission

5. Deadline passe
   📧 Rappel J+1 (auto)

6. Révéler identités (si ANONYMOUS)
7. Clôturer tender
8. Accepter offre ──────────────────> 📧 Offre acceptée
9. Attribuer marché
   ───────────────────────────────────> 📧 Marché attribué 🏆
   ───────────────────────────────────> 📧 Marché attribué (perdants)
```

## 🎨 Design des Emails

### Palette de couleurs

- **Primary:** `#DEAE00` (jaune or)
- **Background:** `#F0EDE3` (beige)
- **Success:** `#1B4332` (vert foncé)
- **Text:** `#0D0D0D` (noir)
- **Muted:** `#6B705C` (gris)

### Structure

- Header avec logo et gradient
- Contenu avec typographie claire
- Boutons CTA avec shadow
- Footer avec infos légales
- Responsive (600px max width)

### Helpers disponibles

```typescript
generateEmailLayout(content: string) // Wrap dans layout complet
generateButtonHtml(text, url, color?) // Bouton CTA stylisé
```

## 🛠️ Utilisation

### Envoyer un email custom

```typescript
import {
  sendEmail,
  generateEmailLayout,
  generateButtonHtml,
} from "@/lib/email/config";

const content = `
  <h2>Titre</h2>
  <p>Contenu...</p>
  ${generateButtonHtml("Action", "https://...")}
`;

await sendEmail({
  to: "user@example.com",
  subject: "Sujet",
  html: generateEmailLayout(content),
});
```

### Tester en dev

1. **Sans clé API (recommandé en local) :**

   ```bash
   # Ne pas définir RESEND_API_KEY
   npm run dev
   ```

   → Les emails sont loggés dans la console

2. **Avec clé API (test réel) :**
   ```bash
   # .env.local
   RESEND_API_KEY=re_xxxxx
   npm run dev
   ```
   → Les emails sont réellement envoyés

### Logs exemple

```
📧 [EMAIL SIMULATION] {
  to: 'user@example.com',
  subject: '✅ Votre appel d\'offres "..." est publié',
  note: 'RESEND_API_KEY non configurée - Email non envoyé'
}
```

## 🔐 Sécurité

- ✅ Emails uniquement aux admins/owners
- ✅ Pas d'emails aux viewers
- ✅ Anonymisation respectée en mode ANONYMOUS
- ✅ Gestion d'erreur graceful (non bloquante)
- ✅ Validation des adresses email
- ✅ Rate limiting géré par Resend

## 📊 Monitoring

### En dev

- Logs console avec emoji 📧
- Simulations visibles dans terminal

### En prod

- Resend Dashboard : https://resend.com/emails
- Logs Vercel/Railway
- Tracking des erreurs dans console

## 🚀 Déploiement

### Checklist

1. ✅ Créer compte Resend : https://resend.com
2. ✅ Ajouter domaine vérifié (ex: `publio.ch`)
3. ✅ Générer API Key
4. ✅ Configurer variables d'env :
   ```env
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL="Publio <noreply@publio.ch>"
   RESEND_REPLY_TO="contact@publio.ch"
   NEXT_PUBLIC_APP_URL="https://publio.ch"
   ```
5. ✅ Déployer
6. ✅ Tester un flow complet
7. ✅ Vérifier logs Resend

### Limites Resend

**Free tier :**

- 100 emails/jour
- 3,000 emails/mois
- Gratuit

**Pro :**

- $20/mois
- 50,000 emails/mois
- Support prioritaire

## 🐛 Troubleshooting

### Emails non reçus

1. **Vérifier RESEND_API_KEY** est définie
2. **Vérifier domaine** vérifié dans Resend
3. **Vérifier spam** du destinataire
4. **Vérifier logs** Resend Dashboard
5. **Vérifier email** du user existe dans DB

### Erreurs en dev

```
⚠️ RESEND_API_KEY non configurée
```

→ Normal en dev, emails loggés uniquement

### Emails en double

→ Vérifier que l'action n'est pas appelée 2x  
→ Vérifier logs "Email envoyé" dans console

## 📝 Maintenance

### Ajouter un nouveau template

1. Créer fonction dans `tender-emails.ts`
2. Utiliser `generateEmailLayout()` + `generateButtonHtml()`
3. Appeler depuis action serveur
4. Wrapper dans try/catch
5. Logger erreurs sans bloquer
6. Tester en dev
7. Documenter ici

### Modifier un template existant

1. Éditer fonction dans `tender-emails.ts`
2. Tester HTML dans navigateur
3. Vérifier responsive (mobile)
4. Tester en dev + prod
5. Update docs si nécessaire

## ✅ Best Practices

- ✅ Toujours wrapper `sendEmail()` dans try/catch
- ✅ Ne jamais bloquer le flux métier si email échoue
- ✅ Logger erreurs pour debug
- ✅ Envoyer uniquement aux admins/owners
- ✅ Utiliser batch emails si > 10 destinataires
- ✅ Respecter l'anonymisation
- ✅ Inclure CTA clair
- ✅ Tester en dev avant prod
- ✅ Vérifier spam score (Resend)

## 🎯 Roadmap

- [ ] Templates React Email (type-safe)
- [ ] Préférences emails utilisateur
- [ ] Digest quotidien/hebdomadaire
- [ ] Emails transactionnels (factures)
- [ ] A/B testing templates
- [ ] Multi-langue (fr/de/it)
- [ ] Tracking ouverture/clics
- [ ] Email queue avec retry

## 📚 Ressources

- [Resend Docs](https://resend.com/docs)
- [React Email](https://react.email)
- [Email Best Practices](https://www.campaignmonitor.com/resources/guides/email-marketing-best-practices/)
