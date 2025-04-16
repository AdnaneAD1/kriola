importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyA0B9EDV_MpBcQIamX3TsY4TghGSZ-7i54",
    authDomain: "plasmacare-ab253.firebaseapp.com",
    projectId: "plasmacare-ab253",
    storageBucket: "plasmacare-ab253.firebasestorage.app",
    messagingSenderId: "244331453375",
    appId: "1:244331453375:web:004be44b72cf1e6e31df0a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        data: payload.data || {},
        actions: [
            {
                action: 'open',
                title: 'Voir les détails'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'open') {
        // Ouvrir l'URL spécifiée dans les données de la notification
        if (event.notification.data && event.notification.data.url) {
            clients.openWindow(event.notification.data.url);
        } else {
            // URL par défaut si aucune URL n'est spécifiée
            clients.openWindow('/dashboard');
        }
    }
});
