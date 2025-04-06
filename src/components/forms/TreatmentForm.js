'use client'

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TreatmentForm({ isOpen, onClose, treatment = null }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: '',
    price: '',
    description: '',
    practitioners: []
  });

  // Mock data pour les praticiens
  const practitioners = [
    'Dr. Sophie Martin',
    'Dr. Marie Dubois',
    'Dr. Jean Dupont',
    'Dr. Pierre Lambert'
  ];

  useEffect(() => {
    if (treatment) {
      // Si on modifie un traitement existant
      setFormData({
        name: treatment.name || '',
        category: treatment.category || '',
        duration: treatment.duration || '',
        price: treatment.price ? treatment.price.toString() : '',
        description: treatment.description || '',
        practitioners: treatment.practitioners || []
      });
    } else {
      // Si on crée un nouveau traitement
      setFormData({
        name: '',
        category: '',
        duration: '',
        price: '',
        description: '',
        practitioners: []
      });
    }
  }, [treatment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Si on modifie un traitement existant
    if (treatment) {
      console.log('Modification du traitement:', { id: treatment.id, ...formData });
    } else {
      // Si on crée un nouveau traitement
      console.log('Nouveau traitement:', formData);
    }
    onClose();
  };

  const handlePractitionerToggle = (practitioner) => {
    setFormData(prev => ({
      ...prev,
      practitioners: prev.practitioners.includes(practitioner)
        ? prev.practitioners.filter(p => p !== practitioner)
        : [...prev.practitioners, practitioner]
    }));
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
            {treatment ? 'Modifier le traitement' : 'Nouveau traitement'}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} id="treatmentForm" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du traitement
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Ex: Traitement Anti-âge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                placeholder="Ex: Anti-âge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input"
                placeholder="Ex: 1h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€)
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input"
                placeholder="Ex: 250"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Description détaillée du traitement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Praticiens
              </label>
              <div className="space-y-2">
                {practitioners.map((practitioner) => (
                  <label
                    key={practitioner}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.practitioners.includes(practitioner)}
                      onChange={() => handlePractitionerToggle(practitioner)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{practitioner}</span>
                  </label>
                ))}
              </div>
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
              form="treatmentForm"
              className="btn-primary"
            >
              {treatment ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
