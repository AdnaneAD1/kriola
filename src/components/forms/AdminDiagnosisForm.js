'use client'

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useTreatments } from '@/hooks/useTreatments';
import { useDiagnoses } from '@/hooks/useDiagnoses';

export function AdminDiagnosisForm({ isOpen, onClose, diagnosis }) {
  const [formData, setFormData] = useState({
    recommendations: '',
    treatments: [] // store selected treatment IDs in state
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const { getTreatments } = useTreatments();
  const { updateDiagnosis } = useDiagnoses();

  useEffect(() => {
    if (diagnosis) {
      setFormData({
        recommendations: diagnosis.recommendations || '',
        // if diagnosis.treatments are objects or names, normalize to IDs when possible
        treatments: Array.isArray(diagnosis.treatments)
          ? diagnosis.treatments.map((t) => (typeof t === 'string' ? t : t?.id || t)).filter(Boolean)
          : []
      });
    }
  }, [diagnosis]);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const list = await getTreatments({ isActive: true, orderBy: 'name', orderDirection: 'asc' });
        setTreatments(list || []);
        setError(null);
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
      // Map selected IDs to minimal objects {id, name} to store in Firestore
      const selectedTreatments = (formData.treatments || [])
        .map((id) => {
          const t = treatments.find((x) => x.id === id);
          return t ? { id: t.id, name: t.name } : null;
        })
        .filter(Boolean);

      await updateDiagnosis({
        id: diagnosis.id,
        recommendations: formData.recommendations,
        treatments: selectedTreatments,
      });
      onClose();
    } catch (error) {
      setError(error?.message || 'Une erreur est survenue');
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
            {treatments.map((treatment) => (
              <option key={treatment.id} value={treatment.id}>
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

