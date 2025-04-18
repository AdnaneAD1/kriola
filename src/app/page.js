'use client'

import { Sparkles, Leaf, Shield, Clock, Star, ArrowRight, Play, ChevronRight, Award, Users, Zap } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';
import Link from 'next/link';

export default function Home() {
  return (
    <PublicLayout>
      <main className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[url('')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/80 to-white/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8 hover:bg-primary/20 transition-all cursor-pointer group animate-fade-in">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Découvrez la révolution des soins de la peau</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Transformez Votre Peau avec
              <span className="gradient-text block mt-2">KriolaCare</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in delay-100">
              Expérimentez des traitements personnalisés avec notre technologie plasma avancée.
              Votre voyage vers une peau radieuse et saine commence ici.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in delay-200">
              <Link href="/dashboard" className="btn-primary group">
                Réserver une Consultation
                <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Hero Image Section */}
            <div className="relative mx-auto max-w-5xl animate-fade-in delay-300">
              {/* Main Image with Gradient Overlay */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10"></div>
                <img 
                  src="https://studiokanea.fr/wp-content/uploads/2024/10/DALL%C2%B7E-2024-10-25-09.50.52-An-extreme-close-up-of-a-beauty-salon-facial-treatment-using-Russian-cold-plasma-therapy-on-a-client.-The-camera-angle-is-at-a-45-degree-angle-from-th-copie.jpg"
                  alt="Traitement KriolaCare"
                  className="w-full transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-32">
              <div className="feature-card group">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Soins Personnalisés</h3>
                <p className="text-gray-600 mb-6">
                  Plans de traitement sur mesure adaptés à vos besoins uniques et à vos objectifs cutanés.
                </p>
              </div>
              
              <div className="feature-card group">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Technologie Avancée</h3>
                <p className="text-gray-600 mb-6">
                  Thérapie plasma froid de pointe pour des résultats optimaux et une peau éclatante.
                </p>
              </div>
              
              <div className="feature-card group">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Accompagnement Expert</h3>
                <p className="text-gray-600 mb-6">
                  Support professionnel tout au long de votre parcours de soins de la peau.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
