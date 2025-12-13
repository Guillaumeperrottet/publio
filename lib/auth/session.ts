import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./config";

/**
 * Récupère la session utilisateur côté serveur
 * Utilisé dans les Server Components et les layouts
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionCookie.value}`,
      },
    });

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 * Redirige vers /auth/signin si non authentifié
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return session;
}

/**
 * Récupère l'utilisateur avec ses organisations
 */
export async function getCurrentUser() {
  const session = await requireAuth();

  // TODO: Récupérer l'utilisateur avec ses organisations depuis Prisma
  // const user = await prisma.user.findUnique({
  //   where: { id: session.user.id },
  //   include: {
  //     memberships: {
  //       include: {
  //         organization: true,
  //       },
  //     },
  //   },
  // });

  return session.user;
}
