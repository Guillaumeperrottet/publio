import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout pour les pages d'authentification (signin, signup)
 * Redirige vers le dashboard si déjà authentifié
 */
export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getSession();

  // Redirection vers dashboard si déjà authentifié
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Formes grises décoratives - style page d'accueil */}
      <div className="absolute -left-40 top-20 w-[500px] h-[500px] bg-gray-100 rounded-full opacity-40" />
      <div className="absolute -right-40 bottom-20 w-[600px] h-[600px] bg-gray-100 rounded-full opacity-35" />
      <div className="absolute left-1/4 -top-20 w-[300px] h-[300px] bg-gray-100 rounded-full opacity-30" />

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="text-5xl font-bold mb-2 transition-transform group-hover:scale-105">
              <span className="font-handdrawn">Publio</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              La plateforme d'appels d'offres équitables
            </p>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
