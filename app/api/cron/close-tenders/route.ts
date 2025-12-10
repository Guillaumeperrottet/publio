import { NextRequest, NextResponse } from "next/server";
import { closeExpiredTenders } from "@/scripts/close-expired-tenders";

/**
 * Endpoint Cron pour fermer automatiquement les tenders expirés
 *
 * Configuration Vercel Cron (vercel.json) :
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/close-tenders",
 *       "schedule": "0 2 * * *"
 *     }
 *   ]
 * }
 *
 * Schedule: "0 2 * * *" = Tous les jours à 2h du matin (UTC)
 *
 * Sécurité: Vérifier le header Authorization avec CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    // Vercel Cron envoie: "Bearer <CRON_SECRET>"
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting close-expired-tenders cron job");

    // Exécuter le script
    await closeExpiredTenders();

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
