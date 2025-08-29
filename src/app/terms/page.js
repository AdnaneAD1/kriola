export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Conditions d'utilisation</h1>

      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            Bienvenue sur PlasmaCare. En utilisant notre service, vous acceptez d'être lié par les présentes conditions d'utilisation. Veuillez les lire attentivement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Utilisation du Service</h2>
          <p className="text-gray-600 mb-4">
            Vous acceptez d'utiliser le service conformément à toutes les lois et réglementations applicables. Vous êtes responsable de maintenir la confidentialité de votre compte.
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Vous devez avoir au moins 18 ans pour utiliser ce service</li>
            <li>Vous êtes responsable de toutes les activités qui se produisent sous votre compte</li>
            <li>Vous acceptez de ne pas utiliser le service à des fins illégales</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Contenu Médical</h2>
          <p className="text-gray-600 mb-4">
            Le contenu fourni sur PlasmaCare est uniquement à titre informatif et ne constitue pas un avis médical professionnel. Consultez toujours un professionnel de santé qualifié pour des conseils médicaux.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Confidentialité</h2>
          <p className="text-gray-600 mb-4">
            Votre utilisation de notre service est également régie par notre politique de confidentialité. Nous nous engageons à protéger vos informations personnelles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Modifications du Service</h2>
          <p className="text-gray-600 mb-4">
            Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment, avec ou sans préavis. Nous ne serons pas responsables envers vous ou un tiers pour toute modification ou interruption.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Résiliation</h2>
          <p className="text-gray-600 mb-4">
            Nous pouvons résilier ou suspendre votre accès au service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p className="text-gray-600">
            Si vous avez des questions concernant ces conditions, veuillez nous contacter à :
            <br />
            <a href="mailto:contact@plasmacare.com" className="text-primary hover:text-primary/80">
              contact@plasmacare.com
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
