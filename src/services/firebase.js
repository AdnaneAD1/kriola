'use client';
import { getToken, onMessage } from "firebase/messaging";
import { app, messaging, db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) return resolve(null);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      if (!messaging) return null;
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Enregistrer/METTRE à jour le token FCM dans Firestore (merge)
const saveFcmToken = async (userId, token) => {
  if (!userId || !token) return;
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, { fcmToken: token, fcmUpdatedAt: Timestamp.now() }, { merge: true });
  } catch (e) {
    console.error('Erreur lors de lenregistrement du token FCM:', e);
  }
};

// Écouter les notifications en premier plan
export const onForegroundMessage = () => {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    // Créer une notification native
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      const { title, body } = payload.notification;
      const options = {
        body,
        data: payload.data || {},
        actions: [
          {
            action: 'open',
            title: 'Voir les détails'
          }
        ],
        requireInteraction: true, // La notification reste jusqu'à ce que l'utilisateur interagisse
        vibrate: [200, 100, 200] // Vibration pour mobile
      };

      navigator.serviceWorker.ready
        .then(registration => registration.showNotification(title, options))
        .catch(error => console.error('Erreur lors de l\'affichage de la notification:', error));
    }
  });
};

// Écouter les notifications en arrière-plan
export const onBackgroundMessage = (messaging) => {
  return new Promise((resolve, reject) => {
    navigator.serviceWorker.ready.then((registration) => {
      messaging.onBackgroundMessage((payload) => {
        registration.showNotification(payload.notification.title, {
          body: payload.notification.body,
          data: payload.data || {},
          actions: [
            {
              action: 'open',
              title: 'Voir les détails'
            }
          ]
        });
        
        resolve(payload);
      });
    }).catch(reject);
  });
};

// Initialiser les notifications
export const initializeNotifications = async (userId) => {
  try {
    // Vérifier si les notifications sont supportées
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications de bureau');
      return null;
    }

    // Vérifier si le service worker est supporté
    if (!('serviceWorker' in navigator)) {
      console.warn('Ce navigateur ne supporte pas les service workers');
      return null;
    }

    // Générer et enregistrer le token
    const token = await requestNotificationPermission();
    if (token) {
      await saveFcmToken(userId, token);
      // Configurer les écouteurs de notifications
      onForegroundMessage();
      // Les notifications en arrière-plan sont gérées par le service worker
    }
    return token;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des notifications:', error);
    return null;
  }
};