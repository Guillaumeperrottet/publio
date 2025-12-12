import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/features/organizations/actions";
import CreateOrganizationForm from "@/features/organizations/create-organization-form";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardDescription,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; action?: string }>;
}) {
  await getCurrentUser();

  const params = await searchParams;
  const redirectUrl = params.redirect;
  const action = params.action;

  // Vérifier si l'utilisateur a déjà une organisation
  const memberships = await getUserOrganizations();

  if (memberships.length > 0) {
    // L'utilisateur a déjà une organisation, rediriger vers la destination ou dashboard
    redirect(redirectUrl || "/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Formes grises décoratives */}
      <div className="absolute -left-40 top-20 w-[500px] h-[500px] bg-gray-100 rounded-full opacity-40" />
      <div className="absolute -right-40 bottom-20 w-[600px] h-[600px] bg-gray-100 rounded-full opacity-35" />
      <div className="absolute left-1/4 -top-20 w-[300px] h-[300px] bg-gray-100 rounded-full opacity-30" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bienvenue sur{" "}
            <span className="font-handdrawn text-5xl md:text-6xl">
              <HandDrawnHighlight variant="yellow">Publio</HandDrawnHighlight>
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Pour commencer, créez votre{" "}
            <span className="font-semibold text-matte-black">organisation</span>
          </p>
        </div>

        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle className="font-handdrawn text-3xl">
              Créer une organisation
            </HandDrawnCardTitle>
            <HandDrawnCardDescription>
              Commune, entreprise ou professionnel indépendant - choisissez le
              type qui vous correspond
            </HandDrawnCardDescription>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <CreateOrganizationForm redirectUrl={redirectUrl} action={action} />
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Option pour rejoindre une organisation - à implémenter plus tard */}
        {/* <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Vous avez reçu une invitation ?{" "}
            <Link href="/onboarding/join" className="text-deep-green underline">
              Rejoindre une organisation
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
