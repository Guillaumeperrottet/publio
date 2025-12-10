import ProtectedLayout from "@/components/layout/protected-layout";
import { CreateTenderStepper } from "@/components/tenders/create-tender-stepper";
import { getUserOrganizations } from "@/features/organizations/actions";
import { redirect } from "next/navigation";

export default async function NewTenderPage() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentOrganization = memberships[0].organization;

  return (
    <ProtectedLayout>
      <div className="bg-sand-light/30 min-h-screen">
        <CreateTenderStepper organizationId={currentOrganization.id} />
      </div>
    </ProtectedLayout>
  );
}
