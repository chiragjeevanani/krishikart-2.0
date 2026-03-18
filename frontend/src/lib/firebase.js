import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export { firebaseConfig };

export const requestFCMToken = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
            });

            // Send Firebase config to the service worker so it doesn't need hard-coded keys
            try {
                const readyRegistration = await navigator.serviceWorker.ready;
                const sw = readyRegistration.active || registration.active;
                if (sw) {
                    sw.postMessage({
                        type: 'INIT_FIREBASE',
                        payload: { firebaseConfig },
                    });
                } else {
                    // non-fatal
                }
            } catch (e) {
                // non-fatal
            }

            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });
            return token;
        } else {
            // non-fatal
        }
    } catch (error) {
        console.error("[FCM] Token Error:", error);
    }
    return null;
};

// Re-export onMessage so hooks can subscribe directly and get an unsubscribe function
export { onMessage };

export default app;
