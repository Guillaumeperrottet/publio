/**
 * Script de fermeture automatique des tenders expirés
 *
 * Ce script :
 * 1. Identifie les tenders PUBLISHED avec deadline passée (+ période de grâce)
 * 2. Envoie un email de rappel à l'émetteur
 * 3. Après X jours de grâce, ferme automatiquement le tender
 *
 * À exécuter via cron job quotidien (ex: chaque nuit à 2h)
 * Ou manuellement : npx tsx scripts/close-expired-tenders.ts
 */

import { PrismaClient, TenderStatus } from "@prisma/client";
import {
  sendDeadlinePassedEmail,
  sendTenderAutoClosedEmail,
} from "@/lib/email/tender-emails";

const prisma = new PrismaClient();

// Configuration
const GRACE_PERIOD_DAYS = 3; // Jours de grâce avant fermeture auto
const AUTO_CLOSE_AFTER_DAYS = 7; // Fermeture automatique après X jours

async function closeExpiredTenders() {
  const now = new Date();

  console.log(`🔍 Recherche des tenders expirés (${now.toISOString()})`);

  try {
    // 1. Trouver les tenders PUBLISHED avec deadline passée depuis 1+ jour
    const expiredTenders = await prisma.tender.findMany({
      where: {
        status: "PUBLISHED",
        deadline: {
          lt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // -1 jour
        },
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    console.log(`📊 ${expiredTenders.length} tender(s) expiré(s) trouvé(s)`);

    for (const tender of expiredTenders) {
      const daysSinceDeadline = Math.floor(
        (now.getTime() - new Date(tender.deadline).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      console.log(`\n📋 Tender: ${tender.title} (ID: ${tender.id})`);
      console.log(`   Deadline passée depuis: ${daysSinceDeadline} jour(s)`);
      console.log(`   Offres reçues: ${tender._count.offers}`);

      // 2. Si encore dans la période de grâce (1-3 jours)
      if (daysSinceDeadline <= GRACE_PERIOD_DAYS) {
        console.log(
          `   ⏳ Période de grâce (${daysSinceDeadline}/${GRACE_PERIOD_DAYS} jours)`
        );

        // Envoyer email de rappel (seulement le 1er jour)
        if (daysSinceDeadline === 1) {
          console.log(`   📧 Envoi email de rappel...`);

          const adminEmails = tender.organization.members
            .map((m) => m.user.email)
            .filter((email): email is string => !!email);

          if (adminEmails.length > 0) {
            try {
              await sendDeadlinePassedEmail({
                to: adminEmails,
                tenderTitle: tender.title,
                tenderId: tender.id,
                offersCount: tender._count.offers,
              });
              console.log(`   ✅ Email de rappel envoyé`);
            } catch (error) {
              console.error(`   ❌ Erreur envoi email:`, error);
            }
          }
        }
        continue;
      }

      // 3. Si au-delà de la période de grâce mais avant auto-close
      if (daysSinceDeadline < AUTO_CLOSE_AFTER_DAYS) {
        console.log(
          `   ⚠️  Deadline dépassée - En attente d'action manuelle (${daysSinceDeadline}/${AUTO_CLOSE_AFTER_DAYS} jours)`
        );
        continue;
      }

      // 4. Fermeture automatique après X jours
      console.log(
        `   🔒 Fermeture automatique (${daysSinceDeadline} jours écoulés)`
      );

      // Préparer les données de mise à jour
      const updateData: {
        status: TenderStatus;
        identityRevealed?: boolean;
        revealedAt?: Date;
      } = {
        status: TenderStatus.CLOSED,
      };

      // Si le tender est en mode anonyme, révéler l'identité
      if (tender.mode === "ANONYMOUS" && !tender.identityRevealed) {
        updateData.identityRevealed = true;
        updateData.revealedAt = new Date();
        console.log(`   🔓 Révélation de l'identité (mode anonyme)`);
      }

      await prisma.tender.update({
        where: { id: tender.id },
        data: updateData,
      });

      // Envoyer email de notification de fermeture auto
      console.log(`   📧 Envoi email de fermeture automatique...`);

      const adminEmails = tender.organization.members
        .map((m) => m.user.email)
        .filter((email): email is string => !!email);

      if (adminEmails.length > 0) {
        try {
          await sendTenderAutoClosedEmail({
            to: adminEmails,
            tenderTitle: tender.title,
            tenderId: tender.id,
            offersCount: tender._count.offers,
            daysSinceDeadline,
          });
          console.log(`   ✅ Email de fermeture envoyé`);
        } catch (error) {
          console.error(`   ❌ Erreur envoi email:`, error);
        }
      }

      console.log(`   ✅ Tender clôturé automatiquement`);
    }

    console.log(`\n✅ Script terminé avec succès`);
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture des tenders:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
if (require.main === module) {
  closeExpiredTenders()
    .then(() => {
      console.log("✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

export { closeExpiredTenders };
