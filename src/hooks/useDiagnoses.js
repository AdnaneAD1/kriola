'use client'

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

const COLLECTION_NAME = 'diagnoses';

export const useDiagnoses = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Remove undefined recursively from plain objects/arrays
  const stripUndefined = (value) => {
    if (Array.isArray(value)) {
      return value.map(stripUndefined);
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]);
      return Object.fromEntries(entries);
    }
    return value;
  };

  // Convertir un doc Firestore en objet JS
  const convertFirestoreData = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data?.date?.toDate
        ? data.date.toDate()
        : data?.date?.seconds !== undefined
        ? Timestamp.fromMillis(data.date.seconds * 1000 + Math.floor((data.date.nanoseconds || 0) / 1e6)).toDate()
        : data?.date,
      followUpDate: data?.followUpDate?.toDate
        ? data.followUpDate.toDate()
        : data?.followUpDate?.seconds !== undefined
        ? Timestamp.fromMillis(data.followUpDate.seconds * 1000 + Math.floor((data.followUpDate.nanoseconds || 0) / 1e6)).toDate()
        : data?.followUpDate,
      // Expose photos as array of URL strings for UI convenience
      photos: Array.isArray(data?.photos)
        ? data.photos
            .map((photo) => {
              if (typeof photo === 'string') return photo;
              const url = photo?.url || null;
              return url;
            })
            .filter(Boolean)
        : [],
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
      deletedAt: data?.deletedAt?.toDate ? data.deletedAt.toDate() : data?.deletedAt,
    };
  };

  // Force toute valeur de date en Timestamp Firestore
  const coerceToTimestamp = (value, { fallbackNow = false } = {}) => {
    if (!value) return fallbackNow ? Timestamp.now() : null;
    try {
      if (value instanceof Timestamp) return value;
      if (typeof value?.toDate === 'function') return value; // déjà Timestamp-like
      if (value instanceof Date) return Timestamp.fromDate(value);
      if (typeof value === 'number') return Timestamp.fromMillis(value);
      if (typeof value === 'string') {
        const isYMD = /^\d{4}-\d{2}-\d{2}$/.test(value);
        const d = new Date(isYMD ? value + 'T00:00:00' : value);
        if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
        return fallbackNow ? Timestamp.now() : null;
      }
      if (typeof value === 'object' && value.seconds !== undefined) {
        return new Timestamp(value.seconds, value.nanoseconds || 0);
      }
      return fallbackNow ? Timestamp.now() : null;
    } catch (_) {
      return fallbackNow ? Timestamp.now() : null;
    }
  };

  // Créer un nouveau diagnostic
  const createDiagnosis = useCallback(async (diagnosisData) => {
    try {
      setLoading(true);
      setError(null);

      // Normalize photos: accept array of strings (Cloudinary URLs) or objects
      const normalizedPhotos = Array.isArray(diagnosisData?.photos)
        ? diagnosisData.photos.map((photo) =>
            typeof photo === 'string'
              ? { url: photo, uploadedAt: Timestamp.now() }
              : {
                  ...photo,
                  url: photo?.url,
                  uploadedAt:
                    photo?.uploadedAt instanceof Date
                      ? Timestamp.fromDate(photo.uploadedAt)
                      : photo?.uploadedAt ?? Timestamp.now(),
                }
          )
        : [];

      const dataToSave = {
        ...diagnosisData,
        date: coerceToTimestamp(diagnosisData?.date, { fallbackNow: true }),
        followUpDate: coerceToTimestamp(diagnosisData?.followUpDate) ?? null,
        status: diagnosisData?.status || 'active',
        treatments: diagnosisData?.treatments || [],
        photos: normalizedPhotos,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deletedAt: null,
      };

      const sanitized = stripUndefined(dataToSave);

      const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitized);
      return docRef.id;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la création du diagnostic";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour un diagnostic
  const updateDiagnosis = useCallback(async (diagnosisData) => {
    try {
      setLoading(true);
      setError(null);

      const { id, ...updateData } = diagnosisData || {};
      const normalizedUpdatePhotos = Array.isArray(updateData?.photos)
        ? updateData.photos.map((photo) =>
            typeof photo === 'string'
              ? { url: photo, uploadedAt: Timestamp.now() }
              : {
                  ...photo,
                  url: photo?.url,
                  uploadedAt:
                    photo?.uploadedAt instanceof Date
                      ? Timestamp.fromDate(photo.uploadedAt)
                      : photo?.uploadedAt ?? Timestamp.now(),
                }
          )
        : undefined;

      const dataToUpdate = {
        ...updateData,
        ...(updateData?.date !== undefined ? { date: coerceToTimestamp(updateData.date, { fallbackNow: false }) } : {}),
        ...(updateData?.followUpDate !== undefined
          ? { followUpDate: coerceToTimestamp(updateData.followUpDate) }
          : {}),
        ...(normalizedUpdatePhotos ? { photos: normalizedUpdatePhotos } : {}),
        updatedAt: Timestamp.now(),
      };

      const sanitizedUpdate = stripUndefined(dataToUpdate);

      await updateDoc(doc(db, COLLECTION_NAME, id), sanitizedUpdate);
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la mise à jour du diagnostic";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Soft delete
  const softDeleteDiagnosis = useCallback(async (diagnosisId) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, COLLECTION_NAME, diagnosisId), {
        deletedAt: Timestamp.now(),
        status: 'cancelled',
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la suppression du diagnostic";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore
  const restoreDiagnosis = useCallback(async (diagnosisId) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, COLLECTION_NAME, diagnosisId), {
        deletedAt: null,
        status: 'active',
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la restauration du diagnostic";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hard delete
  const hardDeleteDiagnosis = useCallback(async (diagnosisId) => {
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, COLLECTION_NAME, diagnosisId));
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la suppression définitive du diagnostic";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by ID
  const getDiagnosisById = useCallback(async (diagnosisId) => {
    try {
      setLoading(true);
      setError(null);

      const docSnap = await getDoc(doc(db, COLLECTION_NAME, diagnosisId));
      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      }
      return null;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la récupération du diagnostic";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get list with filters
  const getDiagnoses = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const constraints = [];

      // Exclure par défaut les éléments supprimés
      if (!filters.includeDeleted) {
        constraints.push(where('deletedAt', '==', null));
      }

      if (filters.userId) constraints.push(where('userId', '==', filters.userId));
      if (filters.skinType) constraints.push(where('skinType', '==', filters.skinType));
      if (filters.status) constraints.push(where('status', '==', filters.status));
      if (filters.dateFrom) constraints.push(where('date', '>=', Timestamp.fromDate(filters.dateFrom)));
      if (filters.dateTo) constraints.push(where('date', '<=', Timestamp.fromDate(filters.dateTo)));

      // Tri
      const orderField = filters.orderBy || 'date';
      const orderDirection = filters.orderDirection || 'desc';
      constraints.push(orderBy(orderField, orderDirection));

      // Limite
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let list = [];
      querySnapshot.forEach((d) => {
        list.push(convertFirestoreData(d));
      });

      // Filtrage client pour concerns (array contains OR)
      if (filters.concerns && filters.concerns.length > 0) {
        list = list.filter((diag) => filters.concerns.some((c) => (diag.concerns || []).includes(c)));
      }

      setDiagnoses(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la récupération des diagnostics";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Temps réel
  const subscribeToDiagnoses = useCallback((filters = {}) => {
    const constraints = [];

    if (!filters.includeDeleted) constraints.push(where('deletedAt', '==', null));
    if (filters.userId) constraints.push(where('userId', '==', filters.userId));
    if (filters.skinType) constraints.push(where('skinType', '==', filters.skinType));
    if (filters.status) constraints.push(where('status', '==', filters.status));

    const orderField = filters.orderBy || 'date';
    const orderDirection = filters.orderDirection || 'desc';
    constraints.push(orderBy(orderField, orderDirection));
    if (filters.limit) constraints.push(fsLimit(filters.limit));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let list = [];
        querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));
        if (filters.concerns && filters.concerns.length > 0) {
          list = list.filter((diag) => filters.concerns.some((c) => (diag.concerns || []).includes(c)));
        }
        setDiagnoses(list);
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
  const getUserDiagnoses = useCallback(
    async (userId) => getDiagnoses({ userId, orderBy: 'date', orderDirection: 'desc' }),
    [getDiagnoses]
  );

  const getActiveDiagnoses = useCallback(
    async () => getDiagnoses({ status: 'active', orderBy: 'date', orderDirection: 'desc' }),
    [getDiagnoses]
  );

  const updateDiagnosisStatus = useCallback(
    async (diagnosisId, status) => updateDiagnosis({ id: diagnosisId, status }),
    [updateDiagnosis]
  );

  const addPhotoToDiagnosis = useCallback(
    async (diagnosisId, photo) => {
      try {
        const diagnosis = await getDiagnosisById(diagnosisId);
        if (!diagnosis) throw new Error('Diagnostic non trouvé');
        const updatedPhotos = [...(diagnosis.photos || []), photo];
        return updateDiagnosis({ id: diagnosisId, photos: updatedPhotos });
      } catch (err) {
        const errorMessage = err?.message || "Erreur lors de l'ajout de la photo";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [getDiagnosisById, updateDiagnosis]
  );

  const removePhotoFromDiagnosis = useCallback(
    async (diagnosisId, photoUrl) => {
      try {
        const diagnosis = await getDiagnosisById(diagnosisId);
        if (!diagnosis) throw new Error('Diagnostic non trouvé');
        const updatedPhotos = (diagnosis.photos || [])
          .map((p) => (typeof p === 'string' ? p : p?.url))
          .filter(Boolean)
          .filter((url) => url !== photoUrl);
        return updateDiagnosis({ id: diagnosisId, photos: updatedPhotos });
      } catch (err) {
        const errorMessage = err?.message || 'Erreur lors de la suppression de la photo';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [getDiagnosisById, updateDiagnosis]
  );

  return {
    diagnoses,
    loading,
    error,
    createDiagnosis,
    updateDiagnosis,
    softDeleteDiagnosis,
    restoreDiagnosis,
    hardDeleteDiagnosis,
    getDiagnosisById,
    getDiagnoses,
    getUserDiagnoses,
    getActiveDiagnoses,
    subscribeToDiagnoses,
    updateDiagnosisStatus,
    addPhotoToDiagnosis,
    removePhotoFromDiagnosis,
  };
};
