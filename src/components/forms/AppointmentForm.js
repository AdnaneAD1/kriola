'use client'

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, X } from 'lucide-react';

export function AppointmentForm({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    practitioner: '',
    location: '',
    treatments: [],
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        date: initialData.date || '',
        time: initialData.time || '',
        practitioner: initialData.practitioner || '',
        location: initialData.location || '',
        treatments: initialData.treatments || [],
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        practitioner: '',
        location: '',
        treatments: [],
        notes: ''
      });
    }
  }, [initialData]);

  const treatments = [
    'Rajeunissement du visage',
    'Traitement de l\'acné',
    'Soins anti-âge',
    'Traitement des cicatrices',
    'Lifting plasma',
  ];

  const practitioners = [
    'Dr. Sophie Martin',
    'Dr. Marie Dubois',
    'Dr. Jean Dupont'
  ];

  const locations = [
    'Cabinet Principal',
    'Cabinet Annexe'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
            {initialData ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} id="appointmentForm" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="Ex: Consultation initiale"
              />
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
                Praticien
              </label>
              <select
                required
                value={formData.practitioner}
                onChange={(e) => setFormData({ ...formData, practitioner: e.target.value })}
                className="input"
              >
                <option value="">Sélectionnez un praticien</option>
                {practitioners.map((practitioner) => (
                  <option key={practitioner} value={practitioner}>
                    {practitioner}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu
              </label>
              <select
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
              >
                <option value="">Sélectionnez un lieu</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Traitements
              </label>
              <select
                required
                value={formData.treatments}
                onChange={(e) => setFormData({ ...formData, treatments: Array.from(e.target.selectedOptions, option => option.value) })}
                className="input"
                multiple
              >
                {treatments.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
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
              form="appointmentForm"
              className="btn-primary"
            >
              {initialData ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
