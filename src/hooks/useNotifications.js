import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { requestNotificationPermission } from '@/services/firebase';
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
  setDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'notifications';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);

  // Initialisation des permissions
  useEffect(() => {
    if (userId) {
      requestNotificationPermission(userId)
        .then(token => setFcmToken(token))
        .catch(err => setError(err.message));
    }
  }, [userId]);

  // Convertir un doc Firestore en objet JS
  const convertFirestoreData = (docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      scheduledFor: data?.scheduledFor?.toDate ? data.scheduledFor.toDate() : data?.scheduledFor,
      sentAt: data?.sentAt?.toDate ? data.sentAt.toDate() : data?.sentAt,
      readAt: data?.readAt?.toDate ? data.readAt.toDate() : data?.readAt,
      expiresAt: data?.expiresAt?.toDate ? data.expiresAt.toDate() : data?.expiresAt,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
    };
  };

  const computeDerived = (list) => {
    const read = list.filter(n => n.read);
    const unread = list.filter(n => !n.read);
    setReadNotifications(read);
    setUnreadNotifications(unread);
    setNotificationCount(unread.length);
  };

  // Création
  const createNotification = useCallback(async (notificationData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToSave = {
        ...notificationData,
        priority: notificationData?.priority || 'normal',
        channels: notificationData?.channels || ['in_app'],
        read: false,
        scheduledFor: notificationData?.scheduledFor instanceof Date ? Timestamp.fromDate(notificationData.scheduledFor) : notificationData?.scheduledFor || null,
        expiresAt: notificationData?.expiresAt instanceof Date ? Timestamp.fromDate(notificationData.expiresAt) : notificationData?.expiresAt || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la création de la notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mise à jour
  const updateNotification = useCallback(async (notificationData) => {
    try {
      setLoading(true);
      setError(null);

      const { id, ...updateData } = notificationData || {};
      const dataToUpdate = {
        ...updateData,
        ...(updateData?.scheduledFor instanceof Date ? { scheduledFor: Timestamp.fromDate(updateData.scheduledFor) } : {}),
        ...(updateData?.expiresAt instanceof Date ? { expiresAt: Timestamp.fromDate(updateData.expiresAt) } : {}),
        ...(updateData?.sentAt instanceof Date ? { sentAt: Timestamp.fromDate(updateData.sentAt) } : {}),
        ...(updateData?.readAt instanceof Date ? { readAt: Timestamp.fromDate(updateData.readAt) } : {}),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, COLLECTION_NAME, id), dataToUpdate);
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la mise à jour de la notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suppression
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, COLLECTION_NAME, notificationId));
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression de la notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lecture par ID
  const getNotificationById = useCallback(async (notificationId) => {
    try {
      setLoading(true);
      setError(null);
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, notificationId));
      if (docSnap.exists()) return convertFirestoreData(docSnap);
      return null;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération de la notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Liste avec filtres
  const getNotifications = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const constraints = [];
      if (filters.userId) constraints.push(where('userId', '==', filters.userId));
      if (filters.type) constraints.push(where('type', '==', filters.type));
      if (filters.priority) constraints.push(where('priority', '==', filters.priority));
      if (filters.read !== undefined) constraints.push(where('read', '==', filters.read));
      if (filters.dateFrom) constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom)));
      if (filters.dateTo) constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.dateTo)));

      // Exclure par défaut les expirées
      if (!filters.includeExpired) {
        const now = Timestamp.now();
        constraints.push(where('expiresAt', '>', now));
      }

      const orderField = filters.orderBy || 'createdAt';
      const orderDirection = filters.orderDirection || 'desc';
      constraints.push(orderBy(orderField, orderDirection));
      if (filters.limit) constraints.push(fsLimit(filters.limit));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let list = [];
      querySnapshot.forEach((d) => list.push(convertFirestoreData(d)));

      if (filters.channel) {
        list = list.filter((n) => Array.isArray(n.channels) && n.channels.includes(filters.channel));
      }

      setNotifications(list);
      computeDerived(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la récupération des notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Abonnement temps réel
  const subscribeToNotifications = useCallback((filters = {}) => {
    const constraints = [];
    if (filters.userId) constraints.push(where('userId', '==', filters.userId));
    if (filters.type) constraints.push(where('type', '==', filters.type));
    if (filters.priority) constraints.push(where('priority', '==', filters.priority));
    if (filters.read !== undefined) constraints.push(where('read', '==', filters.read));
    if (!filters.includeExpired) {
      const now = Timestamp.now();
      constraints.push(where('expiresAt', '>', now));
    }
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
        if (filters.channel) {
          list = list.filter((n) => Array.isArray(n.channels) && n.channels.includes(filters.channel));
        }
        setNotifications(list);
        computeDerived(list);
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
  const getUserNotifications = useCallback(
    async (userId) => getNotifications({ userId, orderBy: 'createdAt', orderDirection: 'desc' }),
    [getNotifications]
  );

  const getUnreadNotifications = useCallback(
    async (userId) => getNotifications({ userId, read: false, orderBy: 'createdAt', orderDirection: 'desc' }),
    [getNotifications]
  );

  const markAsRead = useCallback(
    async (notificationId) => updateNotification({ id: notificationId, read: true, readAt: new Date() }),
    [updateNotification]
  );

  const markAsUnread = useCallback(
    async (notificationId) => updateNotification({ id: notificationId, read: false }),
    [updateNotification]
  );

  const markAllAsRead = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const unread = await getUnreadNotifications(userId);
      await Promise.all(unread.map((n) => markAsRead(n.id)));
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors du marquage des notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getUnreadNotifications, markAsRead]);

  const deleteReadNotifications = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const read = await getNotifications({ userId, read: true });
      await Promise.all(read.map((n) => deleteNotification(n.id)));
    } catch (err) {
      const errorMessage = err?.message || 'Erreur lors de la suppression des notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getNotifications, deleteNotification]);

  const sendNotification = useCallback(
    async (notificationId) => updateNotification({ id: notificationId, sentAt: new Date() }),
    [updateNotification]
  );

  const createAppointmentReminder = useCallback(
    async (userId, appointmentId, appointmentDate, reminderMinutes = 60) => {
      const reminderDate = new Date(appointmentDate.getTime() - reminderMinutes * 60 * 1000);
      return createNotification({
        userId,
        title: 'Rappel de rendez-vous',
        body: `Vous avez un rendez-vous dans ${reminderMinutes} minutes`,
        type: 'appointment_reminder',
        priority: 'high',
        channels: ['in_app', 'push'],
        scheduledFor: reminderDate,
        data: { appointmentId },
        actions: [
          { id: 'view', label: 'Voir le rendez-vous', action: `/appointments/${appointmentId}`, style: 'primary' },
        ],
      });
    },
    [createNotification]
  );

  // Auto-fetch initial notifications (sans filtres spécifiques)
  const refresh = useCallback(async () => {
    await getNotifications({ orderBy: 'createdAt', orderDirection: 'desc' });
  }, [getNotifications]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    notifications,
    readNotifications,
    unreadNotifications,
    notificationCount,
    loading,
    error,
    fcmToken,
    // CRUD & lecture
    createNotification,
    updateNotification,
    deleteNotification,
    getNotificationById,
    getNotifications,
    // Helpers
    getUserNotifications,
    getUnreadNotifications,
    subscribeToNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteReadNotifications,
    sendNotification,
    createAppointmentReminder,
    // Compat
    refresh,
  };
};
