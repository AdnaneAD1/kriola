'use client'

import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, User, X } from 'lucide-react';

export function AdminAppointmentForm({ isOpen, onClose, appointment = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    time: '',
    treatment: '',
    notes: ''
  });

  // Mock data pour les utilisateurs
  const users = [
    { id: 1, name: 'Sophie Martin', email: 'sophie.martin@email.com' },
    { id: 2, name: 'Lucas Bernard', email: 'lucas.bernard@email.com' },
    { id: 3, name: 'Emma Dubois', email: 'emma.dubois@email.com' },
    { id: 4, name: 'Thomas Petit', email: 'thomas.petit@email.com' }
  ];

  const treatments = [
    'Rajeunissement du visage',
    'Traitement de l\'acné',
    'Soins anti-âge',
    'Traitement des cicatrices',
    'Lifting plasma',
  ];

  useEffect(() => {
    if (appointment) {
      // Si on modifie un rendez-vous existant
      setFormData({
        userId: appointment.client.id || '',
        date: appointment.date || '',
        time: appointment.time || '',
        treatment: appointment.treatment || '',
        notes: appointment.notes || ''
      });
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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // Si on modifie un rendez-vous existant
    if (appointment) {
      console.log('Modification du rendez-vous:', { id: appointment.id, ...formData });
    } else {
      // Si on crée un nouveau rendez-vous
      console.log('Nouveau rendez-vous:', formData);
    }
    onClose();
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
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`
                        flex items-center p-3 cursor-pointer hover:bg-gray-50
                        ${formData.userId === user.id ? 'bg-primary/5' : ''}
                        ${filteredUsers.length > 1 ? 'border-b' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name="user"
                        checked={formData.userId === user.id}
                        onChange={() => setFormData({ ...formData, userId: user.id })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Aucun client trouvé
                    </div>
                  )}
                </div>
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
