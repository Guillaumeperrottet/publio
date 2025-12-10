/**
 * Script pour envoyer des alertes aux utilisateurs
 * quand de nouveaux tenders matchent leurs recherches sauvegardées
 *
 * Usage: npx tsx scripts/send-search-alerts.ts
 */

import { PrismaClient, Tender, Organization } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL || "Publio <noreply@publio.ch>";

type TenderWithOrg = Tender & {
  organization: Organization;
};

/**
 * Vérifier si un tender correspond aux critères d'une recherche
 */
function matchesCriteria(
  tender: TenderWithOrg,
  criteria: Record<string, unknown>
): boolean {
  // Recherche textuelle
  if (criteria.search && typeof criteria.search === "string") {
    const searchLower = criteria.search.toLowerCase();
    const titleMatch = tender.title.toLowerCase().includes(searchLower);
    const descMatch = tender.description.toLowerCase().includes(searchLower);

    if (!titleMatch && !descMatch) {
      return false;
    }
  }

  // Canton
  if (criteria.canton && tender.canton !== criteria.canton) {
    return false;
  }

  // Ville
  if (criteria.city && tender.city !== criteria.city) {
    return false;
  }

  // Type de marché
  if (criteria.marketType && tender.marketType !== criteria.marketType) {
    return false;
  }

  // Budget min
  if (criteria.budgetMin && typeof criteria.budgetMin === "number") {
    if (!tender.budget || tender.budget < criteria.budgetMin) {
      return false;
    }
  }

  // Budget max
  if (criteria.budgetMax && typeof criteria.budgetMax === "number") {
    if (!tender.budget || tender.budget > criteria.budgetMax) {
      return false;
    }
  }

  // Mode
  if (criteria.mode && tender.mode !== criteria.mode) {
    return false;
  }

  // Type d'organisation émettrice
  if (
    criteria.organizationType &&
    tender.organization.type !== criteria.organizationType
  ) {
    return false;
  }

  return true;
}

/**
 * Email d'alerte pour recherche sauvegardée
 */
async function sendSearchAlertEmail(params: {
  to: string;
  searchName: string;
  tenders: Array<{
    id: string;
    title: string;
    budget?: number | null;
    deadline: Date;
    location: string;
  }>;
}): Promise<boolean> {
  if (!resend) {
    console.log("Resend not configured - skipping email");
    return false;
  }

  try {
    const tendersList = params.tenders
      .map(
        (tender) => `
        <div style="background-color: #F0EDE3; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #DEAE00;">
          <h3 style="margin: 0 0 8px; color: #0D0D0D; font-size: 16px; font-weight: 600;">
            ${tender.title}
          </h3>
          <p style="margin: 0 0 5px; color: #6B705C; font-size: 14px;">
            📍 ${tender.location}
            ${
              tender.budget
                ? ` • 💰 CHF ${tender.budget.toLocaleString("fr-CH")}`
                : ""
            }
          </p>
          <p style="margin: 0 0 10px; color: #6B705C; font-size: 13px;">
            ⏰ Deadline: ${new Date(tender.deadline).toLocaleDateString(
              "fr-CH",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </p>
          <a href="${APP_URL}/tenders/${
          tender.id
        }" style="display: inline-block; background-color: #DEAE00; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
            Voir l'appel d'offres
          </a>
        </div>
      `
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0D0D0D; background-color: #F0EDE3; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <div style="background: linear-gradient(135deg, #DEAE00 0%, #F0C800 100%); padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">Publio</h1>
    </div>

    <div style="padding: 40px 30px;">
      <h2 style="margin: 0 0 20px; color: #0D0D0D; font-size: 24px; font-weight: 600;">
        🔔 Nouveaux appels d'offres pour "${params.searchName}"
      </h2>
      
      <p style="margin: 0 0 20px; color: #0D0D0D; font-size: 16px;">
        <strong>${params.tenders.length}</strong> nouvel${
      params.tenders.length > 1 ? "s" : ""
    } appel${params.tenders.length > 1 ? "s" : ""} d'offres correspond${
      params.tenders.length > 1 ? "ent" : ""
    } à votre recherche sauvegardée :
      </p>

      ${tendersList}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #F0EDE3; text-align: center;">
        <a href="${APP_URL}/dashboard/saved-searches" style="display: inline-block; background-color: #6B705C; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin-bottom: 15px;">
          Gérer mes alertes
        </a>
        <p style="margin: 0; color: #6B705C; font-size: 12px;">
          Vous recevez cet email car vous avez activé les alertes. Désactivez-les depuis votre tableau de bord.
        </p>
      </div>
    </div>

    <div style="background-color: #F0EDE3; padding: 20px; text-align: center; font-size: 11px; color: #6B705C;">
      © ${new Date().getFullYear()} Publio - Plateforme de gestion des appels d'offres
    </div>

  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `🔔 ${params.tenders.length} nouveau${
        params.tenders.length > 1 ? "x" : ""
      } appel${params.tenders.length > 1 ? "s" : ""} d'offres - ${
        params.searchName
      }`,
      html,
    });

    return true;
  } catch (error) {
    console.error("Error sending search alert email:", error);
    return false;
  }
}

/**
 * Envoyer des alertes pour les nouveaux tenders
 */
export async function sendSearchAlerts() {
  const results = {
    processed: 0,
    alerts: 0,
    errors: 0,
    details: [] as string[],
  };

  try {
    // 1. Récupérer toutes les recherches avec alertes activées
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        alertsEnabled: true,
      },
    });

    results.processed = savedSearches.length;
    results.details.push(
      `Found ${savedSearches.length} saved searches with alerts enabled`
    );

    if (savedSearches.length === 0) {
      return results;
    }

    // 2. Pour chaque recherche, récupérer l'utilisateur
    for (const search of savedSearches) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: search.userId },
        });

        if (!user) {
          results.details.push(`User not found for search ${search.id}`);
          continue;
        }

        // Vérifier quand la dernière alerte a été envoyée
        const lastAlertDate = search.lastAlertSent || new Date(0);

        // Ne pas spammer : minimum 12h entre chaque alerte
        const hoursSinceLastAlert =
          (Date.now() - lastAlertDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastAlert < 12) {
          results.details.push(
            `Skipping search "${search.name}" - alert sent less than 12h ago`
          );
          continue;
        }

        // 3. Déterminer la fenêtre temporelle (depuis dernière alerte ou 24h)
        const since = new Date(
          Math.max(lastAlertDate.getTime(), Date.now() - 24 * 60 * 60 * 1000)
        );

        // 4. Récupérer les nouveaux tenders publiés depuis
        const newTenders = await prisma.tender.findMany({
          where: {
            status: "PUBLISHED",
            publishedAt: {
              gte: since,
            },
          },
          include: {
            organization: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        });

        if (newTenders.length === 0) {
          continue;
        }

        // 5. Filtrer les tenders qui matchent
        const matchingTenders = newTenders.filter((tender: TenderWithOrg) =>
          matchesCriteria(tender, search.criteria as Record<string, unknown>)
        );

        if (matchingTenders.length === 0) {
          continue;
        }

        // 6. Envoyer l'email d'alerte
        const success = await sendSearchAlertEmail({
          to: user.email,
          searchName: search.name,
          tenders: matchingTenders.map((t: TenderWithOrg) => ({
            id: t.id,
            title: t.title,
            budget: t.budget,
            deadline: t.deadline,
            location: t.city || t.canton || "Suisse",
          })),
        });

        if (success) {
          // Mettre à jour la date de dernière alerte
          await prisma.savedSearch.update({
            where: { id: search.id },
            data: {
              lastAlertSent: new Date(),
            },
          });

          results.alerts++;
          results.details.push(
            `✓ Alert sent to ${user.email} for "${search.name}" (${matchingTenders.length} tenders)`
          );
        } else {
          results.errors++;
          results.details.push(`✗ Failed to send alert to ${user.email}`);
        }
      } catch (error) {
        results.errors++;
        console.error(`Error processing search ${search.id}:`, error);
        results.details.push(`✗ Error for search "${search.name}": ${error}`);
      }
    }

    return results;
  } catch (error) {
    console.error("Error in sendSearchAlerts:", error);
    results.details.push(`Fatal error: ${error}`);
    return results;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  sendSearchAlerts()
    .then((results) => {
      console.log("\n✅ Search alerts completed:");
      console.log(`- Processed: ${results.processed} searches`);
      console.log(`- Alerts sent: ${results.alerts}`);
      console.log(`- Errors: ${results.errors}`);
      console.log("\nDetails:");
      results.details.forEach((detail) => console.log(`  ${detail}`));
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    });
}
