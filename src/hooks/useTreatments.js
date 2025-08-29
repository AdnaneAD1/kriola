import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';

const COLLECTION_NAME = 'treatments';

export function useTreatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convertir un doc Firestore en objet JS
  const convertFirestoreData = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
      deletedAt: data?.deletedAt?.toDate ? data.deletedAt.toDate() : data?.deletedAt,
    };
  };

  // Créer un nouveau traitement
  const createTreatment = useCallback(async (treatmentData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToSave = {
        ...treatmentData,
        isActive: treatmentData?.isActive !== undefined ? treatmentData.isActive : true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deletedAt: null,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la création du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour un traitement
  const updateTreatment = useCallback(async (treatmentData) => {
    try {
      setLoading(true);
      setError(null);

      const { id, ...updateData } = treatmentData || {};
      const dataToUpdate = {
        ...updateData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la mise à jour du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Soft delete
  const softDeleteTreatment = useCallback(async (treatmentId) => {
    try {
      setLoading(true);
      setError(null);
      await updateDoc(doc(db, COLLECTION_NAME, treatmentId), {
        deletedAt: Timestamp.now(),
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore
  const restoreTreatment = useCallback(async (treatmentId) => {
    try {
      setLoading(true);
      setError(null);
      await updateDoc(doc(db, COLLECTION_NAME, treatmentId), {
        deletedAt: null,
        isActive: true,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la restauration du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hard delete
  const hardDeleteTreatment = useCallback(async (treatmentId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, COLLECTION_NAME, treatmentId));
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression définitive du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias explicite pour suppression totale
  const deleteTreatment = useCallback(async (treatmentId) => {
    return hardDeleteTreatment(treatmentId);
  }, [hardDeleteTreatment]);

  // Récupérer par ID
  const getTreatmentById = useCallback(async (treatmentId) => {
    try {
      setLoading(true);
      setError(null);
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, treatmentId));
      if (docSnap.exists()) return convertFirestoreData(docSnap);
      return null;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Liste avec filtres
  const getTreatments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const constraints = [];
      if (!filters.includeDeleted) constraints.push(where('deletedAt', '==', null));
      if (filters.category) constraints.push(where('category', '==', filters.category));
      if (filters.isActive !== undefined) constraints.push(where('isActive', '==', filters.isActive));
      if (filters.priceMin !== undefined) constraints.push(where('price', '>=', filters.priceMin));
      if (filters.priceMax !== undefined) constraints.push(where('price', '<=', filters.priceMax));
      if (filters.durationMin !== undefined) constraints.push(where('duration', '>=', filters.durationMin));
      if (filters.durationMax !== undefined) constraints.push(where('duration', '<=', filters.durationMax));

      const orderField = filters.orderBy || 'name';
      const orderDirection = filters.orderDirection || 'asc';
      constraints.push(orderBy(orderField, orderDirection));
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let list = [];
      querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));

      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        list = list.filter((t) =>
          t.name?.toLowerCase().includes(searchTerm) ||
          (t.description && t.description.toLowerCase().includes(searchTerm))
        );
      }

      setTreatments(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération des traitements';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Abonnement temps réel
  const subscribeToTreatments = useCallback((filters = {}) => {
    const constraints = [];
    if (!filters.includeDeleted) constraints.push(where('deletedAt', '==', null));
    if (filters.category) constraints.push(where('category', '==', filters.category));
    if (filters.isActive !== undefined) constraints.push(where('isActive', '==', filters.isActive));
    const orderField = filters.orderBy || 'name';
    const orderDirection = filters.orderDirection || 'asc';
    constraints.push(orderBy(orderField, orderDirection));
    if (filters.limit) constraints.push(fsLimit(filters.limit));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let list = [];
        querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          list = list.filter((t) =>
            t.name?.toLowerCase().includes(searchTerm) ||
            (t.description && t.description.toLowerCase().includes(searchTerm))
          );
        }
        setTreatments(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Helpers
  const getActiveTreatments = useCallback(async () => {
    return getTreatments({ isActive: true, orderBy: 'name', orderDirection: 'asc' });
  }, [getTreatments]);

  const getTreatmentsByCategory = useCallback(async (category) => {
    return getTreatments({ category, isActive: true, orderBy: 'name', orderDirection: 'asc' });
  }, [getTreatments]);

  const toggleTreatmentStatus = useCallback(async (treatmentId, isActive) => {
    return updateTreatment({ id: treatmentId, isActive });
  }, [updateTreatment]);

  return {
    treatments,
    loading,
    error,
    createTreatment,
    updateTreatment,
    softDeleteTreatment,
    restoreTreatment,
    hardDeleteTreatment,
    deleteTreatment,
    getTreatmentById,
    getTreatments,
    getActiveTreatments,
    getTreatmentsByCategory,
    subscribeToTreatments,
    toggleTreatmentStatus,
  };
}
