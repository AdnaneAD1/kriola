'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, User, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { useUsers } from '@/hooks/useUsers';
import { useTreatments } from '@/hooks/useTreatments';
import { useReservation } from '@/hooks/useReservation';
import { sendEmail } from '@/lib/emailService';

export function AdminAppointmentForm({ isOpen, onClose, appointment = null }) {
  const [users, setUsers] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    status: 'pending',
    notes: ''
  });
  // Nouveau: états pour le design en étapes
  const [step, setStep] = useState(1); // 1: Client, 2: Traitements, 3: Date & heure
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [error, setError] = useState('');

  const { createAppointment, updateAppointment, refreshAppointments } = useAppointments();
  const { getClients, getUserById } = useUsers();
  const { getTreatments } = useTreatments();
  const {
    getAvailableTimeSlots,
    isLoadingSlots,
    slotsError,
    totalDuration
  } = useReservation();

  useEffect(() => {
    setIsLoading(true);
    const fetchUsers = async () => {
      try {
        // Charger uniquement les clients (exclure les admins)
        const list = await getClients();
        setUsers(list || []);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      }
    };

    const fetchTreatments = async () => {
      try {
        const list = await getTreatments({ isActive: true, orderBy: 'name', orderDirection: 'asc' });
        setTreatments(list || []);
      } catch (error) {
        console.error('Erreur lors du chargement des traitements:', error);
      }
    };

    Promise.all([fetchUsers(), fetchTreatments()]).finally(() => setIsLoading(false));
  }, [getClients, getTreatments]);

  useEffect(() => {
    if (appointment) {
      try {
        // Si on modifie un rendez-vous existant
        setFormData({
          userId: appointment.user?.id || appointment.userId || '',
          status: appointment.status || 'pending',
          notes: appointment.notes || ''
        });
        // Pré-remplir la sélection (design)
        if (Array.isArray(appointment.treatment_ids) && appointment.treatment_ids.length > 0) {
          setSelectedTreatments(appointment.treatment_ids);
        } else if (appointment.treatment?.id || appointment.treatmentId) {
          setSelectedTreatments([appointment.treatment?.id || appointment.treatmentId]);
        }
        if (appointment.date) {
          try {
            const d = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
            if (!isNaN(d.getTime())) {
              setSelectedDate(format(d, 'yyyy-MM-dd'));
            }
          } catch {}
        }
        if (appointment.time) setSelectedTime(appointment.time);
      } catch (error) {
        console.error('Erreur lors du chargement de la date:', error);
        // Fallback to empty form
        setFormData({
          userId: appointment.user?.id || appointment.userId || '',
          status: appointment.status || 'pending',
          notes: appointment.notes || ''
        });
        if (Array.isArray(appointment.treatment_ids) && appointment.treatment_ids.length > 0) {
          setSelectedTreatments(appointment.treatment_ids);
        } else {
          setSelectedTreatments(appointment.treatment?.id || appointment.treatmentId ? [appointment.treatment?.id || appointment.treatmentId] : []);
        }
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
        setSelectedTime('');
      }
    } else {
      // Si on crée un nouveau rendez-vous
      setFormData({
        userId: '',
        notes: ''
      });
      setSelectedTreatments([]);
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      setSelectedTime('');
      setStep(1);
    }
  }, [appointment]);

  // Charger les créneaux réels via useReservation
  const loadAvailableTimeSlots = useCallback(async (date) => {
    if (!date || selectedTreatments.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }
    try {
      const data = await getAvailableTimeSlots(date, selectedTreatments);
      if (data && data.available_time_slots) {
        setAvailableTimeSlots(data.available_time_slots);
        if (selectedTime && !data.available_time_slots.includes(selectedTime)) {
          setSelectedTime('');
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des créneaux:', err);
      setAvailableTimeSlots([]);
    }
  }, [selectedTreatments, selectedTime, getAvailableTimeSlots]);

  const toggleTreatment = (treatmentId) => {
    setSelectedTreatments((prev) =>
      prev.includes(treatmentId) ? prev.filter((id) => id !== treatmentId) : [...prev, treatmentId]
    );
  };

  // Génération du calendrier (design)
  const generateCalendar = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    const dayOfWeek = firstDayOfMonth.getDay() || 7; // Lundi=1 => 7 pour dimanche
    for (let i = 1; i < dayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push({
        day,
        date: format(date, 'yyyy-MM-dd'),
        isCurrentMonth: true,
        isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
        isSelected: format(date, 'yyyy-MM-dd') === selectedDate,
        isPast: date < new Date() && format(date, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd'),
      });
    }
    return days;
  };

  const calendar = generateCalendar();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    loadAvailableTimeSlots(date);
  };

  // Charger les créneaux quand on arrive à l'étape 3
  useEffect(() => {
    if (step === 3 && selectedDate && selectedTreatments.length > 0) {
      loadAvailableTimeSlots(selectedDate);
    }
  }, [step, selectedDate, selectedTreatments.length, loadAvailableTimeSlots]);

  // Recalculer la durée à partir des traitements sélectionnés
  const computedDuration = useMemo(() => {
    if (!selectedTreatments || selectedTreatments.length === 0) return 0;
    return selectedTreatments.reduce((sum, id) => {
      const t = treatments.find((tr) => tr.id === id);
      const d = t ? parseInt(t.duration, 10) : 0;
      return sum + (Number.isNaN(d) ? 0 : d);
    }, 0);
  }, [selectedTreatments, treatments]);

  // Si on change les traitements pendant l'étape 3, réinitialiser l'heure et recharger les créneaux
  useEffect(() => {
    if (step === 3) {
      setSelectedTime('');
      if (selectedDate && selectedTreatments.length > 0) {
        loadAvailableTimeSlots(selectedDate);
      } else {
        setAvailableTimeSlots([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTreatments]);

  // Réinitialiser totalement le formulaire (pour création en série)
  const resetForm = () => {
    setFormData({ userId: '', status: 'pending', notes: '' });
    setSelectedTreatments([]);
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedTime('');
    setAvailableTimeSlots([]);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      // Construire le payload aligné sur AppointmentBookingForm / useReservation
      const treatmentIds = selectedTreatments;
      const selectedTreatmentsData = treatments.filter((t) => treatmentIds.includes(t.id));
      // Durée totale calculée depuis les traitements sélectionnés
      let durationTotal = computedDuration > 0 ? computedDuration : 30;
      const title = selectedTreatmentsData.length === 0
        ? 'Rendez-vous sans traitement'
        : (selectedTreatmentsData.length === 1
          ? selectedTreatmentsData[0].name
          : `${selectedTreatmentsData[0].name} + ${selectedTreatmentsData.length - 1} autre${selectedTreatmentsData.length > 2 ? 's' : ''}`);
      const totalPrice = selectedTreatments.reduce((sum, id) => {
        const t = treatments.find((tr) => tr.id === id);
        return sum + (t ? parseFloat(t.price) : 0);
      }, 0);

      const appointmentData = {
        userId: formData.userId,
        title,
        date: selectedDate, // garder en string YYYY-MM-DD pour compatibilité disponibilité
        time: selectedTime,
        duration: durationTotal,
        status: formData.status || 'pending',
        notes: formData.notes || '',
        treatment_ids: treatmentIds,
        total_price: totalPrice,
      };

      console.log('Données envoyées:', appointmentData);

      let result;
      if (appointment) {
        result = await updateAppointment(appointment.id, appointmentData);
      } else {
        result = await createAppointment(appointmentData);
      }

      if (result.success) {
        await refreshAppointments();
        // Notify the client by email (fire-and-forget)
        (async () => {
          try {
            const client = await getUserById(appointmentData.userId);
            const to = client?.email;
            if (!to) return;
            const isUpdate = Boolean(appointment);
            const subject = `${isUpdate ? 'Mise à jour de votre rendez-vous' : 'Confirmation de votre rendez-vous'} - ${format(new Date(`${selectedDate}T00:00:00`), 'dd/MM/yyyy')} à ${selectedTime}`;
            const treatmentsList = selectedTreatmentsData.map(t => `- ${t.name}${t.duration ? ` (${t.duration} min)` : ''}`).join('\n');
            const text = `Bonjour ${client?.name || ''},\n\n${isUpdate ? 'Votre rendez-vous a été mis à jour.' : 'Votre rendez-vous a été créé.'}\n\nDate: ${selectedDate}\nHeure: ${selectedTime}\nDurée: ${durationTotal} min\nStatut: ${appointmentData.status}\n\nTraitements:\n${treatmentsList || '-'}\n\nNotes: ${appointmentData.notes || '-'}\nTotal estimé: ${totalPrice.toFixed(2)} €\n\nÀ bientôt,\nPlasmaCare`;
            const html = `
              <p>Bonjour ${client?.name || ''},</p>
              <p>${isUpdate ? 'Votre rendez-vous a été mis à jour.' : 'Votre rendez-vous a été créé.'}</p>
              <ul>
                <li><strong>Date:</strong> ${format(new Date(`${selectedDate}T00:00:00`), 'dd/MM/yyyy')}</li>
                <li><strong>Heure:</strong> ${selectedTime}</li>
                <li><strong>Durée:</strong> ${durationTotal} min</li>
                <li><strong>Statut:</strong> ${appointmentData.status}</li>
              </ul>
              <p><strong>Traitements:</strong></p>
              <ul>
                ${selectedTreatmentsData.map(t => `<li>${t.name}${t.duration ? ` - ${t.duration} min` : ''}</li>`).join('') || '<li>-</li>'}
              </ul>
              <p><strong>Notes:</strong> ${appointmentData.notes || '-'}</p>
              <p><strong>Total estimé:</strong> ${totalPrice.toFixed(2)} €</p>
              <p>À bientôt,<br/>PlasmaCare</p>
            `;
            await sendEmail({ to, subject, text, html });
          } catch (err) {
            console.error('Erreur lors de lenvoi de l\'email client (rdv):', err);
          }
        })();
        if (appointment) {
          onClose();
        } else {
          // Si création: rester ouvert et réinitialiser le formulaire
          resetForm();
        }
      } else {
        alert(result.error || 'Une erreur est survenue lors de l\'enregistrement du rendez-vous.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du rendez-vous.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {step === 1 && 'Sélectionner le client'}
            {step === 2 && 'Sélection des traitements'}
            {step === 3 && 'Choisissez une date et une heure'}
            {step === 4 && 'Informations supplémentaires'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="input pl-10"
                >
                  <option value="">Sélectionnez un client</option>
                  {isLoading ? (
                    <option value="" disabled>Chargement des clients...</option>
                  ) : users && users.length > 0 ? (
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aucun client disponible</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : treatments.length === 0 ? (
                <p className="text-gray-500">Aucun traitement disponible</p>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {treatments.map((treatment) => (
                      <div
                        key={treatment.id}
                        className={`
                          border rounded-lg p-4 cursor-pointer
                          ${selectedTreatments.includes(treatment.id) ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}
                        `}
                        onClick={() => toggleTreatment(treatment.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-primary">{treatment.name}</h3>
                            {treatment.description && (
                              <p className="text-sm text-gray-500 mt-1">{treatment.description}</p>
                            )}
                            {treatment.duration && (
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{treatment.duration} min</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            {typeof treatment.price !== 'undefined' && (
                              <span className="font-semibold text-primary">{treatment.price} €</span>
                            )}
                            <div className={`
                              mt-2 w-5 h-5 rounded-md flex items-center justify-center
                              ${selectedTreatments.includes(treatment.id) ? 'bg-primary text-white' : 'border border-gray-300'}
                            `}>
                              {selectedTreatments.includes(treatment.id) && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium mb-4 text-primary">
                {selectedDate}
              </h3>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">&lt;</button>
                  <h3 className="text-lg font-medium">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">&gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="py-2 text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}

                  {calendar.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day.isCurrentMonth && !day.isPast && handleDateChange(day.date)}
                      disabled={!day.isCurrentMonth || day.isPast}
                      className={`
                        py-2 rounded-full text-sm
                        ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                        ${day.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${day.isSelected ? 'bg-primary text-white' : ''}
                        ${day.isToday && !day.isSelected ? 'border border-primary text-primary' : ''}
                        ${day.isCurrentMonth && !day.isPast && !day.isSelected && !day.isToday ? 'hover:bg-gray-100' : ''}
                      `}
                    >
                      {day.day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Heure du rendez-vous</h3>

                {isLoadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500">Chargement des créneaux disponibles...</p>
                  </div>
                ) : slotsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <p>Impossible de charger les créneaux disponibles.</p>
                    <p className="text-sm mt-1">{slotsError}</p>
                    <button
                      onClick={() => loadAvailableTimeSlots(selectedDate)}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map((time, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-2 px-4 border rounded-lg text-center
                          ${selectedTime === time ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Aucun créneau disponible pour cette date.</p>
                    <p className="text-sm text-gray-500 mt-1">Veuillez sélectionner une autre date.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input min-h-[100px]"
                    placeholder="Ajoutez des notes ou des précisions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Retour
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                // validations simples par étape
                if (step === 1 && !formData.userId) {
                  setError('Veuillez sélectionner un client');
                  return;
                }
                if (step === 2 && selectedTreatments.length === 0) {
                  setError('Veuillez sélectionner au moins un traitement');
                  return;
                }
                if (step === 3 && (!selectedDate || !selectedTime)) {
                  setError('Veuillez sélectionner une date et une heure');
                  return;
                }
                setError('');
                setStep((s) => s + 1);
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={() => {
                setError('');
                handleSubmit();
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              disabled={isLoading || isSaving || !formData.userId}
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Enregistrement...
                </span>
              ) : (
                appointment ? 'Modifier' : 'Enregistrer'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


