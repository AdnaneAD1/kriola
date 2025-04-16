'use client'

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export function useDiagnosis() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiagnoses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/diagnoses');
      setDiagnoses(response.data.diagnoses);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const createDiagnosis = async (data) => {
    try {
      const formData = new FormData();
      formData.append('date', data.date);
      formData.append('skin_type', data.skin_type);
      formData.append('recommendations', data.recommendations);
      formData.append('notes', data.notes || '');
      
      // S'assurer que concerns est un tableau
      const concerns = Array.isArray(data.concerns) ? data.concerns : [];
      concerns.forEach(concern => {
        formData.append('concerns[]', concern);
      });

      // S'assurer que treatments est un tableau
      const treatments = Array.isArray(data.treatments) ? data.treatments : [];
      treatments.forEach(treatment => {
        formData.append('treatments[]', treatment);
      });

      // Ajouter les photos si présentes
      if (data.photos) {
        data.photos.forEach(photo => {
          if (photo instanceof File) {
            formData.append('photos[]', photo);
          }
        });
      }

      const response = await axios.post('/api/diagnoses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDiagnoses(prev => [response.data.diagnosis, ...prev]);
      setError(null);
      return response.data.diagnosis;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du diagnostic');
      throw err;
    }
  };

  const updateDiagnosis = async (id, data) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Laravel requiert ceci pour les requêtes PUT avec FormData
      formData.append('date', data.date);
      formData.append('skin_type', data.skin_type);
      formData.append('recommendations', data.recommendations);
      formData.append('notes', data.notes || '');
      
      // S'assurer que concerns est un tableau
      const concerns = Array.isArray(data.concerns) ? data.concerns : [];
      concerns.forEach(concern => {
        formData.append('concerns[]', concern);
      });

      // S'assurer que treatments est un tableau
      const treatments = Array.isArray(data.treatments) ? data.treatments : [];
      treatments.forEach(treatment => {
        formData.append('treatments[]', treatment);
      });

      // Ajouter les photos si présentes
      if (data.photos) {
        data.photos.forEach(photo => {
          if (photo instanceof File) {
            formData.append('photos[]', photo);
          }
        });
      }

      const response = await axios.post(`/api/diagnoses/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDiagnoses(prev => prev.map(d => d.id === id ? response.data.diagnosis : d));
      setError(null);
      return response.data.diagnosis;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du diagnostic');
      throw err;
    }
  };

  const deleteDiagnosis = async (id) => {
    try {
      await axios.delete(`/api/diagnoses/${id}`);
      setDiagnoses(prev => prev.filter(d => d.id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la suppression du diagnostic');
      throw err;
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  return {
    diagnoses,
    isLoading,
    error,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    refreshDiagnoses: fetchDiagnoses
  };
}
