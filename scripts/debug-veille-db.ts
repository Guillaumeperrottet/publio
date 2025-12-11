#!/usr/bin/env tsx
/**
 * Script de debug pour vérifier les publications en base de données
 */

import { prisma } from "@/lib/db/prisma";

async function debugPublications() {
  console.log("🔍 DEBUG PUBLICATIONS VEILLE");
  console.log("=".repeat(60));

  // 1. Compter toutes les publications
  const totalCount = await prisma.veillePublication.count();
  console.log(`\n📊 Total publications en base: ${totalCount}`);

  if (totalCount === 0) {
    console.log("\n⚠️  Aucune publication en base de données!");
    console.log(
      "Exécutez d'abord: npx tsx scripts/scrape-publications.ts --include-weekly"
    );
    return;
  }

  // 2. Grouper par type
  const publications = await prisma.veillePublication.findMany({
    select: {
      type: true,
      commune: true,
      canton: true,
      title: true,
    },
  });

  const byType = publications.reduce((acc, pub) => {
    acc[pub.type] = (acc[pub.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n📈 Répartition par type:");
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} publication(s)`);
    });

  // 3. Grouper par commune
  const byCommune = publications.reduce((acc, pub) => {
    acc[pub.commune] = (acc[pub.commune] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n🏘️  Répartition par commune (top 10):");
  Object.entries(byCommune)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([commune, count]) => {
      console.log(`  - ${commune}: ${count} publication(s)`);
    });

  // 4. Grouper par canton
  const byCanton = publications.reduce((acc, pub) => {
    acc[pub.canton] = (acc[pub.canton] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n🗺️  Répartition par canton:");
  Object.entries(byCanton)
    .sort((a, b) => b[1] - a[1])
    .forEach(([canton, count]) => {
      console.log(`  - ${canton}: ${count} publication(s)`);
    });

  // 5. Exemples de publications
  console.log("\n📋 Exemples de publications (5 plus récentes):");
  const recent = await prisma.veillePublication.findMany({
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      type: true,
      commune: true,
      canton: true,
      title: true,
      publishedAt: true,
    },
  });

  recent.forEach((pub, i) => {
    console.log(`\n${i + 1}. ${pub.title.substring(0, 60)}...`);
    console.log(`   Type: "${pub.type}"`);
    console.log(`   Commune: ${pub.commune}`);
    console.log(`   Canton: ${pub.canton}`);
    console.log(`   Date: ${pub.publishedAt.toISOString()}`);
  });

  console.log("\n" + "=".repeat(60));
}

// Exécuter
debugPublications()
  .then(() => {
    console.log("\n✅ Debug terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  });
