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

const COLLECTION_NAME = 'programs';

export function usePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert Firestore doc -> Program object with Date conversion
  const convertFirestoreData = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      startDate: data?.startDate?.toDate ? data.startDate.toDate() : data?.startDate,
      endDate: data?.endDate?.toDate ? data.endDate.toDate() : data?.endDate,
      treatments: Array.isArray(data?.treatments)
        ? data.treatments.map((item) => ({
            ...item,
            startDate: item?.startDate?.toDate ? item.startDate.toDate() : item?.startDate,
            endDate: item?.endDate?.toDate ? item.endDate.toDate() : item?.endDate,
          }))
        : [],
      products: Array.isArray(data?.products)
        ? data.products.map((item) => ({
            ...item,
            startDate: item?.startDate?.toDate ? item.startDate.toDate() : item?.startDate,
            endDate: item?.endDate?.toDate ? item.endDate.toDate() : item?.endDate,
          }))
        : [],
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
    };
  };

  // Convert Program items (products/treatments) for Firestore
  const convertProgramItemsForFirestore = (items) => {
    return (items || []).map((item) => ({
      ...item,
      startDate: item?.startDate instanceof Date ? Timestamp.fromDate(item.startDate) : item?.startDate || null,
      endDate: item?.endDate instanceof Date ? Timestamp.fromDate(item.endDate) : item?.endDate || null,
    }));
  };

  // Create
  const createProgram = useCallback(async (programData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToSave = {
        ...programData,
        status: programData?.status || 'active',
        startDate: Timestamp.fromDate(programData.startDate),
        endDate: programData?.endDate ? Timestamp.fromDate(programData.endDate) : null,
        treatments: convertProgramItemsForFirestore(programData?.treatments),
        products: convertProgramItemsForFirestore(programData?.products),
        progress: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la création du programme';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update
  const updateProgram = useCallback(async (programData) => {
    try {
      setLoading(true);
      setError(null);
      const { id, ...updateData } = programData || {};
      const dataToUpdate = {
        ...updateData,
        ...(updateData.startDate && { startDate: Timestamp.fromDate(updateData.startDate) }),
        ...(updateData.endDate && { endDate: Timestamp.fromDate(updateData.endDate) }),
        ...(updateData.treatments && { treatments: convertProgramItemsForFirestore(updateData.treatments) }),
        ...(updateData.products && { products: convertProgramItemsForFirestore(updateData.products) }),
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la mise à jour du programme';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete
  const deleteProgram = useCallback(async (programId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, COLLECTION_NAME, programId));
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression du programme';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by id
  const getProgramById = useCallback(async (programId) => {
    try {
      setLoading(true);
      setError(null);
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, programId));
      if (docSnap.exists()) return convertFirestoreData(docSnap);
      return null;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération du programme';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // List with filters
  const getPrograms = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const constraints = [];
      if (filters.userId) constraints.push(where('userId', '==', filters.userId));
      if (filters.type) constraints.push(where('type', '==', filters.type));
      if (filters.status) constraints.push(where('status', '==', filters.status));
      if (filters.startDateFrom) constraints.push(where('startDate', '>=', Timestamp.fromDate(filters.startDateFrom)));
      if (filters.startDateTo) constraints.push(where('startDate', '<=', Timestamp.fromDate(filters.startDateTo)));
      if (filters.endDateFrom) constraints.push(where('endDate', '>=', Timestamp.fromDate(filters.endDateFrom)));
      if (filters.endDateTo) constraints.push(where('endDate', '<=', Timestamp.fromDate(filters.endDateTo)));

      const orderField = filters.orderBy || 'startDate';
      const orderDirection = filters.orderDirection || 'desc';
      constraints.push(orderBy(orderField, orderDirection));
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let list = [];
      querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));

      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        list = list.filter((program) =>
          program.title?.toLowerCase().includes(searchTerm) ||
          program.description?.toLowerCase?.().includes(searchTerm)
        );
      }

      setPrograms(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération des programmes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime subscription
  const subscribeToPrograms = useCallback((filters = {}) => {
    const constraints = [];
    if (filters.userId) constraints.push(where('userId', '==', filters.userId));
    if (filters.type) constraints.push(where('type', '==', filters.type));
    if (filters.status) constraints.push(where('status', '==', filters.status));
    const orderField = filters.orderBy || 'startDate';
    const orderDirection = filters.orderDirection || 'desc';
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
          list = list.filter((program) =>
            program.title?.toLowerCase().includes(searchTerm) ||
            program.description?.toLowerCase?.().includes(searchTerm)
          );
        }
        setPrograms(list);
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
  const getUserPrograms = useCallback(async (userId) => {
    return getPrograms({ userId, orderBy: 'startDate', orderDirection: 'desc' });
  }, [getPrograms]);

  const getActivePrograms = useCallback(async () => {
    return getPrograms({ status: 'active', orderBy: 'startDate', orderDirection: 'desc' });
  }, [getPrograms]);

  const updateProgramStatus = useCallback(async (programId, status) => {
    return updateProgram({ id: programId, status });
  }, [updateProgram]);

  const updateProgramProgress = useCallback(async (programId, progress) => {
    return updateProgram({ id: programId, progress: Math.max(0, Math.min(100, progress)) });
  }, [updateProgram]);

  const addTreatmentToProgram = useCallback(async (programId, treatment) => {
    try {
      const program = await getProgramById(programId);
      if (!program) throw new Error('Programme non trouvé');
      const updatedTreatments = [...(program.treatments || []), treatment];
      return updateProgram({ id: programId, treatments: updatedTreatments });
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de l'ajout du traitement";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getProgramById, updateProgram]);

  const removeTreatmentFromProgram = useCallback(async (programId, treatmentId) => {
    try {
      const program = await getProgramById(programId);
      if (!program) throw new Error('Programme non trouvé');
      const updatedTreatments = (program.treatments || []).filter((t) => t.id !== treatmentId);
      return updateProgram({ id: programId, treatments: updatedTreatments });
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression du traitement';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getProgramById, updateProgram]);

  const addProductToProgram = useCallback(async (programId, product) => {
    try {
      const program = await getProgramById(programId);
      if (!program) throw new Error('Programme non trouvé');
      const updatedProducts = [...(program.products || []), product];
      return updateProgram({ id: programId, products: updatedProducts });
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de l'ajout du produit";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getProgramById, updateProgram]);

  const removeProductFromProgram = useCallback(async (programId, productId) => {
    try {
      const program = await getProgramById(programId);
      if (!program) throw new Error('Programme non trouvé');
      const updatedProducts = (program.products || []).filter((p) => p.id !== productId);
      return updateProgram({ id: programId, products: updatedProducts });
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getProgramById, updateProgram]);

  return {
    programs,
    loading,
    error,
    // CRUD
    createProgram,
    updateProgram,
    deleteProgram,
    // Queries
    getProgramById,
    getPrograms,
    getUserPrograms,
    getActivePrograms,
    subscribeToPrograms,
    // Helpers
    updateProgramStatus,
    updateProgramProgress,
    addTreatmentToProgram,
    removeTreatmentFromProgram,
    addProductToProgram,
    removeProductFromProgram,
  };
}
