import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Endpoint cron pour envoi des alertes veille
 * Exécuté quotidiennement à 8h UTC (10h Suisse été)
 *
 * POST /api/cron/veille-alerts
 */
export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("[CRON Veille Alerts] Démarrage:", new Date().toISOString());

    const { stdout, stderr } = await execPromise(
      "npx tsx scripts/send-veille-alerts.ts",
      {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes max
      }
    );

    console.log("[CRON Veille Alerts] STDOUT:", stdout);
    if (stderr) {
      console.error("[CRON Veille Alerts] STDERR:", stderr);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Alertes veille envoyées",
    });
  } catch (error) {
    console.error("[CRON Veille Alerts] Erreur:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi des alertes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
