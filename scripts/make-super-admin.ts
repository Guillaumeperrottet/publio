/**
 * Script to make a user super admin
 * Usage: tsx scripts/make-super-admin.ts <email>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: tsx scripts/make-super-admin.ts <email>");
    process.exit(1);
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    if (user.isSuperAdmin) {
      console.log(`✅ ${email} is already a super admin`);
      return;
    }

    // Update the user
    await prisma.user.update({
      where: { id: user.id },
      data: { isSuperAdmin: true },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        type: "ADMIN_LOGIN",
        description: `Super admin granted to ${email} via script`,
        userId: user.id,
      },
    });

    console.log(`✅ Success! ${email} is now a super admin`);
    console.log(`👤 User: ${user.name || "No name"}`);
    console.log(`🔑 User ID: ${user.id}`);
    console.log(`\n🚀 Access the admin panel at: http://localhost:3000/admin`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
