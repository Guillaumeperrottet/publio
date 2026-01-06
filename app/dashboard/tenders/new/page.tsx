import ProtectedLayout from "@/components/layout/protected-layout";
import { TenderModeChoice } from "@/components/tenders/tender-mode-choice";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";

export default async function NewTenderPage() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const currentOrganization = currentMembership.organization;

  // Vérifier que l'utilisateur a les droits de créer un tender
  if (!["OWNER", "ADMIN", "EDITOR"].includes(currentMembership.role)) {
    redirect("/dashboard/tenders");
  }

  return (
    <ProtectedLayout>
      <div className="bg-sand-light/30 min-h-screen">
        <TenderModeChoice organization={currentOrganization} />
      </div>
    </ProtectedLayout>
  );
}
