export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>

      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            Chez PlasmaCare, nous prenons très au sérieux la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Collecte des Données</h2>
          <p className="text-gray-600 mb-4">
            Nous collectons les informations que vous nous fournissez directement :
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Informations d'identification (nom, prénom, date de naissance)</li>
            <li>Coordonnées (email, numéro de téléphone, adresse)</li>
            <li>Informations médicales pertinentes</li>
            <li>Historique des rendez-vous et des traitements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Utilisation des Données</h2>
          <p className="text-gray-600 mb-4">
            Nous utilisons vos informations pour :
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Fournir et améliorer nos services</li>
            <li>Communiquer avec vous concernant vos rendez-vous</li>
            <li>Personnaliser votre expérience</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Protection des Données</h2>
          <p className="text-gray-600 mb-4">
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès, modification, divulgation ou destruction non autorisé.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Partage des Données</h2>
          <p className="text-gray-600 mb-4">
            Nous ne vendons pas vos informations personnelles. Nous ne partageons vos données qu'avec :
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Les professionnels de santé impliqués dans votre traitement</li>
            <li>Nos prestataires de services sous stricte confidentialité</li>
            <li>Les autorités lorsque la loi l'exige</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Vos Droits</h2>
          <p className="text-gray-600 mb-4">
            Vous avez le droit de :
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Accéder à vos données personnelles</li>
            <li>Rectifier vos données</li>
            <li>Supprimer vos données</li>
            <li>Limiter le traitement de vos données</li>
            <li>Vous opposer au traitement de vos données</li>
            <li>Obtenir une copie de vos données</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
          <p className="text-gray-600 mb-4">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p className="text-gray-600">
            Pour toute question concernant notre politique de confidentialité, contactez-nous à :
            <br />
            <a href="mailto:privacy@plasmacare.com" className="text-primary hover:text-primary/80">
              privacy@plasmacare.com
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12 text-sm text-gray-500">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}
