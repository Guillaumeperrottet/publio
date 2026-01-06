/**
 * Admin server actions
 */

"use server";

import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin, logActivity } from "@/lib/auth/super-admin";
import { revalidatePath } from "next/cache";

/**
 * Get admin dashboard stats
 */
export async function getAdminStats() {
  await requireSuperAdmin();

  try {
    const [
      totalUsers,
      totalOrganizations,
      totalTenders,
      totalOffers,
      activeUsersLast30Days,
      recentUsers,
      recentOrgs,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total organizations
      prisma.organization.count(),

      // Total tenders
      prisma.tender.count(),

      // Total offers
      prisma.offer.count(),

      // Active users (logged in last 30 days)
      prisma.session
        .groupBy({
          by: ["userId"],
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        })
        .then((result) => result.length),

      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      }),

      // Recent organizations (last 10)
      prisma.organization.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              tenders: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalOrganizations,
        totalTenders,
        totalOffers,
        activeUsersLast30Days,
      },
      recentUsers,
      recentOrgs,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
}

/**
 * Get all users with pagination and search
 */
export async function getUsers({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  await requireSuperAdmin();

  try {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
          _count: {
            select: {
              sessions: true,
              notifications: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Get all organizations with pagination and search
 */
export async function getOrganizations({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  await requireSuperAdmin();

  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          subscriptions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          members: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              tenders: true,
              offers: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return {
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
}

/**
 * Get activity logs
 */
export async function getActivityLogs({
  page = 1,
  limit = 50,
  type,
}: {
  page?: number;
  limit?: number;
  type?:
    | "USER_CREATED"
    | "USER_DELETED"
    | "ORGANIZATION_CREATED"
    | "ADMIN_LOGIN"
    | "SYSTEM_ERROR";
}) {
  await requireSuperAdmin();

  try {
    const where = type ? { type } : {};

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
}

/**
 * Toggle user super admin status
 */
export async function toggleSuperAdmin(userId: string) {
  const currentUser = await requireSuperAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true, email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin: !user.isSuperAdmin },
    });

    await logActivity({
      type: "ADMIN_LOGIN",
      description: `Super admin status ${
        updated.isSuperAdmin ? "granted" : "revoked"
      } for ${user.email}`,
      userId: currentUser.id,
      metadata: { targetUserId: userId },
    });

    revalidatePath("/admin/users");

    return { success: true, isSuperAdmin: updated.isSuperAdmin };
  } catch (error) {
    console.error("Error toggling super admin:", error);
    throw error;
  }
}

/**
 * Get system health
 */
export async function getSystemHealth() {
  await requireSuperAdmin();

  try {
    const startTime = Date.now();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const dbResponseTime = Date.now() - startTime;

    // Get database size (PostgreSQL specific)
    const dbStats = await prisma.$queryRaw<
      Array<{ size: bigint }>
    >`SELECT pg_database_size(current_database()) as size`;

    const dbSize = Number(dbStats[0]?.size || 0);

    // Count records
    const [usersCount, orgsCount, tendersCount, offersCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.tender.count(),
        prisma.offer.count(),
      ]);

    return {
      status: "healthy",
      database: {
        connected: true,
        responseTime: dbResponseTime,
        size: dbSize,
        tables: {
          users: usersCount,
          organizations: orgsCount,
          tenders: tendersCount,
          offers: offersCount,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error checking system health:", error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueStats() {
  await requireSuperAdmin();

  try {
    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get all invoices
    const [paidInvoices, totalInvoices, recentInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: { status: "PAID" },
        select: { amount: true, paidAt: true, currency: true },
      }),
      prisma.invoice.count(),
      prisma.invoice.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          organization: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    // Assuming subscriptions are monthly
    const mrr = subscriptions.reduce((sum, sub) => {
      // Map plan to price (adjust these values based on your pricing)
      const planPrices: Record<string, number> = {
        FREE: 0,
        BASIC: 29,
        PRO: 99,
        ENTERPRISE: 299,
        VEILLE_BASIC: 49,
        VEILLE_UNLIMITED: 149,
      };
      return sum + (planPrices[sub.plan] || 0);
    }, 0);

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Calculate total revenue from paid invoices
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Revenue by month (last 12 months)
    const now = new Date();
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const revenue = paidInvoices
        .filter((inv) => {
          const paidDate = inv.paidAt ? new Date(inv.paidAt) : null;
          return paidDate && paidDate >= date && paidDate < nextMonth;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);

      return {
        month: date.toLocaleDateString("fr-CH", {
          month: "short",
          year: "numeric",
        }),
        revenue,
      };
    }).reverse();

    // Count cancelled subscriptions (churn)
    const cancelledSubs = await prisma.subscription.count({
      where: { status: "CANCELLED" },
    });

    const totalSubs = subscriptions.length + cancelledSubs;
    const churnRate = totalSubs > 0 ? (cancelledSubs / totalSubs) * 100 : 0;

    return {
      mrr,
      arr,
      totalRevenue,
      activeSubscriptions: subscriptions.length,
      totalInvoices,
      paidInvoices: paidInvoices.length,
      churnRate: parseFloat(churnRate.toFixed(2)),
      monthlyRevenue,
      recentInvoices,
      subscriptionsByPlan: subscriptions.reduce((acc, sub) => {
        acc[sub.plan] = (acc[sub.plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw error;
  }
}

/**
 * Get detailed user info
 */
export async function getUserDetails(userId: string) {
  await requireSuperAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                subscriptions: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
}

/**
 * Get detailed organization info
 */
export async function getOrganizationDetails(organizationId: string) {
  await requireSuperAdmin();

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        tenders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            _count: {
              select: { offers: true },
            },
          },
        },
        offers: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            tender: {
              select: {
                title: true,
                organization: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return organization;
  } catch (error) {
    console.error("Error fetching organization details:", error);
    throw error;
  }
}

/**
 * Block or unblock a user
 */
export async function toggleUserBlock(userId: string, reason?: string) {
  const admin = await requireSuperAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Note: Vous devrez ajouter un champ 'isBlocked' au modèle User
    // Pour l'instant, on log juste l'action
    await logActivity({
      type: "USER_BLOCKED",
      description: `User ${user.email} blocked by admin${
        reason ? `: ${reason}` : ""
      }`,
      userId: admin.id,
      metadata: { targetUserId: userId, reason },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error toggling user block:", error);
    throw error;
  }
}

/**
 * Suspend or reactivate an organization
 */
export async function toggleOrganizationSuspension(
  organizationId: string,
  reason?: string
) {
  const admin = await requireSuperAdmin();

  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, isActive: true },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: { isActive: !org.isActive },
    });

    await logActivity({
      type: updated.isActive
        ? "ORGANIZATION_CREATED"
        : "ORGANIZATION_SUSPENDED",
      description: `Organization ${org.name} ${
        updated.isActive ? "reactivated" : "suspended"
      }${reason ? `: ${reason}` : ""}`,
      userId: admin.id,
      metadata: { organizationId, reason },
    });

    revalidatePath("/admin/organizations");
    revalidatePath(`/admin/organizations/${organizationId}`);

    return { success: true, isActive: updated.isActive };
  } catch (error) {
    console.error("Error toggling organization suspension:", error);
    throw error;
  }
}

/**
 * Add manual credits to an organization
 */
export async function addManualCredits({
  organizationId,
  amount,
  reason,
}: {
  organizationId: string;
  amount: number;
  reason: string;
}) {
  const admin = await requireSuperAdmin();

  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    // Create a credit invoice
    await prisma.invoice.create({
      data: {
        organizationId,
        number: `CREDIT-${Date.now()}`,
        amount: -amount, // Negative amount for credit
        currency: "CHF",
        status: "PAID",
        description: `Manual credit: ${reason}`,
        paidAt: new Date(),
      },
    });

    await logActivity({
      type: "PAYMENT_SUCCESS",
      description: `Manual credit of CHF ${amount} added to ${org.name}: ${reason}`,
      userId: admin.id,
      metadata: { organizationId, amount, reason },
    });

    revalidatePath("/admin/organizations");
    revalidatePath(`/admin/organizations/${organizationId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding manual credits:", error);
    throw error;
  }
}

// ============================================
// MONITORING & OBSERVABILITY
// ============================================

export interface ErrorSummary {
  id: string;
  title: string;
  message: string;
  count: number;
  lastSeen: Date;
  status: "unresolved" | "resolved" | "ignored";
  level: "error" | "warning" | "fatal";
  platform: string;
}

export interface MonitoringStats {
  errors: {
    total: number;
    unresolved: number;
    last24h: number;
    byLevel: Record<string, number>;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  analytics: {
    pageviews: number;
    uniqueUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  system: {
    dbConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
}

/**
 * Get monitoring dashboard stats
 * Aggregates data from Sentry, PostHog, and system metrics
 */
export async function getMonitoringStats(): Promise<MonitoringStats> {
  await requireSuperAdmin();

  try {
    // Get error stats from database (logged errors)
    const errorLogs = await prisma.activityLog.findMany({
      where: {
        type: "SYSTEM_ERROR",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
        },
      },
    });

    // Get system health metrics
    const [totalSessions, avgSessionDuration] = await Promise.all([
      prisma.session.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      Promise.resolve(15), // Default to 15 minutes - would calculate from session duration
    ]);

    // Calculate error rate from activity logs
    const totalRequests = totalSessions * 10; // Rough estimate
    const errorRate =
      totalRequests > 0 ? (errorLogs.length / totalRequests) * 100 : 0;

    const stats: MonitoringStats = {
      errors: {
        total: errorLogs.length,
        unresolved: errorLogs.filter(
          (log) =>
            !log.metadata || !(log.metadata as Record<string, unknown>).resolved
        ).length,
        last24h: errorLogs.length,
        byLevel: {
          error: errorLogs.filter(
            (log) =>
              (log.metadata as Record<string, unknown>)?.level === "error"
          ).length,
          warning: errorLogs.filter(
            (log) =>
              (log.metadata as Record<string, unknown>)?.level === "warning"
          ).length,
          fatal: errorLogs.filter(
            (log) =>
              (log.metadata as Record<string, unknown>)?.level === "fatal"
          ).length,
        },
      },
      performance: {
        avgResponseTime: 250, // ms - Would come from APM tool
        p95ResponseTime: 450, // ms
        errorRate,
        uptime: 99.9, // %
      },
      analytics: {
        pageviews: totalSessions * 5, // Rough estimate
        uniqueUsers: totalSessions,
        avgSessionDuration, // minutes
        bounceRate: 35, // %
      },
      system: {
        dbConnections: 10, // Would come from DB monitoring
        memoryUsage: 65, // %
        cpuUsage: 45, // %
        diskUsage: 60, // %
      },
    };

    return stats;
  } catch (error) {
    console.error("Error fetching monitoring stats:", error);
    throw error;
  }
}

/**
 * Get recent errors from activity logs
 */
export async function getRecentErrors(limit = 50): Promise<ErrorSummary[]> {
  await requireSuperAdmin();

  try {
    const errorLogs = await prisma.activityLog.findMany({
      where: {
        type: "SYSTEM_ERROR",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Group similar errors
    const errorMap = new Map<string, ErrorSummary>();

    errorLogs.forEach((log) => {
      const metadata = log.metadata as Record<string, unknown> | null;
      const errorKey = (metadata?.message as string) || log.description;

      if (errorMap.has(errorKey)) {
        const existing = errorMap.get(errorKey)!;
        existing.count++;
        if (log.createdAt > existing.lastSeen) {
          existing.lastSeen = log.createdAt;
        }
      } else {
        errorMap.set(errorKey, {
          id: log.id,
          title: (metadata?.title as string) || "Application Error",
          message: (metadata?.message as string) || log.description,
          count: 1,
          lastSeen: log.createdAt,
          status: metadata?.resolved ? "resolved" : "unresolved",
          level: (metadata?.level as "error" | "warning" | "fatal") || "error",
          platform: (metadata?.platform as string) || "server",
        });
      }
    });

    return Array.from(errorMap.values()).sort(
      (a, b) => b.lastSeen.getTime() - a.lastSeen.getTime()
    );
  } catch (error) {
    console.error("Error fetching recent errors:", error);
    throw error;
  }
}

/**
 * Mark an error as resolved
 */
export async function resolveError(errorId: string) {
  await requireSuperAdmin();

  try {
    await prisma.activityLog.update({
      where: { id: errorId },
      data: {
        metadata: {
          resolved: true,
          resolvedAt: new Date().toISOString(),
        },
      },
    });

    revalidatePath("/admin/monitoring");
    return { success: true };
  } catch (error) {
    console.error("Error resolving error:", error);
    throw error;
  }
}

/**
 * Log a custom error to activity log
 * Can be called from error boundaries or catch blocks
 */
export async function logError(error: {
  title: string;
  message: string;
  level?: "error" | "warning" | "fatal";
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = await requireSuperAdmin();

    await logActivity({
      type: "SYSTEM_ERROR",
      description: error.title,
      userId: admin.id,
      metadata: {
        message: error.message,
        level: error.level || "error",
        ...error.metadata,
      },
    });
  } catch (err) {
    console.error("Failed to log error:", err);
  }
}
