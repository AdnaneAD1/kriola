import { Sparkles, Leaf, Shield, Clock, Star, ArrowRight, Play, ChevronRight, Award, Users, Zap } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';
import Link from 'next/link';

export default function Home() {
  return (
    <PublicLayout>
      <main className="relative overflow-hidden bg-primary/10">
        {/* Background Elements - Plus moderne avec des formes abstraites */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full filter blur-3xl opacity-15 translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/70 to-white"></div>
        </div>

        {/* Hero Section - Plus épurée et moderne */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content - Meilleure hiérarchie visuelle */}
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary/20 transition-all cursor-pointer group">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Votre soin ne s'arrête pas à la clinique. Suivez-le ici.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                  KriolaCare: {' '}
                </span>
                Votre Journal de Beauté Connecté
              </h1>

              <p className="text-lg text-gray-600">
                KriolaCare vous accompagne à chaque étape de votre soin plasma. Historique, recommandations, résultats : tout est à portée de main.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/dashboard"
                  className="btn-primary group flex items-center justify-center px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Suivre mon Traitement
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/about"
                  className="flex items-center justify-center px-8 py-3 rounded-lg font-medium border border-gray-300 hover:border-primary transition-all duration-300"
                >
                  <Play className="w-4 h-4 mr-2 text-primary" />
                  Voir la démo
                </Link>
              </div>

              {/* Trust badges - Nouvel élément */}
              <div className="flex flex-wrap items-center gap-4 pt-8">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>+45 clients satisfaits</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Award className="w-4 h-4" />
                  <span>Certifié dermatologique</span>
                </div>
              </div>
            </div>

            {/* Image - Redimensionnée et mieux intégrée */}
            <div className="lg:w-1/2 relative mt-10 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent z-10"></div>
                <img
                  src="https://studiokanea.fr/wp-content/uploads/2024/10/DALL%C2%B7E-2024-10-25-09.50.52-An-extreme-close-up-of-a-beauty-salon-facial-treatment-using-Russian-cold-plasma-therapy-on-a-client.-The-camera-angle-is-at-a-45-degree-angle-from-th-copie.jpg"
                  alt="Traitement KriolaCare"
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                />
              </div>

              {/* Floating card - Nouvel élément design */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Résultats visibles</p>
                    <p className="text-sm text-gray-500">en 3 séances</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Design plus sophistiqué */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Une approche <span className="text-primary">révolutionnaire</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Notre méthode combine technologie de pointe et expertise dermatologique pour des résultats inégalés.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="w-6 h-6 text-primary" />,
                  title: "Soins Personnalisés",
                  description: "Plans de traitement sur mesure adaptés à vos besoins uniques et à vos objectifs cutanés."
                },
                {
                  icon: <Zap className="w-6 h-6 text-primary" />,
                  title: "Technologie Avancée",
                  description: "Thérapie plasma froid de pointe pour des résultats optimaux et une peau éclatante."
                },
                {
                  icon: <Users className="w-6 h-6 text-primary" />,
                  title: "Accompagnement Expert",
                  description: "Support professionnel tout au long de votre parcours de soins de la peau."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>
    </PublicLayout>
  );
}