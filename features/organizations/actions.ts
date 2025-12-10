// Actions pour la gestion des organisations
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { OrganizationType, OrganizationRole } from "@prisma/client";
import { sendInvitationEmail } from "@/lib/email";

/**
 * Créer une nouvelle organisation
 */
export async function createOrganization(data: {
  name: string;
  type: OrganizationType;
  description?: string;
  address?: string;
  city?: string;
  canton?: string;
}) {
  const user = await getCurrentUser();

  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      address: data.address,
      city: data.city,
      canton: data.canton,
      createdBy: user.id,
      members: {
        create: {
          userId: user.id,
          role: OrganizationRole.OWNER,
        },
      },
    },
    include: {
      members: true,
    },
  });

  return organization;
}

/**
 * Récupérer les organisations de l'utilisateur
 */
export async function getUserOrganizations() {
  const user = await getCurrentUser();

  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  return memberships;
}

/**
 * Récupérer les membres d'une organisation
 */
export async function getOrganizationMembers(organizationId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur fait partie de l'organisation
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return members;
}

/**
 * Inviter un collaborateur
 */
export async function inviteMember(data: {
  organizationId: string;
  email: string;
  role: OrganizationRole;
}) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur est OWNER ou ADMIN
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: data.organizationId,
      userId: user.id,
      role: {
        in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  // Vérifier que l'utilisateur n'est pas déjà membre
  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: data.organizationId,
      user: {
        email: data.email,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this organization");
  }

  // Vérifier s'il existe déjà une invitation en attente
  const existingInvitation = await prisma.invitationToken.findFirst({
    where: {
      organizationId: data.organizationId,
      email: data.email,
      status: "PENDING",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (existingInvitation) {
    throw new Error("An invitation has already been sent to this email");
  }

  // Générer un token unique
  const token = generateInvitationToken();

  // Créer l'invitation (expire dans 7 jours)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitationToken.create({
    data: {
      token,
      email: data.email,
      role: data.role,
      organizationId: data.organizationId,
      invitedBy: user.id,
      expiresAt,
    },
    include: {
      organization: true,
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // L'email peut être envoyé optionnellement plus tard
  // Pour l'instant, on retourne juste le code et l'URL d'invitation

  return {
    success: true,
    invitationCode: token,
    invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${token}`,
    invitation,
  };
}

/**
 * Générer un token d'invitation unique
 */
function generateInvitationToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Récupérer une invitation par token
 */
export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitationToken.findUnique({
    where: { token },
    include: {
      organization: true,
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Vérifier si l'invitation est expirée
  if (invitation.expiresAt < new Date()) {
    await prisma.invitationToken.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("Invitation has expired");
  }

  // Vérifier si l'invitation a déjà été utilisée
  if (invitation.status !== "PENDING") {
    throw new Error("Invitation has already been used");
  }

  return invitation;
}

/**
 * Accepter une invitation
 */
export async function acceptInvitation(token: string) {
  const user = await getCurrentUser();
  const invitation = await getInvitationByToken(token);

  // Vérifier que l'email correspond
  if (user.email !== invitation.email) {
    throw new Error("This invitation was sent to a different email address");
  }

  // Vérifier que l'utilisateur n'est pas déjà membre
  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: invitation.organizationId,
      userId: user.id,
    },
  });

  if (existingMember) {
    // Marquer l'invitation comme acceptée même si déjà membre
    await prisma.invitationToken.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });
    throw new Error("You are already a member of this organization");
  }

  // Créer le membership
  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: invitation.organizationId,
      role: invitation.role,
    },
  });

  // Marquer l'invitation comme acceptée
  await prisma.invitationToken.update({
    where: { id: invitation.id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  return {
    success: true,
    organization: invitation.organization,
  };
}

/**
 * Refuser une invitation
 */
export async function declineInvitation(token: string) {
  const user = await getCurrentUser();
  const invitation = await getInvitationByToken(token);

  // Vérifier que l'email correspond
  if (user.email !== invitation.email) {
    throw new Error("This invitation was sent to a different email address");
  }

  // Marquer l'invitation comme refusée
  await prisma.invitationToken.update({
    where: { id: invitation.id },
    data: { status: "DECLINED" },
  });

  return { success: true };
}

/**
 * Annuler une invitation (par l'inviteur)
 */
export async function cancelInvitation(invitationId: string) {
  const user = await getCurrentUser();

  const invitation = await prisma.invitationToken.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Vérifier que l'utilisateur a les droits
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: invitation.organizationId,
      userId: user.id,
      role: {
        in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  // Supprimer l'invitation
  await prisma.invitationToken.delete({
    where: { id: invitationId },
  });

  return { success: true };
}

/**
 * Mettre à jour une organisation
 */
export async function updateOrganization(
  organizationId: string,
  data: {
    name?: string;
    description?: string;
    logo?: string;
    website?: string;
    address?: string;
    city?: string;
    canton?: string;
    phone?: string;
    siret?: string;
    taxId?: string;
  }
) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur a les droits (OWNER ou ADMIN)
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: {
        in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.canton !== undefined && { canton: data.canton }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.siret !== undefined && { siret: data.siret }),
      ...(data.taxId !== undefined && { taxId: data.taxId }),
    },
  });

  return organization;
}

/**
 * Modifier le rôle d'un membre
 */
export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  newRole: OrganizationRole
) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur est OWNER ou ADMIN
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: {
        in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  // Vérifier que le membre existe et n'est pas OWNER
  const targetMember = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.organizationId !== organizationId) {
    throw new Error("Member not found");
  }

  if (targetMember.role === OrganizationRole.OWNER) {
    throw new Error("Cannot change role of organization owner");
  }

  // Mettre à jour le rôle
  const updatedMember = await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  return updatedMember;
}

/**
 * Retirer un membre de l'organisation
 */
export async function removeMember(organizationId: string, memberId: string) {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur est OWNER ou ADMIN
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: {
        in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  // Vérifier que le membre existe et n'est pas OWNER
  const targetMember = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.organizationId !== organizationId) {
    throw new Error("Member not found");
  }

  if (targetMember.role === OrganizationRole.OWNER) {
    throw new Error("Cannot remove organization owner");
  }

  // Retirer le membre
  await prisma.organizationMember.delete({
    where: { id: memberId },
  });

  return { success: true };
}
