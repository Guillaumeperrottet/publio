import { PrismaClient, TenderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function publishDraftTenders() {
  try {
    const result = await prisma.tender.updateMany({
      where: {
        status: TenderStatus.DRAFT,
      },
      data: {
        status: TenderStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ ${result.count} tender(s) publié(s)`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

publishDraftTenders();
