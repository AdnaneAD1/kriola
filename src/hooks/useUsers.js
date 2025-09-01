import { useState, useEffect, useCallback } from 'react';
import { db, firebaseAuth } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
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
  writeBatch,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword as updateFbPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged,
  reload,
} from 'firebase/auth';

const COLLECTION_NAME = 'users';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // Start in loading=true until we resolve initial auth state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convertir un doc Firestore en objet User
  const convertFirestoreData = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      emailVerifiedAt: data?.emailVerifiedAt?.toDate ? data.emailVerifiedAt.toDate() : data?.emailVerifiedAt,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
    };
  };

  // Créer un utilisateur dans Firestore (sans authentification)
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      if (!userData.firebaseUid) throw new Error('firebaseUid est requis');

      const dataToSave = {
        ...userData,
        role: userData?.role || 'patient',
        emailVerified: userData?.emailVerified ?? false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const sanitizedData = Object.fromEntries(
        Object.entries(dataToSave).filter(([, v]) => v !== undefined)
      );

      await setDoc(doc(db, COLLECTION_NAME, userData.firebaseUid), sanitizedData);
      return userData.firebaseUid;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la création de l'utilisateur";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update password for current authenticated user (requires reauthentication)
  const updatePasswordForCurrentUser = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error('Aucun utilisateur connecté');
      if (!user.email) throw new Error("L'utilisateur courant n'a pas d'email");

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateFbPassword(user, newPassword);
      // Optionally refresh auth state
      await reload(user);
      return true;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la mise à jour du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un utilisateur avec Auth Firebase + Firestore
  const createUserWithAuth = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, userData.email, userData.password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: userData.name });
      // Envoyer l'email de vérification avec une URL de retour explicite
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
        };
        await sendEmailVerification(fbUser, actionCodeSettings);
      } catch (e) {
        // Si window n'est pas disponible (SSR) ou autre erreur,
        // ne pas réessayer si Firebase renvoie un rate-limit
        if (e?.code !== 'auth/too-many-requests') {
          await sendEmailVerification(fbUser);
        } else {
          console.warn('sendEmailVerification rate-limited, skipping retry');
        }
      }

      const userId = await createUser({
        name: userData.name,
        email: userData.email,
        role: userData.role || 'patient',
        firebaseUid: fbUser.uid,
        photoURL: fbUser.photoURL ?? null,
        phoneNumber: userData.phoneNumber,
      });

      return { uid: fbUser.uid, userId: fbUser.uid };
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la création de l'utilisateur avec authentification";
      setError(errorMessage);
      // Préserver le code d'erreur Firebase si disponible
      const wrapped = new Error(errorMessage);
      if (err && err.code) wrapped.code = err.code;
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, [createUser]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { id, ...updateData } = userData || {};
      const dataToUpdate = {
        ...updateData,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la mise à jour de l'utilisateur";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer un utilisateur
  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, COLLECTION_NAME, userId));
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la suppression de l'utilisateur";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suppression définitive de l'utilisateur + données liées
  const deleteUserDeep = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const batch = writeBatch(db);

      // Collections liées par userId
      const relatedCollections = ['appointments', 'diagnoses', 'programs'];

      for (const colName of relatedCollections) {
        const q = query(collection(db, colName), where('userId', '==', userId));
        const snap = await getDocs(q);
        snap.forEach((d) => batch.delete(doc(db, colName, d.id)));
      }

      // Supprimer le document utilisateur
      batch.delete(doc(db, COLLECTION_NAME, userId));

      await batch.commit();
      return true;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la suppression définitive de l'utilisateur";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer un utilisateur par ID
  const getUserById = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, userId));
      if (docSnap.exists()) return convertFirestoreData(docSnap);
      return null;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la récupération de l'utilisateur";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer un utilisateur par Firebase UID
  const getUserByFirebaseUid = useCallback(async (firebaseUid) => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, COLLECTION_NAME), where('firebaseUid', '==', firebaseUid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const d = querySnapshot.docs[0];
        return convertFirestoreData(d);
      }
      return null;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de la récupération de l'utilisateur par UID Firebase";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les utilisateurs avec filtres
  const getUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const constraints = [];
      if (filters.role) constraints.push(where('role', '==', filters.role));
      if (filters.emailVerified !== undefined) constraints.push(where('emailVerified', '==', filters.emailVerified));

      const orderField = filters.orderBy || 'createdAt';
      const orderDirection = filters.orderDirection || 'desc';
      constraints.push(orderBy(orderField, orderDirection));
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let list = [];
      querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));

      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        list = list.filter((u) =>
          u.name?.toLowerCase().includes(searchTerm) ||
          u.email?.toLowerCase().includes(searchTerm)
        );
      }

      setUsers(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération des utilisateurs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Abonnement temps réel
  const subscribeToUsers = useCallback((filters = {}) => {
    const constraints = [];
    if (filters.role) constraints.push(where('role', '==', filters.role));
    if (filters.emailVerified !== undefined) constraints.push(where('emailVerified', '==', filters.emailVerified));
    const orderField = filters.orderBy || 'createdAt';
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
          list = list.filter((u) =>
            u.name?.toLowerCase().includes(searchTerm) ||
            u.email?.toLowerCase().includes(searchTerm)
          );
        }
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Auth
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const fbUser = cred.user;
      const user = await getUserByFirebaseUid(fbUser.uid);
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getUserByFirebaseUid]);

  const signOutUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(firebaseAuth);
      setCurrentUser(null);
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la déconnexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helpers
  const getUsersByRole = useCallback(async (role) => {
    return getUsers({ role, orderBy: 'name', orderDirection: 'asc' });
  }, [getUsers]);

  // Admin helpers
  const getClients = useCallback(async () => {
    return getUsers({ role: 'client', orderBy: 'name', orderDirection: 'asc' });
  }, [getUsers]);

  const getAdmins = useCallback(async () => {
    return getUsers({ role: 'admin', orderBy: 'name', orderDirection: 'asc' });
  }, [getUsers]);

  const markEmailAsVerified = useCallback(async (userId) => {
    return updateUser({ id: userId, emailVerified: true, emailVerifiedAt: new Date() });
  }, [updateUser]);

  // Écouteur d'état Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      try {
        if (fbUser) {
          const user = await getUserByFirebaseUid(fbUser.uid);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des données utilisateur:', e);
        setCurrentUser(null);
      } finally {
        // Ensure loading is turned off after initial auth resolution
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [getUserByFirebaseUid]);

  // Password reset: send email
  const sendPasswordReset = useCallback(async (email, actionUrl) => {
    try {
      setLoading(true);
      setError(null);
      const url = actionUrl || `${window.location.origin}/password-reset`;
      await sendPasswordResetEmail(firebaseAuth, email, { url, handleCodeInApp: true });
      return true;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de lenvoi du lien de réinitialisation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Password reset: confirm with oobCode
  const confirmResetPassword = useCallback(async (oobCode, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await confirmPasswordReset(firebaseAuth, oobCode, newPassword);
      return true;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend email verification for current user
  const resendVerificationEmail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error('Aucun utilisateur connecté');
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
        };
        await sendEmailVerification(user, actionCodeSettings);
      } catch (e) {
        await sendEmailVerification(user);
      }
      // Optionally refresh user
      await reload(user);
      return true;
    } catch (err) {
      const errorMessage = err?.message || "Erreur lors de l'envoi de l'email de vérification";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    currentUser,
    loading,
    error,
    // CRUD
    createUser,
    createUserWithAuth,
    updateUser,
    deleteUser,
    deleteUserDeep,
    // Queries
    getUserById,
    getUserByFirebaseUid,
    getUsers,
    getUsersByRole,
    getClients,
    getAdmins,
    subscribeToUsers,
    // Auth
    signIn,
    signOutUser,
    markEmailAsVerified,
    // Password/Verification
    sendPasswordReset,
    confirmResetPassword,
    resendVerificationEmail,
    // Password update (auth)
    updatePasswordForCurrentUser,
  };
};
