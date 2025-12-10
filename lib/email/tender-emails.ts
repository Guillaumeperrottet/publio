/**
 * Templates d'emails pour les tenders
 */

import { sendEmail, generateEmailLayout, generateButtonHtml } from "./config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================
// EMAILS POUR L'ÉMETTEUR (Donneur d'ordre)
// ============================================

/**
 * Email de confirmation de publication du tender
 */
export async function sendTenderPublishedEmail(params: {
  to: string | string[];
  tenderTitle: string;
  tenderId: string;
  deadline: Date;
  budget?: number;
}) {
  const tenderUrl = `${APP_URL}/dashboard/tenders/${params.tenderId}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
      ✅ Votre appel d'offres est publié !
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Félicitations ! Votre appel d'offres <strong style="color: #DEAE00;">"${
        params.tenderTitle
      }"</strong> 
      est maintenant visible sur Publio.
    </p>

    <div style="background-color: #F0EDE3; border-left: 4px solid #DEAE00; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #1B4332; font-size: 14px; font-weight: 600;">Récapitulatif :</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #6B705C; font-size: 14px;">
        <li>Date limite : <strong>${new Date(
          params.deadline
        ).toLocaleDateString("fr-CH", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</strong></li>
        ${
          params.budget
            ? `<li>Budget indicatif : <strong>CHF ${params.budget.toLocaleString(
                "fr-CH"
              )}</strong></li>`
            : ""
        }
        <li>Statut : <strong style="color: #1B4332;">Publié</strong></li>
      </ul>
    </div>

    <p style="margin: 25px 0 15px; color: #6B705C; font-size: 14px;">
      Les entreprises peuvent maintenant consulter votre appel d'offres et soumettre leurs offres. 
      Vous serez notifié dès qu'une nouvelle offre sera déposée.
    </p>

    ${generateButtonHtml("Gérer mon appel d'offres", tenderUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        💡 <strong>Conseil :</strong> Consultez régulièrement votre tableau de bord pour suivre les offres reçues.
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `✅ Votre appel d'offres "${params.tenderTitle}" est publié`,
    html: generateEmailLayout(content),
  });
}

/**
 * Email de notification de nouvelle offre reçue
 */
export async function sendNewOfferReceivedEmail(params: {
  to: string | string[];
  tenderTitle: string;
  tenderId: string;
  offerPrice: number;
  offerCurrency: string;
  isAnonymous: boolean;
  organizationName?: string;
  totalOffersCount: number;
}) {
  const tenderUrl = `${APP_URL}/dashboard/tenders/${params.tenderId}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
      🎉 Nouvelle offre reçue !
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Une nouvelle offre a été soumise pour votre appel d'offres 
      <strong style="color: #DEAE00;">"${params.tenderTitle}"</strong>.
    </p>

    <div style="background-color: #F0EDE3; border-left: 4px solid #DEAE00; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #1B4332; font-size: 14px; font-weight: 600;">Détails de l'offre :</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #6B705C; font-size: 14px;">
        <li>Soumissionnaire : <strong>${
          params.isAnonymous
            ? "Identité masquée (mode anonyme)"
            : params.organizationName
        }</strong></li>
        <li>Montant : <strong style="color: #DEAE00;">${new Intl.NumberFormat(
          "fr-CH",
          {
            style: "currency",
            currency: params.offerCurrency,
          }
        ).format(params.offerPrice)}</strong></li>
        <li>Total d'offres reçues : <strong>${
          params.totalOffersCount
        }</strong></li>
      </ul>
    </div>

    ${
      params.isAnonymous
        ? `
    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400E; font-size: 13px;">
        🔒 <strong>Mode anonyme actif :</strong> L'identité du soumissionnaire reste masquée jusqu'à la deadline. 
        Vous pourrez révéler les identités une fois la date limite passée.
      </p>
    </div>
    `
        : ""
    }

    ${generateButtonHtml("Consulter les offres", tenderUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        💡 Vous recevrez un email pour chaque nouvelle offre soumise.
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `🎉 Nouvelle offre pour "${params.tenderTitle}"`,
    html: generateEmailLayout(content),
  });
}

/**
 * Email de rappel deadline passée
 */
export async function sendDeadlinePassedEmail(params: {
  to: string | string[];
  tenderTitle: string;
  tenderId: string;
  offersCount: number;
  isAnonymous: boolean;
}) {
  const tenderUrl = `${APP_URL}/dashboard/tenders/${params.tenderId}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
      ⏰ La deadline est passée
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      La date limite pour l'appel d'offres <strong style="color: #DEAE00;">"${
        params.tenderTitle
      }"</strong> 
      est maintenant passée.
    </p>

    <div style="background-color: #F0EDE3; border-left: 4px solid #DEAE00; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #1B4332; font-size: 14px; font-weight: 600;">Récapitulatif :</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #6B705C; font-size: 14px;">
        <li>Offres reçues : <strong>${params.offersCount}</strong></li>
        <li>Statut : <strong style="color: #1B4332;">Deadline passée</strong></li>
      </ul>
    </div>

    <p style="margin: 25px 0 15px; color: #6B705C; font-size: 14px;">
      <strong>Actions recommandées :</strong>
    </p>

    <ul style="margin: 0 0 25px; padding-left: 20px; color: #6B705C; font-size: 14px;">
      ${
        params.isAnonymous
          ? "<li>Révéler les identités des soumissionnaires</li>"
          : ""
      }
      <li>Consulter et évaluer les offres reçues</li>
      <li>Clôturer l'appel d'offres</li>
      <li>Accepter/rejeter les offres</li>
      <li>Attribuer le marché</li>
    </ul>

    ${generateButtonHtml("Gérer l'appel d'offres", tenderUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        ⚠️ Pensez à clôturer l'appel d'offres pour empêcher toute nouvelle soumission.
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `⏰ Action requise - Deadline passée pour "${params.tenderTitle}"`,
    html: generateEmailLayout(content),
  });
}

// ============================================
// EMAILS POUR LE SOUMISSIONNAIRE
// ============================================

/**
 * Email de confirmation de soumission d'offre
 */
export async function sendOfferSubmittedEmail(params: {
  to: string | string[];
  tenderTitle: string;
  tenderId: string;
  offerPrice: number;
  offerCurrency: string;
  deadline: Date;
}) {
  const offersUrl = `${APP_URL}/dashboard/offers`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
      ✅ Votre offre a été soumise !
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Félicitations ! Votre offre pour l'appel d'offres 
      <strong style="color: #DEAE00;">"${
        params.tenderTitle
      }"</strong> a été soumise avec succès.
    </p>

    <div style="background-color: #F0EDE3; border-left: 4px solid #1B4332; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #1B4332; font-size: 14px; font-weight: 600;">Détails de votre offre :</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #6B705C; font-size: 14px;">
        <li>Montant : <strong style="color: #DEAE00;">${new Intl.NumberFormat(
          "fr-CH",
          {
            style: "currency",
            currency: params.offerCurrency,
          }
        ).format(params.offerPrice)}</strong></li>
        <li>Date limite : <strong>${new Date(
          params.deadline
        ).toLocaleDateString("fr-CH", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</strong></li>
        <li>Statut : <strong style="color: #1B4332;">Soumise</strong></li>
      </ul>
    </div>

    <p style="margin: 25px 0 15px; color: #6B705C; font-size: 14px;">
      Le donneur d'ordre a reçu votre offre et l'évaluera avec les autres soumissions. 
      Vous serez notifié dès qu'une décision sera prise.
    </p>

    ${generateButtonHtml("Voir mes offres", offersUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0 0 8px; color: #6B705C; font-size: 13px;">
        💡 <strong>Vous pouvez retirer votre offre</strong> avant la deadline en accédant à votre tableau de bord.
      </p>
      <p style="margin: 8px 0 0; color: #6B705C; font-size: 13px;">
        📧 Vous recevrez un email dès que le donneur d'ordre aura pris une décision.
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `✅ Offre soumise pour "${params.tenderTitle}"`,
    html: generateEmailLayout(content),
  });
}

/**
 * Email d'acceptation d'offre
 */
export async function sendOfferAcceptedEmail(params: {
  to: string | string[];
  tenderTitle: string;
  tenderId: string;
  offerPrice: number;
  offerCurrency: string;
  organizationName: string;
}) {
  const tenderUrl = `${APP_URL}/tenders/${params.tenderId}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #1B4332; font-size: 28px; font-weight: 700;">
      🎉 Félicitations ! Votre offre a été acceptée
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Excellente nouvelle ! Votre offre pour l'appel d'offres 
      <strong style="color: #DEAE00;">"${
        params.tenderTitle
      }"</strong> a été acceptée par 
      <strong>${params.organizationName}</strong>.
    </p>

    <div style="background-color: #ECFDF5; border-left: 4px solid: #10B981; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #065F46; font-size: 14px; font-weight: 600;">✅ Offre acceptée</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #047857; font-size: 14px;">
        <li>Montant : <strong>${new Intl.NumberFormat("fr-CH", {
          style: "currency",
          currency: params.offerCurrency,
        }).format(params.offerPrice)}</strong></li>
        <li>Prochaine étape : Attente de l'attribution finale du marché</li>
      </ul>
    </div>

    <p style="margin: 25px 0 15px; color: #6B705C; font-size: 14px;">
      <strong>Que se passe-t-il maintenant ?</strong>
    </p>

    <p style="margin: 0 0 15px; color: #6B705C; font-size: 14px;">
      Le donneur d'ordre a marqué votre offre comme acceptée. Il procédera à l'attribution finale du marché prochainement. 
      Vous serez notifié dès la décision finale.
    </p>

    ${generateButtonHtml("Voir l'appel d'offres", tenderUrl, "#1B4332")}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        💼 Tenez-vous prêt pour la suite du processus. Le donneur d'ordre pourrait vous contacter prochainement.
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `🎉 Votre offre pour "${params.tenderTitle}" a été acceptée !`,
    html: generateEmailLayout(content),
  });
}

/**
 * Email de rejet d'offre
 */
export async function sendOfferRejectedEmail(params: {
  to: string | string[];
  tenderTitle: string;
}) {
  const tendersUrl = `${APP_URL}/tenders`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
      Mise à jour sur votre offre
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Nous vous informons que votre offre pour l'appel d'offres 
      <strong>"${params.tenderTitle}"</strong> n'a pas été retenue.
    </p>

    <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #991B1B; font-size: 14px;">
        Le donneur d'ordre a choisi une autre offre pour ce projet.
      </p>
    </div>

    <p style="margin: 25px 0 15px; color: #6B705C; font-size: 14px;">
      Nous vous remercions de votre participation et vous encourageons à continuer à soumissionner sur d'autres appels d'offres.
    </p>

    <p style="margin: 0 0 25px; color: #6B705C; font-size: 14px;">
      Ne vous découragez pas ! De nombreuses opportunités sont publiées quotidiennement sur Publio.
    </p>

    ${generateButtonHtml("Parcourir les appels d'offres", tendersUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        💡 <strong>Conseil :</strong> Consultez régulièrement notre plateforme pour ne manquer aucune opportunité.
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `Mise à jour sur votre offre pour "${params.tenderTitle}"`,
    html: generateEmailLayout(content),
  });
}

/**
 * Email d'attribution du marché (gagnant)
 */
export async function sendTenderAwardedWinnerEmail(params: {
  to: string | string[];
  tenderTitle: string;
  tenderId: string;
  offerPrice: number;
  offerCurrency: string;
  organizationName: string;
}) {
  const tenderUrl = `${APP_URL}/tenders/${params.tenderId}`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #DEAE00; font-size: 32px; font-weight: 700; text-align: center;">
      🏆 Marché attribué - Félicitations !
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 18px; text-align: center;">
      Le marché pour <strong style="color: #DEAE00;">"${
        params.tenderTitle
      }"</strong> vous a été attribué !
    </p>

    <div style="background-color: #FFFBEB; border: 3px solid #DEAE00; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 10px; color: #92400E; font-size: 16px; font-weight: 600;">
        🎉 Vous avez remporté ce marché !
      </p>
      <p style="margin: 0; color: #78350F; font-size: 24px; font-weight: 700;">
        ${new Intl.NumberFormat("fr-CH", {
          style: "currency",
          currency: params.offerCurrency,
        }).format(params.offerPrice)}
      </p>
    </div>

    <p style="margin: 25px 0 15px; color: #0D0D0D; font-size: 16px;">
      <strong>${
        params.organizationName
      }</strong> a officiellement attribué le marché à votre organisation.
    </p>

    <p style="margin: 0 0 25px; color: #6B705C; font-size: 14px;">
      <strong>Prochaines étapes :</strong>
    </p>

    <ul style="margin: 0 0 25px; padding-left: 20px; color: #6B705C; font-size: 14px;">
      <li>Le donneur d'ordre vous contactera prochainement pour finaliser les détails</li>
      <li>Préparez les documents contractuels nécessaires</li>
      <li>Organisez le démarrage du projet selon le calendrier convenu</li>
    </ul>

    ${generateButtonHtml("Voir les détails", tenderUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px; text-align: center;">
        💼 Toute l'équipe Publio vous félicite pour ce succès !
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `🏆 Marché attribué - "${params.tenderTitle}"`,
    html: generateEmailLayout(content),
  });
}

/**
 * Email d'attribution du marché (perdants)
 */
export async function sendTenderAwardedLosersEmail(params: {
  to: string | string[];
  tenderTitle: string;
}) {
  const tendersUrl = `${APP_URL}/tenders`;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
      Marché attribué - "${params.tenderTitle}"
    </h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Nous vous informons que le marché pour l'appel d'offres 
      <strong>"${
        params.tenderTitle
      }"</strong> a été attribué à une autre organisation.
    </p>

    <div style="background-color: #F0EDE3; border-left: 4px solid #6B705C; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #6B705C; font-size: 14px;">
        Merci d'avoir participé à cet appel d'offres. Votre offre a été évaluée avec attention.
      </p>
    </div>

    <p style="margin: 25px 0 15px; color: #6B705C; font-size: 14px;">
      Nous vous encourageons à continuer à soumissionner sur d'autres appels d'offres. 
      De nouvelles opportunités sont publiées régulièrement sur Publio.
    </p>

    ${generateButtonHtml("Parcourir les appels d'offres", tendersUrl)}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        💡 Continuez à développer votre activité avec Publio. Votre prochaine opportunité vous attend !
      </p>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `Marché attribué - "${params.tenderTitle}"`,
    html: generateEmailLayout(content),
  });
}
