'use client'

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Dialog } from '@/components/ui/Dialog';

export function AdminDiagnosisForm({ isOpen, onClose, diagnosis }) {
  const [formData, setFormData] = useState({
    recommendations: '',
    treatments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    if (diagnosis) {
      setFormData({
        recommendations: diagnosis.recommendations || '',
        treatments: diagnosis.treatments || []
      });
    }
  }, [diagnosis]);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get('/api/treatments');
        setTreatments(response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des traitements:', error);
        setError('Erreur lors du chargement des traitements');
      }
    };
    fetchTreatments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await axios.put(`/api/diagnoses/${diagnosis.id}/admin`, formData);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le diagnostic"
    >
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommandations
          </label>
          <textarea
            required
            value={formData.recommendations}
            onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            className="input min-h-[100px]"
            placeholder="Recommandations pour le client"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traitements recommandés
          </label>
          <select
            multiple
            required
            value={formData.treatments}
            onChange={(e) => setFormData({
              ...formData,
              treatments: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="input h-32"
          >
            {treatments.map(treatment => (
              <option key={treatment.id} value={treatment.name}>
                {treatment.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs traitements
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
