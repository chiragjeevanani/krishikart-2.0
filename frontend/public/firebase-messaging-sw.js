importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

let messaging = null;

// Initialize Firebase in the service worker using config sent from the main app
self.addEventListener('message', (event) => {
    const data = event.data || {};
    console.log('[firebase-messaging-sw.js] Message received from page:', data?.type);

    if (data.type === 'INIT_FIREBASE' && data.payload && data.payload.firebaseConfig) {
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(data.payload.firebaseConfig);
                console.log('[firebase-messaging-sw.js] Firebase initialized from app config:', {
                    projectId: data.payload.firebaseConfig.projectId,
                    messagingSenderId: data.payload.firebaseConfig.messagingSenderId,
                });
            } else {
                console.log('[firebase-messaging-sw.js] Firebase already initialized, reusing existing app');
            }

            if (!messaging) {
                messaging = firebase.messaging();
                console.log('[firebase-messaging-sw.js] Firebase Messaging instance created');

                messaging.onBackgroundMessage((payload) => {
                    console.log('[firebase-messaging-sw.js] onBackgroundMessage payload:', payload);
                    const notificationTitle = payload.notification?.title || 'Kisaankart Update';
                    const notificationOptions = {
                        body: payload.notification?.body || 'New update available',
                        icon: '/favicon.png',
                        tag: 'kisaankart-notification',
                        data: payload.data || {},
                        badge: '/favicon.png',
                        vibrate: [200, 100, 200]
                    };

                    console.log('[firebase-messaging-sw.js] Showing background notification with title:', notificationTitle);
                    return self.registration.showNotification(notificationTitle, notificationOptions);
                });
            }
        } catch (err) {
            console.error('[firebase-messaging-sw.js] Error during Firebase init or messaging setup:', err);
        }
    }
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

    const data = event.notification.data || {};
    const urlToOpen = data.link || '/';

    const fullUrlToOpen = new URL(urlToOpen, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open at the target URL
            for (const client of clientList) {
                if (client.url === fullUrlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(fullUrlToOpen);
            }
        })
    );
});
