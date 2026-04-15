importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

let messaging = null;

// Handle the 'push' event at the top level to satisfy browser requirements.
// Initial evaluation of the worker MUST add this listener.
self.addEventListener('push', (event) => {
    // If messaging is initialized, Firebase handles this. 
    // If not, we still need this listener to exist at top level.
    console.log('[firebase-messaging-sw.js] Push event received');
});

// Initialize Firebase in the service worker using config sent from the main app
self.addEventListener('message', (event) => {
    const data = event.data || {};
    console.log('[firebase-messaging-sw.js] Message received from page:', data?.type);

    if (data.type === 'INIT_FIREBASE' && data.payload && data.payload.firebaseConfig) {
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(data.payload.firebaseConfig);
                messaging = firebase.messaging();
                setupBackgroundHandler();
                console.log('[firebase-messaging-sw.js] Firebase initialized from app config');
            }
        } catch (err) {
            console.error('[firebase-messaging-sw.js] Error during Firebase init:', err);
        }
    }
});

function setupBackgroundHandler() {
    if (!messaging) return;
    
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

        console.log('[firebase-messaging-sw.js] Showing background notification');
        return self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

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
