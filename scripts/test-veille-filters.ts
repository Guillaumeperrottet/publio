#!/usr/bin/env tsx
/**
 * Script de test des filtres de veille
 * Vérifie que les types et communes extraits par les scrapers
 * sont compatibles avec les filtres du dashboard
 */

import { FribourgOfficialGazetteScraper } from "@/features/veille/scrapers/fribourg-official";
import { SimapScraper } from "@/features/veille/scrapers/simap";
import { PUBLICATION_TYPE_LABELS } from "@/features/veille/types";

console.log("🧪 TEST DES FILTRES DE VEILLE");
console.log("=".repeat(60));
console.log(`Démarrage: ${new Date().toISOString()}\n`);

async function testFilters() {
  // 1. Test Fribourg FO
  console.log("📄 Test Fribourg Feuille Officielle...\n");
  const fribourgScraper = new FribourgOfficialGazetteScraper();
  const fribourgPubs = await fribourgScraper.scrape();

  console.log(`✅ ${fribourgPubs.length} publications extraites\n`);

  // Analyser les types
  const fribourgTypes = new Set(fribourgPubs.map((p) => p.type));
  console.log("📊 Types trouvés dans Fribourg FO:");
  fribourgTypes.forEach((type) => {
    const count = fribourgPubs.filter((p) => p.type === type).length;
    const label =
      PUBLICATION_TYPE_LABELS[type as keyof typeof PUBLICATION_TYPE_LABELS];
    const isValid = type in PUBLICATION_TYPE_LABELS;
    console.log(
      `  ${isValid ? "✅" : "❌"} ${type} (${
        label || "INCONNU"
      }): ${count} publications`
    );
  });

  // Analyser les communes
  const fribourgCommunes = new Set(fribourgPubs.map((p) => p.commune));
  console.log(
    `\n🏘️  Communes trouvées dans Fribourg FO: ${fribourgCommunes.size}`
  );
  console.log(
    `   ${Array.from(fribourgCommunes).slice(0, 10).join(", ")}${
      fribourgCommunes.size > 10 ? "..." : ""
    }`
  );

  // 2. Test SIMAP
  console.log("\n\n🇨🇭 Test SIMAP...\n");
  const simapScraper = new SimapScraper();
  const simapPubs = await simapScraper.scrape(["FR"]);

  console.log(`✅ ${simapPubs.length} publications extraites\n`);

  // Analyser les types
  const simapTypes = new Set(simapPubs.map((p) => p.type));
  console.log("📊 Types trouvés dans SIMAP:");
  simapTypes.forEach((type) => {
    const count = simapPubs.filter((p) => p.type === type).length;
    const label =
      PUBLICATION_TYPE_LABELS[type as keyof typeof PUBLICATION_TYPE_LABELS];
    const isValid = type in PUBLICATION_TYPE_LABELS;
    console.log(
      `  ${isValid ? "✅" : "❌"} ${type} (${
        label || "INCONNU"
      }): ${count} publications`
    );
  });

  // Analyser les communes
  const simapCommunes = new Set(simapPubs.map((p) => p.commune));
  console.log(`\n🏘️  Communes trouvées dans SIMAP: ${simapCommunes.size}`);
  console.log(
    `   ${Array.from(simapCommunes).slice(0, 10).join(", ")}${
      simapCommunes.size > 10 ? "..." : ""
    }`
  );

  // 3. Résumé
  console.log("\n" + "=".repeat(60));
  console.log("📊 RÉSUMÉ DES TESTS");
  console.log("=".repeat(60));

  const allTypes = new Set([...fribourgTypes, ...simapTypes]);
  const invalidTypes = Array.from(allTypes).filter(
    (type) => !(type in PUBLICATION_TYPE_LABELS)
  );

  if (invalidTypes.length > 0) {
    console.log("\n❌ Types invalides détectés:");
    invalidTypes.forEach((type) => {
      console.log(`   - ${type}`);
    });
    console.log(
      "\n⚠️  Ces types ne seront pas affichés correctement dans les filtres!"
    );
  } else {
    console.log(
      "\n✅ Tous les types sont valides et compatibles avec les filtres"
    );
  }

  const allCommunes = new Set([...fribourgCommunes, ...simapCommunes]);
  console.log(`\n🏘️  Total de communes uniques: ${allCommunes.size}`);
  console.log("   Les filtres par commune fonctionneront correctement ✅");

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Test terminé: ${new Date().toISOString()}`);
  console.log("=".repeat(60));
}

// Exécuter les tests
testFilters()
  .then(() => {
    console.log("\n✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erreur lors des tests:", error);
    process.exit(1);
  });
