/**
 * Script de seed pour la base de données
 * Usage: npx tsx prisma/seed.ts
 *
 * Crée des données de test réalistes pour faciliter le développement
 */

import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth/config";

const prisma = new PrismaClient();
async function main() {
  console.log("🌱 Début du seeding...\n");

  // Nettoyer la base (optionnel - décommenter si besoin)
  // await prisma.equityLog.deleteMany();
  // await prisma.savedTender.deleteMany();
  // await prisma.offer.deleteMany();
  // await prisma.tender.deleteMany();
  // await prisma.organizationMember.deleteMany();
  // await prisma.organization.deleteMany();
  // await prisma.session.deleteMany();
  // await prisma.account.deleteMany();
  // await prisma.user.deleteMany();

  // ============================================
  // 1. CRÉER DES UTILISATEURS AVEC BETTER AUTH
  // ============================================
  console.log("👤 Création des utilisateurs avec Better Auth...");

  // Helper pour créer un utilisateur avec email/password via Better Auth
  async function createUserWithPassword(
    email: string,
    password: string,
    name: string
  ) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`  ℹ️  Utilisateur ${email} existe déjà`);
        return existingUser;
      }

      // Créer l'utilisateur via Better Auth API
      // Better Auth va créer à la fois le user ET le compte avec mot de passe hashé
      const response = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (!response) {
        throw new Error(`Échec de création pour ${email}`);
      }

      console.log(`  ✅ Utilisateur créé: ${email}`);

      // Récupérer l'utilisateur créé
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error(`Utilisateur ${email} non trouvé après création`);
      }

      // Marquer l'email comme vérifié pour faciliter les tests
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      return user;
    } catch (error) {
      console.error(`  ❌ Erreur pour ${email}:`, error);
      throw error;
    }
  }

  // Créer les 4 utilisateurs de test
  const user1 = await createUserWithPassword(
    "commune.fribourg@test.ch",
    "Test1234!",
    "Commune de Fribourg"
  );

  const user2 = await createUserWithPassword(
    "entreprise.construction@test.ch",
    "Test1234!",
    "Jean Dupont"
  );

  const user3 = await createUserWithPassword(
    "architecte.lausanne@test.ch",
    "Test1234!",
    "Marie Martin"
  );

  const user4 = await createUserWithPassword(
    "bureau.ingenieur@test.ch",
    "Test1234!",
    "Pierre Schneider"
  );

  // Utilisateurs supplémentaires pour tester les rôles
  const user5 = await createUserWithPassword(
    "admin.construction@test.ch",
    "Test1234!",
    "Sophie Lambert"
  );

  const user6 = await createUserWithPassword(
    "editor.construction@test.ch",
    "Test1234!",
    "Thomas Müller"
  );

  const user7 = await createUserWithPassword(
    "viewer.construction@test.ch",
    "Test1234!",
    "Julie Moreau"
  );

  console.log("✅ 7 utilisateurs créés avec leurs comptes Better Auth");
  console.log("🔑 Mot de passe pour tous: Test1234!\n");

  // ============================================
  // 2. CRÉER DES ORGANISATIONS
  // ============================================
  console.log("🏢 Création des organisations...");

  const orgCommune = await prisma.organization.upsert({
    where: { id: "org-commune-fribourg" },
    update: {},
    create: {
      id: "org-commune-fribourg",
      name: "Ville de Fribourg",
      type: "COMMUNE",
      description: "Administration communale de la ville de Fribourg",
      city: "Fribourg",
      canton: "FR",
      address: "Place de l'Hôtel de Ville 5",
      phone: "+41 26 351 71 11",
      email: "info@ville-fribourg.ch",
      website: "https://ville-fribourg.ch",
      createdBy: user1.id,
      members: {
        create: [
          {
            userId: user1.id,
            role: "OWNER",
          },
        ],
      },
    },
  });

  const orgEntreprise = await prisma.organization.upsert({
    where: { id: "org-construction-sa" },
    update: {},
    create: {
      id: "org-construction-sa",
      name: "Construction Pro SA",
      type: "ENTREPRISE",
      description: "Entreprise générale de construction",
      city: "Lausanne",
      canton: "VD",
      address: "Rue du Commerce 12",
      phone: "+41 21 345 67 89",
      email: "contact@construction-pro.ch",
      website: "https://construction-pro.ch",
      createdBy: user2.id,
      members: {
        create: [
          {
            userId: user2.id,
            role: "OWNER", // User2 est OWNER
          },
          {
            userId: user5.id,
            role: "ADMIN", // ✅ User5 est ADMIN
          },
          {
            userId: user6.id,
            role: "EDITOR", // ✅ User6 est EDITOR
          },
          {
            userId: user7.id,
            role: "VIEWER", // ✅ User7 est VIEWER
          },
        ],
      },
    },
  });

  const orgArchitecte = await prisma.organization.upsert({
    where: { id: "org-architectes-associes" },
    update: {},
    create: {
      id: "org-architectes-associes",
      name: "Architectes Associés Sàrl",
      type: "ENTREPRISE",
      description: "Bureau d'architecture moderne et durable",
      city: "Lausanne",
      canton: "VD",
      address: "Avenue de la Gare 24",
      phone: "+41 21 456 78 90",
      email: "info@architectes-associes.ch",
      website: "https://architectes-associes.ch",
      createdBy: user3.id,
      members: {
        create: [
          {
            userId: user3.id,
            role: "OWNER",
          },
        ],
      },
    },
  });

  const orgIngenieur = await prisma.organization.upsert({
    where: { id: "org-bureau-ingenieur" },
    update: {},
    create: {
      id: "org-bureau-ingenieur",
      name: "Bureau d'Ingénieurs Conseils SA",
      type: "ENTREPRISE",
      description: "Ingénierie civile et génie civil",
      city: "Genève",
      canton: "GE",
      address: "Rue des Alpes 45",
      phone: "+41 22 567 89 01",
      email: "contact@bureau-ingenieurs.ch",
      createdBy: user4.id,
      members: {
        create: [
          {
            userId: user4.id,
            role: "OWNER",
          },
        ],
      },
    },
  });

  console.log("✅ 4 organisations créées\n");

  // ============================================
  // 3. CRÉER DES APPELS D'OFFRES
  // ============================================
  console.log("📢 Création des appels d'offres...");

  // Tender 1: Publié, mode anonyme, deadline future
  const tender1 = await prisma.tender.create({
    data: {
      title: "Rénovation de la salle polyvalente communale",
      summary:
        "Travaux de rénovation complète de la salle polyvalente incluant isolation, peinture et mise aux normes électriques",
      description: `
La Ville de Fribourg lance un appel d'offres pour la rénovation complète de sa salle polyvalente située au centre-ville.

## Travaux à réaliser :
- Isolation thermique des murs et plafond
- Remplacement des installations électriques
- Peinture intérieure et extérieure
- Remplacement du chauffage
- Mise en conformité des normes de sécurité

## Contraintes :
- Travaux à réaliser pendant la fermeture estivale (juillet-août 2026)
- Accès limité les week-ends
- Site occupé partiellement (bureaux adjacents)

## Documents requis :
- Références de projets similaires
- Certificats d'assurance
- Plan de sécurité du chantier
      `.trim(),
      marketType: "CONSTRUCTION",
      cfcCodes: ["C2", "C3", "E1"],
      budget: 450000,
      showBudget: true,
      surfaceM2: 850,
      constraints: [
        "Accès limité les week-ends",
        "Site partiellement occupé",
        "Travaux en période estivale uniquement",
      ],
      contractDuration: 60,
      contractStartDate: new Date("2026-07-01"),
      status: "PUBLISHED",
      visibility: "PUBLIC",
      mode: "ANONYMOUS",
      procedure: "OPEN",
      isSimpleMode: false,
      selectionPriority: "QUALITY_PRICE",
      publishedAt: new Date("2025-12-01"),
      deadline: new Date("2026-01-15T17:00:00.000Z"),
      questionDeadline: new Date("2026-01-08T17:00:00.000Z"),
      location: "Fribourg centre-ville",
      address: "Rue de Morat 15",
      city: "Fribourg",
      canton: "FR",
      participationConditions:
        "Entreprise enregistrée au RC suisse, assurance RC professionnelle min. CHF 2'000'000",
      requiredDocuments:
        "Extrait RC, attestation assurance, références (min. 2 projets similaires)",
      requiresReferences: true,
      requiresInsurance: true,
      minExperience: 5,
      organizationId: orgCommune.id,
    },
  });

  // Tender 2: Publié, mode classique, deadline passée
  const tender2 = await prisma.tender.create({
    data: {
      title: "Construction d'un parking souterrain - 80 places",
      summary:
        "Réalisation d'un parking souterrain de 80 places avec ventilation et système de gestion automatisé",
      description: `
Construction d'un parking souterrain moderne de 80 places sous la Place de la Gare.

## Caractéristiques techniques :
- 2 niveaux souterrains
- Système de ventilation mécanique
- Bornes de recharge électrique (20 places)
- Système de gestion automatisé des entrées/sorties
- Éclairage LED basse consommation

## Délais :
- Phase 1 (excavation) : 4 mois
- Phase 2 (gros œuvre) : 8 mois
- Phase 3 (finitions) : 3 mois
      `.trim(),
      marketType: "CONSTRUCTION",
      cfcCodes: ["C1", "C2", "E1", "E2"],
      budget: 3500000,
      showBudget: true,
      volumeM3: 12000,
      constraints: [
        "Circulation maintenue sur la place",
        "Nuisances sonores limitées 7h-19h",
        "Coordination avec CFF",
      ],
      contractDuration: 450,
      contractStartDate: new Date("2026-03-01"),
      status: "CLOSED",
      visibility: "PUBLIC",
      mode: "CLASSIC",
      procedure: "OPEN",
      isSimpleMode: false,
      selectionPriority: "QUALITY_PRICE",
      publishedAt: new Date("2025-10-15"),
      deadline: new Date("2025-12-01T17:00:00.000Z"),
      questionDeadline: new Date("2025-11-24T17:00:00.000Z"),
      location: "Fribourg Gare",
      address: "Place de la Gare",
      city: "Fribourg",
      canton: "FR",
      requiresReferences: true,
      requiresInsurance: true,
      minExperience: 10,
      organizationId: orgCommune.id,
      identityRevealed: true,
    },
  });

  // Tender 3: Draft (brouillon)
  await prisma.tender.create({
    data: {
      title: "Aménagement paysager du parc municipal",
      summary:
        "Création d'espaces verts, jeux pour enfants et zones de détente",
      description: `
Projet d'aménagement paysager complet du parc municipal incluant :
- Plantation d'arbres et arbustes
- Création d'une aire de jeux pour enfants
- Installation de bancs et mobilier urbain
- Système d'arrosage automatique
      `.trim(),
      marketType: "CONSTRUCTION",
      cfcCodes: ["G1", "G2"],
      budget: 180000,
      showBudget: true,
      surfaceM2: 2500,
      status: "DRAFT",
      visibility: "PUBLIC",
      mode: "ANONYMOUS",
      procedure: "OPEN",
      isSimpleMode: true,
      selectionPriority: "ECO_FRIENDLY",
      deadline: new Date("2026-03-01T17:00:00.000Z"),
      city: "Fribourg",
      canton: "FR",
      organizationId: orgCommune.id,
    },
  });

  // Tender 4: Publié récemment, mode anonyme
  const tender4 = await prisma.tender.create({
    data: {
      title: "Étude technique pour nouveau pont piétonnier",
      summary:
        "Bureau d'ingénieurs recherché pour étude de faisabilité et avant-projet",
      description: `
La Ville de Fribourg souhaite réaliser une étude de faisabilité pour la construction d'un pont piétonnier enjambant la Sarine.

## Prestations attendues :
- Étude géotechnique du site
- Étude des variantes techniques
- Avant-projet détaillé (3 variantes)
- Estimation des coûts
- Planning prévisionnel

## Livrables :
- Rapport d'étude (format PDF)
- Plans techniques (format DWG)
- Modélisation 3D (format IFC)
- Présentation PowerPoint
      `.trim(),
      marketType: "ENGINEERING",
      cfcCodes: ["A1", "A2"],
      budget: 85000,
      showBudget: true,
      contractDuration: 120,
      contractStartDate: new Date("2026-02-01"),
      status: "PUBLISHED",
      visibility: "PUBLIC",
      mode: "ANONYMOUS",
      procedure: "SELECTIVE",
      isSimpleMode: false,
      selectionPriority: "BEST_REFERENCES",
      publishedAt: new Date("2025-12-10"),
      deadline: new Date("2026-02-10T17:00:00.000Z"),
      questionDeadline: new Date("2026-02-03T17:00:00.000Z"),
      location: "Fribourg, quartier Pérolles",
      city: "Fribourg",
      canton: "FR",
      requiresReferences: true,
      minExperience: 8,
      organizationId: orgCommune.id,
    },
  });

  // Tender 5: Mode ANONYME avec identité RÉVÉLÉE (deadline passée)
  const tender5 = await prisma.tender.create({
    data: {
      title: "Installation système de vidéosurveillance communale",
      summary:
        "Déploiement d'un système de vidéosurveillance moderne avec 25 caméras",
      description: `
Projet de sécurisation des espaces publics avec installation de caméras haute définition.

## Équipements :
- 25 caméras IP haute résolution
- Serveur d'enregistrement redondant
- Logiciel de gestion centralisé
- Formation du personnel communal

## Zones couvertes :
- Gare et parking
- Centre-ville
- Parcs publics
- Bâtiments administratifs
      `.trim(),
      marketType: "IT_SERVICES",
      cfcCodes: ["E2", "E3"],
      budget: 220000,
      showBudget: true,
      contractDuration: 90,
      status: "CLOSED",
      visibility: "PUBLIC",
      mode: "ANONYMOUS",
      procedure: "OPEN",
      isSimpleMode: false,
      selectionPriority: "QUALITY_PRICE",
      publishedAt: new Date("2025-10-01"),
      deadline: new Date("2025-11-30T17:00:00.000Z"),
      questionDeadline: new Date("2025-11-23T17:00:00.000Z"),
      city: "Fribourg",
      canton: "FR",
      organizationId: orgCommune.id,
      identityRevealed: true, // ✅ IDENTITÉ RÉVÉLÉE après deadline
      revealedAt: new Date("2025-11-30T17:01:00.000Z"),
    },
  });

  // Tender 6: Mode ANONYME ATTRIBUÉ (marché attribué)
  const tender6 = await prisma.tender.create({
    data: {
      title: "Fourniture matériel de bureau pour services communaux",
      summary: "Fourniture de mobilier et équipement de bureau pour 3 ans",
      description: `
Appel d'offres pour fourniture de matériel de bureau pour l'ensemble des services communaux.

## Lots :
- Lot 1 : Mobilier (bureaux, chaises, armoires)
- Lot 2 : Informatique (ordinateurs, écrans, imprimantes)
- Lot 3 : Fournitures consommables

## Conditions :
- Livraison échelonnée sur 3 ans
- Service après-vente local
- Garantie minimum 2 ans sur le matériel
      `.trim(),
      marketType: "SUPPLIES",
      cfcCodes: ["S1", "S2"],
      budget: 95000,
      showBudget: false,
      contractDuration: 1095, // 3 ans
      status: "AWARDED",
      visibility: "PUBLIC",
      mode: "ANONYMOUS",
      procedure: "OPEN",
      isSimpleMode: true,
      selectionPriority: "LOWEST_PRICE",
      publishedAt: new Date("2025-09-01"),
      deadline: new Date("2025-10-15T17:00:00.000Z"),
      city: "Fribourg",
      canton: "FR",
      organizationId: orgCommune.id,
      identityRevealed: true,
      revealedAt: new Date("2025-10-15T17:01:00.000Z"),
    },
  });

  // Tender 7: Mode CLASSIQUE en cours (pour contraste avec anonyme)
  const tender7 = await prisma.tender.create({
    data: {
      title: "Maintenance annuelle des espaces verts communaux",
      summary: "Entretien régulier des parcs, jardins et espaces verts",
      description: `
Contrat annuel de maintenance des espaces verts de la commune.

## Prestations :
- Tonte hebdomadaire avril-octobre
- Taille des haies et arbustes
- Plantation saisonnière
- Désherbage et entretien
- Ramassage des feuilles automne

## Zones :
- 5 parcs publics (12 hectares)
- Abords bâtiments communaux
- Ronds-points et îlots centraux
      `.trim(),
      marketType: "MAINTENANCE",
      cfcCodes: ["G1", "G2"],
      budget: 145000,
      showBudget: true,
      contractDuration: 365,
      isRenewable: true,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      mode: "CLASSIC", // ✅ MODE CLASSIQUE (identité visible dès le début)
      procedure: "OPEN",
      isSimpleMode: true,
      selectionPriority: "ECO_FRIENDLY",
      publishedAt: new Date("2025-12-08"),
      deadline: new Date("2026-01-31T17:00:00.000Z"),
      questionDeadline: new Date("2026-01-24T17:00:00.000Z"),
      city: "Fribourg",
      canton: "FR",
      organizationId: orgCommune.id,
      identityRevealed: true, // En mode CLASSIC, toujours révélé
    },
  });

  // Tender 8: CANCELLED (annulé)
  const tender8 = await prisma.tender.create({
    data: {
      title: "Réfection de la toiture du centre sportif",
      summary: "Remplacement complet de la toiture et isolation",
      description:
        "Projet annulé suite à découverte de problèmes structurels nécessitant une étude plus approfondie.",
      marketType: "CONSTRUCTION",
      cfcCodes: ["C3", "C4"],
      budget: 280000,
      showBudget: true,
      status: "CANCELLED",
      visibility: "PUBLIC",
      mode: "ANONYMOUS",
      procedure: "OPEN",
      isSimpleMode: false,
      publishedAt: new Date("2025-11-15"),
      deadline: new Date("2025-12-20T17:00:00.000Z"),
      city: "Fribourg",
      canton: "FR",
      organizationId: orgCommune.id,
    },
  });

  console.log("✅ 8 appels d'offres créés\n");

  // ============================================
  // 4. CRÉER DES OFFRES
  // ============================================
  console.log("💼 Création des offres...");

  // Offres pour tender1 (mode anonyme, en cours)
  await prisma.offer.create({
    data: {
      tenderId: tender1.id,
      organizationId: orgEntreprise.id,
      status: "SUBMITTED",
      price: 425000,
      currency: "CHF",
      durationDays: 55,
      warrantyYears: 2,
      references:
        "Rénovation Centre culturel Bulle (2023), Salle des fêtes Romont (2022)",
      description: `
Notre approche privilégie la qualité et le respect des délais :
- Équipe dédiée à temps plein
- Planning détaillé avec jalons hebdomadaires
- Coordination étroite avec les services techniques
- Utilisation de matériaux écologiques certifiés
      `.trim(),
      projectSummary: "Rénovation complète de la salle polyvalente communale",
      submittedAt: new Date("2025-12-05"),
      viewedAt: new Date("2025-12-05"),
    },
  });

  await prisma.offer.create({
    data: {
      tenderId: tender1.id,
      organizationId: orgArchitecte.id,
      status: "SUBMITTED",
      price: 398000,
      currency: "CHF",
      durationDays: 60,
      warrantyYears: 3,
      references: "École primaire Vevey (2024), Bibliothèque Morges (2023)",
      description: `
Spécialisés en rénovation énergétique, nous proposons :
- Isolation renforcée pour économies d'énergie
- Matériaux biosourcés
- Garantie prolongée 3 ans
      `.trim(),
      projectSummary: "Rénovation énergétique de la salle polyvalente",
      submittedAt: new Date("2025-12-08"),
    },
  });

  // Offres pour tender2 (mode classique, clôturé)
  await prisma.offer.create({
    data: {
      tenderId: tender2.id,
      organizationId: orgEntreprise.id,
      status: "ACCEPTED",
      price: 3280000,
      currency: "CHF",
      durationDays: 420,
      warrantyYears: 5,
      references:
        "Parking Gare Lausanne (2022), Parking Centre-ville Genève (2021)",
      description:
        "Méthodologie éprouvée avec 15 parkings souterrains réalisés",
      projectSummary: "Construction parking souterrain 80 places",
      submittedAt: new Date("2025-11-20"),
      viewedAt: new Date("2025-11-21"),
    },
  });

  await prisma.offer.create({
    data: {
      tenderId: tender2.id,
      organizationId: orgIngenieur.id,
      status: "REJECTED",
      price: 3650000,
      currency: "CHF",
      durationDays: 450,
      warrantyYears: 4,
      references: "Tunnel Sion (2020), Viaduc Martigny (2019)",
      description: "Expertise en génie civil et infrastructures souterraines",
      projectSummary: "Construction parking souterrain 80 places",
      submittedAt: new Date("2025-11-25"),
      viewedAt: new Date("2025-11-25"),
    },
  });

  // Offres pour tender4 (récent, mode anonyme)
  await prisma.offer.create({
    data: {
      tenderId: tender4.id,
      organizationId: orgIngenieur.id,
      status: "SUBMITTED",
      price: 78000,
      currency: "CHF",
      durationDays: 110,
      warrantyYears: 1,
      references: "Passerelle piétonne Vevey (2023), Pont cyclable Nyon (2022)",
      description: `
Notre méthodologie :
1. Relevé topographique complet
2. Études géotechniques (3 sondages)
3. Modélisation BIM 3D
4. 3 variantes comparées
      `.trim(),
      projectSummary: "Étude technique pour nouveau pont piétonnier",
      submittedAt: new Date("2025-12-11"),
    },
  });

  // Offres pour tender5 (mode anonyme, identité révélée)
  await prisma.offer.create({
    data: {
      tenderId: tender5.id,
      organizationId: orgEntreprise.id,
      status: "SHORTLISTED",
      price: 198000,
      currency: "CHF",
      durationDays: 75,
      warrantyYears: 3,
      references: "Installation vidéo Yverdon (2024), Système Bulle (2023)",
      description:
        "Solution complète avec caméras IP haute résolution et logiciel de gestion centralisé",
      projectSummary: "Installation système vidéosurveillance 25 caméras",
      submittedAt: new Date("2025-11-15"),
      viewedAt: new Date("2025-11-16"),
    },
  });

  await prisma.offer.create({
    data: {
      tenderId: tender5.id,
      organizationId: orgIngenieur.id,
      status: "REJECTED",
      price: 245000,
      currency: "CHF",
      durationDays: 90,
      warrantyYears: 2,
      references: "Système sécurité Genève (2022)",
      description: "Solution haut de gamme avec analyse vidéo intelligente",
      projectSummary: "Installation système vidéosurveillance avec IA",
      submittedAt: new Date("2025-11-20"),
      viewedAt: new Date("2025-11-20"),
    },
  });

  // Offres pour tender6 (mode anonyme, marché attribué)
  await prisma.offer.create({
    data: {
      tenderId: tender6.id,
      organizationId: orgEntreprise.id,
      status: "AWARDED", // ✅ Offre GAGNANTE
      price: 87500,
      currency: "CHF",
      durationDays: 1095,
      warrantyYears: 3,
      references: "Fourniture mobilier Ville de Vevey (2022-2025)",
      description:
        "Offre globale pour 3 ans avec service de livraison et installation inclus",
      projectSummary: "Fourniture matériel de bureau 3 ans",
      submittedAt: new Date("2025-10-05"),
      viewedAt: new Date("2025-10-06"),
      paymentStatus: "PAID",
      paidAt: new Date("2025-10-07"),
    },
  });

  await prisma.offer.create({
    data: {
      tenderId: tender6.id,
      organizationId: orgArchitecte.id,
      status: "REJECTED",
      price: 102000,
      currency: "CHF",
      durationDays: 1095,
      warrantyYears: 2,
      references: "N/A - Première soumission dans ce domaine",
      description: "Offre détaillée avec mobilier design",
      projectSummary: "Fourniture mobilier bureau haut de gamme",
      submittedAt: new Date("2025-10-08"),
      viewedAt: new Date("2025-10-08"),
    },
  });

  // Offres pour tender7 (mode CLASSIQUE en cours)
  await prisma.offer.create({
    data: {
      tenderId: tender7.id,
      organizationId: orgEntreprise.id,
      status: "SUBMITTED",
      price: 138000,
      currency: "CHF",
      durationDays: 365,
      warrantyYears: 1,
      references: "Entretien espaces verts Romont (2023-2024)",
      description: `
Équipe dédiée de 3 jardiniers qualifiés :
- Intervention hebdomadaire garantie
- Matériel professionnel moderne
- Utilisation de produits écologiques certifiés
- Disponibilité 7j/7 pour urgences
      `.trim(),
      projectSummary: "Maintenance annuelle espaces verts",
      submittedAt: new Date("2025-12-09"),
    },
  });

  // Offre DRAFT (brouillon non soumise) pour tender7
  await prisma.offer.create({
    data: {
      tenderId: tender7.id,
      organizationId: orgArchitecte.id,
      status: "DRAFT", // ✅ Offre en BROUILLON
      price: 142000,
      currency: "CHF",
      durationDays: 365,
      description: "Brouillon à compléter...",
      projectSummary: "Maintenance espaces verts - brouillon",
      // Pas de submittedAt car non soumise
    },
  });

  // Offre WITHDRAWN (retirée) pour tender1
  await prisma.offer.create({
    data: {
      tenderId: tender1.id,
      organizationId: orgIngenieur.id,
      status: "WITHDRAWN", // ✅ Offre RETIRÉE par le soumissionnaire
      price: 410000,
      currency: "CHF",
      durationDays: 58,
      description:
        "Offre retirée suite à conflit de planning avec autre projet",
      projectSummary: "Rénovation salle polyvalente",
      submittedAt: new Date("2025-12-06"),
      viewedAt: new Date("2025-12-06"),
    },
  });

  console.log(
    "✅ 12 offres créées (DRAFT, SUBMITTED, SHORTLISTED, WITHDRAWN, REJECTED, AWARDED)\n"
  );

  // ============================================
  // 5. CRÉER DES LOGS D'ÉQUITÉ
  // ============================================
  console.log("📜 Création des logs d'équité...");

  await prisma.equityLog.createMany({
    data: [
      // Logs pour tender1 (mode anonyme en cours)
      {
        tenderId: tender1.id,
        userId: user1.id,
        action: "TENDER_CREATED",
        description: "Appel d'offres créé",
      },
      {
        tenderId: tender1.id,
        userId: user1.id,
        action: "TENDER_PUBLISHED",
        description: "Appel d'offres publié en mode anonyme",
      },
      {
        tenderId: tender1.id,
        userId: user1.id,
        action: "OFFER_RECEIVED",
        description: `Offre reçue de ${orgEntreprise.name}`,
      },
      {
        tenderId: tender1.id,
        userId: user1.id,
        action: "OFFER_RECEIVED",
        description: `Offre reçue de ${orgArchitecte.name}`,
      },
      {
        tenderId: tender1.id,
        userId: user1.id,
        action: "OFFER_RECEIVED",
        description: `Offre reçue puis retirée`,
      },
      // Logs pour tender2 (mode classique clôturé)
      {
        tenderId: tender2.id,
        userId: user1.id,
        action: "TENDER_CREATED",
        description: "Appel d'offres créé",
      },
      {
        tenderId: tender2.id,
        userId: user1.id,
        action: "TENDER_PUBLISHED",
        description: "Appel d'offres publié en mode classique",
      },
      {
        tenderId: tender2.id,
        userId: user1.id,
        action: "TENDER_CLOSED",
        description: "Appel d'offres clôturé",
      },
      {
        tenderId: tender2.id,
        userId: user1.id,
        action: "IDENTITY_REVEALED",
        description: "Identités révélées",
      },
      {
        tenderId: tender2.id,
        userId: user1.id,
        action: "TENDER_AWARDED",
        description: `Marché attribué à ${orgEntreprise.name}`,
        metadata: { winningPrice: 3280000 },
      },
      // Logs pour tender5 (mode anonyme, identité révélée)
      {
        tenderId: tender5.id,
        userId: user1.id,
        action: "TENDER_CREATED",
        description: "Appel d'offres créé",
      },
      {
        tenderId: tender5.id,
        userId: user1.id,
        action: "TENDER_PUBLISHED",
        description: "Appel d'offres publié en mode anonyme",
      },
      {
        tenderId: tender5.id,
        userId: user1.id,
        action: "TENDER_CLOSED",
        description: "Appel d'offres clôturé automatiquement (deadline passée)",
      },
      {
        tenderId: tender5.id,
        userId: user1.id,
        action: "IDENTITY_REVEALED",
        description: "Identités révélées automatiquement après clôture",
      },
      {
        tenderId: tender5.id,
        userId: user1.id,
        action: "OFFER_SHORTLISTED",
        description: `Offre de ${orgEntreprise.name} mise en liste restreinte`,
      },
      {
        tenderId: tender5.id,
        userId: user1.id,
        action: "OFFER_REJECTED",
        description: `Offre de ${orgIngenieur.name} rejetée`,
      },
      // Logs pour tender6 (mode anonyme attribué)
      {
        tenderId: tender6.id,
        userId: user1.id,
        action: "TENDER_CREATED",
        description: "Appel d'offres créé",
      },
      {
        tenderId: tender6.id,
        userId: user1.id,
        action: "TENDER_PUBLISHED",
        description: "Appel d'offres publié en mode anonyme",
      },
      {
        tenderId: tender6.id,
        userId: user1.id,
        action: "TENDER_CLOSED",
        description: "Appel d'offres clôturé",
      },
      {
        tenderId: tender6.id,
        userId: user1.id,
        action: "IDENTITY_REVEALED",
        description: "Identités révélées",
      },
      {
        tenderId: tender6.id,
        userId: user1.id,
        action: "TENDER_AWARDED",
        description: `Marché attribué à ${orgEntreprise.name}`,
        metadata: { winningPrice: 87500 },
      },
      // Logs pour tender8 (annulé)
      {
        tenderId: tender8.id,
        userId: user1.id,
        action: "TENDER_CREATED",
        description: "Appel d'offres créé",
      },
      {
        tenderId: tender8.id,
        userId: user1.id,
        action: "TENDER_PUBLISHED",
        description: "Appel d'offres publié en mode anonyme",
      },
      {
        tenderId: tender8.id,
        userId: user1.id,
        action: "TENDER_CANCELLED",
        description:
          "Appel d'offres annulé suite à découverte de problèmes structurels",
      },
    ],
  });

  console.log("✅ 27 logs d'équité créés\n");

  // ============================================
  // 6. CRÉER DES RECHERCHES SAUVEGARDÉES
  // ============================================
  console.log("🔍 Création des recherches sauvegardées...");

  await prisma.savedSearch.createMany({
    data: [
      {
        userId: user2.id,
        name: "Travaux construction Fribourg",
        criteria: {
          keywords: "construction rénovation",
          canton: "FR",
          marketTypes: ["CONSTRUCTION"],
        },
        alertsEnabled: true,
      },
      {
        userId: user3.id,
        name: "Projets architecture Romandie",
        criteria: {
          keywords: "architecture bâtiment",
          cantons: ["VD", "FR", "GE"],
          marketTypes: ["ARCHITECTURE", "ENGINEERING"],
          budgetMin: 100000,
        },
        alertsEnabled: true,
      },
      {
        userId: user4.id,
        name: "Études techniques",
        criteria: {
          marketTypes: ["ENGINEERING"],
          budgetMax: 200000,
        },
        alertsEnabled: false,
      },
    ],
  });

  console.log("✅ 3 recherches sauvegardées créées\n");

  // ============================================
  // 7. CRÉER DES TENDERS SAUVEGARDÉS
  // ============================================
  console.log("🔖 Création des tenders sauvegardés...");

  await prisma.savedTender.createMany({
    data: [
      {
        userId: user2.id,
        tenderId: tender1.id,
      },
      {
        userId: user2.id,
        tenderId: tender4.id,
      },
      {
        userId: user3.id,
        tenderId: tender1.id,
      },
      {
        userId: user4.id,
        tenderId: tender4.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ 4 tenders sauvegardés créés\n");

  // ============================================
  // 8. CRÉER DES PUBLICATIONS VEILLE
  // ============================================
  console.log("📰 Création des publications veille...");

  await prisma.veillePublication.createMany({
    data: [
      {
        title: "Mise à l'enquête - Construction d'un immeuble locatif",
        description:
          "La commune de Fribourg met à l'enquête un projet de construction d'un immeuble de 12 logements",
        url: "https://www.fr.ch/exemple-1",
        commune: "Fribourg",
        canton: "FR",
        type: "MISE_ENQUETE",
        publishedAt: new Date("2025-12-01"),
        metadata: {
          adresse: "Chemin des Primevères 5",
          parcelle: "1234",
        },
      },
      {
        title: "Permis de construire accordé - Extension école",
        description:
          "Permis de construire accordé pour l'extension de l'école primaire du Bourg",
        url: "https://www.fr.ch/exemple-2",
        commune: "Bulle",
        canton: "FR",
        type: "PERMIS_CONSTRUIRE",
        publishedAt: new Date("2025-12-05"),
        metadata: {
          adresse: "Route de l'École 12",
        },
      },
      {
        title: "Avis de construction - Rénovation bâtiment",
        description:
          "Travaux de rénovation énergétique d'un bâtiment historique",
        url: "https://ville-fribourg.ch/exemple-3",
        commune: "Fribourg",
        canton: "FR",
        type: "AVIS_CONSTRUCTION",
        publishedAt: new Date("2025-12-08"),
      },
    ],
  });

  console.log("✅ 3 publications veille créées\n");

  // ============================================
  // 9. CRÉER DES ABONNEMENTS VEILLE
  // ============================================
  console.log("📡 Création des abonnements veille...");

  await prisma.veilleSubscription.createMany({
    data: [
      {
        organizationId: orgCommune.id,
        cantons: ["FR"],
        keywords: ["construction", "rénovation", "infrastructure"],
        emailNotifications: true,
        appNotifications: true,
        alertFrequency: "DAILY",
        alertTypes: ["MISE_ENQUETE", "PERMIS_CONSTRUIRE"],
        alertCommunes: ["Fribourg", "Bulle", "Romont"],
      },
      {
        organizationId: orgEntreprise.id,
        cantons: ["VD", "FR"],
        keywords: ["appel d'offres", "construction", "travaux publics"],
        emailNotifications: true,
        appNotifications: true,
        alertFrequency: "INSTANT",
        alertTypes: [],
        alertCommunes: [],
      },
      {
        organizationId: orgArchitecte.id,
        cantons: ["VD"],
        keywords: ["permis", "construction", "aménagement"],
        emailNotifications: true,
        appNotifications: false,
        alertFrequency: "WEEKLY",
        alertTypes: ["PERMIS_CONSTRUIRE"],
        alertCommunes: ["Lausanne", "Vevey", "Montreux"],
      },
    ],
  });

  console.log("✅ 3 abonnements veille créés\n");

  // ============================================
  // 10. CRÉER DES DOCUMENTS DE TENDERS
  // ============================================
  console.log("📄 Création des documents de tenders...");

  await prisma.tenderDocument.createMany({
    data: [
      {
        tenderId: tender1.id,
        name: "Cahier des charges.pdf",
        url: "https://example.com/docs/cahier-charges-tender1.pdf",
        size: 2458000,
        mimeType: "application/pdf",
      },
      {
        tenderId: tender1.id,
        name: "Plans architecturaux.dwg",
        url: "https://example.com/docs/plans-tender1.dwg",
        size: 5120000,
        mimeType: "application/acad",
      },
      {
        tenderId: tender1.id,
        name: "Métrés détaillés.xlsx",
        url: "https://example.com/docs/metres-tender1.xlsx",
        size: 145000,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      {
        tenderId: tender2.id,
        name: "Dossier technique complet.pdf",
        url: "https://example.com/docs/dossier-tender2.pdf",
        size: 8950000,
        mimeType: "application/pdf",
      },
      {
        tenderId: tender4.id,
        name: "Termes de référence.pdf",
        url: "https://example.com/docs/tdr-tender4.pdf",
        size: 890000,
        mimeType: "application/pdf",
      },
    ],
  });

  console.log("✅ 5 documents de tenders créés\n");

  // ============================================
  // 11. CRÉER DES CRITÈRES D'ÉVALUATION
  // ============================================
  console.log("📋 Création des critères d'évaluation...");

  await prisma.tenderCriteria.createMany({
    data: [
      {
        tenderId: tender1.id,
        name: "Prix",
        weight: 40,
        description: "Prix total des travaux",
        order: 1,
      },
      {
        tenderId: tender1.id,
        name: "Qualité technique",
        weight: 30,
        description: "Qualité des matériaux et mise en œuvre",
        order: 2,
      },
      {
        tenderId: tender1.id,
        name: "Délais",
        weight: 20,
        description: "Respect du planning",
        order: 3,
      },
      {
        tenderId: tender1.id,
        name: "Références",
        weight: 10,
        description: "Expérience sur projets similaires",
        order: 4,
      },
      {
        tenderId: tender2.id,
        name: "Prix",
        weight: 50,
        description: "Offre financière",
        order: 1,
      },
      {
        tenderId: tender2.id,
        name: "Expérience",
        weight: 30,
        description: "Références sur parkings souterrains",
        order: 2,
      },
      {
        tenderId: tender2.id,
        name: "Méthodologie",
        weight: 20,
        description: "Approche technique et planning",
        order: 3,
      },
      {
        tenderId: tender4.id,
        name: "Compétences techniques",
        weight: 40,
        description: "Expertise en ouvrages d'art",
        order: 1,
      },
      {
        tenderId: tender4.id,
        name: "Méthodologie d'étude",
        weight: 35,
        description: "Approche et outils utilisés",
        order: 2,
      },
      {
        tenderId: tender4.id,
        name: "Prix",
        weight: 25,
        description: "Coût de l'étude",
        order: 3,
      },
    ],
  });

  console.log("✅ 10 critères d'évaluation créés\n");

  // ============================================
  // 12. CRÉER DES LIGNES DE DEVIS (OFFER LINE ITEMS)
  // ============================================
  console.log("💰 Création des lignes de devis...");

  // Pour l'offre de orgEntreprise sur tender1
  const offer1 = await prisma.offer.findFirst({
    where: {
      tenderId: tender1.id,
      organizationId: orgEntreprise.id,
    },
  });

  if (offer1) {
    await prisma.offerLineItem.createMany({
      data: [
        {
          offerId: offer1.id,
          description: "Isolation thermique murs et plafond",
          quantity: 850,
          unit: "m²",
          priceHT: 80750,
          position: 1,
        },
        {
          offerId: offer1.id,
          description: "Installation électrique complète",
          quantity: 1,
          unit: "forfait",
          priceHT: 125000,
          position: 2,
        },
        {
          offerId: offer1.id,
          description: "Peinture intérieure",
          quantity: 1800,
          unit: "m²",
          priceHT: 63000,
          position: 3,
        },
        {
          offerId: offer1.id,
          description: "Peinture extérieure",
          quantity: 450,
          unit: "m²",
          priceHT: 24750,
          position: 4,
        },
        {
          offerId: offer1.id,
          description: "Système de chauffage (pompe à chaleur)",
          quantity: 1,
          unit: "forfait",
          priceHT: 85000,
          position: 5,
        },
        {
          offerId: offer1.id,
          description: "Mise en conformité sécurité",
          quantity: 1,
          unit: "forfait",
          priceHT: 46500,
          position: 6,
        },
      ],
    });
  }

  // Pour l'offre acceptée sur tender2
  const offer2 = await prisma.offer.findFirst({
    where: {
      tenderId: tender2.id,
      organizationId: orgEntreprise.id,
      status: "ACCEPTED",
    },
  });

  if (offer2) {
    await prisma.offerLineItem.createMany({
      data: [
        {
          offerId: offer2.id,
          description: "Excavation et terrassement",
          quantity: 12000,
          unit: "m³",
          priceHT: 1020000,
          position: 1,
        },
        {
          offerId: offer2.id,
          description: "Gros œuvre béton armé",
          quantity: 1,
          unit: "forfait",
          priceHT: 1450000,
          position: 2,
        },
        {
          offerId: offer2.id,
          description: "Ventilation mécanique",
          quantity: 1,
          unit: "forfait",
          priceHT: 280000,
          position: 3,
        },
        {
          offerId: offer2.id,
          description: "Bornes de recharge électrique (20 places)",
          quantity: 20,
          unit: "unité",
          priceHT: 170000,
          position: 4,
        },
        {
          offerId: offer2.id,
          description: "Système de gestion automatisé",
          quantity: 1,
          unit: "forfait",
          priceHT: 195000,
          position: 5,
        },
        {
          offerId: offer2.id,
          description: "Éclairage LED",
          quantity: 1,
          unit: "forfait",
          priceHT: 95000,
          position: 6,
        },
        {
          offerId: offer2.id,
          description: "Divers et imprévus",
          quantity: 1,
          unit: "forfait",
          priceHT: 70000,
          position: 7,
        },
      ],
    });
  }

  console.log("✅ 13 lignes de devis créées\n");

  // ============================================
  // 13. CRÉER DES INCLUSIONS/EXCLUSIONS D'OFFRES
  // ============================================
  console.log("✅❌ Création des inclusions/exclusions...");

  if (offer1) {
    await prisma.offerInclusion.createMany({
      data: [
        {
          offerId: offer1.id,
          description: "Fourniture et pose de tous les matériaux",
          position: 1,
        },
        {
          offerId: offer1.id,
          description: "Nettoyage quotidien du chantier",
          position: 2,
        },
        {
          offerId: offer1.id,
          description: "Coordination avec les autres corps de métier",
          position: 3,
        },
        {
          offerId: offer1.id,
          description: "Garantie biennale sur tous les travaux",
          position: 4,
        },
        {
          offerId: offer1.id,
          description: "Service après-vente pendant 2 ans",
          position: 5,
        },
      ],
    });

    await prisma.offerExclusion.createMany({
      data: [
        {
          offerId: offer1.id,
          description: "Mobilier et équipements de la salle",
          position: 1,
        },
        {
          offerId: offer1.id,
          description: "Raccordements aux réseaux publics",
          position: 2,
        },
        {
          offerId: offer1.id,
          description: "Aménagements extérieurs (parking, accès)",
          position: 3,
        },
        {
          offerId: offer1.id,
          description: "Études géotechniques complémentaires si nécessaires",
          position: 4,
        },
      ],
    });
  }

  if (offer2) {
    await prisma.offerInclusion.createMany({
      data: [
        {
          offerId: offer2.id,
          description: "Tous travaux de terrassement et soutènement",
          position: 1,
        },
        {
          offerId: offer2.id,
          description: "Installation complète du système de gestion",
          position: 2,
        },
        {
          offerId: offer2.id,
          description: "Formation du personnel d'exploitation",
          position: 3,
        },
        {
          offerId: offer2.id,
          description: "Maintenance préventive 12 mois",
          position: 4,
        },
      ],
    });

    await prisma.offerExclusion.createMany({
      data: [
        {
          offerId: offer2.id,
          description: "Déplacement des réseaux existants",
          position: 1,
        },
        {
          offerId: offer2.id,
          description: "Signalisation routière provisoire",
          position: 2,
        },
        {
          offerId: offer2.id,
          description: "Taxes et redevances communales",
          position: 3,
        },
      ],
    });
  }

  console.log("✅ 9 inclusions et 7 exclusions créées\n");

  // ============================================
  // 14. CRÉER DES MATÉRIAUX (OFFER MATERIALS)
  // ============================================
  console.log("🧱 Création des matériaux...");

  if (offer1) {
    await prisma.offerMaterial.createMany({
      data: [
        {
          offerId: offer1.id,
          name: "Isolation laine de roche",
          brand: "Rockwool",
          model: "Rockwool Plus",
          range: "Épaisseur 160mm, λ=0.035 W/mK, classement feu A1",
          manufacturerWarranty: "10 ans",
          position: 1,
        },
        {
          offerId: offer1.id,
          name: "Peinture acrylique intérieure",
          brand: "Seigneurie",
          model: "Evolution Mate",
          range: "Finition mate, COV < 5 g/L",
          manufacturerWarranty: "2 ans",
          position: 2,
        },
        {
          offerId: offer1.id,
          name: "Pompe à chaleur air-eau",
          brand: "Viessmann",
          model: "Vitocal 200-S",
          range: "Puissance 45 kW, COP 4.5",
          manufacturerWarranty: "5 ans",
          position: 3,
        },
        {
          offerId: offer1.id,
          name: "Câbles électriques",
          brand: "Nexans",
          model: "H07V-K",
          range: "Section 2.5-16mm², norme CE",
          manufacturerWarranty: "1 an",
          position: 4,
        },
      ],
    });
  }

  if (offer2) {
    await prisma.offerMaterial.createMany({
      data: [
        {
          offerId: offer2.id,
          name: "Béton C30/37",
          brand: "Holcim",
          model: "Holcim ProBuild",
          range: "XC3/XD1, granulométrie 0/32, adjuvants hydrofuges",
          manufacturerWarranty: "Garantie standard",
          position: 1,
        },
        {
          offerId: offer2.id,
          name: "Aciers d'armature",
          brand: "Swiss Steel",
          model: "B500B",
          range: "Diamètres Ø8 à Ø32, certifié norme SIA",
          manufacturerWarranty: "Certifié EN 10080",
          position: 2,
        },
        {
          offerId: offer2.id,
          name: "Ventilateurs industriels",
          brand: "Systemair",
          model: "DVNI-EC",
          range: "Débit 15'000 m³/h, variation de vitesse",
          manufacturerWarranty: "3 ans",
          position: 3,
        },
      ],
    });
  }

  console.log("✅ 7 matériaux créés\n");

  // ============================================
  // 15. CRÉER DES INVITATIONS
  // ============================================
  console.log("✉️ Création des invitations...");

  await prisma.invitationToken.createMany({
    data: [
      {
        token: "invite-" + Math.random().toString(36).substring(2, 15),
        email: "collaborateur1@construction-pro.ch",
        role: "ADMIN",
        status: "PENDING",
        organizationId: orgEntreprise.id,
        invitedBy: user2.id,
        expiresAt: new Date("2026-01-15"),
      },
      {
        token: "invite-" + Math.random().toString(36).substring(2, 15),
        email: "architecte2@architectes-associes.ch",
        role: "EDITOR",
        status: "PENDING",
        organizationId: orgArchitecte.id,
        invitedBy: user3.id,
        expiresAt: new Date("2026-01-20"),
      },
      {
        token: "invite-" + Math.random().toString(36).substring(2, 15),
        email: "ancien@example.ch",
        role: "VIEWER",
        status: "EXPIRED",
        organizationId: orgCommune.id,
        invitedBy: user1.id,
        expiresAt: new Date("2025-11-01"),
      },
    ],
  });

  console.log("✅ 3 invitations créées\n");

  console.log("✨ Seeding terminé avec succès!\n");
  console.log("📊 Résumé:");
  console.log(
    "   - 7 utilisateurs (avec tous les rôles: OWNER, ADMIN, EDITOR, VIEWER)"
  );
  console.log("   - 4 organisations (avec emails de contact)");
  console.log("   - 8 appels d'offres:");
  console.log("     • 1 DRAFT (brouillon)");
  console.log("     • 3 PUBLISHED (dont 2 mode ANONYMOUS, 1 mode CLASSIC)");
  console.log("     • 2 CLOSED (mode ANONYMOUS avec identité révélée)");
  console.log("     • 1 AWARDED (marché attribué)");
  console.log("     • 1 CANCELLED (annulé)");
  console.log("   - 12 offres (tous les statuts testés):");
  console.log("     • 1 DRAFT (brouillon)");
  console.log("     • 5 SUBMITTED (soumises)");
  console.log("     • 1 SHORTLISTED (liste restreinte)");
  console.log("     • 1 WITHDRAWN (retirée)");
  console.log("     • 3 REJECTED (rejetées)");
  console.log("     • 1 AWARDED (gagnante)");
  console.log("   - 13 lignes de devis");
  console.log("   - 9 inclusions / 7 exclusions");
  console.log("   - 7 matériaux");
  console.log("   - 27 logs d'équité (traçabilité complète)");
  console.log("   - 3 recherches sauvegardées");
  console.log("   - 4 tenders sauvegardés");
  console.log("   - 3 publications veille");
  console.log("   - 3 abonnements veille");
  console.log("   - 5 documents de tenders");
  console.log("   - 10 critères d'évaluation");
  console.log("   - 3 invitations");
  console.log("\n🔑 CONNEXION:");
  console.log("\n   Emails:");
  console.log("   - commune.fribourg@test.ch (OWNER Ville de Fribourg)");
  console.log(
    "   - entreprise.construction@test.ch (OWNER Construction Pro SA)"
  );
  console.log("   - admin.construction@test.ch (ADMIN Construction Pro SA)");
  console.log("   - editor.construction@test.ch (EDITOR Construction Pro SA)");
  console.log("   - viewer.construction@test.ch (VIEWER Construction Pro SA)");
  console.log("   - architecte.lausanne@test.ch (OWNER Architectes Associés)");
  console.log("   - bureau.ingenieur@test.ch (OWNER Bureau d'Ingénieurs)");
  console.log("\n   Mot de passe: Test1234!");
  console.log("\n✅ TESTS COUVERTS:");
  console.log("   • Mode ANONYMOUS vs CLASSIC");
  console.log("   • Identité révélée après deadline");
  console.log(
    "   • Tous les statuts de tenders (DRAFT, PUBLISHED, CLOSED, AWARDED, CANCELLED)"
  );
  console.log(
    "   • Tous les statuts d'offres (DRAFT, SUBMITTED, SHORTLISTED, WITHDRAWN, REJECTED, AWARDED)"
  );
  console.log(
    "   • Tous les rôles d'organisation (OWNER, ADMIN, EDITOR, VIEWER)"
  );
  console.log("   • Offres avec paiement (PAID) et sans");
  console.log("   • Notes internes privées sur offres");
  console.log("   • Traçabilité complète via equity logs");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
