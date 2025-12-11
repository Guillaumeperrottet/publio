import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Endpoint cron pour scraping hebdomadaire (Fribourg FO, etc.)
 * Exécuté chaque jeudi à 7h UTC (9h Suisse été)
 *
 * POST /api/cron/scrape-veille-weekly
 */
export async function GET() {
  try {
    // Vérifier que la requête vient de Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log(
      "[CRON Weekly] Démarrage du scraping hebdomadaire:",
      new Date().toISOString()
    );

    // Exécuter le script avec l'option --include-weekly
    const { stdout, stderr } = await execPromise(
      "npx tsx scripts/scrape-publications.ts --include-weekly",
      {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes max
      }
    );

    console.log("[CRON Weekly] STDOUT:", stdout);
    if (stderr) {
      console.error("[CRON Weekly] STDERR:", stderr);
    }

    // Parser les résultats du script (dernière ligne contient le JSON)
    const lines = stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];

    let result = { success: true, message: "Scraping hebdomadaire terminé" };

    try {
      // Si la dernière ligne est du JSON, la parser
      if (lastLine.startsWith("{")) {
        result = JSON.parse(lastLine);
      }
    } catch {
      // Ignore si pas du JSON
    }

    console.log(
      "[CRON Weekly] Scraping hebdomadaire terminé avec succès:",
      result
    );

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("[CRON Weekly] Erreur:", error);

    return NextResponse.json(
      {
        error: "Erreur lors du scraping hebdomadaire",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
