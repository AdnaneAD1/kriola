'use client'

import { Calendar, Clock, FileText, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Alert } from '../../components/ui/Alert';
import Link from 'next/link';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  // Mock data pour simuler les données de l'API
  const stats = {
    upcomingAppointments: 3,
    totalTreatmentTime: 180,
    completedDiagnoses: 2,
    treatmentProgress: 45
  };

  const appointments = [
    {
      id: 1,
      title: "Traitement Anti-âge",
      date: "15 Avril 2025",
      time: "14:30",
      status: "confirmed",
      category: "alopecie"
    },
    {
      id: 2,
      title: "Lifting Non-chirurgical",
      date: "22 Avril 2025",
      time: "10:00",
      status: "pending",
      category: "blepharochalasis"
    }
  ];

  const diagnoses = [
    {
      date: "6 Avril 2025",
      type: "Type de peau : Mixte",
      result: "2 préoccupation(s) identifiée(s)"
    },
    {
      date: "1 Avril 2025",
      type: "Type de peau : Sèche",
      result: "3 préoccupation(s) identifiée(s)"
    }
  ];

  // Fonction pour traduire le statut en français
  const translateStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Fonction pour traduire la catégorie en français
  const translateCategory = (category) => {
    switch (category) {
      case 'alopecie':
        return 'Alopécie';
      case 'blepharochalasis':
        return 'Blépharochalasis';
      default:
        return 'Autre';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link href="/dashboard/appointments" className="btn-primary w-full md:w-auto">
          Nouveau rendez-vous
        </Link>
      </div>

      {success && (
        <Alert type="success">
          Votre diagnostic a été envoyé avec succès ! Nous vous contacterons bientôt avec nos recommandations.
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-500">Ce mois</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.upcomingAppointments}</h3>
          <p className="text-gray-600">Rendez-vous prévus</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.totalTreatmentTime} min</h3>
          <p className="text-gray-600">Temps de traitement</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.completedDiagnoses}</h3>
          <p className="text-gray-600">Diagnostics complétés</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-500">Progression</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.treatmentProgress}%</h3>
          <p className="text-gray-600">Traitements validés</p>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prochains rendez-vous</h2>
            <Link href="/dashboard/appointments" className="text-primary hover:text-primary/80">
              Voir tout
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.title}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} à {appointment.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {translateCategory(appointment.category)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {translateStatus(appointment.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnoses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Derniers diagnostics</h2>
            <Link href="/dashboard/diagnoses" className="text-primary hover:text-primary/80">
              Voir tout
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {diagnoses.map((diagnosis, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{diagnosis.type}</p>
                    <p className="text-sm text-gray-500">{diagnosis.date}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    {diagnosis.result}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
