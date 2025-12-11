import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface VeilleAlertPublication {
  title: string;
  description?: string;
  url: string;
  commune: string;
  canton: string;
  type: string;
  publishedAt: Date;
}

interface SendVeilleAlertEmailParams {
  to: string;
  userName: string;
  publications: VeilleAlertPublication[];
  cantons: string[];
  alertTypes?: string[];
  alertKeywords?: string[];
  alertCommunes?: string[];
}

export async function sendVeilleAlertEmail({
  to,
  userName,
  publications,
  cantons,
  alertTypes,
  alertKeywords,
  alertCommunes,
}: SendVeilleAlertEmailParams) {
  const publicationCount = publications.length;
  const subject =
    publicationCount === 1
      ? `🔔 1 nouvelle publication dans vos cantons`
      : `🔔 ${publicationCount} nouvelles publications dans vos cantons`;

  // Grouper par type
  const byType = publications.reduce((acc, pub) => {
    acc[pub.type] = (acc[pub.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Grouper par canton
  const byCanton = publications.reduce((acc, pub) => {
    acc[pub.canton] = (acc[pub.canton] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels: Record<string, string> = {
    MISE_A_LENQUETE: "Mise à l'enquête",
    PERMIS_CONSTRUIRE: "Permis de construire",
    OPPOSITION: "Opposition",
    APPEL_DOFFRES: "Appel d'offres",
    AVIS_OFFICIEL: "Avis officiel",
    AUTORISATION_CONSTRUIRE: "Autorisation de construire",
    AUTRE: "Autre",
  };

  // Générer le HTML
  const publicationsHtml = publications
    .slice(0, 10) // Limiter à 10 pour éviter un email trop long
    .map(
      (pub) => `
    <div style="margin-bottom: 24px; padding: 16px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #f4cf5d;">
      <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
        ${pub.title}
      </h3>
      <div style="margin-bottom: 8px;">
        <span style="background-color: #f4cf5d; color: #1a1a1a; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
          ${typeLabels[pub.type] || pub.type}
        </span>
        <span style="margin-left: 8px; color: #666; font-size: 14px;">
          📍 ${pub.commune}, ${pub.canton}
        </span>
      </div>
      ${
        pub.description
          ? `<p style="margin: 8px 0; color: #555; font-size: 14px; line-height: 1.5;">
          ${pub.description.substring(0, 200)}${
              pub.description.length > 200 ? "..." : ""
            }
        </p>`
          : ""
      }
      <a href="${
        pub.url
      }" style="display: inline-block; margin-top: 8px; color: #2563eb; text-decoration: none; font-size: 14px;">
        Voir les détails →
      </a>
    </div>
  `
    )
    .join("");

  const morePublications =
    publications.length > 10
      ? `
    <div style="text-align: center; padding: 16px; background-color: #f0f0f0; border-radius: 8px; margin-top: 16px;">
      <p style="margin: 0; color: #666;">
        ... et ${publications.length - 10} autre${
          publications.length - 10 > 1 ? "s" : ""
        } publication${publications.length - 10 > 1 ? "s" : ""}
      </p>
    </div>
  `
      : "";

  const filtersSummary = [];
  if (alertTypes && alertTypes.length > 0) {
    filtersSummary.push(
      `Types: ${alertTypes.map((t) => typeLabels[t] || t).join(", ")}`
    );
  }
  if (alertKeywords && alertKeywords.length > 0) {
    filtersSummary.push(`Mots-clés: ${alertKeywords.join(", ")}`);
  }
  if (alertCommunes && alertCommunes.length > 0) {
    filtersSummary.push(`Communes: ${alertCommunes.join(", ")}`);
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: bold;">
        🔔 Veille Communale
      </h1>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Publio - Plateforme des marchés publics
      </p>
    </div>

    <!-- Greeting -->
    <p style="margin: 0 0 24px 0; color: #1a1a1a; font-size: 16px;">
      Bonjour ${userName},
    </p>

    <!-- Summary -->
    <div style="margin-bottom: 32px; padding: 16px; background-color: #fff8e1; border-radius: 8px; border: 1px solid #f4cf5d;">
      <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
        ${publicationCount} nouvelle${
    publicationCount > 1 ? "s" : ""
  } publication${publicationCount > 1 ? "s" : ""}
      </h2>
      <div style="margin-bottom: 8px;">
        <strong style="color: #666;">Cantons surveillés:</strong> ${cantons.join(
          ", "
        )}
      </div>
      <div style="margin-bottom: 8px;">
        <strong style="color: #666;">Répartition par type:</strong>
        ${Object.entries(byType)
          .map(([type, count]) => `${typeLabels[type] || type} (${count})`)
          .join(", ")}
      </div>
      <div>
        <strong style="color: #666;">Répartition par canton:</strong>
        ${Object.entries(byCanton)
          .map(([canton, count]) => `${canton} (${count})`)
          .join(", ")}
      </div>
      ${
        filtersSummary.length > 0
          ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f4cf5d;">
          <strong style="color: #666;">Filtres actifs:</strong><br>
          ${filtersSummary.join("<br>")}
        </div>
      `
          : ""
      }
    </div>

    <!-- Publications -->
    <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
      Publications récentes
    </h2>
    ${publicationsHtml}
    ${morePublications}

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/veille" 
         style="display: inline-block; padding: 12px 32px; background-color: #f4cf5d; color: #1a1a1a; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Voir toutes les publications
      </a>
    </div>

    <!-- Footer -->
    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e0e0e0; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
        Vous recevez cet email car vous êtes abonné à la veille communale Publio
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL
        }/dashboard/veille/settings" style="color: #999; text-decoration: underline;">
          Gérer mes préférences
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Publio <alerts@publio.ch>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[sendVeilleAlertEmail] Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[sendVeilleAlertEmail] Exception:", error);
    return { success: false, error };
  }
}
