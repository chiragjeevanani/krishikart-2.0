import { useEffect, useCallback } from 'react';
import { requestFCMToken } from '@/lib/firebase';
import api from '@/lib/axios';

export const useFCM = (isAuthenticated, userType) => {
    const saveToken = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const token = await requestFCMToken();
            if (token) {
                // Check if already registered in this session/browser
                const savedToken = localStorage.getItem(`fcm_token_${userType}`);
                if (savedToken === token) {
                    console.log(`FCM token for ${userType} already registered.`);
                    return;
                }

                console.log(`Registering new FCM token for ${userType}:`, token);
                const response = await api.post(`/${userType}/fcm-token`, { token });

                if (response.data.success) {
                    localStorage.setItem(`fcm_token_${userType}`, token);
                }
            }
        } catch (error) {
            console.error(`Error in useFCM (${userType}):`, error);
        }
    }, [isAuthenticated, userType]);

    useEffect(() => {
        if (isAuthenticated) {
            saveToken();
        }
    }, [isAuthenticated, saveToken]);

    return { saveToken };
};
