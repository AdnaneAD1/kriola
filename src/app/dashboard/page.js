'use client'

import { Calendar, Clock, FileText, TrendingUp, Package } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Alert } from '../../components/ui/Alert';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, startOfDay } from 'date-fns';
import { useUsers } from '@/hooks/useUsers';
import { usePrograms } from '@/hooks/usePrograms';
import { useDiagnoses } from '@/hooks/useDiagnoses';
import { useAppointments } from '@/hooks/useAppointments';
import { LoadingPage } from '@/components/ui/LoadingSpinner';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const { currentUser } = useUsers();
  const { programs, subscribeToPrograms, loading: programsLoading, error: programsError } = usePrograms();
  const { diagnoses, subscribeToDiagnoses, loading: diagnosesLoading, error: diagnosesError } = useDiagnoses();
  const { appointments, isLoading: appointmentsLoading, error: appointmentsError } = useAppointments(currentUser?.id);

  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalTreatmentTime: 0,
    completedDiagnoses: 0,
    treatmentProgress: 0
  });

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubs = [];
    // Realtime programs and diagnoses for this user
    unsubs.push(subscribeToPrograms({ userId: currentUser.id, orderBy: 'startDate', orderDirection: 'desc' }));
    unsubs.push(subscribeToDiagnoses({ userId: currentUser.id }));
    return () => {
      unsubs.forEach((u) => typeof u === 'function' && u());
    };
  }, [currentUser?.id, subscribeToPrograms, subscribeToDiagnoses]);

  useEffect(() => {
    if (!appointments || !diagnoses) return;

    const now = new Date();
    const monthStart = startOfDay(now);
    const monthEnd = endOfMonth(now);

    // Rendez-vous confirmés ce mois (inclus toute la journée d'aujourd'hui)
    const upcomingAppointments = (appointments || []).filter(a => {
      const raw = a?.date;
      let d = null;
      if (raw instanceof Date) {
        d = raw;
      } else if (typeof raw === 'string') {
        // Traiter 'YYYY-MM-DD' comme date locale (évite le décalage UTC)
        d = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw);
      } else if (raw) {
        d = new Date(raw);
      }
      if (!d) return false;
      const day = startOfDay(d);
      return day >= monthStart && day <= monthEnd && a.status === 'confirmed';
    }).length;

    // Temps total de traitement (minutes) sur rendez-vous complétés
    const totalTreatmentTime = (appointments || [])
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => {
        const d = typeof a.duration === 'number' ? a.duration : a.treatment?.duration || 0;
        return sum + (Number.isFinite(d) ? d : 0);
      }, 0);

    // Progression (%) = complétés / total (même logique que backend)
    const completedAppointments = (appointments || []).filter(a => a.status === 'completed').length;
    const totalAppointments = (appointments || []).length;
    const treatmentProgress = totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0;

    setStats({
      upcomingAppointments,
      totalTreatmentTime,
      completedDiagnoses: (diagnoses || []).length,
      treatmentProgress,
    });
  }, [appointments, diagnoses]);

  // Compute stats when data changes
  // useEffect(() => {
  //   const now = new Date();
  //   const upcoming = (appointments || []).filter(a => {
  //     const d = a?.date instanceof Date ? a.date : (a?.date ? new Date(a.date) : null);
  //     return d && d >= now;
  //   }).length;

  //   const allTreatments = (programs || []).flatMap(p => Array.isArray(p.treatments) ? p.treatments : []);
  //   const totalDuration = allTreatments.reduce((sum, t) => sum + (t?.duration || 0), 0);
  //   const completedTreatments = allTreatments.filter(t => t?.completed).length;
  //   const treatmentProgress = allTreatments.length > 0
  //     ? Math.round((completedTreatments / allTreatments.length) * 100)
  //     : 0;

  //   // Frontend: total diagnostics for the user (soft-deleted are already excluded by the hook)
  //   const completedDiag = (diagnoses || []).length;

  //   setStats({
  //     upcomingAppointments: upcoming,
  //     totalTreatmentTime: totalDuration,
  //     completedDiagnoses: completedDiag,
  //     treatmentProgress,
  //   });
  // }, [appointments, programs, diagnoses]);

  // Fonction pour traduire le statut en français
  const translateStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return 'Autre';
    }
  };

  const anyError = appointmentsError || programsError || diagnosesError;
  const isLoading = programsLoading || diagnosesLoading || appointmentsLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

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

      {anyError && (
        <Alert type="error">
          {anyError}
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
          <p className="text-gray-600">Diagnostics</p>
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

      {/* Programs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mes programmes</h2>
            <Link href="/dashboard/programs" className="text-primary hover:text-primary/80">
              Voir tout
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {programs?.map((program) => (
            <div key={program.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{program.title || program.name}</p>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(program.treatments) ? program.treatments.length : (program.treatments_count || 0)} traitement{(Array.isArray(program.treatments) ? program.treatments.length : (program.treatments_count || 0)) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  program.status === 'en cours' || program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {program.status}
                </span>
              </div>
            </div>
          ))}
          {programs?.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Aucun programme actif
            </div>
          )}
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
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun rendez-vous prévu
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.title || appointment.type || 'Rendez-vous'}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.date ? new Date(appointment.date).toLocaleString('fr-FR') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {translateStatus(appointment.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Diagnoses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Derniers diagnostics</h2>
            <Link href="/dashboard/diagnosis" className="text-primary hover:text-primary/80">
              Voir tout
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {diagnoses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun diagnostic disponible
            </div>
          ) : (
            diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{diagnosis.type || 'Diagnostic'}</p>
                      <p className="text-sm text-gray-500">{diagnosis.date ? new Date(diagnosis.date).toLocaleDateString('fr-FR') : ''}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      {diagnosis.result || diagnosis.status || ''}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
