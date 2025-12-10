/**
 * Configuration Resend et gestion des emails
 */

import { Resend } from "resend";

// Initialiser Resend
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "⚠️ RESEND_API_KEY non configurée - Les emails ne seront pas envoyés"
  );
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || "Publio <noreply@publio.ch>",
  replyTo: process.env.RESEND_REPLY_TO || "contact@publio.ch",
  enabled: !!resendApiKey,
  isDev: process.env.NODE_ENV !== "production",
};

/**
 * Type pour les options d'email
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Envoyer un email avec gestion d'erreur
 */
export async function sendEmail(options: EmailOptions) {
  // Si Resend n'est pas configuré, logger et retourner
  if (!resend) {
    console.log("📧 [EMAIL SIMULATION]", {
      to: options.to,
      subject: options.subject,
      note: "RESEND_API_KEY non configurée - Email non envoyé",
    });
    return { success: false, simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    });

    console.log("✅ Email envoyé:", {
      to: options.to,
      subject: options.subject,
      id: result.data?.id,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);

    // En dev, on ne throw pas pour ne pas bloquer le flux
    if (EMAIL_CONFIG.isDev) {
      console.log("⚠️ Mode dev - Erreur ignorée");
      return { success: false, error };
    }

    throw error;
  }
}

/**
 * Helper pour générer le layout HTML des emails
 */
export function generateEmailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0D0D0D; background-color: #F0EDE3; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0EDE3; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #DEAE00 0%, #F0C800 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Publio</h1>
              <p style="margin: 10px 0 0; color: #FFFFFF; font-size: 14px; opacity: 0.9;">Plateforme de gestion des appels d'offres</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F0EDE3; padding: 25px 30px; text-align: center; border-top: 1px solid #E0DDD3;">
              <p style="margin: 0 0 8px; color: #6B705C; font-size: 12px;">
                Cet email a été envoyé par <strong>Publio</strong>
              </p>
              <p style="margin: 0 0 8px; color: #6B705C; font-size: 12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #DEAE00; text-decoration: none;">Accéder à la plateforme</a>
              </p>
              <p style="margin: 0; color: #6B705C; font-size: 11px;">
                Si vous ne souhaitez plus recevoir ces emails, contactez-nous à ${EMAIL_CONFIG.replyTo}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Helper pour générer le style de bouton
 */
export function generateButtonHtml(
  text: string,
  url: string,
  color = "#DEAE00"
) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
  <tr>
    <td align="center" style="padding: 10px 0;">
      <a href="${url}" style="display: inline-block; background-color: ${color}; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
        ${text}
      </a>
    </td>
  </tr>
</table>
  `;
}
