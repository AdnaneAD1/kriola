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

const COLLECTION_NAME = 'products';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convertir un doc Firestore en objet Product
  const convertFirestoreData = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
    };
  };

  // Créer un produit
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToSave = {
        ...productData,
        status: productData?.status !== undefined ? productData.status : true,
        ingredients: productData?.ingredients || [],
        suitableFor: productData?.suitableFor || [],
        benefits: productData?.benefits || [],
        warnings: productData?.warnings || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la création du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour un produit
  const updateProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      const { id, ...updateData } = productData || {};
      const dataToUpdate = {
        ...updateData,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la mise à jour du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer un produit
  const deleteProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, COLLECTION_NAME, productId));
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer un produit par ID
  const getProductById = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, productId));
      if (docSnap.exists()) return convertFirestoreData(docSnap);
      return null;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les produits avec filtres
  const getProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const constraints = [];
      if (filters.status !== undefined) constraints.push(where('status', '==', filters.status));
      if (filters.category) constraints.push(where('category', '==', filters.category));
      if (filters.brand) constraints.push(where('brand', '==', filters.brand));
      if (filters.priceMin !== undefined) constraints.push(where('price', '>=', filters.priceMin));
      if (filters.priceMax !== undefined) constraints.push(where('price', '<=', filters.priceMax));

      const orderField = filters.orderBy || 'name';
      const orderDirection = filters.orderDirection || 'asc';
      constraints.push(orderBy(orderField, orderDirection));
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let list = [];
      querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));

      // Filtres client: recherche textuelle, suitableFor
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        list = list.filter((p) =>
          p.name?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase?.().includes(searchTerm) ||
          p.brand?.toLowerCase?.().includes(searchTerm)
        );
      }
      if (filters.suitableFor) {
        list = list.filter((p) => Array.isArray(p.suitableFor) && p.suitableFor.includes(filters.suitableFor));
      }

      setProducts(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération des produits';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Abonnement temps réel
  const subscribeToProducts = useCallback((filters = {}) => {
    const constraints = [];
    if (filters.status !== undefined) constraints.push(where('status', '==', filters.status));
    if (filters.category) constraints.push(where('category', '==', filters.category));
    if (filters.brand) constraints.push(where('brand', '==', filters.brand));
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
          list = list.filter((p) =>
            p.name?.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase?.().includes(searchTerm) ||
            p.brand?.toLowerCase?.().includes(searchTerm)
          );
        }
        if (filters.suitableFor) {
          list = list.filter((p) => Array.isArray(p.suitableFor) && p.suitableFor.includes(filters.suitableFor));
        }
        setProducts(list);
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
  const getActiveProducts = useCallback(async () => {
    return getProducts({ status: true, orderBy: 'name', orderDirection: 'asc' });
  }, [getProducts]);

  const getProductsByCategory = useCallback(async (category) => {
    return getProducts({ category, status: true, orderBy: 'name', orderDirection: 'asc' });
  }, [getProducts]);

  const toggleProductStatus = useCallback(async (productId, status) => {
    return updateProduct({ id: productId, status });
  }, [updateProduct]);

  return {
    products,
    loading,
    error,
    // CRUD
    createProduct,
    updateProduct,
    deleteProduct,
    // Queries
    getProductById,
    getProducts,
    getActiveProducts,
    getProductsByCategory,
    subscribeToProducts,
    toggleProductStatus,
  };
}
