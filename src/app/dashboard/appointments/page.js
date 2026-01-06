'use client'

import { Calendar, Clock, RefreshCw, Check, Clock4, X, Plus, CreditCard } from 'lucide-react';
import Script from 'next/script';
import { useAppointments } from '../../../hooks/useAppointments';
import { useState, useEffect } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import AppointmentBookingForm from '@/components/forms/AppointmentBookingForm';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUsers } from '@/hooks/useUsers';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingPage } from '@/components/ui/LoadingSpinner';

export default function Appointments() {
  const { currentUser } = useUsers();
  const { appointments, isLoading, error, updateAppointmentStatus } = useAppointments(currentUser?.id);
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Filtres et tri
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | confirmed | cancelled
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = du plus récent au plus ancien
  const [dateFrom, setDateFrom] = useState(''); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState('');   // YYYY-MM-DD

  useEffect(() => {
    if (window.Calendly && showCalendly) {
      setIsCalendlyLoaded(true);
      initCalendly();
    }
  }, [showCalendly]);

  const initCalendly = () => {
    if (window.Calendly) {
      const container = document.querySelector('.calendly-container');
      if (container) {
        container.innerHTML = '';
      }
      
      window.Calendly.initInlineWidget({
        url: 'https://calendly.com/sidiamadouadnane4?hide_landing_page_details=1&hide_gdpr_banner=1&primary_color=f6a667',
        parentElement: container,
        prefill: {},
        utm: {}
      });
    }
  };

  const handleCalendlyLoad = () => {
    setIsCalendlyLoaded(true);
    if (showCalendly) {
      initCalendly();
    }
  };

  const reloadCalendly = () => {
    initCalendly();
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateAppointmentStatus(id, newStatus);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
  
  // Formater la date pour l'affichage (accepte Date, Timestamp-like, ou string)
  const formatAppointmentDate = (value) => {
    try {
      // Firestore Timestamp
      if (value && typeof value === 'object' && typeof value.toDate === 'function') {
        const d = value.toDate();
        return format(d, 'dd MMMM yyyy', { locale: fr });
      }
      // JS Date
      if (value instanceof Date) {
        return format(value, 'dd MMMM yyyy', { locale: fr });
      }
      const dateString = String(value ?? '');
      if (!dateString) return '';
      // ISO
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy', { locale: fr });
      }
      // YYYY-MM-DD
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          return format(date, 'dd MMMM yyyy', { locale: fr });
        }
      }
      return dateString;
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return String(value ?? '');
    }
  };

  // Formater l'heure pour l'affichage (accepte Date, Timestamp-like, ou string)
  const formatAppointmentTime = (value) => {
    try {
      if (value && typeof value === 'object' && typeof value.toDate === 'function') {
        const d = value.toDate();
        return format(d, 'HH:mm', { locale: fr });
      }
      if (value instanceof Date) {
        return format(value, 'HH:mm', { locale: fr });
      }
      const s = String(value ?? '');
      return s;
    } catch (error) {
      console.error('Erreur lors du formatage de l\'heure:', error);
      return String(value ?? '');
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Normalise date+heure d'un rendez-vous vers un objet Date utilisable pour tri et filtre
  const toJsDate = (appointment) => {
    try {
      let base;
      const d = appointment?.date;
      if (!d) return null;
      // Firestore Timestamp-like
      if (d && typeof d === 'object' && typeof d.toDate === 'function') {
        base = d.toDate();
      } else if (d instanceof Date) {
        base = new Date(d);
      } else if (typeof d === 'string' && d.includes('T')) {
        base = new Date(d);
      } else if (typeof d === 'string' && d.includes('-')) {
        const [y, m, day] = d.split('-').map((v) => parseInt(v, 10));
        base = new Date(y, (m || 1) - 1, day || 1);
      } else {
        base = new Date(d);
      }
      // Applique l'heure si disponible (HH:mm)
      if (appointment?.time && typeof appointment.time === 'string' && appointment.time.includes(':')) {
        const [hh, mm] = appointment.time.split(':').map((v) => parseInt(v, 10));
        if (!Number.isNaN(hh)) base.setHours(hh);
        if (!Number.isNaN(mm)) base.setMinutes(mm);
        base.setSeconds(0, 0);
      }
      return base;
    } catch {
      return null;
    }
  };

  // Applique filtres et tri
  const displayedAppointments = (appointments || [])
    .filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      const dt = toJsDate(a);
      if (!dt) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (dt < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (dt > to) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const da = toJsDate(a)?.getTime() || 0;
      const db = toJsDate(b)?.getTime() || 0;
      return sortOrder === 'desc' ? db - da : da - db;
    });

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <h1 className="text-2xl font-bold">Mes rendez-vous</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl font-semibold">Prendre un rendez-vous</h2>
            <div className="flex gap-2">
              {showCalendly && isCalendlyLoaded && (
                <button
                  onClick={reloadCalendly}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Recharger le calendrier</span>
                  <span className="sm:hidden">Recharger</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {!showCalendly ? (
          <div className="p-8 sm:p-16 flex flex-col items-center justify-center bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={() => setShowCalendly(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                <Calendar className="w-5 h-5" />
                <span className="hidden sm:inline">Calendrier Calendly</span>
                <span className="sm:hidden">Calendly</span>
              </button>
              
              <button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                <CreditCard className="w-5 h-5" />
                <span className="hidden sm:inline">Réserver avec paiement</span>
                <span className="sm:hidden">Réserver</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Choisissez votre méthode de réservation préférée
            </p>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: '700px' }}>
            <div className="calendly-container absolute inset-0" />
            {!isCalendlyLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-sm text-gray-600">Chargement du calendrier...</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {showCalendly && (
          <Script
            src="https://assets.calendly.com/assets/external/widget.js"
            strategy="lazyOnload"
            async
            onLoad={handleCalendlyLoad}
          />
        )}
        
        {/* Formulaire de réservation avec paiement */}
        {showBookingForm && (
          <AppointmentBookingForm 
            onClose={() => setShowBookingForm(false)} 
            existingAppointments={appointments}
          />
        )}
      </div>

      {/* Filtres et tri */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">Tous</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input w-full min-w-0"
              style={{ minWidth: '140px', maxWidth: '100%' }}
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input w-full min-w-0"
              style={{ minWidth: '140px', maxWidth: '100%' }}
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Tri par date</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input w-full"
            >
              <option value="desc">Du plus récent au plus ancien</option>
              <option value="asc">Du plus ancien au plus récent</option>
            </select>
          </div>
        </div>
      </div>

      {displayedAppointments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold p-6 border-b">Rendez-vous prévus</h2>
          <div className="grid divide-y">
            {displayedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setDetailsOpen(true);
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Colonne 1: Date et Heure */}
                  <div className="flex items-start gap-4 lg:min-w-[240px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-base font-medium">{formatAppointmentDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-8">
                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-base text-gray-600">{formatAppointmentTime(appointment.time)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Colonne 2: Traitement */}
                  <div className="flex-1 lg:min-w-[200px]">
                    <h3 className="font-semibold text-base text-gray-900">{appointment.title}</h3>
                    {appointment.duration && (
                      <p className="text-sm text-gray-500 mt-1">{appointment.duration} min</p>
                    )}
                  </div>

                  {/* Colonne 3: Statut et Actions */}
                  <div className="flex items-center gap-4 lg:min-w-[280px] lg:justify-end" onClick={(e) => e.stopPropagation()}>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(appointment.status)} whitespace-nowrap`}>
                      {translateStatus(appointment.status)}
                    </span>
                    {appointment.status !== 'confirmed' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          disabled={updatingId === appointment.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Confirmer"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        {appointment.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'pending')}
                            disabled={updatingId === appointment.id}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Mettre en attente"
                          >
                            <Clock4 className="w-5 h-5" />
                          </button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            disabled={updatingId === appointment.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="Aucun rendez-vous"
          description="Vous n'avez pas encore de rendez-vous prévu. Cliquez sur le bouton ci-dessous pour ouvrir le calendrier et prendre un rendez-vous."
          actionLabel="Prendre un rendez-vous"
          onAction={() => setShowCalendly(true)}
        />
      )}

      {/* Modal détails rendez-vous */}
      <Dialog
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selectedAppointment ? selectedAppointment.title || 'Détails du rendez-vous' : 'Détails du rendez-vous'}
      >
        {selectedAppointment && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatAppointmentDate(selectedAppointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatAppointmentTime(selectedAppointment.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                {translateStatus(selectedAppointment.status)}
              </span>
            </div>
            {selectedAppointment.duration ? (
              <div className="text-gray-700">Durée: {selectedAppointment.duration} min</div>
            ) : null}
            {typeof selectedAppointment.total_price !== 'undefined' ? (
              <div className="text-gray-700">Prix total: {Number(selectedAppointment.total_price).toFixed(2)} €</div>
            ) : null}
            {selectedAppointment.notes ? (
              <div>
                <div className="text-gray-500">Notes</div>
                <div className="mt-1 whitespace-pre-wrap">{selectedAppointment.notes}</div>
              </div>
            ) : null}
          </div>
        )}
      </Dialog>
    </div>
  );
}
