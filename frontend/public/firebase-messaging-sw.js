importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDdzURk5KJykQwmtUdOg-Lbdj4HjUT9G8g",
    authDomain: "dhakadsnazzy2.firebaseapp.com",
    projectId: "dhakadsnazzy2",
    storageBucket: "dhakadsnazzy2.firebasestorage.app",
    messagingSenderId: "88524532800",
    appId: "1:88524532800:web:347183dc062e619a48c3a5",
    measurementId: "G-GCPBFW3F1B"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'KrishiKart Update';
    const notificationOptions = {
        body: payload.notification?.body || 'New update available',
        icon: '/favicon.png',
        tag: 'krishikart-notification',
        data: payload.data || {},
        badge: '/favicon.png',
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Activated');
    event.waitUntil(clients.claim());
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;
    const urlToOpen = data?.link || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
