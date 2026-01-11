/**
 * Script de seed avec des données réalistes et connectées
 * Utilise Faker.js pour générer des données crédibles
 */

import { PrismaClient, Organization, User, Tender } from "@prisma/client";
import {
  createUser,
  createOrganization,
  addOrganizationMember,
  createTender,
  createOffer,
  createSavedSearch,
  createVeillePublication,
  createEquityLog,
  createNotification,
  createNotificationPreferences,
  createSavedTender,
  createVeilleSubscription,
  createTenderLot,
  createTenderCriteria,
  createOfferComment,
  createInvitationToken,
  createInvoice,
  createSubscription,
  createActivityLog,
} from "./factories";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Démarrage du seed avec données réalistes...\n");

  // ====================================
  // 1. UTILISATEURS (20 users)
  // ====================================
  console.log("👥 Création des utilisateurs...");

  const userEmails = [
    "marie.dubois@lausanne.ch",
    "jean.martin@geneve.ch",
    "sophie.bernard@fribourg.ch",
    "luc.favre@construction.ch",
    "claire.perret@architecture.ch",
    "nicolas.schmid@ingenierie.ch",
    "anne.monnier@travaux.ch",
    "pierre.ducommun@batiment.ch",
    "julie.rossier@commune-vd.ch",
    "marc.gaillard@entreprise.ch",
    "isabelle.muller@design.ch",
    "francois.blanc@projet.ch",
    "sarah.weber@conseil.ch",
    "laurent.fischer@technique.ch",
    "nathalie.keller@architect.ch",
    "olivier.roux@construction.ch",
    "catherine.girard@commune-ge.ch",
    "david.moreau@build.ch",
    "emilie.richard@renovation.ch",
    "thomas.lopez@infrastructure.ch",
  ];

  const users = [];
  for (const email of userEmails) {
    const firstName = email.split(".")[0];
    const lastName = email.split(".")[1].split("@")[0];
    const name = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${
      lastName.charAt(0).toUpperCase() + lastName.slice(1)
    }`;

    const user = await createUser(email, "Test1234!", name);
    users.push(user);
    console.log(`  ✓ ${name} (${email})`);
  }

  console.log(`✅ ${users.length} utilisateurs créés\n`);

  // ====================================
  // 2. ORGANISATIONS (20 orgs)
  // ====================================
  console.log("🏢 Création des organisations...");

  const organizations: Organization[] = [];

  // 4 Communes (20%)
  for (let i = 0; i < 4; i++) {
    const org = await createOrganization(users[i].id, "COMMUNE");
    organizations.push(org);
    console.log(`  ✓ ${org.name} (${org.city})`);
  }

  // 6 Entreprises (30%)
  for (let i = 4; i < 10; i++) {
    const org = await createOrganization(users[i].id, "ENTREPRISE");
    organizations.push(org);
    console.log(`  ✓ ${org.name} (${org.city})`);
  }

  // 10 Privés (50%) - Pour refléter la cible principale
  for (let i = 10; i < 20; i++) {
    const org = await createOrganization(users[i].id, "PRIVE");
    organizations.push(org);
    console.log(`  ✓ ${org.name}`);
  }

  console.log(`✅ ${organizations.length} organisations créées\n`);

  // ====================================
  // 3. MEMBRES D'ORGANISATIONS
  // ====================================
  console.log("👥 Ajout de membres aux organisations...");

  let memberCount = 0;
  // Chaque organisation a 1-3 membres additionnels
  for (let i = 0; i < organizations.length; i++) {
    const org = organizations[i];
    const numMembers = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < numMembers; j++) {
      const userIndex = (i + j + 1) % users.length;
      if (users[userIndex].id !== org.createdBy) {
        await addOrganizationMember(users[userIndex].id, org.id, "EDITOR");
        memberCount++;
      }
    }
  }

  console.log(`✅ ${memberCount} membres ajoutés\n`);

  // ====================================
  // 4. APPELS D'OFFRES (40 tenders)
  // ====================================
  console.log("📋 Création des appels d'offres...");

  const tenders: Tender[] = [];
  const communeOrgs = organizations.filter((o) => o.type === "COMMUNE");
  const privateOrgs = organizations.filter((o) => o.type === "PRIVE");
  const entrepriseOrgs = organizations.filter((o) => o.type === "ENTREPRISE");

  // 10 tenders pour les communes (25%)
  for (let i = 0; i < 10; i++) {
    const org = communeOrgs[i % communeOrgs.length];
    const tender = await createTender(org.id);
    tenders.push(tender);
    console.log(`  ✓ ${tender.title} (${org.name})`);
  }

  // 25 tenders pour les privés (62.5%) - Annonces simples de particuliers
  for (let i = 0; i < 25; i++) {
    const org = privateOrgs[i % privateOrgs.length];
    const tender = await createTender(org.id, { isSimpleMode: true });
    tenders.push(tender);
    console.log(`  ✓ ${tender.title} (${org.name})`);
  }

  // 5 tenders pour les entreprises (12.5%)
  for (let i = 0; i < 5; i++) {
    const org = entrepriseOrgs[i % entrepriseOrgs.length];
    const tender = await createTender(org.id);
    tenders.push(tender);
    console.log(`  ✓ ${tender.title} (${org.name})`);
  }

  console.log(`✅ ${tenders.length} appels d'offres créés\n`);

  // ====================================
  // 4. EQUITY LOGS (Journaux d'équité)
  // ====================================
  console.log("📜 Création des journaux d'équité...");

  let equityLogCount = 0;

  for (const tender of tenders) {
    const org = organizations.find((o) => o.id === tender.organizationId);
    const creator = users.find((u) => u.id === org?.createdBy);

    if (creator) {
      // Log de création
      await createEquityLog(tender.id, creator.id, "TENDER_CREATED");
      equityLogCount++;

      // Log de publication pour les tenders publiés
      if (tender.status === "PUBLISHED") {
        await createEquityLog(tender.id, creator.id, "TENDER_PUBLISHED", {
          publishedAt: tender.publishedAt,
        });
        equityLogCount++;
      }
    }
  }

  console.log(`✅ ${equityLogCount} logs d'équité créés\n`);

  // ====================================
  // 5. LOTS & CRITÈRES (pour tenders avancés)
  // ====================================
  console.log("🎯 Création des lots et critères...");

  let lotCount = 0;
  let criteriaCount = 0;

  const tendersWithLots = tenders.filter((t) => t.hasLots);
  for (const tender of tendersWithLots) {
    // Créer 2-4 lots
    const numLots = Math.floor(Math.random() * 3) + 2;
    for (let i = 1; i <= numLots; i++) {
      await createTenderLot(
        tender.id,
        i,
        tender.budget ? Math.round(tender.budget / numLots) : undefined
      );
      lotCount++;
    }
  }

  // Critères pour tous les tenders non-simples
  const tendersWithCriteria = tenders.filter((t) => !t.isSimpleMode);
  for (const tender of tendersWithCriteria) {
    await createTenderCriteria(tender.id);
    criteriaCount += 4; // 4 critères par tender
  }

  console.log(`✅ ${lotCount} lots créés`);
  console.log(`✅ ${criteriaCount} critères créés\n`);

  // ====================================
  // 6. OFFRES (60 offers)
  // ====================================
  console.log("💼 Création des offres...");

  let offerCount = 0;
  let publishedTenders = tenders.filter((t) => t.status === "PUBLISHED");

  for (const tender of publishedTenders) {
    const numOffers = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numOffers && offerCount < 60; i++) {
      const org = entrepriseOrgs[offerCount % entrepriseOrgs.length];

      // Ne pas créer d'offre si l'org est celle qui a créé le tender
      if (org.id !== tender.organizationId) {
        // 60% avec détails complets (lineItems, inclusions, etc.)
        const withDetails = Math.random() < 0.6;
        const offer = await createOffer(tender.id, org.id, tender, {
          withDetails,
        });
        offerCount++;

        // Ajouter log d'équité pour offre reçue
        const tenderCreator = users.find(
          (u) =>
            u.id ===
            organizations.find((o) => o.id === tender.organizationId)?.createdBy
        );
        if (tenderCreator) {
          await createEquityLog(tender.id, tenderCreator.id, "OFFER_RECEIVED", {
            offerId: offer.id,
            organizationName: org.name,
            price: offer.price,
          });
          equityLogCount++;
        }
      }
    }
  }

  console.log(`✅ ${offerCount} offres créées\n`);

  // ====================================
  // 7. COMMENTAIRES SUR OFFRES
  // ====================================
  console.log("💬 Création des commentaires...");

  let commentCount = 0;

  // Récupérer toutes les offres avec leur tender
  const allOffers = await prisma.offer.findMany({
    include: { tender: { include: { organization: true } } },
  });

  // 30% des offres ont des commentaires
  const offersWithComments = allOffers.filter(() => Math.random() < 0.3);

  for (const offer of offersWithComments) {
    const tenderOrg = offer.tender.organization;
    const creator = users.find((u) => u.id === tenderOrg.createdBy);

    if (creator) {
      await createOfferComment(offer.id, creator.id);
      commentCount++;

      // Parfois 2-3 commentaires
      if (Math.random() < 0.3) {
        await createOfferComment(offer.id, creator.id);
        commentCount++;
      }
    }
  }

  console.log(`✅ ${commentCount} commentaires créés\n`);

  // ====================================
  // 8. NOTIFICATIONS
  // ====================================
  console.log("🔔 Création des notifications...");

  let notificationCount = 0;

  // Notifications pour les émetteurs ayant reçu des offres
  for (const tender of publishedTenders.slice(0, 10)) {
    const org = organizations.find((o) => o.id === tender.organizationId);
    const creator = users.find((u) => u.id === org?.createdBy);

    if (creator) {
      await createNotification(creator.id, "OFFER_RECEIVED", {
        tenderId: tender.id,
        tenderTitle: tender.title,
      });
      notificationCount++;
    }
  }

  // Notifications pour deadline proche
  const tendersClosingSoon = publishedTenders.filter((t) => {
    const daysUntilDeadline = Math.ceil(
      (t.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline > 0 && daysUntilDeadline <= 3;
  });

  for (const tender of tendersClosingSoon.slice(0, 5)) {
    // Notifier 3-5 utilisateurs aléatoires
    const randomUsers = users
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 3);

    for (const user of randomUsers) {
      await createNotification(user.id, "TENDER_CLOSING_SOON", {
        tenderId: tender.id,
        tenderTitle: tender.title,
        deadline: tender.deadline,
      });
      notificationCount++;
    }
  }

  // Notifications veille
  for (let i = 0; i < 8; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    await createNotification(randomUser.id, "VEILLE_MATCH", {
      publicationTitle: "Nouvelle mise à l'enquête",
    });
    notificationCount++;
  }

  console.log(`✅ ${notificationCount} notifications créées\n`);

  // ====================================
  // 9. PRÉFÉRENCES DE NOTIFICATION
  // ====================================
  console.log("⚙️ Création des préférences de notification...");

  let prefCount = 0;
  for (const user of users) {
    await createNotificationPreferences(user.id);
    prefCount++;
  }

  console.log(`✅ ${prefCount} préférences créées\n`);

  // ====================================
  // 10. TENDERS SAUVEGARDÉS (Favoris)
  // ====================================
  console.log("⭐ Création des tenders sauvegardés...");

  let savedTenderCount = 0;

  // Chaque utilisateur sauvegarde 0-3 tenders
  for (const user of users) {
    const numSaved = Math.floor(Math.random() * 4); // 0-3
    const randomTenders = publishedTenders
      .sort(() => 0.5 - Math.random())
      .slice(0, numSaved);

    for (const tender of randomTenders) {
      const saved = await createSavedTender(user.id, tender.id);
      if (saved) savedTenderCount++;
    }
  }

  console.log(`✅ ${savedTenderCount} tenders sauvegardés\n`);

  // ====================================
  // 11. RECHERCHES SAUVEGARDÉES (15)
  // ====================================
  console.log(" Création des recherches sauvegardées...");

  let searchCount = 0;
  for (let i = 0; i < 15; i++) {
    const user = users[i % users.length];
    await createSavedSearch(user.id);
    searchCount++;
  }

  console.log(`✅ ${searchCount} recherches sauvegardées créées\n`);

  // ====================================
  // 12. VEILLE - SUBSCRIPTIONS & PUBLICATIONS
  // ====================================
  console.log("📰 Création des subscriptions et publications de veille...");

  let veilleSubCount = 0;
  let pubCount = 0;

  // 50% des communes ont une subscription veille
  for (const org of communeOrgs) {
    if (Math.random() < 0.5) {
      await createVeilleSubscription(org.id);
      veilleSubCount++;
    }
  }

  // Créer 150 publications
  for (let i = 0; i < 150; i++) {
    await createVeillePublication();
    pubCount++;
  }

  console.log(`✅ ${veilleSubCount} subscriptions veille créées`);
  console.log(`✅ ${pubCount} publications de veille créées\n`);

  // ====================================
  // 13. SUBSCRIPTIONS & FACTURES (Stripe)
  // ====================================
  console.log("💳 Création des subscriptions et factures...");

  let subscriptionCount = 0;
  let invoiceCount = 0;

  // Subscriptions pour toutes les organisations
  for (const org of organizations) {
    let plan: "FREE" | "VEILLE_BASIC" | "VEILLE_UNLIMITED" = "FREE";

    if (org.type === "COMMUNE") {
      // 60% des communes ont un plan payant
      if (Math.random() < 0.6) {
        plan = Math.random() < 0.7 ? "VEILLE_BASIC" : "VEILLE_UNLIMITED";
      }
    }

    await createSubscription(org.id, plan);
    subscriptionCount++;

    // Créer des factures pour les organisations avec plan payant
    if (plan !== "FREE") {
      // 2-4 factures par organisation
      const numInvoices = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numInvoices; i++) {
        await createInvoice(
          org.id,
          "subscription",
          plan === "VEILLE_BASIC" ? 5 : 10
        );
        invoiceCount++;
      }
    }
  }

  // Factures pour publication de tenders
  for (const tender of publishedTenders.slice(0, 15)) {
    await createInvoice(tender.organizationId, "tender", 10);
    invoiceCount++;
  }

  // Factures pour soumission d'offres (si payant à l'avenir)
  const submittedOffers = await prisma.offer.findMany({
    where: { status: "SUBMITTED" },
    take: 10,
  });
  for (const offer of submittedOffers) {
    if (Math.random() < 0.3) {
      // 30% des offres ont une facture
      await createInvoice(offer.organizationId, "offer", 5);
      invoiceCount++;
    }
  }

  console.log(`✅ ${subscriptionCount} subscriptions créées`);
  console.log(`✅ ${invoiceCount} factures créées\n`);

  // ====================================
  // 14. INVITATIONS
  // ====================================
  console.log("✉️ Création des invitations...");

  let invitationCount = 0;

  // 30% des organisations ont des invitations en attente
  for (const org of organizations) {
    if (Math.random() < 0.3) {
      const inviter = users.find((u) => u.id === org.createdBy);
      if (inviter) {
        const numInvitations = Math.floor(Math.random() * 3) + 1; // 1-3 invitations
        for (let i = 0; i < numInvitations; i++) {
          await createInvitationToken(
            org.id,
            inviter.id,
            `invite${invitationCount}@example.com`,
            Math.random() < 0.5 ? "EDITOR" : "VIEWER"
          );
          invitationCount++;
        }
      }
    }
  }

  console.log(`✅ ${invitationCount} invitations créées\n`);

  // ====================================
  // 15. ACTIVITY LOGS (Super admin)
  // ====================================
  console.log("📊 Création des activity logs...");

  let activityLogCount = 0;

  // Logs de création d'utilisateurs
  for (const user of users.slice(0, 10)) {
    await createActivityLog("USER_CREATED", user.id, {
      email: user.email,
      name: user.name,
    });
    activityLogCount++;
  }

  // Logs de création d'organisations
  for (const org of organizations.slice(0, 10)) {
    const creator = users.find((u) => u.id === org.createdBy);
    await createActivityLog("ORGANIZATION_CREATED", creator?.id, {
      organizationId: org.id,
      organizationName: org.name,
      type: org.type,
    });
    activityLogCount++;
  }

  // Logs de publication de tenders
  for (const tender of publishedTenders.slice(0, 15)) {
    const org = organizations.find((o) => o.id === tender.organizationId);
    const creator = users.find((u) => u.id === org?.createdBy);
    await createActivityLog("TENDER_PUBLISHED", creator?.id, {
      tenderId: tender.id,
      tenderTitle: tender.title,
    });
    activityLogCount++;
  }

  // Logs de soumission d'offres
  for (const offer of submittedOffers.slice(0, 20)) {
    await createActivityLog("OFFER_SUBMITTED", undefined, {
      offerId: offer.id,
      tenderId: offer.tenderId,
      organizationId: offer.organizationId,
    });
    activityLogCount++;
  }

  // Logs de paiements
  for (let i = 0; i < 10; i++) {
    const randomOrg =
      organizations[Math.floor(Math.random() * organizations.length)];
    const creator = users.find((u) => u.id === randomOrg.createdBy);
    await createActivityLog("PAYMENT_SUCCESS", creator?.id, {
      organizationId: randomOrg.id,
      amount: Math.random() < 0.5 ? 10 : 5,
    });
    activityLogCount++;
  }

  console.log(`✅ ${activityLogCount} activity logs créés\n`);

  // Rafraîchir publishedTenders après ajout des offres
  publishedTenders = tenders.filter((t) => t.status === "PUBLISHED");

  // Statistiques détaillées
  const communeTenders = tenders.filter((t) =>
    communeOrgs.some((o) => o.id === t.organizationId)
  );
  const privateTenders = tenders.filter((t) =>
    privateOrgs.some((o) => o.id === t.organizationId)
  );
  const entrepriseTenders = tenders.filter((t) =>
    entrepriseOrgs.some((o) => o.id === t.organizationId)
  );

  // ====================================
  // RÉSUMÉ
  // ====================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ Seed terminé avec succès!\n");
  console.log("📊 Résumé des données créées:");
  console.log(`\n👥 Utilisateurs & Organisations:`);
  console.log(`   • ${users.length} utilisateurs`);
  console.log(`   • ${organizations.length} organisations au total`);
  console.log(
    `     - ${communeOrgs.length} communes (${Math.round(
      (communeOrgs.length / organizations.length) * 100
    )}%)`
  );
  console.log(
    `     - ${entrepriseOrgs.length} entreprises (${Math.round(
      (entrepriseOrgs.length / organizations.length) * 100
    )}%)`
  );
  console.log(
    `     - ${privateOrgs.length} privés (${Math.round(
      (privateOrgs.length / organizations.length) * 100
    )}%) 🏠`
  );
  console.log(`   • ${memberCount} membres d'organisations\n`);

  console.log(`📋 Appels d'offres:`);
  console.log(`   • ${tenders.length} appels d'offres au total`);
  console.log(
    `     - ${publishedTenders.length} publiés (${Math.round(
      (publishedTenders.length / tenders.length) * 100
    )}%)`
  );
  console.log(
    `     - ${
      tenders.length - publishedTenders.length
    } brouillons (${Math.round(
      ((tenders.length - publishedTenders.length) / tenders.length) * 100
    )}%)`
  );
  console.log(`   • Par type d'émetteur:`);
  console.log(
    `     - ${communeTenders.length} par des communes (${Math.round(
      (communeTenders.length / tenders.length) * 100
    )}%)`
  );
  console.log(
    `     - ${privateTenders.length} par des privés (${Math.round(
      (privateTenders.length / tenders.length) * 100
    )}%) 🏠`
  );
  console.log(
    `     - ${entrepriseTenders.length} par des entreprises (${Math.round(
      (entrepriseTenders.length / tenders.length) * 100
    )}%)\n`
  );

  console.log(`💼 Offres & Interactions:`);
  console.log(`   • ${offerCount} offres déposées`);
  console.log(`   • ${commentCount} commentaires sur offres`);
  console.log(`   • ${savedTenderCount} tenders sauvegardés (favoris)`);
  console.log(`   • ${searchCount} recherches sauvegardées\n`);

  console.log(`📜 Traçabilité & Notifications:`);
  console.log(`   • ${equityLogCount} logs d'équité`);
  console.log(`   • ${notificationCount} notifications`);
  console.log(`   • ${prefCount} préférences de notification\n`);

  console.log(`🏛️ Module Veille:`);
  console.log(`   • ${veilleSubCount} subscriptions veille actives`);
  console.log(`   • ${pubCount} publications de veille\n`);

  console.log(`💳 Facturation & Abonnements:`);
  console.log(`   • ${subscriptionCount} subscriptions (Stripe)`);
  console.log(`   • ${invoiceCount} factures générées\n`);

  console.log(`✉️ Collaborations:`);
  console.log(`   • ${invitationCount} invitations en cours\n`);

  console.log(`📊 Administration:`);
  console.log(`   • ${activityLogCount} activity logs (super admin)\n`);

  console.log(`🎯 Fonctionnalités avancées:`);
  console.log(`   • ${lotCount} lots créés (tenders avec lots)`);
  console.log(`   • ${criteriaCount} critères d'évaluation\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🔐 Tous les utilisateurs utilisent le mot de passe: Test1234!");
  console.log("📧 Les emails sont vérifiés automatiquement");
  console.log(
    "🏠 L'application est maintenant optimisée pour les particuliers !"
  );
  console.log("✨ Toutes les fonctionnalités sont maintenant testables !\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur durant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
