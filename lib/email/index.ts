import { Resend } from "resend";
import {
  sendEmail,
  generateEmailLayout,
  generateButtonHtml,
  EMAIL_CONFIG,
} from "./config";

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend, sendEmail, EMAIL_CONFIG };

/**
 * Envoyer un email d'invitation à rejoindre une organisation
 */
export async function sendInvitationEmail(invitation: {
  email: string;
  token: string;
  organization: {
    name: string;
    type: string;
  };
  inviter: {
    name: string | null;
    email: string;
  };
  role: string;
  expiresAt: Date;
}) {
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${invitation.token}`;

  const roleDescription =
    {
      OWNER: "tous les droits incluant la facturation",
      ADMIN: "gestion des membres et des contenus",
      EDITOR: "création et modification de contenus",
      VIEWER: "consultation en lecture seule",
    }[invitation.role] || "consultation";

  const content = `
    <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">Vous êtes invité !</h2>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      Bonjour,
    </p>
    
    <p style="margin: 0 0 15px; color: #0D0D0D; font-size: 16px;">
      <strong>${
        invitation.inviter.name || invitation.inviter.email
      }</strong> vous invite à rejoindre l'organisation 
      <strong style="color: #DEAE00;">${
        invitation.organization.name
      }</strong> sur Publio.
    </p>

    <div style="background-color: #F0EDE3; border-left: 4px solid #DEAE00; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #1B4332; font-size: 14px; font-weight: 600;">Votre rôle :</p>
      <p style="margin: 0; color: #6B705C; font-size: 14px;">
        <strong style="color: #1B4332;">${
          invitation.role
        }</strong> - ${roleDescription}
      </p>
    </div>

    <p style="margin: 0 0 25px; color: #6B705C; font-size: 14px;">
      En acceptant cette invitation, vous pourrez collaborer avec l'équipe et accéder aux ressources de l'organisation selon votre rôle.
    </p>

    ${generateButtonHtml("Accepter l'invitation", invitationUrl)}

    <p style="margin: 25px 0 10px; color: #6B705C; font-size: 13px; text-align: center;">
      Ou copiez ce lien dans votre navigateur :
    </p>
    <p style="margin: 0; color: #DEAE00; font-size: 12px; text-align: center; word-break: break-all;">
      ${invitationUrl}
    </p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDE3;">
      <p style="margin: 0; color: #6B705C; font-size: 13px;">
        ⏰ Cette invitation expire le <strong>${new Date(
          invitation.expiresAt
        ).toLocaleDateString("fr-CH", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: invitation.email,
    subject: `Invitation à rejoindre ${invitation.organization.name} sur Publio`,
    html: generateEmailLayout(content),
  });
}
