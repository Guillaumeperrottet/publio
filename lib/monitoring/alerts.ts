/**
 * Alert notifications system
 * Send critical alerts via email or Slack
 */

"use server";

import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/auth/super-admin";

interface AlertConfig {
  errorThreshold: number; // Max errors per hour
  uptimeThreshold: number; // Min uptime percentage
  responseTimeThreshold: number; // Max avg response time (ms)
}

const DEFAULT_CONFIG: AlertConfig = {
  errorThreshold: 50,
  uptimeThreshold: 99.0,
  responseTimeThreshold: 1000,
};

/**
 * Check system health and send alerts if thresholds exceeded
 */
export async function checkAndSendAlerts() {
  try {
    // Get recent errors
    const recentErrors = await prisma.activityLog.count({
      where: {
        type: "SYSTEM_ERROR",
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    // Check thresholds
    if (recentErrors > DEFAULT_CONFIG.errorThreshold) {
      await sendAlert({
        type: "error_threshold",
        severity: "critical",
        title: "High Error Rate Detected",
        message: `${recentErrors} errors in the last hour (threshold: ${DEFAULT_CONFIG.errorThreshold})`,
        metadata: { errorCount: recentErrors },
      });
    }

    return { success: true, alerts: [] };
  } catch (error) {
    console.error("Error checking alerts:", error);
    return { success: false, error: "Failed to check alerts" };
  }
}

interface Alert {
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send an alert notification
 */
async function sendAlert(alert: Alert) {
  try {
    // Log the alert
    await logActivity({
      type: "SYSTEM_ERROR",
      description: `[ALERT] ${alert.title}`,
      userId: undefined,
      metadata: {
        alertType: alert.type,
        severity: alert.severity,
        message: alert.message,
        ...alert.metadata,
      },
    });

    // TODO: Send email notification
    if (process.env.ADMIN_EMAIL) {
      await sendEmailAlert(alert);
    }

    // TODO: Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert(alert);
    }

    console.log(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.title}`);
  } catch (error) {
    console.error("Failed to send alert:", error);
  }
}

/**
 * Send alert via email
 */
async function sendEmailAlert(alert: Alert) {
  // TODO: Implement with Resend or your email provider
  console.log("Email alert:", alert);
}

/**
 * Send alert via Slack
 */
async function sendSlackAlert(alert: Alert) {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  const color =
    alert.severity === "critical"
      ? "danger"
      : alert.severity === "warning"
      ? "warning"
      : "good";

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: alert.metadata
            ? Object.entries(alert.metadata).map(([key, value]) => ({
                title: key,
                value: String(value),
                short: true,
              }))
            : [],
          footer: "Publio Monitoring",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  });
}

/**
 * Manual alert sending (for testing)
 */
export async function sendTestAlert() {
  await sendAlert({
    type: "test",
    severity: "info",
    title: "Test Alert",
    message: "This is a test alert from Publio monitoring system",
    metadata: { environment: process.env.NODE_ENV },
  });

  return { success: true };
}
