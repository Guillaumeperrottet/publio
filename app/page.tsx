import PublicLayout from "@/components/layout/public-layout";
import { HandDrawnHighlight } from "@/components/ui/hand-drawn-highlight";
import {
  HandDrawnArrow,
  HandDrawnUnderline,
  HandDrawnCircle,
  HandDrawnStar,
} from "@/components/ui/hand-drawn-elements";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Target,
  Eye,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section - Style Odoo */}
      <section className="relative py-24 px-4 bg-white overflow-hidden">
        {/* Decorative elements - Formes grises à ajouter */}
        {/* <div className="absolute top-10 right-10 w-32 h-32 bg-gray-100 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gray-100 rounded-full blur-3xl" /> */}

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge supérieur */}
            <div className="inline-block mb-6 px-4 py-2 bg-white border-2 border-matte-black rounded-full shadow-sm">
              <span className="text-sm font-semibold">
                🚀 Plateforme suisse d&apos;appels d&apos;offres
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Simplifiez vos{" "}
              <span className="relative inline-block">
                <HandDrawnHighlight variant="yellow">
                  appels d&apos;offres
                </HandDrawnHighlight>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              La{" "}
              <span className="relative inline-block font-handdrawn text-deep-green text-3xl">
                première
                <HandDrawnUnderline className="text-artisan-yellow" />
              </span>{" "}
              plateforme qui connecte{" "}
              <span className="font-semibold text-deep-green">
                particuliers
              </span>
              ,{" "}
              <span className="font-semibold text-deep-green">
                professionnels
              </span>{" "}
              et <span className="font-semibold text-deep-green">communes</span>{" "}
              pour des appels d&apos;offres{" "}
              <span className="relative inline-block font-handdrawn text-artisan-yellow text-2xl font-bold">
                équitables
              </span>{" "}
              et simple.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-7 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold shadow-xl border-2 border-matte-black"
              >
                <Link href="/tenders">
                  Explorer les appels d&apos;offres
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap gap-8 justify-center items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2 relative">
                <Users className="w-5 h-5 text-artisan-yellow" />
                <span className="font-handdrawn text-lg">Particuliers</span>
                <HandDrawnStar className="absolute -top-4 -right-4 w-6 h-6 text-artisan-yellow" />
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-artisan-yellow" />
                <span className="font-handdrawn text-lg">Professionnels</span>
              </div>
              <div className="flex items-center gap-2 relative">
                <Building2 className="w-5 h-5 text-artisan-yellow" />
                <span className="font-handdrawn text-lg">Communes</span>
                <HandDrawnStar className="absolute -top-4 -right-4 w-6 h-6 text-artisan-yellow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Style Odoo avec alternance */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Forme grise décorative - commence à gauche et entoure les features */}
        <div className="absolute -left-32 top-20 w-[600px] h-[600px] bg-gray-100 rounded-full opacity-40" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pourquoi{" "}
              <span
                className="relative inline-block text-5xl md:text-6xl"
                style={{ fontFamily: "More Sugar, cursive" }}
              >
                <HandDrawnHighlight variant="yellow">Publio</HandDrawnHighlight>
              </span>
              <span style={{ color: "#a9e3b3" }}>.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme pensée pour{" "}
              <span className="relative inline-block font-handdrawn text-deep-green text-2xl">
                simplifier
                <HandDrawnUnderline className="text-deep-green" />
              </span>{" "}
              et moderniser vos processus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center border-2 border-matte-black group-hover:bg-artisan-yellow transition-all duration-300 rotate-3 group-hover:rotate-6">
                  <Target className="w-10 h-10 text-matte-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Offres{" "}
                <span className="relative inline-block font-handdrawn text-3xl">
                  <HandDrawnHighlight variant="yellow">
                    anonymisées
                  </HandDrawnHighlight>
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Éliminez les biais locaux. L&apos;identité des soumissionnaires
                reste masquée jusqu&apos;à la deadline pour une évaluation 100%
                équitable.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Évaluation objective</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aucun favoritisme</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center border-2 border-matte-black group-hover:bg-artisan-yellow transition-all duration-300 -rotate-3 group-hover:-rotate-6">
                  <Eye className="w-10 h-10 text-matte-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Hébergé en{" "}
                <span className="relative inline-block">
                  <HandDrawnHighlight variant="yellow">
                    Suisse
                  </HandDrawnHighlight>
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont stockées à Genève et restent en Suisse.
                Conformité totale avec la législation suisse sur la protection
                des données.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Données à Genève</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% suisse</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center border-2 border-matte-black group-hover:bg-artisan-yellow transition-all duration-300 rotate-3 group-hover:rotate-6">
                  <Zap className="w-10 h-10 text-matte-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Recherche{" "}
                <span className="relative inline-block">
                  <HandDrawnHighlight variant="yellow">
                    & alertes
                  </HandDrawnHighlight>
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Trouvez les appels d&apos;offres qui vous correspondent. Soyez
                notifié dès qu&apos;une opportunité correspond à vos critères.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Filtres personnalisés</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Notifications en temps réel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Style Odoo */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Forme grise décorative - commence à droite et entoure les steps */}
        <div className="absolute -right-32 top-20 w-[600px] h-[600px] bg-gray-100 rounded-full opacity-40" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Comment ça{" "}
              <span className="relative inline-block font-handdrawn text-5xl md:text-6xl">
                <HandDrawnHighlight variant="yellow">marche</HandDrawnHighlight>
              </span>{" "}
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <span className="relative inline-block font-handdrawn text-deep-green text-2xl">
                Simple
                <HandDrawnUnderline className="text-deep-green" />
              </span>
              , rapide et efficace
            </p>
            {/* Flèche décorative */}
            <div className="relative w-48 mx-auto mt-8">
              <HandDrawnArrow className="w-full h-12 text-artisan-yellow" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start bg-white p-8 rounded-2xl border-2 border-matte-black shadow-sm">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-artisan-yellow rounded-full flex items-center justify-center border-2 border-matte-black font-bold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  <span className="font-handdrawn text-3xl">
                    Créez votre compte en 2 minutes
                  </span>
                </h3>
                <p className="text-muted-foreground">
                  Inscription gratuite pour particuliers, professionnels et
                  collectivités. Aucune carte bancaire requise.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start bg-white p-8 rounded-2xl border-2 border-matte-black shadow-sm">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-artisan-yellow rounded-full flex items-center justify-center border-2 border-matte-black font-bold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  <span className="font-handdrawn text-3xl">
                    Publiez votre appel d&apos;offres
                  </span>
                </h3>
                <p className="text-muted-foreground">
                  Formulaire simple et intuitif. Choisissez le mode anonyme pour
                  plus d&apos;équité ou classique selon vos besoins.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start bg-white p-8 rounded-2xl border-2 border-matte-black shadow-sm">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-artisan-yellow rounded-full flex items-center justify-center border-2 border-matte-black font-bold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  <span className="font-handdrawn text-3xl">
                    Recevez et comparez les offres
                  </span>
                </h3>
                <p className="text-muted-foreground">
                  Les professionnels soumettent leurs offres. Comparez, échangez
                  et choisissez la meilleure proposition en toute sérénité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Style Odoo */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        {/* Forme grise en demi-cercle qui englobe le contenu - ellipse large */}
        <div className="absolute left-1/2 -translate-x-1/2 top-40 w-[2000px] h-[600px] bg-gray-100 rounded-[100%] opacity-40" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-matte-black">
              Prêt à{" "}
              <span className="relative inline-block font-handdrawn text-5xl md:text-7xl text-artisan-yellow">
                moderniser
                <HandDrawnUnderline className="text-matte-black opacity-30" />
              </span>{" "}
              vos appels d&apos;offres ?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-muted-foreground leading-relaxed">
              Rejoignez particuliers, professionnels et collectivités qui font
              confiance à Publio pour leurs projets.
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-7 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold shadow-xl border-2 border-matte-black"
            >
              <Link href="/auth/signup">
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
              ✓ Sans engagement · ✓ Hébergé en Suisse · ✓ Support en français
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
