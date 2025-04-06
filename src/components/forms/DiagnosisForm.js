'use client'

import { useState } from 'react';
import { FileText, X } from 'lucide-react';

export function DiagnosisForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    skinType: '',
    concerns: [],
    allergies: '',
    currentProducts: '',
    expectations: ''
  });

  const skinTypes = [
    'Normal',
    'Sèche',
    'Grasse',
    'Mixte',
    'Sensible'
  ];

  const skinConcerns = [
    'Acné',
    'Rides',
    'Taches brunes',
    'Rougeurs',
    'Pores dilatés',
    'Cicatrices',
    'Teint terne'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission à implémenter
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
          <h2 className="text-2xl font-semibold pr-8">Nouveau diagnostic</h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} id="diagnosisForm" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de peau
              </label>
              <select
                required
                value={formData.skinType}
                onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                className="input"
              >
                <option value="">Sélectionnez votre type de peau</option>
                {skinTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préoccupations principales
              </label>
              <div className="grid grid-cols-2 gap-2">
                {skinConcerns.map((concern) => (
                  <label key={concern} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.concerns.includes(concern)}
                      onChange={(e) => {
                        const newConcerns = e.target.checked
                          ? [...formData.concerns, concern]
                          : formData.concerns.filter(c => c !== concern);
                        setFormData({ ...formData, concerns: newConcerns });
                      }}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{concern}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies connues
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="input"
                placeholder="Liste des allergies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produits actuellement utilisés
              </label>
              <textarea
                value={formData.currentProducts}
                onChange={(e) => setFormData({ ...formData, currentProducts: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Listez les produits que vous utilisez..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attentes et objectifs
              </label>
              <textarea
                value={formData.expectations}
                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Décrivez vos objectifs..."
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
              form="diagnosisForm"
              className="btn-primary"
            >
              Soumettre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
