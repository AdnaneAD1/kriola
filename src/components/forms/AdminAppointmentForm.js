'use client'

import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, User, X } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import axios from '@/lib/axios';

export function AdminAppointmentForm({ isOpen, onClose, appointment = null }) {
  const [users, setUsers] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    time: '',
    treatment: '',
    status: 'pending',
    notes: ''
  });

  const { createAppointment, updateAppointment, refreshAppointments } = useAppointments();

  useEffect(() => {
    setIsLoading(true);
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      }
    };

    const fetchTreatments = async () => {
      try {
        const response = await axios.get('/api/treatments');
        setTreatments(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des traitements:', error);
      }
    };

    Promise.all([fetchUsers(), fetchTreatments()])
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (appointment) {
      try {
        // Si on modifie un rendez-vous existant
        setFormData({
          userId: appointment.user?.id || '',
          date: appointment.date || '',
          time: appointment.time || '',
          treatment: appointment.treatment?.id || '',
          notes: appointment.notes || ''
        });
      } catch (error) {
        console.error('Erreur lors du chargement de la date:', error);
        // Fallback to empty form
        setFormData({
          userId: appointment.user?.id || '',
          date: '',
          time: '',
          treatment: appointment.treatment?.id || '',
          notes: appointment.notes || ''
        });
      }
    } else {
      // Si on crée un nouveau rendez-vous
      setFormData({
        userId: '',
        date: '',
        time: '',
        treatment: '',
        notes: ''
      });
    }
  }, [appointment]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        user_id: formData.userId,
        treatment_id: formData.treatment,
        date: formData.date,
        time: formData.time,
        status: formData.status || 'pending',
        notes: formData.notes
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
        onClose();
      } else {
        alert(result.error || 'Une erreur est survenue lors de l\'enregistrement du rendez-vous.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du rendez-vous.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold pr-8">
            {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} id="adminAppointmentForm" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Traitement
              </label>
              <select
                required
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="input"
              >
                <option value="">Sélectionnez un traitement</option>
                {isLoading ? (
                  <option value="" disabled>Chargement des traitements...</option>
                ) : treatments && treatments.length > 0 ? (
                  treatments.map((treatment) => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucun traitement disponible</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Ajoutez des notes ou des précisions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
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
          </form>
        </div>

        <div className="p-6 border-t bg-white">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="adminAppointmentForm"
              className="btn-primary"
              disabled={!formData.userId}
            >
              {appointment ? 'Modifier' : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
