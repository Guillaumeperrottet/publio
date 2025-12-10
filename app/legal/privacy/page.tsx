import PublicLayout from "@/components/layout/public-layout";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Politique de Confidentialité
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : Décembre 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Publio accorde une grande importance à la protection de vos
              données personnelles. Cette politique de confidentialité vous
              informe sur la manière dont nous collectons, utilisons et
              protégeons vos informations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Données collectées
            </h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Données d&apos;identification :</strong> nom, prénom,
                email, numéro de téléphone
              </li>
              <li>
                <strong>Données de l&apos;organisation :</strong> nom de
                l&apos;entreprise/commune, adresse, SIRET
              </li>
              <li>
                <strong>Données de connexion :</strong> adresse IP, cookies,
                logs de navigation
              </li>
              <li>
                <strong>Données de paiement :</strong> gérées par Stripe (nous
                ne stockons pas les numéros de carte)
              </li>
              <li>
                <strong>Documents :</strong> fichiers uploadés dans le cadre des
                appels d&apos;offres
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Utilisation des données
            </h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Gérer votre compte et vous identifier</li>
              <li>Traiter vos appels d&apos;offres et vos soumissions</li>
              <li>Envoyer des notifications et alertes</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Partage des données
            </h2>
            <p>
              Vos données personnelles ne sont jamais vendues à des tiers. Elles
              peuvent être partagées avec :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Prestataires techniques :</strong> hébergement
                (Exoscale), paiement (Stripe), emails (Resend)
              </li>
              <li>
                <strong>Autorités compétentes :</strong> sur réquisition
                judiciaire
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et
              organisationnelles pour protéger vos données contre tout accès non
              autorisé, perte ou divulgation.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Connexions HTTPS sécurisées</li>
              <li>Chiffrement des mots de passe</li>
              <li>Hébergement en Suisse (conformité LPD)</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              6. Vos droits (RGPD / LPD)
            </h2>
            <p>
              Conformément à la législation suisse et européenne, vous disposez
              des droits suivants :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Droit d&apos;accès :</strong> consulter vos données
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger vos
                informations
              </li>
              <li>
                <strong>Droit à l&apos;effacement :</strong> supprimer votre
                compte
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> récupérer vos données
              </li>
              <li>
                <strong>Droit d&apos;opposition :</strong> refuser certains
                traitements
              </li>
            </ul>
            <p>
              Pour exercer vos droits, contactez-nous à :{" "}
              <strong>contact@publio.ch</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Vous
              pouvez gérer vos préférences dans les paramètres de votre
              navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Conservation des données
            </h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire aux
              finalités pour lesquelles elles ont été collectées, et
              conformément aux obligations légales (généralement 10 ans pour les
              documents comptables).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité
              :
            </p>
            <p className="font-semibold">
              Email : contact@publio.ch
              <br />
              Responsable de la protection des données : [Nom]
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
