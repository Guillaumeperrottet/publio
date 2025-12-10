import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function PublioFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-matte-black text-white">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold font-handdrawn text-artisan-yellow">
                Publio
              </h3>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              La plateforme moderne pour vos appels d&apos;offres en Suisse
              romande.
            </p>
          </div>

          {/* Liens Produit */}
          <div>
            <h4 className="font-semibold mb-4 text-artisan-yellow">Produit</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tenders"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Appels d&apos;offres
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens Légaux */}
          <div>
            <h4 className="font-semibold mb-4 text-artisan-yellow">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/mentions"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Politique des cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-artisan-yellow">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-artisan-yellow" />
                <a
                  href="mailto:contact@publio.ch"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  contact@publio.ch
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-artisan-yellow" />
                <span className="text-sm text-gray-400">+41 XX XXX XX XX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-artisan-yellow" />
                <span className="text-sm text-gray-400">Suisse Romande</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 my-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} Publio. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>🇨🇭 Hébergé en Suisse</span>
            <span>•</span>
            <span>🔒 Sécurisé</span>
            <span>•</span>
            <span>✓ RGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
