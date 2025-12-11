import { prisma } from "@/lib/db/prisma";

async function debugTenders() {
  console.log("=".repeat(60));
  console.log("🔍 DEBUG TENDERS - Analyse complète");
  console.log("=".repeat(60));

  // 1. Tous les tenders dans la DB
  const allTenders = await prisma.tender.findMany({
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`\n📋 TOTAL TENDERS: ${allTenders.length}\n`);

  allTenders.forEach((tender, index) => {
    console.log(`${index + 1}. ${tender.title}`);
    console.log(`   ID: ${tender.id}`);
    console.log(`   Status: ${tender.status}`);
    console.log(
      `   Organization: ${tender.organization.name} (${tender.organizationId})`
    );
    console.log(`   Created: ${tender.createdAt.toISOString()}`);
    console.log("");
  });

  // 2. Toutes les organisations
  const allOrgs = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          tenders: true,
          offers: true,
          members: true,
        },
      },
    },
  });

  console.log("\n" + "=".repeat(60));
  console.log(`🏢 TOTAL ORGANIZATIONS: ${allOrgs.length}\n`);

  allOrgs.forEach((org, index) => {
    console.log(`${index + 1}. ${org.name}`);
    console.log(`   ID: ${org.id}`);
    console.log(`   Type: ${org.type}`);
    console.log(`   Tenders: ${org._count.tenders}`);
    console.log(`   Offers: ${org._count.offers}`);
    console.log(`   Members: ${org._count.members}`);
    console.log("");
  });

  // 3. Tous les users et leurs organisations
  const allUsers = await prisma.user.findMany({
    include: {
      memberships: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  console.log("\n" + "=".repeat(60));
  console.log(`👥 TOTAL USERS: ${allUsers.length}\n`);

  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Organizations (${user.memberships.length}):`);
    user.memberships.forEach((membership) => {
      console.log(
        `     - ${membership.organization.name} (${membership.role})`
      );
    });
    console.log("");
  });

  // 4. Vérifier les tenders par organisation
  console.log("\n" + "=".repeat(60));
  console.log("📊 TENDERS BY ORGANIZATION\n");

  for (const org of allOrgs) {
    const orgTenders = allTenders.filter((t) => t.organizationId === org.id);
    console.log(`${org.name}: ${orgTenders.length} tender(s)`);
    orgTenders.forEach((t) => {
      console.log(`  - ${t.title} (${t.status})`);
    });
    console.log("");
  }

  console.log("\n" + "=".repeat(60));
  await prisma.$disconnect();
}

debugTenders().catch(console.error);
