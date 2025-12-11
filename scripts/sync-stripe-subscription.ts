/**
 * Script pour synchroniser manuellement l'abonnement Stripe d'une organisation
 * Utile quand un changement n'a pas été capturé par les webhooks
 *
 * Usage:
 * npx tsx scripts/sync-stripe-subscription.ts
 */

import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";

async function syncStripeSubscription() {
  console.log("=".repeat(60));
  console.log("🔄 SYNCHRONISATION ABONNEMENT STRIPE");
  console.log("=".repeat(60));

  try {
    // Récupérer toutes les organisations avec un stripeCustomerId
    const organizations = await prisma.organization.findMany({
      where: {
        stripeCustomerId: { not: null },
      },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionPlan: true,
      },
    });

    console.log(`\n📊 ${organizations.length} organisation(s) avec Stripe\n`);

    for (const org of organizations) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`🏢 Organisation: ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Stripe Customer ID: ${org.stripeCustomerId}`);
      console.log(
        `   Plan actuel en BDD: ${org.stripeSubscriptionPlan || "FREE"}`
      );

      if (!org.stripeCustomerId) {
        console.log("   ⚠️  Pas de Stripe Customer ID");
        continue;
      }

      try {
        // Récupérer les abonnements actifs depuis Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: org.stripeCustomerId,
          status: "active",
          limit: 10,
        });

        console.log(
          `   📋 ${subscriptions.data.length} abonnement(s) actif(s) trouvé(s)`
        );

        if (subscriptions.data.length === 0) {
          console.log("   ℹ️  Aucun abonnement actif → Mise à jour vers FREE");

          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionId: null,
              stripeSubscriptionPlan: "FREE",
            },
          });

          console.log("   ✅ Organisation mise à jour vers FREE");
          continue;
        }

        // Afficher TOUS les abonnements
        console.log("\n   📑 Liste de tous les abonnements:");
        for (let i = 0; i < subscriptions.data.length; i++) {
          const sub = subscriptions.data[i];
          const priceId = sub.items.data[0]?.price.id;
          const amount = sub.items.data[0]?.price.unit_amount;
          const currency = sub.items.data[0]?.price.currency;

          let planName = "FREE";
          if (priceId === process.env.STRIPE_VEILLE_BASIC_PRICE_ID) {
            planName = "VEILLE_BASIC";
          } else if (priceId === process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID) {
            planName = "VEILLE_UNLIMITED";
          }

          console.log(`\n   ${i + 1}. Abonnement ${sub.id}`);
          console.log(
            `      💰 Montant: ${
              (amount || 0) / 100
            } ${currency?.toUpperCase()}`
          );
          console.log(`      🏷️  Plan: ${planName}`);
          console.log(`      🔑 Price ID: ${priceId}`);
          console.log(
            `      📅 Créé: ${new Date(sub.created * 1000).toLocaleString()}`
          );
        }

        // Chercher TOUS les abonnements VEILLE (Basic ou Unlimited)
        const veilleSubscriptions = subscriptions.data.filter((sub) => {
          const priceId = sub.items.data[0]?.price.id;
          return (
            priceId === process.env.STRIPE_VEILLE_BASIC_PRICE_ID ||
            priceId === process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID
          );
        });

        // Prioriser VEILLE_UNLIMITED, puis le plus récent
        const unlimitedSub = veilleSubscriptions.find(
          (sub) =>
            sub.items.data[0]?.price.id ===
            process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID
        );

        const subscription =
          unlimitedSub || // Prioriser Unlimited s'il existe
          (veilleSubscriptions.length > 0
            ? veilleSubscriptions.sort((a, b) => b.created - a.created)[0] // Sinon le plus récent
            : subscriptions.data[0]); // Sinon le premier abonnement

        console.log(`\n   ✅ Abonnement sélectionné: ${subscription.id}`);
        console.log(`   📅 Statut: ${subscription.status}`);

        // Annuler les abonnements en double (sauf celui sélectionné)
        const duplicateSubscriptions = veilleSubscriptions.filter(
          (sub) => sub.id !== subscription.id
        );

        if (duplicateSubscriptions.length > 0) {
          console.log(
            `\n   🗑️  ${duplicateSubscriptions.length} abonnement(s) en double détecté(s)`
          );

          for (const dupSub of duplicateSubscriptions) {
            try {
              await stripe.subscriptions.cancel(dupSub.id);
              console.log(`   ✅ Abonnement ${dupSub.id} annulé`);
            } catch (error) {
              console.error(
                `   ❌ Erreur lors de l'annulation de ${dupSub.id}:`,
                error
              );
            }
          }
        }

        // Déterminer le plan selon le price_id
        const priceId = subscription.items.data[0]?.price.id;
        console.log(`   💰 Price ID: ${priceId}`);

        let planId = "FREE";
        if (priceId === process.env.STRIPE_VEILLE_BASIC_PRICE_ID) {
          planId = "VEILLE_BASIC";
        } else if (priceId === process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID) {
          planId = "VEILLE_UNLIMITED";
        }

        console.log(`   🎯 Plan détecté: ${planId}`);

        // Vérifier si une mise à jour est nécessaire
        const needsUpdate =
          org.stripeSubscriptionId !== subscription.id ||
          org.stripeSubscriptionPlan !== planId;

        if (needsUpdate) {
          console.log(`   🔄 Mise à jour nécessaire`);
          console.log(
            `      ${org.stripeSubscriptionPlan || "FREE"} → ${planId}`
          );

          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripeSubscriptionPlan: planId,
            },
          });

          // S'assurer que VeilleSubscription existe
          await prisma.veilleSubscription.upsert({
            where: { organizationId: org.id },
            create: {
              organizationId: org.id,
              cantons: [],
              keywords: [],
              emailNotifications: true,
              appNotifications: true,
            },
            update: {},
          });

          console.log(`   ✅ Organisation synchronisée avec succès`);
        } else {
          console.log(`   ✓ Déjà à jour, aucune modification nécessaire`);
        }
      } catch (error) {
        console.error(
          `   ❌ Erreur lors de la synchro pour ${org.name}:`,
          error
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ SYNCHRONISATION TERMINÉE");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
syncStripeSubscription();
