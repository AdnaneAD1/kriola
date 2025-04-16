'use client'

import { useState } from 'react';
import axios from '@/lib/axios';

export function usePrograms(userId) {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/users/${userId}/programs`);
      setPrograms(response.data.programs);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const createProgram = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/users/${userId}/programs`, data);
      setPrograms(prev => [...prev, response.data.program]);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgram = async (programId, data) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/api/users/${userId}/programs/${programId}`, data);
      setPrograms(prev => 
        prev.map(program => 
          program.id === programId ? response.data.program : program
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProgram = async (programId) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/users/${userId}/programs/${programId}`);
      setPrograms(prev => prev.filter(program => program.id !== programId));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    programs,
    isLoading,
    error,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram
  };
}
