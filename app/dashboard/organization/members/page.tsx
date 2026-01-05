import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getUserOrganizations,
  getOrganizationMembers,
} from "@/features/organizations/actions";
import ProtectedLayout from "@/components/layout/protected-layout";
import {
  HandDrawnCard,
  HandDrawnCardContent,
  HandDrawnCardHeader,
  HandDrawnCardTitle,
  HandDrawnCardDescription,
} from "@/components/ui/hand-drawn-card";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import { HandDrawnBadge } from "@/components/ui/hand-drawn-badge";
import {
  HandDrawnCircle,
  HandDrawnStar,
} from "@/components/ui/hand-drawn-elements";
import MembersList from "@/features/organizations/members-list";
import InviteMemberForm from "@/features/organizations/invite-member-form";

async function MembersContent() {
  await getCurrentUser();
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const currentMembership = memberships[0];
  const organization = currentMembership.organization;
  const userRole = currentMembership.role;

  // Récupérer les membres de l'organisation
  const members = await getOrganizationMembers(organization.id);

  // Vérifier que l'utilisateur peut gérer les membres
  const canManageMembers = ["OWNER", "ADMIN"].includes(userRole);

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-6xl mx-auto relative">
        {/* Éléments décoratifs */}
        <div className="absolute top-4 right-8 opacity-20">
          <HandDrawnStar className="w-12 h-12 text-deep-green" />
        </div>
        <div className="absolute top-20 right-20 opacity-15">
          <HandDrawnCircle className="w-20 h-20 text-artisan-yellow" />
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">
            <span className="font-handdrawn text-6xl">
              <HandDrawnHighlight variant="green">Équipe</HandDrawnHighlight>
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez les{" "}
            <span className="font-handdrawn text-xl text-deep-green">
              collaborateurs
            </span>{" "}
            de {organization.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des membres */}
          <div className="lg:col-span-2">
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <HandDrawnCardTitle className="font-handdrawn text-3xl">
                      Membres de l&apos;organisation
                    </HandDrawnCardTitle>
                    <HandDrawnCardDescription>
                      <span className="font-handdrawn text-lg">
                        {members.length}
                      </span>{" "}
                      membre{members.length > 1 ? "s" : ""}
                    </HandDrawnCardDescription>
                  </div>
                  <HandDrawnBadge variant="default">
                    {organization.type === "COMMUNE"
                      ? "Commune"
                      : organization.type === "ENTREPRISE"
                      ? "Entreprise"
                      : "Privé"}
                  </HandDrawnBadge>
                </div>
              </HandDrawnCardHeader>
              <HandDrawnCardContent>
                <MembersList
                  members={members}
                  organizationId={organization.id}
                  currentUserId={currentMembership.userId}
                  canManage={canManageMembers}
                />
              </HandDrawnCardContent>
            </HandDrawnCard>
          </div>

          {/* Invitation */}
          <div>
            <HandDrawnCard>
              <HandDrawnCardHeader>
                <HandDrawnCardTitle className="font-handdrawn text-2xl">
                  Inviter un membre
                </HandDrawnCardTitle>
                <HandDrawnCardDescription>
                  Ajoutez un collaborateur à votre organisation
                </HandDrawnCardDescription>
              </HandDrawnCardHeader>
              <HandDrawnCardContent>
                {canManageMembers ? (
                  <InviteMemberForm organizationId={organization.id} />
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Vous n&apos;avez pas les droits pour inviter des membres.
                    </p>
                  </div>
                )}
              </HandDrawnCardContent>
            </HandDrawnCard>

            {/* Informations sur les rôles */}
            <HandDrawnCard className="mt-6">
              <HandDrawnCardHeader>
                <HandDrawnCardTitle>Rôles</HandDrawnCardTitle>
              </HandDrawnCardHeader>
              <HandDrawnCardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-deep-green">OWNER</p>
                    <p className="text-xs text-muted-foreground">
                      Tous les droits, gestion facturation
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-deep-green">ADMIN</p>
                    <p className="text-xs text-muted-foreground">
                      Gestion membres et contenus
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-deep-green">EDITOR</p>
                    <p className="text-xs text-muted-foreground">
                      Création et modification
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-deep-green">VIEWER</p>
                    <p className="text-xs text-muted-foreground">
                      Lecture seule
                    </p>
                  </div>
                </div>
              </HandDrawnCardContent>
            </HandDrawnCard>
          </div>
        </div>
      </>
  );
}

function MembersSkeleton() {
  return (
    <>
      {/* Éléments décoratifs */}
      <div className="absolute top-4 right-8 opacity-20">
        <HandDrawnStar className="w-12 h-12 text-deep-green" />
      </div>
      <div className="absolute top-20 right-20 opacity-15">
        <HandDrawnCircle className="w-20 h-20 text-artisan-yellow" />
      </div>

      <div className="mb-8">
        <div className="h-12 w-64 bg-sand-light/50 rounded animate-pulse mb-3" />
        <div className="h-6 w-96 bg-sand-light/50 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des membres skeleton */}
        <div className="lg:col-span-2">
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <div className="space-y-2">
                <div className="h-8 w-64 bg-sand-light/50 rounded animate-pulse" />
                <div className="h-5 w-32 bg-sand-light/50 rounded animate-pulse" />
              </div>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 bg-sand-light/50 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-sand-light/50 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-sand-light/50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>

        {/* Invitation skeleton */}
        <div>
          <HandDrawnCard>
            <HandDrawnCardHeader>
              <div className="h-8 w-48 bg-sand-light/50 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-sand-light/50 rounded animate-pulse" />
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <div className="space-y-4">
                <div className="h-10 w-full bg-sand-light/50 rounded animate-pulse" />
                <div className="h-10 w-full bg-sand-light/50 rounded animate-pulse" />
                <div className="h-10 w-full bg-sand-light/50 rounded animate-pulse" />
              </div>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>
      </div>
    </>
  );
}

export default function OrganizationMembersPage() {
  return (
    <ProtectedLayout>
      <div className="p-8 max-w-6xl mx-auto relative">
        <Suspense fallback={<MembersSkeleton />}>
          <MembersContent />
        </Suspense>
      </div>
    </ProtectedLayout>
  );
}
