'use client'

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
  limit as fsLimit,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';

export function useAppointments(userId) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLLECTION_NAME = 'appointments';

  // Convert a Firestore doc to plain JS object with Date instances
  const convertFirestoreData = async (docSnap) => {
    const data = docSnap.data();
    
    // Vérification et conversion des dates
    const convertTimestamp = (timestamp) => {
      return timestamp?.toDate ? timestamp.toDate() : timestamp;
    };

    return {
      id: docSnap.id,
      ...data,
      user: {
        id: data.userId,
        name: await getUserName(data.userId)
      },
      date: convertTimestamp(data?.date),
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt)
    };
  };

  async function getUserName(userId) {
    if (!userId) return 'Utilisateur inconnu';
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data().name : 'Utilisateur inconnu';
    } catch {
      return 'Erreur de chargement';
    }
  }

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const constraints = [];
      if (userId) constraints.push(where('userId', '==', userId));
      constraints.push(orderBy('date', 'asc'));
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      const list = await Promise.all(snapshot.docs.map(convertFirestoreData));
      setAppointments(list);
    } catch (err) {
      const msg = err?.message || 'Une erreur est survenue lors du chargement des rendez-vous';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Admin: fetch with filters (status, date range, ordering, limit)
  const getAppointments = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const constraints = [];
      // Scope by user if provided (prop or filter)
      const scopeUserId = filters.userId || userId;
      if (scopeUserId) constraints.push(where('userId', '==', scopeUserId));
      if (filters.status) constraints.push(where('status', '==', filters.status));
      if (filters.fromDate instanceof Date) constraints.push(where('date', '>=', Timestamp.fromDate(filters.fromDate)));
      if (filters.toDate instanceof Date) constraints.push(where('date', '<=', Timestamp.fromDate(filters.toDate)));
      const orderField = filters.orderBy || 'date';
      const orderDirection = filters.orderDirection || 'asc';
      constraints.push(orderBy(orderField, orderDirection));
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      const list = await Promise.all(snapshot.docs.map(convertFirestoreData));
      setAppointments(list);
      return list;
    } catch (err) {
      const msg = err?.message || 'Une erreur est survenue lors du chargement des rendez-vous';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateAppointmentStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status,
        updatedAt: Timestamp.now(),
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      return { success: true };
    } catch (err) {
      throw new Error(err?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const createAppointment = async (data) => {
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        ...(userId ? { userId } : {}),
        date: data?.date instanceof Date ? Timestamp.fromDate(data.date) : data?.date,
        status: data?.status || 'pending',
        paymentStatus: data?.paymentStatus || 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, COLLECTION_NAME), payload);
      // Optimistic local update
      setAppointments(prev => [
        ...prev,
        {
          id: ref.id,
          ...data,
          ...(userId ? { userId } : {}),
          status: payload.status,
          paymentStatus: payload.paymentStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
      return { success: true, id: ref.id };
    } catch (err) {
      const msg = err?.message || 'Une erreur est survenue';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointment = async (id, data) => {
    try {
      setIsLoading(true);
      const updateData = {
        ...data,
        ...(data?.date instanceof Date ? { date: Timestamp.fromDate(data.date) } : {}),
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Une erreur est survenue';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Une erreur est survenue';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription: keeps appointments in sync automatically
  useEffect(() => {
    try {
      setIsLoading(true);
      const constraints = [];
      if (userId) constraints.push(where('userId', '==', userId));
      constraints.push(orderBy('date', 'asc'));
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const list = await Promise.all(snapshot.docs.map(convertFirestoreData));
          setAppointments(list);
          setIsLoading(false);
        },
        (err) => {
          const msg = err?.message || 'Une erreur est survenue lors de la synchronisation des rendez-vous';
          setError(msg);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refreshAppointments: fetchAppointments,
    getAppointments,
  };
}
