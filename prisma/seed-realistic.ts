/**
 * Script de seed avec des données réalistes et connectées
 * Utilise Faker.js pour générer des données crédibles
 */

import { PrismaClient } from "@prisma/client";
import {
  createUser,
  createOrganization,
  addOrganizationMember,
  createTender,
  createOffer,
  createSavedSearch,
  createVeillePublication,
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
  // 2. ORGANISATIONS (15 orgs)
  // ====================================
  console.log("🏢 Création des organisations...");

  const organizations = [];

  // 6 Communes
  for (let i = 0; i < 6; i++) {
    const org = await createOrganization(users[i].id, "COMMUNE");
    organizations.push(org);
    console.log(`  ✓ ${org.name} (${org.city})`);
  }

  // 7 Entreprises
  for (let i = 6; i < 13; i++) {
    const org = await createOrganization(users[i].id, "ENTREPRISE");
    organizations.push(org);
    console.log(`  ✓ ${org.name} (${org.city})`);
  }

  // 2 Privés
  for (let i = 13; i < 15; i++) {
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
  // 4. APPELS D'OFFRES (30 tenders)
  // ====================================
  console.log("📋 Création des appels d'offres...");

  const tenders = [];
  const communeOrgs = organizations.filter((o) => o.type === "COMMUNE");
  const privateOrgs = organizations.filter((o) => o.type === "PRIVE");

  // 20 tenders pour les communes
  for (let i = 0; i < 20; i++) {
    const org = communeOrgs[i % communeOrgs.length];
    const tender = await createTender(org.id);
    tenders.push(tender);
    console.log(`  ✓ ${tender.title} (${org.name})`);
  }

  // 10 tenders pour les privés
  for (let i = 0; i < 10; i++) {
    const org = privateOrgs[i % privateOrgs.length];
    const tender = await createTender(org.id);
    tenders.push(tender);
    console.log(`  ✓ ${tender.title} (${org.name})`);
  }

  console.log(`✅ ${tenders.length} appels d'offres créés\n`);

  // ====================================
  // 5. OFFRES (50 offers)
  // ====================================
  console.log("💼 Création des offres...");

  const entrepriseOrgs = organizations.filter((o) => o.type === "ENTREPRISE");
  let offerCount = 0;

  // Chaque tender publié reçoit 1-4 offres
  const publishedTenders = tenders.filter((t) => t.status === "PUBLISHED");

  for (const tender of publishedTenders) {
    const numOffers = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numOffers && offerCount < 50; i++) {
      const org = entrepriseOrgs[offerCount % entrepriseOrgs.length];

      // Ne pas créer d'offre si l'org est celle qui a créé le tender
      if (org.id !== tender.organizationId) {
        await createOffer(tender.id, org.id, tender);
        offerCount++;
      }
    }
  }

  console.log(`✅ ${offerCount} offres créées\n`);

  // ====================================
  // 6. RECHERCHES SAUVEGARDÉES (15)
  // ====================================
  console.log("🔍 Création des recherches sauvegardées...");

  let searchCount = 0;
  for (let i = 0; i < 15; i++) {
    const user = users[i % users.length];
    await createSavedSearch(user.id);
    searchCount++;
  }

  console.log(`✅ ${searchCount} recherches sauvegardées créées\n`);

  // ====================================
  // 7. PUBLICATIONS DE VEILLE (40)
  // ====================================
  console.log("📰 Création des publications de veille...");

  let pubCount = 0;
  for (let i = 0; i < 40; i++) {
    await createVeillePublication();
    pubCount++;
  }

  console.log(`✅ ${pubCount} publications de veille créées\n`);

  // ====================================
  // RÉSUMÉ
  // ====================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ Seed terminé avec succès!\n");
  console.log("📊 Résumé des données créées:");
  console.log(`   • ${users.length} utilisateurs`);
  console.log(`   • ${organizations.length} organisations`);
  console.log(`     - ${communeOrgs.length} communes`);
  console.log(`     - ${entrepriseOrgs.length} entreprises`);
  console.log(`     - ${privateOrgs.length} privés`);
  console.log(`   • ${memberCount} membres d'organisations`);
  console.log(`   • ${tenders.length} appels d'offres`);
  console.log(`     - ${publishedTenders.length} publiés`);
  console.log(`     - ${tenders.length - publishedTenders.length} brouillons`);
  console.log(`   • ${offerCount} offres`);
  console.log(`   • ${searchCount} recherches sauvegardées`);
  console.log(`   • ${pubCount} publications de veille`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🔐 Tous les utilisateurs utilisent le mot de passe: Test1234!");
  console.log("📧 Les emails sont vérifiés automatiquement\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur durant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
