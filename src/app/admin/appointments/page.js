'use client'

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, User } from 'lucide-react';
import { AdminAppointmentForm } from '../../../components/forms/AdminAppointmentForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useAppointments } from '@/hooks/useAppointments';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminAppointments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const { appointments, isLoading, error, deleteAppointment, updateAppointmentStatus, refreshAppointments } = useAppointments();

  // Filtres et tri
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | confirmed | cancelled
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = du plus récent au plus ancien
  const [dateFrom, setDateFrom] = useState(''); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState('');   // YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Reset page when filters or underlying list change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortOrder, dateFrom, dateTo, appointments?.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement des rendez-vous...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Normalise date+heure d'un rendez-vous vers un objet Date utilisable pour tri et filtre
  const toJsDate = (appointment) => {
    try {
      let base;
      const d = appointment?.date;
      if (!d) return null;
      if (d instanceof Date) {
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

  // Pagination derived values
  const totalItems = displayedAppointments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedAppointments = displayedAppointments.slice(startIndex, startIndex + pageSize);

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleDelete = async (appointmentId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await deleteAppointment(appointmentId);
        await refreshAppointments();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Une erreur est survenue lors de la suppression du rendez-vous.');
      }
    }
  };

  const handleCancel = async (appointmentId) => {
    if (confirm('Voulez-vous annuler ce rendez-vous ?')) {
      try {
        await updateAppointmentStatus(appointmentId, 'cancelled');
        await refreshAppointments();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Une erreur est survenue lors de l\'annulation du rendez-vous.');
      }
    }
  };
  
  // Fonction pour formater la date correctement
  const formatAppointmentDate = (dateString) => {
    try {
      // Si la date est au format ISO complet (2025-05-23T00:00:00.000000Z)
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy', { locale: fr });
      }
      // Si la date est un objet Date
      else if (dateString instanceof Date) {
        return format(dateString, 'dd MMMM yyyy', { locale: fr });
      }
      // Si la date est au format YYYY-MM-DD
      else if (typeof dateString === 'string' && dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          return format(date, 'dd MMMM yyyy', { locale: fr });
        }
      }
      // Si aucun format reconnu, utiliser toLocaleDateString comme fallback
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, dateString);
      // En cas d'erreur, retourner la chaîne telle quelle
      return dateString;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-primary whitespace-nowrap">Gestion des rendez-vous</h1>
        <div className="w-full md:w-auto">
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">Tous</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tri par date</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input"
            >
              <option value="desc">Du plus récent au plus ancien</option>
              <option value="asc">Du plus ancien au plus récent</option>
            </select>
          </div>
        </div>
      </div>

      {displayedAppointments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="grid divide-y">
            {paginatedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setDetailsOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatAppointmentDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {appointment.user?.name || 'Utilisateur inconnu'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">{appointment.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {appointment.status === 'confirmed' ? 'Confirmé' : appointment.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        items={[
                          {
                            label: 'Modifier',
                            onClick: () => handleEdit(appointment)
                          },
                          {
                            label: 'Annuler le rendez-vous',
                            onClick: () => handleCancel(appointment.id),
                            destructive: true
                          },
                          {
                            label: 'Supprimer',
                            onClick: () => handleDelete(appointment.id),
                            destructive: true
                          }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">Page {safePage} sur {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="Aucun rendez-vous"
          description="Il n'y a actuellement aucun rendez-vous dans le système. Vous pouvez créer un nouveau rendez-vous en cliquant sur le bouton ci-dessous."
          actionLabel="Nouveau rendez-vous"
          onAction={() => {
            setEditingAppointment(null);
            setIsFormOpen(true);
          }}
        />
      )}

      <AdminAppointmentForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAppointment(null);
        }}
        appointment={editingAppointment}
      />

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
              <span>{selectedAppointment.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{selectedAppointment.user?.name || 'Utilisateur inconnu'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${selectedAppointment.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : selectedAppointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }
              `}>
                {selectedAppointment.status === 'confirmed' ? 'Confirmé' : selectedAppointment.status === 'pending' ? 'En attente' : 'Annulé'}
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
