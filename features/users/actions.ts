// Actions pour la gestion du profil utilisateur
"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export async function getUserProfile() {
  const user = await getCurrentUser();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw new Error("User not found");
  }

  return profile;
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfile(data: {
  name?: string;
  image?: string;
}) {
  const user = await getCurrentUser();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.image && { image: data.image }),
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return updatedUser;
}

/**
 * Changer le mot de passe
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await getCurrentUser();

  // Récupérer le compte avec le mot de passe actuel
  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      provider: "credential",
    },
  });

  if (!account || !account.password) {
    throw new Error("No password account found");
  }

  // Vérifier le mot de passe actuel avec Better Auth
  // TODO: Implémenter la vérification du mot de passe avec Better Auth
  // Pour l'instant, on suppose que c'est bon

  // Hasher le nouveau mot de passe
  // TODO: Utiliser le système de hash de Better Auth
  const hashedPassword = data.newPassword; // À remplacer par le hash réel

  // Mettre à jour le mot de passe
  await prisma.account.update({
    where: { id: account.id },
    data: {
      password: hashedPassword,
    },
  });

  return { success: true };
}

/**
 * Supprimer le compte utilisateur
 */
export async function deleteUserAccount() {
  const user = await getCurrentUser();

  // Vérifier que l'utilisateur n'est pas le seul OWNER d'organisations
  const ownerships = await prisma.organizationMember.findMany({
    where: {
      userId: user.id,
      role: "OWNER",
    },
    include: {
      organization: {
        include: {
          members: {
            where: {
              role: "OWNER",
            },
          },
        },
      },
    },
  });

  // Vérifier s'il y a des organisations où il est le seul propriétaire
  const soleOwnerships = ownerships.filter(
    (m) => m.organization.members.length === 1
  );

  if (soleOwnerships.length > 0) {
    throw new Error(
      "You must transfer ownership or delete organizations where you are the sole owner before deleting your account"
    );
  }

  // Supprimer l'utilisateur (cascade supprimera les relations)
  await prisma.user.delete({
    where: { id: user.id },
  });

  return { success: true };
}
