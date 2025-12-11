#!/usr/bin/env tsx
/**
 * Script d'envoi des alertes veille
 * Exécuté quotidiennement par cron job (8h)
 *
 * Usage:
 *   npx tsx scripts/send-veille-alerts.ts
 */

import { prisma } from "@/lib/db/prisma";
import { sendVeilleAlertEmail } from "@/lib/email/veille-alert";

async function sendVeilleAlerts() {
  console.log("=".repeat(60));
  console.log("📧 ENVOI DES ALERTES VEILLE");
  console.log("=".repeat(60));
  console.log(`Démarrage: ${new Date().toISOString()}\n`);

  try {
    const subscriptions = await prisma.veilleSubscription.findMany({
      where: {
        emailNotifications: true,
        cantons: { isEmpty: false },
      },
    });

    console.log(`📊 ${subscriptions.length} abonnement(s) actif(s)\n`);

    if (subscriptions.length === 0) {
      console.log("ℹ️  Aucun abonnement à traiter");
      return { processed: 0, sent: 0, skipped: 0 };
    }

    let sent = 0;
    let skipped = 0;

    for (const subscription of subscriptions) {
      try {
        const organization = await prisma.organization.findUnique({
          where: { id: subscription.organizationId },
        });

        if (!organization) continue;

        const owner = await prisma.organizationMember.findFirst({
          where: { organizationId: organization.id, role: "OWNER" },
          include: { user: true },
        });

        if (!owner?.user.email) {
          console.log(`⚠️  ${organization.name}: Pas d'email`);
          skipped++;
          continue;
        }

        const now = new Date();
        const dayOfWeek = now.getDay();

        // Vérifier fréquence
        if (subscription.alertFrequency === "WEEKLY" && dayOfWeek !== 1) {
          skipped++;
          continue;
        }
        if (subscription.alertFrequency === "DISABLED") {
          skipped++;
          continue;
        }

        const lastSent = subscription.lastAlertSent || new Date(0);
        const hoursSinceLastAlert =
          (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastAlert < 12) {
          console.log(`⏭️  ${organization.name}: Alerte récente`);
          skipped++;
          continue;
        }

        // Construire requête avec filtres
        const whereClause: {
          canton: { in: string[] };
          publishedAt: { gt: Date };
          type?: { in: string[] };
          commune?: { in: string[] };
        } = {
          canton: { in: subscription.cantons },
          publishedAt: { gt: lastSent },
        };

        if (subscription.alertTypes.length > 0) {
          whereClause.type = { in: subscription.alertTypes };
        }

        if (subscription.alertCommunes.length > 0) {
          whereClause.commune = { in: subscription.alertCommunes };
        }

        let publications = await prisma.veillePublication.findMany({
          where: whereClause,
          orderBy: { publishedAt: "desc" },
        });

        // Filtrer par mots-clés
        if (subscription.alertKeywords.length > 0) {
          publications = publications.filter((pub) => {
            const text = `${pub.title} ${pub.description || ""}`.toLowerCase();
            return subscription.alertKeywords.some((kw) =>
              text.includes(kw.toLowerCase())
            );
          });
        }

        if (publications.length === 0) {
          console.log(`ℹ️  ${organization.name}: Aucune publication`);
          skipped++;
          continue;
        }

        console.log(
          `📤 ${organization.name}: ${publications.length} publication(s)`
        );

        const result = await sendVeilleAlertEmail({
          to: owner.user.email,
          userName: owner.user.name || "utilisateur",
          publications: publications.map((p) => ({
            title: p.title,
            description: p.description || undefined,
            url: p.url,
            commune: p.commune,
            canton: p.canton,
            type: p.type,
            publishedAt: p.publishedAt,
          })),
          cantons: subscription.cantons,
          alertTypes:
            subscription.alertTypes.length > 0
              ? subscription.alertTypes
              : undefined,
          alertKeywords:
            subscription.alertKeywords.length > 0
              ? subscription.alertKeywords
              : undefined,
          alertCommunes:
            subscription.alertCommunes.length > 0
              ? subscription.alertCommunes
              : undefined,
        });

        if (result.success) {
          await prisma.veilleSubscription.update({
            where: { id: subscription.id },
            data: { lastAlertSent: now },
          });
          console.log(`✅ ${organization.name}: Email envoyé`);
          sent++;
        } else {
          console.error(`❌ ${organization.name}: Erreur`, result.error);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Erreur subscription:`, error);
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`Traités:   ${subscriptions.length}`);
    console.log(`Envoyés:   ${sent}`);
    console.log(`Ignorés:   ${skipped}`);
    console.log("=".repeat(60));

    return { processed: subscriptions.length, sent, skipped };
  } catch (error) {
    console.error("\n❌ ERREUR:", error);
    throw error;
  }
}

sendVeilleAlerts()
  .then(() => {
    console.log("\n✅ Terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Échec:", error);
    process.exit(1);
  });
