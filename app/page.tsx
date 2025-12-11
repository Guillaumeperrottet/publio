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
import Image from "next/image";
import {
  Target,
  CheckCircle2,
  FileText,
  Search,
  Bell,
  Shield,
  Briefcase,
  Building,
  ArrowRight,
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
                🚀 La marketplace des appels d&apos;offres en Suisse romande
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight flex flex-col items-center gap-4">
              <Image
                src="/logo/logo_slogan.png"
                alt="Publio"
                width={600}
                height={240}
                className="w-auto h-40 md:h-64"
                priority
              />
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              La marketplace des appels d&apos;offres pour{" "}
              <span className="font-semibold text-deep-green">
                PME, artisans et privés
              </span>
              .
              <br />
              <span className="font-handdrawn text-artisan-yellow text-2xl font-bold mt-2 relative inline-block">
                {/* Flèche à gauche du mot Nouveaux */}
                <div className="absolute -left-50 top-1/4 w-48 md:w-64">
                  <HandDrawnArrow className="w-full h-16 text-artisan-yellow -scale-x-100 -rotate-25" />
                </div>
                Nouveaux projets chaque jour
              </span>{" "}
              en Suisse romande.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-7 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold shadow-xl border-2 border-matte-black"
              >
                <Link href="/tenders">
                  <Search className="mr-2 w-5 h-5" />
                  Trouver des projets
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-2 border-matte-black font-bold shadow-lg hover:bg-sand-light"
              >
                <Link href="/auth/signup?callbackUrl=/dashboard/tenders/new">
                  <FileText className="mr-2 w-5 h-5" />
                  Publier un appel d&apos;offres
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center items-center text-sm">
              <div className="flex items-center gap-2">
                <div />
                <span className="font-semibold">✓ Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <div />
                <span className="font-semibold">✓ Hébergé en Suisse 🇨🇭</span>
              </div>
              <div className="flex items-center gap-2">
                <div />
                <span className="font-semibold">✓ Équitable & transparent</span>
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
              <span className="relative inline-block text-5xl md:text-6xl font-script">
                <HandDrawnHighlight variant="yellow">Publio</HandDrawnHighlight>
              </span>
              <span style={{ color: "#a9e3b3" }}>.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trouvez des opportunités,{" "}
              <span className="relative inline-block font-handdrawn text-deep-green text-2xl">
                comblez vos trous
                <HandDrawnUnderline className="text-deep-green" />
              </span>
              , développez votre activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Feature 1 - Marketplace */}
            <div className="text-center group">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center border-2 border-matte-black group-hover:bg-artisan-yellow transition-all duration-300 rotate-3 group-hover:rotate-6">
                  <Target className="w-10 h-10 text-matte-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Marketplace{" "}
                <span className="relative inline-block font-handdrawn text-3xl">
                  <HandDrawnHighlight variant="yellow">
                    active
                  </HandDrawnHighlight>
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Plus de 850 projets actifs. Filtrez par métier, canton et
                budget. Nouveaux appels d&apos;offres chaque jour.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recherche avancée</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alertes personnalisées</span>
                </div>
              </div>
            </div>

            {/* Feature 2 - Veille */}
            <div className="text-center group">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center border-2 border-matte-black group-hover:bg-artisan-yellow transition-all duration-300 -rotate-3 group-hover:-rotate-6">
                  <Bell className="w-10 h-10 text-matte-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Veille{" "}
                <span className="relative inline-block">
                  <HandDrawnHighlight variant="yellow">
                    intelligente
                  </HandDrawnHighlight>
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ne ratez plus jamais une opportunité. Recevez les publications
                communales et mises à l&apos;enquête en temps réel.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alertes quotidiennes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CHF 5-10/mois</span>
                </div>
              </div>
            </div>

            {/* Feature 3 - Anonymat optionnel */}
            <div className="text-center group">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center border-2 border-matte-black group-hover:bg-artisan-yellow transition-all duration-300 rotate-3 group-hover:rotate-6">
                  <Shield className="w-10 h-10 text-matte-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Offres{" "}
                <span className="relative inline-block">
                  <HandDrawnHighlight variant="yellow">
                    anonymes
                  </HandDrawnHighlight>
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Mode anonyme optionnel. Identité masquée jusqu&apos;à la
                deadline pour une évaluation 100% objective.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Évaluation équitable</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CHF 10.- / offre</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Veille Section - Fond vert */}
      <section className="py-20 px-4 bg-deep-green text-white relative overflow-hidden">
        {/* Forme décorative */}
        <div className="absolute -left-32 top-20 w-[600px] h-[600px] bg-white/5 rounded-full" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              🔔 Ne ratez plus jamais une{" "}
              <span className="relative inline-block font-script text-5xl md:text-6xl text-artisan-yellow">
                opportunité
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Veille communale intelligente pour professionnels ambitieux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-artisan-yellow">
                Publications communales en temps réel
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-artisan-yellow shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Mises à l&apos;enquête</p>
                    <p className="text-sm text-white/70">
                      Soyez alerté dès qu&apos;une nouvelle construction est
                      mise à l&apos;enquête
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-artisan-yellow shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Permis de construire</p>
                    <p className="text-sm text-white/70">
                      Suivez les projets de construction dans vos communes
                      cibles
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-artisan-yellow shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">
                      Appels d&apos;offres publics
                    </p>
                    <p className="text-sm text-white/70">
                      Accédez aux marchés publics avant vos concurrents
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-artisan-yellow shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Alertes quotidiennes</p>
                    <p className="text-sm text-white/70">
                      Recevez un résumé chaque matin par email
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* CTA Card */}
            <div className="bg-white text-matte-black p-8 rounded-2xl border-2 border-matte-black shadow-xl">
              <div className="text-center mb-6">
                <p className="text-sm font-semibold text-deep-green mb-2">
                  À partir de
                </p>
                <p className="text-5xl font-bold mb-2">CHF 5.-</p>
                <p className="text-sm text-muted-foreground">par mois</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-deep-green rounded-full" />
                  <span>Basic : 5 communes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-deep-green rounded-full" />
                  <span>Premium : communes illimitées (CHF 10.-)</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full text-lg py-6 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black"
              >
                <Link href="/dashboard/veille">
                  <Bell className="mr-2 w-5 h-5" />
                  Activer la veille
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                ✓ Sans engagement · ✓ Résiliable à tout moment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - 2 parcours */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Forme grise décorative */}
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
              Deux parcours, une plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Parcours 1 : Chercher du travail */}
            <div className="bg-white p-8 rounded-2xl border-2 border-matte-black shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-8 h-8 text-artisan-yellow" />
                <h3 className="text-2xl font-bold">
                  Vous cherchez du{" "}
                  <span className="font-handdrawn text-3xl text-artisan-yellow">
                    travail
                  </span>{" "}
                  ?
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-artisan-yellow rounded-full flex items-center justify-center border-2 border-matte-black font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Parcourez les projets</h4>
                    <p className="text-sm text-muted-foreground">
                      Filtrez par métier, canton et budget. Trier selon les CFC
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-artisan-yellow rounded-full flex items-center justify-center border-2 border-matte-black font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Soumettez votre offre</h4>
                    <p className="text-sm text-muted-foreground">
                      Uniquement pour les projets qui vous intéressent vraiment.
                      Filtre qualité garanti.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-artisan-yellow rounded-full flex items-center justify-center border-2 border-matte-black font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Placer des alertes</h4>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications pour les nouveaux projets
                      correspondant à vos critères.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="w-full mt-8 bg-artisan-yellow hover:bg-artisan-yellow/90 text-matte-black font-bold border-2 border-matte-black"
              >
                <Link href="/tenders">
                  <Search className="mr-2 w-4 h-4" />
                  Trouver des projets
                </Link>
              </Button>
            </div>

            {/* Parcours 2 : Publier un projet */}
            <div className="bg-white p-8 rounded-2xl border-2 border-matte-black shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-8 h-8 text-deep-green" />
                <h3 className="text-2xl font-bold">
                  Vous avez un{" "}
                  <span className="font-handdrawn text-3xl text-deep-green">
                    projet
                  </span>{" "}
                  ?
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-deep-green text-white rounded-full flex items-center justify-center border-2 border-matte-black font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Publiez votre appel d&apos;offre
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Formulaire simple. Choisissez le mode anonyme pour plus
                      d&apos;équité.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-deep-green text-white rounded-full flex items-center justify-center border-2 border-matte-black font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Recevez des offres</h4>
                    <p className="text-sm text-muted-foreground">
                      Les professionnels soumettent leurs propositions. Comparez
                      facilement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-deep-green text-white rounded-full flex items-center justify-center border-2 border-matte-black font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Choisissez le meilleur</h4>
                    <p className="text-sm text-muted-foreground">
                      Évaluez objectivement. Révélez les identités après la
                      deadline.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full mt-8 border-2 border-matte-black font-bold hover:bg-sand-light"
              >
                <Link href="/dashboard/tenders">
                  <FileText className="mr-2 w-4 h-4" />
                  Publier un appel d&apos;offres
                </Link>
              </Button>
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
              Prêt à trouver votre{" "}
              <span className="relative inline-block font-handdrawn text-5xl md:text-7xl text-artisan-yellow">
                prochain projet
                <HandDrawnUnderline className="text-matte-black opacity-30" />
              </span>{" "}
              ?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-muted-foreground leading-relaxed">
              Rejoignez plus de 1&apos;200 professionnels qui font confiance à
              Publio pour développer leur activité.
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
