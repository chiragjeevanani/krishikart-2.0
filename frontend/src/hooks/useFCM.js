import { useEffect, useCallback } from 'react';
import { requestFCMToken } from '@/lib/firebase';
import { getMessaging, onMessage } from 'firebase/messaging';
import api from '@/lib/axios';
import { toast } from 'sonner';

export const useFCM = (isAuthenticated, userType) => {
    const saveToken = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            console.log(`[useFCM] Initializing token registration for ${userType}...`);
            const token = await requestFCMToken();

            if (token) {
                console.log(`[useFCM] Sending token to backend for ${userType}...`);
                const response = await api.post(`/${userType}/fcm-token`, { token });

                if (response.data.success) {
                    console.log(`[useFCM] Token successfully registered on backend for ${userType}`);
                    localStorage.setItem(`fcm_token_${userType}`, token);
                }
            }
        } catch (error) {
            console.error(`[useFCM] Error in token registration:`, error);
        }
    }, [isAuthenticated, userType]);

    useEffect(() => {
        if (isAuthenticated) {
            saveToken();

            const messaging = getMessaging();
            const unsubscribe = onMessage(messaging, async (payload) => {
                console.log('[useFCM] Foreground message received:', payload);

                // Show UI toast for immediate feedback
                toast.info(payload.notification.title, {
                    description: payload.notification.body
                });

                // 2. Show native notification via Service Worker registration
                // Force Action Center visibility with high priority flags
                if (Notification.permission === 'granted') {
                    try {
                        const registration = await navigator.serviceWorker.ready;
                        registration.showNotification(payload.notification.title || 'Kisaankart', {
                            body: payload.notification.body || '',
                            icon: '/favicon.png',
                            data: payload.data || {},
                            tag: 'kisaankart-foreground',
                            badge: '/favicon.png',
                            requireInteraction: true, // IMPORTANT: Keeps it in the Action Center until dismissed
                            renotify: true,
                            silent: false
                        });
                        console.log('[useFCM] Native notification triggered successfully');
                    } catch (err) {
                        console.error('[useFCM] Failed to trigger native notification:', err);
                    }
                }
            });

            return () => unsubscribe();
        }
    }, [isAuthenticated, saveToken]);

    return { saveToken };
};
