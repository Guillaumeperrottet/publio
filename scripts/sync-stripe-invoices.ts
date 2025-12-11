/**
 * Script pour synchroniser les factures Stripe existantes
 * Utile pour importer l'historique des factures
 *
 * Usage:
 * npx tsx scripts/sync-stripe-invoices.ts
 */

import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

async function syncStripeInvoices() {
  console.log("=".repeat(60));
  console.log("🔄 SYNCHRONISATION FACTURES STRIPE");
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
      },
    });

    console.log(`\n📊 ${organizations.length} organisation(s) avec Stripe\n`);

    let totalSynced = 0;

    for (const org of organizations) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`🏢 Organisation: ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Stripe Customer ID: ${org.stripeCustomerId}`);

      if (!org.stripeCustomerId) continue;

      try {
        // Récupérer toutes les factures depuis Stripe
        const invoices = await stripe.invoices.list({
          customer: org.stripeCustomerId,
          limit: 100,
        });

        console.log(`   📋 ${invoices.data.length} facture(s) trouvée(s)`);

        for (const stripeInvoice of invoices.data) {
          // Vérifier si la facture existe déjà en BDD
          const existingInvoice = await prisma.invoice.findFirst({
            where: { stripeInvoiceId: stripeInvoice.id },
          });

          if (existingInvoice) {
            console.log(`   ⏭️  Facture ${stripeInvoice.number} déjà en BDD`);
            continue;
          }

          // Créer la facture
          const status =
            stripeInvoice.status === "paid"
              ? "PAID"
              : stripeInvoice.status === "open"
              ? "PENDING"
              : "FAILED";

          const paymentIntent = (
            stripeInvoice as Stripe.Invoice & {
              payment_intent?: string | Stripe.PaymentIntent;
            }
          ).payment_intent;

          await prisma.invoice.create({
            data: {
              number: stripeInvoice.number || `INV-${Date.now()}`,
              amount: stripeInvoice.amount_paid / 100, // Convertir centimes → CHF
              currency: stripeInvoice.currency.toUpperCase(),
              status,
              description:
                stripeInvoice.lines.data[0]?.description || "Abonnement Veille",
              stripeInvoiceId: stripeInvoice.id,
              stripePaymentIntentId:
                typeof paymentIntent === "string"
                  ? paymentIntent
                  : paymentIntent?.id,
              paidAt: stripeInvoice.status_transitions.paid_at
                ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
                : null,
              organizationId: org.id,
            },
          });

          console.log(
            `   ✅ Facture ${stripeInvoice.number} créée (${status})`
          );
          totalSynced++;
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour ${org.name}:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ SYNCHRONISATION TERMINÉE - ${totalSynced} facture(s)`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
syncStripeInvoices();
