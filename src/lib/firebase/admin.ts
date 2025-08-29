import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('Missing Firebase Admin configuration');
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

export { admin };
export const adminDb = () => admin.firestore();
export const adminMessaging = () => admin.messaging();
