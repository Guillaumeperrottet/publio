/**
 * Release Prisma advisory lock manually
 * Run this if migrations are stuck
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function releaseLock() {
  try {
    console.log("🔓 Releasing Prisma advisory locks...");

    // Release the specific lock that Prisma uses for migrations
    await prisma.$executeRawUnsafe(`
      SELECT pg_advisory_unlock_all();
    `);

    console.log("✅ All advisory locks released");

    // Show current locks
    const locks = await prisma.$queryRawUnsafe(`
      SELECT * FROM pg_locks WHERE locktype = 'advisory';
    `);

    console.log("\nCurrent advisory locks:", locks);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

releaseLock();
