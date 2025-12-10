import PublicLayout from "@/components/layout/public-layout";

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Conditions Générales d&apos;Utilisation
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : Décembre 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (ci-après «
              CGU ») régissent l&apos;accès et l&apos;utilisation de la
              plateforme Publio, accessible à l&apos;adresse [URL], ainsi que
              les services proposés par Publio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Acceptation des CGU
            </h2>
            <p>
              L&apos;utilisation de la plateforme Publio implique
              l&apos;acceptation pleine et entière des présentes CGU. Si vous
              n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos
              services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Services proposés
            </h2>
            <p>Publio est une plateforme permettant de :</p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                Publier des appels d&apos;offres (communes, entreprises,
                particuliers)
              </li>
              <li>Consulter et soumettre des offres</li>
              <li>Gérer les processus d&apos;attribution de marchés</li>
              <li>Sauvegarder des recherches et recevoir des alertes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Inscription et compte utilisateur
            </h2>
            <p>
              L&apos;accès à certaines fonctionnalités nécessite la création
              d&apos;un compte. Vous vous engagez à fournir des informations
              exactes et à maintenir la confidentialité de vos identifiants.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Tarification</h2>
            <p>Les tarifs applicables sont les suivants :</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Publication d&apos;un appel d&apos;offres : CHF 10.-</li>
              <li>Soumission d&apos;une offre : CHF 10.-</li>
              <li>Module de veille (optionnel) : CHF 5-10.- / mois</li>
            </ul>
            <p>
              Les paiements sont sécurisés via Stripe. Aucun remboursement
              n&apos;est possible une fois le service activé.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Responsabilités</h2>
            <p>
              Publio met tout en œuvre pour assurer la disponibilité et la
              sécurité de la plateforme. Toutefois, nous ne pouvons garantir une
              disponibilité ininterrompue et déclinons toute responsabilité en
              cas d&apos;interruption de service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Propriété intellectuelle
            </h2>
            <p>
              Tous les éléments de la plateforme (textes, graphismes, logiciels,
              etc.) sont la propriété exclusive de Publio et sont protégés par
              les lois sur la propriété intellectuelle.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Droit applicable et juridiction
            </h2>
            <p>
              Les présentes CGU sont régies par le droit suisse. Tout litige
              sera soumis aux tribunaux compétents de Suisse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGU, vous pouvez nous
              contacter à :
            </p>
            <p className="font-semibold">Email : contact@publio.ch</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
