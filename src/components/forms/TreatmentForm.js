'use client'

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTreatments } from '@/hooks/useTreatments';

export function TreatmentForm({ isOpen, onClose, treatment = null }) {
  const { createTreatment, updateTreatment } = useTreatments();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: '',
    price: '',
    description: ''
  });


  useEffect(() => {
    if (treatment) {
      // Si on modifie un traitement existant
      setFormData({
        name: treatment.name || '',
        category: treatment.category || '',
        duration: treatment.duration || '',
        price: treatment.price ? treatment.price.toString() : '',
        description: treatment.description || ''
      });
    } else {
      // Si on crée un nouveau traitement
      setFormData({
        name: '',
        category: '',
        duration: '',
        price: '',
        description: ''
      });
    }
  }, [treatment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name?.trim(),
        category: formData.category?.trim(),
        duration: formData.duration ? Number(formData.duration) : 0,
        price: formData.price ? Number(formData.price) : 0,
        description: formData.description?.trim(),
      };

      if (treatment) {
        await updateTreatment({ id: treatment.id, ...payload });
      } else {
        await createTreatment(payload);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue lors de la sauvegarde du traitement.');
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
            {treatment ? `Modifier ${treatment.name}` : 'Nouveau traitement'}
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
                Durée (en minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input"
                placeholder="Ex: 30"
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
              {treatment ? 'Enregistrer les modifications' : 'Créer le traitement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
