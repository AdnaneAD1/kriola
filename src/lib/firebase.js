import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize Firebase Messaging only in browser and when supported
let messaging = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    // In unsupported environments (SSR, no SW), avoid crashing
    console.warn('Firebase Messaging not initialized:', e);
    messaging = null;
  }
}

export { app, auth, db, googleProvider, messaging };

// Backward-compatible named export used elsewhere in the app
export const firebaseAuth = auth;
export { db as defaultDbExport }; // optional alias if needed

/**
 * Request an FCM token (browser only). Returns a token string or null.
 */
export const generateToken = async () => {
  try {
    if (typeof window === 'undefined') return null;
    const supported = await isSupported().catch(() => false);
    if (!supported || !messaging) return null;
    if (typeof Notification === 'undefined') return null;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('NEXT_PUBLIC_FIREBASE_VAPID_KEY manquante');
      return null;
    }
    const token = await getToken(messaging, { vapidKey }).catch((e) => {
      console.error('getToken error:', e);
      return null;
    });
    if (token) {
      console.log('FCM token:', token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('Erreur generateToken:', err);
    return null;
  }
};

/**
 * Listen for foreground messages (browser only). Resolves with the payload when a message arrives.
 */
export const onMessageListener = async () => {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported().catch(() => false);
  if (!supported || !messaging) return null;
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};