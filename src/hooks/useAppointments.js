'use client'

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/appointments');
      setAppointments(response.data.appointments);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const response = await axios.put(`/api/appointments/${id}`, { status });
      setAppointments(appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...response.data.appointment }
          : appointment
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const createAppointment = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/appointments', data);
      setAppointments(prev => [...prev, response.data.appointment]);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointment = async (id, data) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/api/appointments/${id}`, data);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? response.data.appointment : appointment
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

  const deleteAppointment = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/appointments/${id}`);
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refreshAppointments: fetchAppointments
  };
}
