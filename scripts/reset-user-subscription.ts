import { prisma } from "@/lib/db/prisma";

/**
 * Script pour supprimer l'abonnement Stripe d'un utilisateur
 * Usage: npx tsx scripts/reset-user-subscription.ts
 */

async function resetUserSubscription() {
  const userEmail = "perrottet.guillaume.97@gmail.com";

  console.log(`🔍 Recherche de l'utilisateur: ${userEmail}`);

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      memberships: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) {
    console.error("❌ Utilisateur non trouvé");
    return;
  }

  console.log(`✅ Utilisateur trouvé: ${user.name} (${user.id})`);
  console.log(`📊 ${user.memberships.length} organisation(s)`);

  for (const membership of user.memberships) {
    const org = membership.organization;
    console.log(`\n🏢 Organisation: ${org.name} (${org.id})`);

    // Réinitialiser les champs Stripe
    if (
      org.stripeCustomerId ||
      org.stripeSubscriptionId ||
      org.stripeSubscriptionPlan
    ) {
      console.log(`   Stripe Customer ID: ${org.stripeCustomerId}`);
      console.log(`   Stripe Subscription ID: ${org.stripeSubscriptionId}`);
      console.log(`   Stripe Subscription Plan: ${org.stripeSubscriptionPlan}`);

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          stripeSubscriptionId: null,
          stripeSubscriptionPlan: null,
        },
      });

      console.log(`   ✅ Champs Stripe réinitialisés`);
    } else {
      console.log(`   ℹ️  Aucun abonnement Stripe actif`);
    }

    // Supprimer ou désactiver la VeilleSubscription
    const veilleSubscription = await prisma.veilleSubscription.findUnique({
      where: { organizationId: org.id },
    });

    if (veilleSubscription) {
      console.log(
        `   📡 VeilleSubscription trouvée (${veilleSubscription.cantons.length} cantons)`
      );

      await prisma.veilleSubscription.delete({
        where: { organizationId: org.id },
      });

      console.log(`   ✅ VeilleSubscription supprimée`);
    } else {
      console.log(`   ℹ️  Aucune VeilleSubscription`);
    }
  }

  console.log("\n✅ Réinitialisation terminée !");
  console.log("💡 Tu peux maintenant retester l'abonnement Stripe");
}

resetUserSubscription()
  .then(() => {
    console.log("\n✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  });
