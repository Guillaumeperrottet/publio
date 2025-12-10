import { NextResponse } from "next/server";
import { sendSearchAlerts } from "@/scripts/send-search-alerts";

/**
 * API Route pour envoyer les alertes de recherches sauvegardées
 * Appelé par un cron job Vercel
 */
export async function GET(request: Request) {
  try {
    // Vérification de la clé secrète
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔔 Starting search alerts cron job...");

    const results = await sendSearchAlerts();

    console.log("✅ Search alerts cron job completed:", {
      processed: results.processed,
      alerts: results.alerts,
      errors: results.errors,
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("❌ Search alerts cron job failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
