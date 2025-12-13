import ProtectedLayout from "@/components/layout/protected-layout";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EditTenderForm } from "@/components/tenders/edit-tender-form";

export default async function EditTenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Récupérer le tender avec toutes les relations
  const tender = await prisma.tender.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          members: {
            where: {
              userId: user.id,
            },
          },
        },
      },
      lots: {
        orderBy: {
          number: "asc",
        },
      },
      criteria: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!tender) {
    notFound();
  }

  // Vérifier que l'utilisateur a les droits
  const membership = tender.organization.members[0];
  if (!membership || !["OWNER", "ADMIN", "EDITOR"].includes(membership.role)) {
    redirect("/dashboard/tenders");
  }

  // Seuls les DRAFT peuvent être édités
  if (tender.status !== "DRAFT") {
    redirect(`/dashboard/tenders/${id}`);
  }

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <EditTenderForm
          tender={{
            ...tender,
            images: tender.images as Array<{
              url: string;
              name: string;
              type: string;
            }>,
            pdfs: tender.pdfs as Array<{
              url: string;
              name: string;
              type: string;
            }>,
          }}
        />
      </div>
    </ProtectedLayout>
  );
}
