import ProtectedLayout from "@/components/layout/protected-layout";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CreateTenderStepper } from "@/components/tenders/create-tender-stepper";
import { SimpleTenderStepper } from "@/components/tenders/simple-tender-stepper";

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

  // Déterminer quel stepper utiliser en fonction du mode
  const isSimpleMode = tender.isSimpleMode ?? false;

  return (
    <ProtectedLayout>
      {isSimpleMode ? (
        <SimpleTenderStepper
          organizationId={tender.organizationId}
          organization={{
            id: tender.organization.id,
            name: tender.organization.name,
            logo: tender.organization.logo,
            address: tender.organization.address,
            city: tender.organization.city,
            canton: tender.organization.canton,
            phone: tender.organization.phone,
            email: tender.organization.email,
            website: tender.organization.website,
          }}
          existingTender={{
            id: tender.id,
            title: tender.title,
            description: tender.description,
            currentSituation: tender.currentSituation,
            budget: tender.budget,
            showBudget: tender.showBudget,
            deadline: tender.deadline,
            address: tender.address,
            city: tender.city,
            postalCode: tender.postalCode,
            canton: tender.canton,
            mode: tender.mode,
            visibility: tender.visibility,
            images: tender.images as Array<{
              url: string;
              name: string;
              type: "image";
            }>,
            pdfs: tender.pdfs as Array<{
              url: string;
              name: string;
              type: "pdf";
            }>,
          }}
        />
      ) : (
        <CreateTenderStepper
          organizationId={tender.organizationId}
          existingTender={{
            id: tender.id,
            title: tender.title,
            summary: tender.summary,
            description: tender.description,
            currentSituation: tender.currentSituation,
            mode: tender.mode,
            cfcCodes: tender.cfcCodes,
            budget: tender.budget,
            showBudget: tender.showBudget,
            surfaceM2: tender.surfaceM2,
            volumeM3: tender.volumeM3,
            constraints: tender.constraints,
            contractDuration: tender.contractDuration,
            contractStartDate: tender.contractStartDate,
            isRenewable: tender.isRenewable,
            deadline: tender.deadline,
            address: tender.address,
            city: tender.city,
            postalCode: tender.postalCode,
            canton: tender.canton,
            country: tender.country,
            location: tender.location,
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
            hasLots: tender.hasLots,
            lots: tender.lots.map((lot) => ({
              number: lot.number,
              title: lot.title,
              description: lot.description,
              budget: lot.budget,
            })),
            criteria: tender.criteria.map((c) => ({
              name: c.name,
              description: c.description,
              weight: c.weight,
              order: c.order,
            })),
            questionDeadline: tender.questionDeadline,
            participationConditions: tender.participationConditions,
            requiredDocuments: tender.requiredDocuments,
            requiresReferences: tender.requiresReferences,
            requiresInsurance: tender.requiresInsurance,
            minExperience: tender.minExperience,
            contractualTerms: tender.contractualTerms,
            procedure: tender.procedure,
            allowPartialOffers: tender.allowPartialOffers,
            visibility: tender.visibility,
            selectionPriorities: tender.selectionPriorities,
          }}
        />
      )}
    </ProtectedLayout>
  );
}
