'use client'

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, User, List, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminAppointmentForm } from '../../../components/forms/AdminAppointmentForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useAppointments } from '@/hooks/useAppointments';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
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
  const pageSize = 4;
  
  // Vue calendrier
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDetailsOpen, setCalendarDetailsOpen] = useState(false);
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] = useState(null);
  
  // Modal liste des RDV du jour
  const [dayAppointmentsOpen, setDayAppointmentsOpen] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

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
  
  // Fonctions pour le calendrier
  const getAppointmentsForDate = (date) => {
    return (appointments || []).filter(appointment => {
      const appointmentDate = toJsDate(appointment);
      return appointmentDate && isSameDay(appointmentDate, date);
    });
  };
  
  const generateCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };
  
  const handleAppointmentClick = (appointment) => {
    setSelectedCalendarAppointment(appointment);
    setCalendarDetailsOpen(true);
  };
  
  const handleDayClick = (date, dayAppointments) => {
    if (dayAppointments.length >= 2) {
      // Trier les RDV par heure
      const sortedAppointments = [...dayAppointments].sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
      
      setSelectedDate(date);
      setSelectedDayAppointments(sortedAppointments);
      setDayAppointmentsOpen(true);
    }
  };
  
  const handleDayCellClick = (date, dayAppointments, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dayAppointments.length >= 2) {
      handleDayClick(date, dayAppointments);
    }
  };

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
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Gestion des rendez-vous</h1>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Basculement vue liste/calendrier */}
            <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial ${
                  viewMode === 'calendar'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Calendrier</span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsFormOpen(true);
              }}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau rendez-vous</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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

      {viewMode === 'calendar' ? (
        /* Vue Calendrier */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header du calendrier */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Grille du calendrier */}
          <div className="p-2 sm:p-4">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-600">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}</span>
                </div>
              ))}
            </div>
            
            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map(day => {
                const dayAppointments = getAppointmentsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-100 rounded-md ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${
                      isToday ? 'ring-2 ring-primary ring-opacity-50 bg-primary/5' : ''
                    } ${
                      dayAppointments.length >= 2 ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200' : ''
                    }`}
                    onClick={(e) => dayAppointments.length >= 2 ? handleDayCellClick(day, dayAppointments, e) : null}
                  >
                    <div className={`text-xs sm:text-sm font-medium mb-1 text-center sm:text-left ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${
                      isToday ? 'text-primary font-bold' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Rendez-vous du jour */}
                    <div className="space-y-1">
                      {dayAppointments.length >= 2 ? (
                        // Si 2 RDV ou plus, afficher seulement le premier + indicateur
                        <>
                          <div
                            key={dayAppointments[0].id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(dayAppointments[0]);
                            }}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                              dayAppointments[0].status === 'confirmed'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : dayAppointments[0].status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            <div className="font-medium truncate">
                              <span className="hidden sm:inline">{dayAppointments[0].time} - </span>
                              {dayAppointments[0].title}
                            </div>
                            <div className="truncate opacity-75 hidden sm:block">
                              {dayAppointments[0].user?.name || 'Utilisateur inconnu'}
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 text-center py-1 font-medium">
                            Cliquer pour voir tous ({dayAppointments.length})
                          </div>
                        </>
                      ) : (
                        // Si 1 RDV seulement, affichage normal
                        dayAppointments.map(appointment => (
                          <div
                            key={appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(appointment);
                            }}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : appointment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            <div className="font-medium truncate">
                              <span className="hidden sm:inline">{appointment.time} - </span>
                              {appointment.title}
                            </div>
                            <div className="truncate opacity-75 hidden sm:block">
                              {appointment.user?.name || 'Utilisateur inconnu'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : displayedAppointments.length > 0 ? (
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
      
      {/* Modal détails calendrier */}
      <Dialog
        isOpen={calendarDetailsOpen}
        onClose={() => setCalendarDetailsOpen(false)}
        title={selectedCalendarAppointment ? selectedCalendarAppointment.title || 'Détails du rendez-vous' : 'Détails du rendez-vous'}
      >
        {selectedCalendarAppointment && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatAppointmentDate(selectedCalendarAppointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{selectedCalendarAppointment.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{selectedCalendarAppointment.user?.name || 'Utilisateur inconnu'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${selectedCalendarAppointment.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : selectedCalendarAppointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }
              `}>
                {selectedCalendarAppointment.status === 'confirmed' ? 'Confirmé' : selectedCalendarAppointment.status === 'pending' ? 'En attente' : 'Annulé'}
              </span>
            </div>
            {selectedCalendarAppointment.duration ? (
              <div className="text-gray-700">Durée: {selectedCalendarAppointment.duration} min</div>
            ) : null}
            {typeof selectedCalendarAppointment.total_price !== 'undefined' ? (
              <div className="text-gray-700">Prix total: {Number(selectedCalendarAppointment.total_price).toFixed(2)} €</div>
            ) : null}
            {selectedCalendarAppointment.notes ? (
              <div>
                <div className="text-gray-500">Notes</div>
                <div className="mt-1 whitespace-pre-wrap">{selectedCalendarAppointment.notes}</div>
              </div>
            ) : null}
            
            {/* Actions rapides */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setCalendarDetailsOpen(false);
                  handleEdit(selectedCalendarAppointment);
                }}
                className="btn-secondary flex-1"
              >
                Modifier
              </button>
              <button
                onClick={() => {
                  setCalendarDetailsOpen(false);
                  handleCancel(selectedCalendarAppointment.id);
                }}
                className="btn-secondary flex-1 text-red-600 hover:bg-red-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Dialog>
      
      {/* Modal liste des RDV du jour */}
      <Dialog
        isOpen={dayAppointmentsOpen}
        onClose={() => setDayAppointmentsOpen(false)}
        title={selectedDate ? `Rendez-vous du ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}` : 'Rendez-vous du jour'}
      >
        <div className="space-y-3">
          {selectedDayAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                setDayAppointmentsOpen(false);
                handleAppointmentClick(appointment);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{appointment.time}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmé' : appointment.status === 'pending' ? 'En attente' : 'Annulé'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{appointment.user?.name || 'Utilisateur inconnu'}</span>
                </div>
                
                {appointment.duration && (
                  <div className="text-sm text-gray-600">
                    Durée: {appointment.duration} min
                  </div>
                )}
                
                {appointment.notes && (
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Notes:</span> {appointment.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {selectedDayAppointments.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Aucun rendez-vous pour cette journée
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setDayAppointmentsOpen(false)}
              className="w-full btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
