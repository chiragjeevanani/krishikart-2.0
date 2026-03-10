import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestFCMToken, messaging, onMessage } from '@/lib/firebase';
import api from '@/lib/axios';
import { toast } from 'sonner';

export const useFCM = (isAuthenticated, userType) => {
    const navigate = useNavigate();

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

            console.log('[useFCM] Subscribing to foreground FCM messages for', userType);
            const unsubscribe = onMessage(messaging, async (payload) => {
                console.log('[useFCM] Foreground FCM message received:', payload);
                const data = payload.data || {};

                // Show UI toast for immediate feedback
                toast.info(payload.notification.title, {
                    description: payload.notification.body
                });

                // 2. Show native notification via Service Worker registration
                // Force Action Center visibility with high priority flags
                if (Notification.permission === 'granted') {
                    try {
                        const registration = await navigator.serviceWorker.ready;
                        console.log('[useFCM] Showing foreground native notification via SW registration');
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
                        console.log('[useFCM] Native foreground notification triggered successfully');
                    } catch (err) {
                        console.error('[useFCM] Failed to trigger native foreground notification:', err);
                    }
                }

                // 3. Deep-link for delivery assignment notifications while app is in foreground
                if (userType === 'delivery' && data.type === 'new_delivery' && data.orderId && data.link) {
                    try {
                        navigate(data.link);
                    } catch (navErr) {
                        console.error('[useFCM] Failed to navigate on new_delivery notification:', navErr);
                    }
                }

                // 4. Deep-link for vendor procurement assignment notifications while app is in foreground
                if (userType === 'vendor' && data.type === 'assignment' && data.requestId && data.link) {
                    try {
                        navigate(data.link);
                    } catch (navErr) {
                        console.error('[useFCM] Failed to navigate on vendor assignment notification:', navErr);
                    }
                }
            });

            return () => {
                console.log('[useFCM] Cleaning up FCM foreground subscription for', userType);
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                } else {
                    console.warn('[useFCM] unsubscribe was not a function during cleanup');
                }
            };
        }
    }, [isAuthenticated, saveToken]);

    return { saveToken };
};
