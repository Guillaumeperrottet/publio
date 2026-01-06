/**
 * Super Admin utilities
 */

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";

/**
 * Vérifie si l'utilisateur courant est un super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  return user?.isSuperAdmin || false;
}

/**
 * Middleware pour protéger les routes admin
 * Utiliser dans les Server Components
 */
export async function requireSuperAdmin() {
  const user = await getCurrentUser();

  const isAdmin = await isSuperAdmin(user.id);

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Log une activité admin
 */
export async function logActivity({
  type,
  description,
  metadata,
  userId,
  ipAddress,
  userAgent,
}: {
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        // @ts-expect-error - Prisma enum type
        type: type,
        description,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        userId,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Ne pas bloquer l'action si le log échoue
  }
}
